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
- `reject`: Returns an explicit refusal response. Compared with `drop`, this can prevent some applications from waiting too long for a DNS timeout or repeatedly retrying.

> `qtype`: number | string

Matches DNS query types. The forms are as follows:

- Integer value: a specific query type, such as `"qtype": 1` for an A query, or `"qtype": 28` for an AAAA query.
- String: can be a digits-only string such as `"qtype": "28"`, or a numeric range such as `"qtype": "5-10"`, which represents the 6 types from type 5 to type 10. Commas can be used for segmentation, such as `11,13,15-17`, which represents the 5 types: type 11, type 13, and type 15 to type 17.

For specific type numbers, refer to the [IANA documentation](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml).

> `domain`: [string]

Matches a list of domains. The syntax is the same as [`domain` in routing rules](../routing.md#ruleobject).
