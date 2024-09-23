# Built-in DNS Server

## DNS Server

The DNS module built into Xray has two main purposes:

- During the routing phase, it resolves domain names to IP addresses and performs traffic splitting based on the results of domain name resolution and the value of `domainStrategy` in the routing configuration module. The built-in DNS server is only used for DNS queries when either of the following values is set:
  - "IPIfNonMatch": When a domain name is requested, it first tries to match it against the `domain` entries in the routing configuration. If no match is found, the built-in DNS server is used to perform a DNS query for the domain name, and the returned IP address is used to perform IP routing matching again.
  - "IPOnDemand": When a domain name is matched against any IP-based rule, it is immediately resolved to an IP address for matching.
- It resolves the target address for connection.
  - In the `freedom` outbound setting, if `domainStrategy` is set to `UseIP`, requests made through the outbound proxy will first resolve the domain name to an IP address using the built-in server before making the connection.
  - In the `sockopt` setting, if `domainStrategy` is set to `UseIP`, system connections initiated through the outbound proxy will first be resolved to an IP address using the built-in server before making the connection.

::: tip TIP 1
DNS queries sent by the built-in DNS server are automatically forwarded based on the routing configuration.
:::

::: tip TIP 2
Only basic IP queries (A and AAAA records) are supported. CNAME records will be queried repeatedly until an A/AAAA record is returned. Other queries will not enter the built-in DNS server.
:::

## DNS Processing Flow

If the domain name to be queried:

- Matches the mapping of "domain name - IP" or "domain name - IP array" in the `hosts`, then the IP or IP array will be returned as the DNS resolution result.

- Matches the mapping of "domain name - domain name" in the `hosts`, then the value of this mapping (another domain name) will be used as the domain name to be queried, and enter the DNS processing flow until an IP is resolved and returned, or an empty resolution is returned.

- Does not match `hosts`, but matches the `domains` list in one or more DNS servers, then according to the priority of the matching rule, use the DNS server corresponding to the rule to perform the query in sequence. If the DNS server that is hit fails to query or `expectIPs` does not match, then use the next hit DNS server to perform the query. Otherwise, return the resolved IP. If all hit DNS servers fail to query or `expectIPs` does not match, then the DNS component:

  - By default, it will perform "DNS fallback query": use the "DNS server that has not been used in the last failed query and has a default value of `false` for `skipFallback`" to perform the query in sequence. If the query fails or `expectIPs` does not match, return an empty resolution; otherwise, return the resolved IP.
  - If `disableFallback` is set to `true`, "DNS fallback query" will not be performed.

- If neither `hosts` nor the `domains` list in DNS servers matches, then:

  - By default, use the "DNS server that has a default value of `false` for `skipFallback`" to perform the query in sequence. If the first selected DNS server fails to query or `expectIPs` does not match, then use the next selected DNS server to perform the query. Otherwise, return the resolved IP. If all selected DNS servers fail to query or `expectIPs` does not match, return an empty resolution.
  - If the number of "DNS servers that have a default value of `false` for `skipFallback`" is 0 or `disableFallback` is set to `true`, use the first DNS server in the DNS configuration to perform the query. If the query fails or `expectIPs` does not match, return an empty resolution; otherwise, return the resolved IP.

## DnsObject

`DnsObject` corresponds to the `dns` section in the configuration file.

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
        "expectIPs": ["geoip:cn"],
        "skipFallback": false,
        "clientIP": "1.2.3.4"
      },
      {
        "address": "https://1.1.1.1/dns-query",
        "domains": [
          "geosite:netflix"
        ],
        "skipFallback": true,
        "queryStrategy": "UseIPv4"
      },
      {
        "address": "https://1.1.1.1/dns-query",
        "domains": [
          "geosite:openai"
        ],
        "skipFallback": true,
        "queryStrategy": "UseIPv6"
      },
      "localhost"
    ],
    "clientIp": "1.2.3.4",
    "queryStrategy": "UseIP",
    "disableCache": false,
    "disableFallback": false,
    "disableFallbackIfMatch": false,
    "tag": "dns_inbound"
  }
}
```

> `hosts`: map{string: address} | map{string: [address]}

A list of static IP addresses, with values consisting of a series of "domain": "address" or "domain": ["address 1","address 2"]. The address can be an IP or a domain name. When resolving a domain name, if the domain name matches an item in this list:

- If the address of the item is an IP, the resolution result will be that IP.
- If the address of the item is a domain name, this domain name will be used for IP resolution instead of the original domain name.
- If multiple IPs and domain names are set in the address, only the first domain name will be returned, and the rest of the IPs and domain names will be ignored.

The domain name can take several forms:

- Plain string: When this string matches the target domain name exactly, the rule takes effect. For example, "xray.com" matches "xray.com" but not "www.xray.com".
- Regular expression: Starting with `"regexp:"`, the rest is a regular expression. When this regular expression matches the target domain name, the rule takes effect. For example, "regexp:\\\\.goo.\*\\\\.com$" matches "www.google.com" and "fonts.googleapis.com", but not "google.com".
- Subdomain (recommended): Starting with `"domain:"`, the rest is a domain name. When this domain name is the target domain name or its subdomain, the rule takes effect. For example, "domain:xray.com" matches "www.xray.com" and "xray.com", but not "wxray.com".
- Substring: Starting with `"keyword:"`, the rest is a string. When this string matches any part of the target domain name, the rule takes effect. For example, "keyword:sina.com" can match "sina.com", "sina.com.cn", and "www.sina.com", but not "sina.cn".
- Predefined domain name list: Starting with `"geosite:"`, the rest is a name, such as `geosite:google` or `geosite:cn`. The names and domain name lists are listed in [Predefined Domain Name Lists](#predefined-domain-name-lists).

> `servers`: [string | [DnsServerObject](#dnsserverobject) ]

A list of DNS servers that supports two types: DNS addresses (in string format) and [DnsServerObject](#dnsserverobject).

When the value is `"localhost"`, it means to use the default DNS configuration on the local machine.

When the value is a DNS `"IP:Port"` address, such as `"8.8.8.8:53"`, Xray will use the specified UDP port of this address for DNS queries. The query follows the routing rules. When the port is not specified, the default port 53 is used.

When the value is in the form of `"tcp://host:port"`, such as `"tcp://8.8.8.8:53"`, Xray will use `DNS over TCP` for queries. The query follows the routing rules. When the port is not specified, the default port 53 is used.

When the value is in the form of `"tcp+local://host:port"`, such as `"tcp+local://8.8.8.8:53"`, Xray will use `TCP local mode (TCPL)` for queries. That is, DNS requests will not pass through the routing component and will directly request outbound through Freedom, to reduce latency. When the port is not specified, the default port 53 is used.

When the value is in the form of `"https://host:port/dns-query"`, such as `"https://dns.google/dns-query"`, Xray will use `DNS over HTTPS` (RFC8484, abbreviated as DOH) for queries. Some service providers have certificates with IP aliases, which can be directly written in IP form, such as `https://1.1.1.1/dns-query`. Non-standard ports and paths can also be used, such as `"https://a.b.c.d:8443/my-dns-query"`.

When the value is in the form of `"https+local://host:port/dns-query"`, such as `"https+local://dns.google/dns-query"`, Xray will use `DOH local mode (DOHL)` for queries. That is, DOH requests will not pass through the routing component and will directly request outbound through Freedom, to reduce latency. This is generally suitable for use on the server side. Non-standard ports and paths can also be used.

When the value is in the form of `"quic+local://host"`, such as `"quic+local://dns.adguard.com"`, Xray will use `DNS over QUIC local mode (DOQL)` for queries. That is, DNS requests will not pass through the routing component and will directly request outbound through Freedom. This method requires DNS server support for DNS over QUIC. The default port 853 is used for queries, and non-standard ports can also be used.

When the value is `fakedns`, the FakeDNS function will be used for queries.

::: tip TIP 1
When using `localhost`, DNS requests on the local machine are not controlled by Xray and additional configuration is required to make DNS requests forwarded by Xray.
:::

::: tip TIP 2
DNS clients initialized with different rules will be reflected in the Xray startup log at the `info` level, such as `local DOH`, `remote DOH`, and `udp` modes.
:::

::: tip TIP 3
(v1.4.0+) DNS query logging can be enabled in the [log](./log.md).
:::

> `clientIp`: string

Used to notify the server of the specified IP location during DNS queries. Cannot be a private address.

::: tip TIP 1
EDNS Client Subnet support is required for the DNS server.
:::

::: tip TIP 2
You can specify `clientIp` for all DNS servers in [DnsObject](#dnsobject), or specify it for each DNS server in the configuration of [DnsServerObject](#dnsserverobject) (which has higher priority than the configuration in [DnsObject](#dnsobject)).
:::

> `queryStrategy`: "UseIP" | "UseIPv4" | "UseIPv6"

`UseIPv4` only queries A records; `UseIPv6` only queries AAAA records. The default value is `UseIP`, which queries both A and AAAA records.

Xray-core v1.8.6 New feature: `queryStrategy` can be set separately for each `DNS` server.

```jsonc
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:netflix"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv4" // geosite:netflix's domain name uses "UseIPv4"
            },
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:openai"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // The domain name geosite:openai uses "UseIPv6".
            }
        ],
        "queryStrategy": "UseIP" // Global use of "UseIP"
    }
```

**NOTE：**<br>
When the `"queryStrategy"` value in the child item conflicts with the global `"queryStrategy"` value, the query for the child item will respond null.

```jsonc
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://8.8.8.8/dns-query",
                "domains": [
                    "geosite:netflix"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // "UseIPv6" conflicts with "UseIPv4".
            }
        ],
        "queryStrategy": "UseIPv4"
    }
```

Subterm geosite:netflix query gets null response due to conflicting `"queryStrategy"` values. geosite:netflix domain is queried by global DNS `https://1.1.1.1/dns-query` and gets A record.

> `disableCache`: true | false

`true` disables DNS caching, default is `false` which means caching is not disabled.

> `disableFallback`: true | false

`true` disables fallback DNS queries, default is `false` which means fallback queries are not disabled.

> `disableFallbackIfMatch`: true | false

`true` disables fallback DNS queries when the matching domain list of the DNS server is hit, default is `false` which means fallback queries are not disabled.

> `tag`: string

Traffic generated by built-in DNS, except for `localhost`, `fakedns`, `TCPL`, `DOHL`, and `DOQL` modes, can be matched with `inboundTag` in routing using this identifier.

### DnsServerObject

```json
{
  "address": "1.2.3.4",
  "port": 5353,
  "domains": ["domain:xray.com"],
  "expectIPs": ["geoip:cn"],
  "skipFallback": false,
  "clientIP": "1.2.3.4"
}
```

> `address`: address

A list of DNS servers, which can be either DNS addresses (in string form) or DnsServerObjects.

When the value is `"localhost"`, it means using the local DNS configuration.

When the value is a DNS `"IP"` address, such as `"8.8.8.8"`, Xray will use the specified UDP port of this address for DNS queries. The query follows routing rules. By default, port 53 is used.

When the value is in the form of `"tcp://host"`, such as `"tcp://8.8.8.8"`, Xray will use `DNS over TCP` for the query. The query follows routing rules. By default, port 53 is used.

When the value is in the form of `"tcp+local://host"`, such as `"tcp+local://8.8.8.8"`, Xray will use `TCP local mode (TCPL)` for the query. That is, the DNS request will not go through the routing component and will be sent directly through the Freedom outbound to reduce latency. When no port is specified, port 53 is used by default.

When the value is in the form of `"https://host:port/dns-query"`, such as `"https://dns.google/dns-query"`, Xray will use `DNS over HTTPS` (RFC8484, abbreviated as DOH) for the query. Some service providers have IP alias certificates, which can be directly written in IP form, such as `https://1.1.1.1/dns-query`. Non-standard ports and paths can also be used, such as `"https://a.b.c.d:8443/my-dns-query"`.

When the value is in the form of `"https+local://host:port/dns-query"`, such as `"https+local://dns.google/dns-query"`, Xray will use `DOH local mode (DOHL)` for the query, which means that the DOH request will not go through the routing component and will be sent directly through the Freedom outbound to reduce latency. This is generally suitable for server-side use. Non-standard ports and paths can also be used.

When the value is in the form of `"quic+local://host:port"`, such as `"quic+local://dns.adguard.com"`, Xray will use `DOQ local mode (DOQL)` for the query, which means that the DNS request will not go through the routing component and will be sent directly through the Freedom outbound. This method requires DNS server support for DNS over QUIC. By default, port 853 is used for the query, and non-standard ports can be used.

When the value is `fakedns`, FakeDNS functionality will be used for the query.

> `port`: number

The port number of the DNS server, such as `53`. If not specified, the default is `53`. This item is not applicable when using DOH, DOHL, or DOQL modes, and non-standard ports should be specified in the URL.

> `domains`: [string]

A list of domain names. The domain names in this list will be queried using this server first. The format of domain names is the same as in [routing configuration](./routing.md#ruleobject).

> `expectIPs`: [string]

A list of IP ranges in the same format as in [routing configuration](./routing.md#ruleobject).

When this item is configured, Xray DNS will verify the returned IP addresses and only return addresses that are included in the `expectIPs` list.

If this item is not configured, the IP address will be returned as is.

> `skipFallback`: true | false

`true` means to skip this server when performing DNS fallback queries, and the default is `false`, which means not to skip.
