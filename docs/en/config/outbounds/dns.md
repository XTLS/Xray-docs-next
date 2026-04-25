# DNS

DNS is an outbound protocol used to receive DNS queries sent in by routing, then forward or process them according to rules.

This outbound only supports traditional plaintext DNS queries over UDP and TCP; non-plaintext DNS protocols such as DoH, DoT, and DoQ are not applicable to this outbound. Common scenarios include TUN, transparent proxy, or `dokodemo-door` receiving DNS traffic and then routing sending that traffic to this outbound.

It can allow queries to the target DNS server, `hijack` them to the built-in [DNS server](../dns.md) for further processing, drop them, or explicitly refuse them according to rules. It can also rewrite the target address, port, and transport protocol.

## OutboundConfigurationObject

```json
{
  "network": "udp",
  "address": "1.1.1.1",
  "port": 53,
  "userLevel": 0,
  "rules": [
    {
      "action": "reject",
      "domain": ["domain:example.com"]
    },
    {
      "action": "direct",
      "qtype": 65,
      "domain": ["geosite:geolocation-!cn"]
    }
  ]
}
```

The example above only demonstrates the field syntax. See the full example below for a complete configuration.

> `network`: [ "tcp" | "udp" ]

Modifies the transport protocol used for DNS traffic. Available values are `"tcp"` and `"udp"`. If omitted, the original transport method is preserved.

> `address`: address

Modifies the DNS server address. If omitted, the address specified by the source is preserved.

> `port`: number

Modifies the DNS server port. If omitted, the port specified by the source is preserved.

> `userLevel`: number

User level. Connections will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the `level` value in [policy](../policy.md#policyobject). If omitted, it defaults to `0`.

> `rules`: \[[RuleObject](#ruleobject)\]

Matches DNS query rules in order, and supports fine-grained control by `qtype` and `domain`.

If no rule is matched, the built-in fallback rule is used: A and AAAA queries are imported into the built-in DNS module, while other query types are explicitly refused.

## RuleObject

```json
{
  "action": "hijack",
  "qtype": 1,
  "domain": ["geosite:cn"]
}
```

All matching conditions in a rule are combined with AND logic. If a condition is omitted, that condition is not restricted.

> `action`: [ "direct" | "hijack" | "drop" | "reject" ]

Defines the action to take when the rule matches.

- `direct`: Allows the query directly to the target DNS server. If outbound-level `network`, `address`, or `port` is also configured, the query is forwarded to the rewritten target.
- `hijack`: Imports the query into the built-in [DNS server](../dns.md) for further processing. This can be used for additional routing based on the built-in DNS configuration. Currently, only A and AAAA records are supported.
- `drop`: Drops the request directly without returning a response.
- `reject`: Returns an explicit refusal response. Compared with `drop`, this can prevent applications from waiting too long for a DNS timeout.

> `qtype`: number | string

Matches DNS query types. It has three forms:

- `"a-b"`: `a` and `b` are both integers. This is a closed interval; the rule takes effect when the query type falls within this range.
- `a`: `a` is an integer. The rule takes effect when the query type is `a`.
- A comma-separated mix of the two forms above. For example: `"1,3,23-24"`.

Common type numbers can be found in the [List of DNS record types](https://en.wikipedia.org/wiki/List_of_DNS_record_types).

If omitted, all query types are matched.

> `domain`: [string]

Matches a list of domains. The syntax is the same as [`domain` in routing rules](../routing.md#ruleobject), such as `domain:example.com`, `full:example.com`, and `geosite:cn`. If omitted, domains are not restricted.

## DNS Configuration Example

The following example demonstrates a practical scenario: in a transparent proxy environment, the inbound enables `sniffing` for domain / SNI routing, foreign domains go through the proxy, and other IP traffic goes directly. At the same time, `dns-out` refuses HTTPS records for foreign domains to reduce cases where clients obtain ECH configuration and affect plaintext SNI routing, forwards common MX, TXT, SRV, and similar queries to a specified upstream, and refuses AAAA queries because the proxy server has no IPv6 environment.

```json
{
  "inbounds": [
    {
      "tag": "all-in",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"],
        "routeOnly": true
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "dns": {
    "servers": ["https+local://1.1.1.1/dns-query"]
  },
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        // Omitted...
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "settings": {
        "network": "tcp",
        "address": "1.1.1.1",
        "port": 53,
        "rules": [
          {
            "action": "reject",
            "qtype": "28,65",
            "domain": ["geosite:geolocation-!cn"]
          },
          {
            "action": "direct",
            "qtype": "15-16,33"
          }
        ]
      }
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "inboundTag": ["all-in"],
        "network": "tcp,udp",
        "port": "53",
        "outboundTag": "dns-out"
      },
      {
        "domain": ["geosite:geolocation-!cn"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

The example behaves as follows:

- `all-in` enables `sniffing` and uses `routeOnly: true`, allowing routing to split traffic based on sniffed HTTP, TLS, and QUIC target domains while preserving the original target address.
- UDP/TCP plaintext DNS queries from `all-in` to port 53 are routed to `dns-out`.
- For regular traffic, `geosite:geolocation-!cn` goes through `proxy`; traffic that does not match this domain rule automatically uses the first outbound, `direct`.
- HTTPS records with `qtype` `65` for domains in `geosite:geolocation-!cn` are explicitly refused, which can help with plaintext SNI-based routing.
- AAAA queries with `qtype` `28` for domains in `geosite:geolocation-!cn` are explicitly refused, which can be used to block IPv6 resolution for foreign domains.
- Queries with `qtype` `15-16,33` are allowed directly and forwarded to `1.1.1.1:53` according to the outbound configuration, using TCP as the transport.
- Queries that do not match any rule enter the built-in fallback logic: A and AAAA queries are imported into the built-in DNS module, while other query types are explicitly refused. The built-in DNS then queries upstream through `https+local://1.1.1.1/dns-query`, avoiding a loop.
