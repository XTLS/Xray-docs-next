# Routing

The routing module can send inbound data through different outbound connections according to different rules to achieve on-demand proxying.

A common use case is to split domestic and foreign traffic. Xray can use its internal mechanisms to determine the traffic from different regions and then send them to different outbound proxies.

For a more detailed analysis of the routing function, please refer to [Routing Function Analysis](../document/level-1/routing-lv1-part1.md).

## RoutingObject

`RoutingObject` corresponds to the `routing` item in the configuration file.

```json
{
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [],
    "balancers": []
  }
}
```

> `domainStrategy`: "AsIs" | "IPIfNonMatch" | "IPOnDemand"

The domain name resolution strategy, which uses different strategies based on different settings.

- `"AsIs"`: No additional processing is performed. The domain name from the destination address or the sniffed domain is used for routing selection. Default value.
- `"IPIfNonMatch"`: After a full round of matching, if no rule is matched, the domain name is resolved to an IP address and a second matching pass is performed;
- `"IPOnDemand"`: Before starting the matching process, directly resolve the domain name to the IP address for matching;

The actual resolution action is deferred until the first encounter with an IP rule to reduce latency. The result will include both IPv4 and IPv6 (you can further restrict this using the built-in DNS's `queryStrategy`). When a domain name resolves to multiple IPs, each rule will try all IPs sequentially; a rule is considered a hit if any IP matches the requirement.

When `sniff + routeOnly` is enabled, allowing the routing system to see both the IP and the domain name simultaneously, if the above resolution occurs, the routing system will only see the IP resolved from the domain name and not the original target IP, unless the resolution fails.

When two domains exist (target domain + sniff result), the sniff result always has higher priority, whether used for resolution or domain name matching.

Regardless of whether the resolution is performed or not, the routing system does not affect the actual target address; the requested target remains the original target.

> `rules`: [[RuleObject](#ruleobject)]

An array corresponding to a list of rules.

For each connection, the routing will judge these rules from top to bottom in order. When it encounters the first effective rule, it will forward the connection to the `outboundTag` or `balancerTag` specified by the rule.

::: tip
When no rules match, the traffic is sent out by the first outbound by default.
:::

> `balancers`: [ [BalancerObject](#balancerobject) ]

An array corresponding to a list of load balancers.

When a rule points to a load balancer, Xray selects an outbound through this load balancer, and then it forwards the traffic through it.

### RuleObject

```json
{
  "domain": ["baidu.com", "qq.com", "geosite:cn"],
  "ip": ["0.0.0.0/8", "10.0.0.0/8", "fc00::/7", "fe80::/10", "geoip:cn"],
  "port": "53,443,1000-2000",
  "sourcePort": "53,443,1000-2000",
  "localPort": "53,443,1000-2000",
  "network": "tcp",
  "sourceIP": ["10.0.0.1"],
  "localIP": ["192.168.0.25"],
  "user": ["love@xray.com"],
  "vlessRoute": "53,443,1000-2000",
  "inboundTag": ["tag-vmess"],
  "protocol": ["http", "tls", "quic", "bittorrent"],
  "attrs": { ":method": "GET" },
  "outboundTag": "direct",
  "balancerTag": "balancer",
  "ruleTag": "rule name"
}
```

::: danger
When multiple attributes are specified at the same time, these attributes need to be satisfied **simultaneously** in order for the current rule to take effect.
:::

> `domain`: [string]

An array where each item is a domain match. There are several forms:

- Plain string: Same as the substring below, but the "keyword:" prefix can be omitted.
- Regular expression: Starts with `"regexp:"` followed by a regular expression. When this regular expression matches the target domain, the rule takes effect. For example, "regexp:\\\\.goo.\*\\\\.com$" matches "www.google.com" and "fonts.googleapis.com", but not "google.com". Case sensitive.
- Subdomain (recommended): Starts with `"domain:"` followed by a domain. When this domain is the target domain or a subdomain of the target domain, the rule takes effect. For example, "domain:xray.com" matches "www.xray.com" and "xray.com", but not "wxray.com".
- Substring: Begins with `"keyword:"`, the remainder is a string. This rule applies when this string matches any part of the target domain. For example, "keyword:sina.com" can match "sina.com", "sina.com.cn", and "www.sina.com", but not "sina.cn".
- Exact match: Starts with `"full:"` followed by a domain. When this domain is an exact match for the target domain, the rule takes effect. For example, "full:xray.com" matches "xray.com" but not "www.xray.com".
- Dotless domain name: Begins with `"dotless:"`, followed by a string that cannot contain periods (.). This rule applies when the domain name does not contain periods (.) and this string matches any part of the target domain name. For example, "dotless:pc-" can match "pc-alice" and "mypc-alice", suitable for internal NetBIOS domains, etc. Case sensitive.
- Predefined domain list: Starts with `"geosite:"` followed by a name such as `geosite:google` or `geosite:cn`. The names and domain lists are listed in [Predefined Domain List](#predefined-domain-lists).
- Load domains from a file: Formatted as `"ext:file:tag"`, where the file is stored in the [resource directory](./features/env.md#resource-file-path) and has the same format as `geosite.dat`. The tag must exist in the file.

::: tip
`"ext:geoip.dat:cn"` is equivalent to `"geoip:cn"`
:::

`ip`: [string]

An array where each item represents an IP range. This rule will take effect when the target IP matches any of the IP ranges in the array. There are several types of IP ranges:

- IP: In the format of `"127.0.0.1"`.
- [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing): In the format of `"10.0.0.0/8"`, or you can use `"0.0.0.0/0"` `::/0"` to specify all IPv4 or IPv6.
- Predefined IP lists: These lists are included in every Xray installation package under the file name `geoip.dat`. They can be used in the format of `"geoip:cn"`, where `cn` is a two-letter country code. The prefix `geoip:`(all lowercase) must be used, and nearly all countries that have internet access are supported.
  - Special value: `"geoip:private"`, which includes all private addresses, such as `127.0.0.1`.
  - The `!` function negates the selection; `"geoip:!cn"` represents results other than those in `geoip:cn`. Multiple negations are related by `AND`, while positive options, positive options, and all negations are related by `OR`. For example, `ip: ["geoip:!cn", "geoip:!us", "geoip:telegram"]` matches IPs that are neither in the US nor China, or IPs from Telegram.
- Loading IP from a file: In the format of `"ext:file:tag"`, where `file` is the file name and `tag` is a label that must exist in the file. The prefix `ext:` (all lowercase) must be used, and the file should be located in the [resource directory](./features/env.md#resource-file-path) with the same format as `geoip.dat`.

> `port`: number | string

The target port range, which can take on three forms:

- `"a-b"`: `a` and `b` are both positive integers less than 65536. This range is a closed interval, and this rule will take effect when the target port falls within this range.
- `a`: `a` is a positive integer less than 65536. This rule will take effect when the target port is `a`.
- A mixture of the above two forms, separated by commas ",". For example: `"53,443,1000-2000"`.

> `sourcePort`: number | string

The source port, which can take on three forms:

- `"a-b"`: `a` and `b` are both positive integers less than 65536. This range is a closed interval, and this rule will take effect when the source port falls within this range.
- `a`: `a` is a positive integer less than 65536. This rule will take effect when the source port is `a`.
- A mixture of the above two forms, separated by commas ",". For example: `"53,443,1000-2000"`.

> `localPort`：number | string

The local inbound port, in the same format as `port`/`sourcePort`, may be useful when listening on a range of inbound ports.

> `network`: "tcp" | "udp" | "tcp,udp"

This can be "tcp", "udp", or "tcp,udp". This rule will take effect when the connection method is the specified one.

Since the core clearly supports only two Layer-4 protocols, TCP and UDP, a routing rule that contains only the "network": "tcp,udp" condition can be used as a catch-all to match any traffic. A typical use case is to place such a rule at the very end of the routing rule list to specify the default outbound when no other rules match (otherwise, the core uses the first one by default).

Of course, other obvious ways to match all traffic—such as specifying ports 1–65535, or using 0.0.0.0/0 together with ::/0 as IP conditions—serve a similar purpose.

> `sourceIP`: [string]

An array where each item represents an IP range in the format of IP, CIDR, GeoIP, or loading IP from a file. This rule will take effect when the source IP matches any of the IP ranges in the array.

alias: `source`

> `localIP`: \[string\]

The format is the same as other IP fields and is used to specify the IP address on which the local inbound connection is received. When listening on 0.0.0.0, different actual incoming IP addresses will result in different localIP values.

This field is not effective for UDP. Due to the message-oriented nature of UDP, the local IP cannot be tracked, and the listener IP is always reported.

> `user`: [string]

An array where each item represents an email address. This rule will take effect when the source user matches any of the email addresses in the array.

Similar to domain matching, this field also supports regular-expression matching with the `regexp:` prefix (note that `\` must be escaped as `\\`; see the explanation in the domain section).

> `vlessRoute`: number | string

For VLESS inbounds, the client is allowed to modify the 7th and 8th bytes of the configured UUID to any value. The server-side routing system uses these two bytes as vlessRoute data, allowing users to customize server-side routing behavior without changing any external fields.

```
--------------↓↓↓↓------------------
xxxxxxxx-xxxx-0000-xxxx-xxxxxxxxxxxx
```

In the configuration, the value is interpreted as a big-endian uint16. (If this sounds confusing, simply treat these four hexadecimal digits as a single hexadecimal number and convert it to decimal). For example: `0001 → 1`, `000e → 14`, `38b2 → 14514`. This design is used so that the syntax matches `port`, allowing multiple ranges to be specified freely for routing, just like port-based routing.

> `inboundTag`: [string]

An array where each item represents an identifier. This rule will take effect when the inbound protocol matches any of the identifiers in the array.

> `protocol`: [ "http" | "tls" | "quic" | "bittorrent" ]

An array where each item represents a protocol. This rule will take effect when the protocol of the current connection matches any of the protocols in the array.

`http` Only HTTP/1.0 and HTTP/1.1 are supported; HTTP/2 (h2) is not currently supported. (Plaintext h2 traffic is also very rare.)

`tls` TLS versions 1.0 through 1.3 are supported.

`quic` Due to the complexity of the protocol, sniffing may occasionally fail.

`bittorrent` Only very basic sniffing is supported and may not work with many encrypted or obfuscated variants.

::: tip
The `sniffing` option in the inbound proxy must be enabled to detect the protocol type used by the connection.
:::

`attrs`: object

A JSON object in which both keys and values are strings. It is used to match attributes of HTTP traffic (for obvious reasons, only HTTP/1.0 and HTTP/1.1 are supported). A rule is considered matched when the HTTP headers contain **all** specified keys and the corresponding values contain the specified substrings.Header names are case-insensitive. Values support regular-expression matching.

Pseudo-headers similar to those in HTTP/2, such as `:method` and `:path`, are also supported for matching the request method and path (even though these headers do not exist in HTTP/1.1).

For HTTP inbounds using non-`CONNECT` methods, the attributes can be obtained directly. For other inbounds, sniffing must be enabled in order to obtain these values for matching.

Examples:

- Detect HTTP GET：`{":method": "GET"}`
- Detect HTTP Path：`{":path": "/test"}`
- Detect Content Type：`{"accept": "text/html"}`

> `outboundTag`: string

Corresponds to the identifier of an outbound.

> `balancerTag`: string

Corresponds to the identifier of a balancer.

::: tip
`balancerTag` and `outboundTag` are mutually exclusive. When both are specified, `outboundTag` takes effect.
:::

> `ruleTag`: string

Optional. Has no functional effect and is used only to identify the rule.

When set, relevant information will be logged at the Info level when this rule is matched, which is useful for debugging and determining which routing rule was applied.

### BalancerObject

Load balancer configuration. When a load balancer is in effect, it selects the most appropriate outbound from the specified outbound according to the configuration and forwards traffic.

```json
{
  "tag": "balancer",
  "selector": [],
  "fallbackTag": "outbound",
  "strategy": {}
}
```

> `tag`: string

The identifier of this load balancer, used to match `balancerTag` in `RuleObject`.

> `selector`: [ string ]

An array of strings, each of which will be used to match the prefix of the outbound identifier. For example, in the following outbound identifiers: `[ "a", "ab", "c", "ba" ]`, `"selector": ["a"]` will match `[ "a", "ab" ]`.

Generally, multiple outbounds are matched to distribute the load evenly.

> `fallbackTag`: string

If all outbounds fail to connect based on the connection observation results, the outbound specified by this configuration item will be used.

Note: You need to add either the [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject) configuration item.

> `strategy`: [StrategyObject](#strategyobject)

#### StrategyObject

```json
{
  "type": "roundRobin",
  "settings": {}
}
```

> `type`: `"random"` | `"roundRobin"` | `"leastPing"` | `"leastLoad"`

- `random` Default value. Randomly selects one of the matched outbound proxies.
- `roundRobin` Selects matched outbound proxies in sequential order.
- `leastPing` Selects the matched outbound proxy with the lowest latency based on connection observation results. Requires either the [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject) configuration to be enabled.
- `leastLoad` Selects the most stable matched outbound proxy based on connection observation results. Requires either the [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject) configuration to be enabled.

::: tip
Regardless of the selected strategy, once all nodes referenced by the `selector` are configured with either `observatory` or `burstObservatory`, unhealthy nodes can be filtered out. If no healthy nodes are available, `fallbackTag` will be attempted.
:::

> `settings`: [StrategySettingsObject](#strategysettingsobject)

##### StrategySettingsObject

This is an optional configuration object. The configuration format varies depending on the load-balancing strategy. Currently, only the `leastLoad` strategy supports this configuration.

```json
{
  "expected": 2,
  "maxRTT": "1s",
  "tolerance": 0.01,
  "baselines": ["1s"],
  "costs": [
    {
      "regexp": false,
      "match": "tag",
      "value": 0.5
    }
  ]
}
```

> `expected`: number

The number of optimal nodes selected by the load balancer. Traffic will be randomly distributed among these nodes.

> `maxRTT`: string

The maximum acceptable RTT for latency measurements.

> `tolerance`: float

The maximum acceptable ratio of failed latency measurements. For example, `0.01` allows up to 1% of measurements to fail. (Appears to be not yet implemented.)

> `baselines`: [string]

The maximum acceptable standard deviation of RTT measurements.

> `costs`: [CostObject]

Optional. An array used to assign weights to outbounds.

> `regexp`: `true` | `false`

Whether to use a regular expression to match the outbound `tag`.

> `match`: string

The outbound `tag` to match.

> `value`: float

The weight value. A higher value makes the corresponding node less likely to be selected.

### Load Balancing Configuration Example

```json
"routing": {
  "rules": [
    {
      "inboundTag": [
        "in"
      ],
      "balancerTag": "round"
    }
  ],
  "balancers": [
    {
      "selector": [
        "out"
      ],
      "strategy": {
        "type": "roundRobin"
      },
      "tag": "round"
    }
  ]
},

"inbounds": [
  {
    // inbound configuration
    "tag": "in"
  }
],

"outbounds": [
  {
    // outbound configuration
    "tag": "out1"
  },
  {
    // outbound configuration
    "tag": "out2"
  }
]
```

### Predefined Domain Lists

This list is included in every Xray installation package, and the file name is `geosite.dat`. This file contains some common domain names, which can be used as `geosite:filename` to perform routing or DNS filtering for domain names that match those in the file.

Common domain lists include:

- `category-ads`: Contains common advertising domain names.
- `category-ads-all`: Contains common advertising domain names and advertising provider domain names.
- `cn`: Equivalent to the combination of `geolocation-cn` and `tld-cn`.
- `apple`: Contains most of the domain names under Apple.
- `google`: Contains most of the domain names under Google.
- `microsoft`: Contains most of the domain names under Microsoft.
- `facebook`: Contains most of the domain names under Facebook.
- `twitter`: Contains most of the domain names under Twitter.
- `telegram`: Contains most of the domain names under Telegram.
- `geolocation-cn`: Contains common domain names of mainland Chinese websites.
- `geolocation-!cn`: Contains common domain names of non-mainland Chinese websites.
- `tld-cn`: Contains top-level domain names managed by CNNIC for mainland China, such as domain names ending in `.cn` and `.中国`.
- `tld-!cn`: Contains top-level domain names used outside mainland China, such as domain names ending in `.tw` (Taiwan), `.jp` (Japan), `.sg` (Singapore), `.us` (United States), and `.ca` (Canada).

You can also find the complete list of domain names here: [Domain list community](https://github.com/v2fly/domain-list-community).
