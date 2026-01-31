# Built-in DNS Server

## DNS Server

The built-in DNS module in Xray has three main purposes:

- **Routing Phase:** Resolves domain names to IPs and matches rules based on the resolved IPs for traffic splitting. Whether to resolve the domain and split traffic depends on the `domainStrategy` setting in the routing configuration module. The built-in DNS server is used for DNS queries only when the following two values are set:
  - `"IPIfNonMatch"`: When a domain is requested, Xray attempts to match it against the `domain` rules in the routing configuration. If no match is found, the built-in DNS server is used to resolve the domain, and the returned IP address is used to match against IP routing rules.
  - `"IPOnDemand"`: When any IP-based rule is encountered during matching, the domain is immediately resolved to an IP for matching.

- **Resolving Target Addresses for Connections:**
  - For example, in a `freedom` outbound, if `domainStrategy` is set to `UseIP`, requests sent from this outbound will first resolve the domain to an IP using the built-in server before connecting.
  - For example, in `sockopt`, if `domainStrategy` is set to `UseIP`, system connections initiated by this outbound will first resolve to an IP using the built-in server before connecting.

- **DNS Traffic Hijacking (Transparent Proxy) or Acting as a Recursive DNS Server:** Directly exposing port 53 to serve as a DNS server.

::: tip TIP 1
The DNS server enters the routing system for matching by default unless it contains `+local`. When using domain names within it, be aware of potential routing loops; `hosts` may help.
:::

::: tip TIP 2
Only basic IP queries (A and AAAA records) are supported. CNAME records will be queried repeatedly until an A/AAAA record is returned. Other queries will not enter the built-in DNS server; instead, they may be discarded or transparently forwarded to other servers depending on your outbound configuration.
:::

## DNS Processing Flow

The domain first undergoes a Hosts mapping check (see the `hosts` field). If the required IP is not found, the DNS server is used for the query.

The core then begins to build a list of servers, sorting them according to the requested domain based on the following rules.

- Build List 1: Contains servers where the `domains` field successfully matches the requested domain, in the order they appear in the configuration file.
- Check `disableFallback`: If true, skip building List 2.
- Check `disableFallbackIfMatch`: If true and List 1 is not empty, skip building List 2.
- Build List 2: Contains servers not in List 1 where `skipFallback` is not true, in the order they appear in the configuration file.
- Final Server List = List 1 + List 2.

Note: Any DNS server with `FinalQuery` set to true will directly truncate the subsequent parts of the list.

When executing a DNS query, the core will query the servers in the Final Server List sequentially. It filters the results using `expectedIPs` and `unexpectedIPs`; if the result is empty after filtering, it attempts the next server in the list. (Behavior differs slightly when `enableParallelQuery` is true; see its field description for details.)

## DnsObject

`DnsObject` corresponds to the `dns` field in the configuration file.

```json
{
  "dns": {
    "hosts": {
      "baidu.com": "127.0.0.1",
      "dns.google": ["8.8.8.8", "8.8.4.4"]
    },
    "servers": [
      "8.8.8.8",
      "8.8.4.4",
      {
        "address": "1.2.3.4",
        "port": 5353,
        "domains": ["domain:xray.com"],
        "expectedIPs": ["geoip:cn"],
        "skipFallback": false,
        "clientIP": "1.2.3.4"
      },
      {
        "address": "https://8.8.8.8/dns-query",
        "domains": ["geosite:netflix"],
        "skipFallback": true,
        "queryStrategy": "UseIPv4"
      },
      {
        "address": "https://1.1.1.1/dns-query",
        "domains": ["geosite:openai"],
        "skipFallback": true,
        "queryStrategy": "UseIPv6"
      },
      "localhost"
    ],
    "clientIp": "1.2.3.4",
    "queryStrategy": "UseIP",
    "disableCache": false,
    "serveStale": false,
    "serveExpiredTTL": 0,
    "disableFallback": false,
    "disableFallbackIfMatch": false,
    "enableParallelQuery": false,
    "useSystemHosts": false,
    "tag": "dns_inbound"
  }
}
```

> `hosts`: map{string: address} | map{string: [address]}

A list of static IPs. The value is a series of `"domain": "address"` or `"domain": ["address 1", "address 2"]`. The address can be an IP or a domain. When resolving a domain, if the domain matches an item in this list:

- If the address of the item is an IP, the resolution result is that IP.
- If the address of the item is a domain, this domain is used to recursively match within the hosts list (max depth 5). If no IP is found ultimately, the domain is handed over to subsequent DNS servers for resolution.
- If multiple IPs and domains are set in the address list simultaneously, only the first domain is returned, and the remaining IPs and domains are ignored.
- If the first value in the address starts with a hash followed by a number (e.g., `#3`), and it is used in a DNS outbound, the core will return an empty response with the corresponding rcode number to reject the request. If the request comes from an internal query, it will simply be treated as a failure.
- When the resolved domain matches multiple domains in the list, all associated IPs are returned.

The matching format (`domain:`, `full:`, etc.) is the same as the domain in the commonly used [Routing System](./routing.md#ruleobject). The difference is that without a prefix, it defaults to using the `full:` prefix (similar to the common hosts file syntax).

> `servers`: \[string | [DnsServerObject](#dnsserverobject) \]

A list of DNS servers. Two types are supported: DNS address (string format) and [DnsServerObject](#dnsserverobject).

When the value is `"localhost"`, it indicates using the local machine's preset DNS configuration.

When the value is a DNS `"IP:Port"` address, such as `"8.8.8.8:53"`, Xray will use the specified UDP port of this address for DNS queries. The query follows routing rules. If no port is specified, port 53 is used by default.

When the value is in the form of `"tcp://host:port"`, such as `"tcp://8.8.8.8:53"`, Xray will use `DNS over TCP` for queries. The query follows routing rules. If no port is specified, port 53 is used by default.

When the value is in the form of `"tcp+local://host:port"`, such as `"tcp+local://8.8.8.8:53"`, Xray will use `TCP Local Mode (TCPL)` for queries. This means the DNS request will **not** pass through the routing component but will request directly via the Freedom outbound to reduce latency. If no port is specified, port 53 is used by default.

When the value is in the form of `"https://host:port/dns-query"`, such as `"https://dns.google/dns-query"`, Xray will use `DNS over HTTPS` (RFC8484, abbreviated as DOH) for queries. Some providers have certificates for IP aliases, so you can write the IP directly, such as `https://1.1.1.1/dns-query`. Non-standard ports and paths can also be used, such as `"https://a.b.c.d:8443/my-dns-query"`.

When the value is in the form of `"h2c://host:port/dns-query"`, such as `"h2c://dns.google/dns-query"`, Xray will use the `DNS over HTTPS` request format but will send the request in cleartext h2c. This cannot be used directly; in this case, you need to configure a Freedom outbound + streamSettings with TLS to wrap it into a normal DOH request. This is used for special purposes, such as customizing the SNI of DOH requests or using utls fingerprints.

When the value is in the form of `"https+local://host:port/dns-query"`, such as `"https+local://dns.google/dns-query"`, Xray will use `DOH Local Mode (DOHL)` for queries. This means the DOH request will **not** pass through the routing component but will request directly via the Freedom outbound to reduce latency. Generally suitable for server-side use. Non-standard ports and paths can also be used.

When the value is in the form of `"quic+local://host"`, such as `"quic+local://dns.adguard.com"`, Xray will use `DNS over QUIC Local Mode (DOQL)` for queries. This means the DNS request will **not** pass through the routing component but will request directly via the Freedom outbound. This method requires the DNS server to support DNS over QUIC. By default, port 853 is used for queries, and non-standard ports can be used.

When the value is `fakedns`, the FakeDNS feature will be used for queries.

::: tip TIP 1
When using `localhost`, the local machine's DNS requests are not controlled by Xray. Additional configuration is required to forward DNS requests through Xray.
:::

::: tip TIP 2
The DNS clients initialized by different rules will be shown in the Xray startup logs at the `info` level, such as `local DOH`, `remote DOH`, and `udp` modes.
:::

::: tip TIP 3
(v1.4.0+) You can enable DNS query logging in [Log](./log.md).
:::

> `clientIp`: string

The IP address used in the EDNS Client Subnet extension.

Must be a valid IPv4 or IPv6 address. When actually sent, the last few bits will be automatically masked; IPv4 and IPv6 are sent with /24 and /96 subnets respectively.

> `queryStrategy`: "UseIP" | "UseIPv4" | "UseIPv6" | "UseSystem"

Limits the capabilities of all servers in the DNS module and sets the default value for IP query types initiated by Xray itself.

The default value `UseIP` allows querying both A + AAAA records. When a query initiated by Xray itself does not specify an IP type, both A and AAAA records are queried from the upstream DNS server. `UseIPv4` only queries and allows querying A records; `UseIPv6` only queries and allows querying AAAA records.

`UseSystem` adapts to the operating system's network environment. Before querying, it checks whether there are IPv4 and IPv6 default gateways, thereby limiting the capabilities of all servers and setting the default query type. It checks in real-time on graphical OS environments and only once on command-line environments.

```json
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://8.8.8.8/dns-query",
                "domains": [
                    "geosite:netflix"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv4" // netflix domain queries A record
            },
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:openai"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // openai domain queries AAAA record
            }
        ],
        "queryStrategy": "UseIP" // Globally query both A and AAAA records
    }
```

::: tip TIP 1
The global `"queryStrategy"` value takes precedence. When the `"queryStrategy"` value in a sub-item conflicts with the global `"queryStrategy"` value, the query for that sub-item will return an empty response.
:::

::: tip TIP 2
When the `"queryStrategy"` parameter is not written in a sub-item, the global `"queryStrategy"` parameter value is used. This behavior is the same as versions prior to Xray-core v1.8.6.
:::

For example:<br>
Global `"queryStrategy": "UseIPv6"` conflicts with sub-item `"queryStrategy": "UseIPv4"`.<br>
Global `"queryStrategy": "UseIPv4"` conflicts with sub-item `"queryStrategy": "UseIPv6"`.<br>
Global `"queryStrategy": "UseIP"` does not conflict with sub-item `"queryStrategy": "UseIPv6"`.<br>
Global `"queryStrategy": "UseIP"` does not conflict with sub-item `"queryStrategy": "UseIPv4"`.

```json
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://8.8.8.8/dns-query",
                "domains": [
                    "geosite:netflix"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // Global "UseIPv4" conflicts with sub-item "UseIPv6"
            }
        ],
        "queryStrategy": "UseIPv4"
    }
```

The sub-item query for the Netflix domain returns an empty response due to the conflicting `"queryStrategy"` value. The Netflix domain is then queried by `https://1.1.1.1/dns-query`, returning an A record.

> `disableCache`: true | false

`true` disables DNS caching. Defaults to `false` (not disabled).

This does not affect `localhost` DNS (system DNS), which always follows Golang's DNS caching behavior (cgo and pure go may differ slightly).

> `serveStale`: true | false

`true` enables DNS optimistic caching. Defaults to `false` (not enabled).

Only effective when the server has DNS caching enabled (i.e., this option is constrained by `disableCache`).

> `serveExpiredTTL`: number

Validity period for optimistic caching in seconds. Defaults to 0, meaning it never expires.

If the server has caching enabled and optimistic caching is turned on: when the cache has expired but the optimistic cache has not, the stale DNS record in the cache is returned immediately, and the cache is refreshed in the background. This can reduce latency.

> `disableFallback`: true | false

`true` disables DNS fallback queries. Defaults to `false` (not disabled).

> `disableFallbackIfMatch`: true | false

`true` disables fallback queries when the DNS server's priority domain list is matched. Defaults to `false` (not disabled).

> `enableParallelQuery`: true | false

`true` enables parallel queries. Defaults to `false` (not enabled).

DNS failover is serial by default, meaning a query is sent to the next server only after the selected DNS server fails or `expectedIPs` and `unexpectedIPs` do not match.

When parallel query is enabled, queries are initiated asynchronously to all selected DNS servers in advance, executing a strategy of "dynamic grouping, intra-group racing, and inter-group fallback".

**Dynamic Grouping**: Adjacent servers in the selected server list are considered the same group if their `clientIP`, `skipFallback`, `queryStrategy`, `tag`, `domains`, `expectedIPs`, and `unexpectedIPs` are **exactly** the same.

**Intra-group Racing**: If any DNS server in the same group queries successfully and the IP matches `expectedIPs` and `unexpectedIPs`, the group is considered successful, and results from other servers in the group are ignored.

**Inter-group Fallback**: If the first group is still querying, wait. If the first group succeeds, return the IP. If all servers in the first group fail or IPs do not match, fallback to the next group. Finally, if all groups fail, return an empty resolution.

> `useSystemHosts`: true | false

If true, appends the system hosts file to the built-in DNS hosts.

> `tag`: string

For query traffic generated by the built-in DNS, except for `localhost`, `fakedns`, `TCPL`, `DOHL`, and `DOQL` modes, this tag can be used in routing for matching via `inboundTag`.

### DnsServerObject

```json
{
  "address": "1.2.3.4",
  "port": 5353,
  "domains": ["domain:xray.com"],
  "expectedIPs": ["geoip:cn"],
  "unexpectedIPs": ["geoip:cloudflare"],
  "skipFallback": false,
  "finalQuery": false,
  "tag": "dns-tag",
  "clientIP": "1.2.3.4",
  "queryStrategy": "UseIPv4",
  "disableCache": false
}
```

> `address`: address

A list of DNS servers. Two types are supported: DNS address (string format) and DnsServerObject.

When the value is `"localhost"`, it indicates using the local machine's preset DNS configuration.

When the value is a DNS `"IP"` address, such as `"8.8.8.8"`, Xray will use the specified UDP port of this address for DNS queries. The query follows routing rules. Defaults to port 53.

When the value is in the form of `"tcp://host"`, such as `"tcp://8.8.8.8"`, Xray will use `DNS over TCP` for queries. The query follows routing rules. Defaults to port 53.

When the value is in the form of `"tcp+local://host"`, such as `"tcp+local://8.8.8.8"`, Xray will use `TCP Local Mode (TCPL)` for queries. This means the DNS request will **not** pass through the routing component but will request directly via the Freedom outbound to reduce latency. If no port is specified, port 53 is used by default.

When the value is in the form of `"https://host:port/dns-query"`, such as `"https://dns.google/dns-query"`, Xray will use `DNS over HTTPS` (RFC8484, abbreviated as DOH) for queries. Some providers have certificates for IP aliases, so you can write the IP directly, such as `https://1.1.1.1/dns-query`. Non-standard ports and paths can also be used, such as `"https://a.b.c.d:8443/my-dns-query"`.

When the value is in the form of `"https+local://host:port/dns-query"`, such as `"https+local://dns.google/dns-query"`, Xray will use `DOH Local Mode (DOHL)` for queries. This means the DOH request will **not** pass through the routing component but will request directly via the Freedom outbound to reduce latency. Generally suitable for server-side use. Non-standard ports and paths can also be used.

When the value is in the form of `"quic+local://host:port"`, such as `"quic+local://dns.adguard.com"`, Xray will use `DOQ Local Mode (DOQL)` for queries. This means the DNS request will **not** pass through the routing component but will request directly via the Freedom outbound. This method requires the DNS server to support DNS over QUIC. By default, port 853 is used for queries, and non-standard ports can be used.

When the value is `fakedns`, the FakeDNS feature will be used for queries.

::: tip About Local Mode and the Domain of the DNS Server Itself
There are two scenarios for DNS requests sent by the DNS module:

**Local Mode** connections are made directly outwards by the core. In this case, if the address is a domain name, it will be resolved by the system itself. The logic is relatively simple.

**Non-Local** modes will essentially be treated as requests coming from an inbound with the tag `dns.tag` (Don't know where it is? Ctrl+F in your browser to search for `inboundTag`). They will go through the normal core processing flow and may be assigned by the routing module to a local freedom or other remote outbounds. They will be resolved by the freedom's `domainStrategy` (beware of potential loops) or sent directly as domains to the remote end to be resolved according to the server's own resolution method.

Since it might be difficult for average users to clarify the logic involved, it is recommended (especially in a transparent proxy environment) to **directly set the corresponding IPs for servers with domain names in the host option of the DNS module** to prevent loops.

Incidentally, DNS requests sent by the DNS module in non-local modes will automatically skip the `IPIfNonMatch` and `IPOnDemand` resolution processes in the routing module. This prevents their resolution from being sent back to the DNS module, causing a loop.
:::

> `port`: number

DNS server port, e.g., `53`. Defaults to `53` if omitted. This item is invalid when using DOH, DOHL, or DOQL modes; non-standard ports should be specified in the URL.

> `domains`: \[string\]

A list of domains. Domains included in this list will prioritize using this server for queries. The domain format is the same as in [Routing Configuration](./routing.md#ruleobject).

> `expectedIPs`:\[string\]

A list of IP ranges. The format is the same as in [Routing Configuration](./routing.md#ruleobject).

When configured, Xray DNS will verify the returned IP and only return addresses included in the `expectedIPs` list.

If `*` exists in the list, and if no IP exists after filtering, the original IP is still returned so that the request does not fail.

> `unexpectedIPs`: [string]

The reverse version of `expectedIPs`. IPs included in this list are removed. The asterisk works the same way.

> `skipFallback`: true | false

`true`: Skip this server during DNS fallback queries. Defaults to `false` (not skipped).

> `timeoutMs`: number

DNS server timeout in milliseconds. Default is 4000 ms.

This does not affect `localhost` DNS (system DNS), which always follows Golang's DNS timeout behavior (cgo and pure go may differ slightly).

> `finalQuery`: true | false

If set to true, the request to this DNS server will be the final attempt and will not trigger fallback behavior.

> `queryStrategy`: "UseIP" | "UseIPv4" | "UseIPv6" | "UseSystem"

If not specified, it inherits from the global configuration; if specified, it allows further limiting the capabilities of this server and setting the default value for IP query types initiated by Xray itself.

Note: It is always constrained by the global `queryStrategy`.

### The following configuration items, if not specified, will inherit from the global configuration, or can override the global configuration here

> `tag`: string

> `clientIP`: [string]

> `disableCache`: true | false

> `serveStale`: true | false

> `serveExpiredTTL`: number
