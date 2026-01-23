# Routing

The routing module can send inbound data through different outbound connections based on different rules, achieving the purpose of on-demand proxying.

A common usage is splitting traffic between domestic and foreign destinations. Xray can determine the region of the traffic through internal mechanisms and then send them to different outbound proxies.

For a more detailed analysis of the routing function: [Analysis of Routing (Part 1)](../document/level-1/routing-lv1-part1.md).

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

Domain resolution strategy. Different strategies are used based on different settings.

- `"AsIs"`: No extra operation. Uses the domain in the destination address or the sniffed domain. Default value.
- `"IPIfNonMatch"`: When no rule is matched after a full round of matching, resolve the domain to an IP and perform a second round of matching.
- `"IPOnDemand"`: Before starting matching, resolve the domain to an IP immediately for matching.

Actual resolution behavior will be delayed until the first IP rule is encountered to reduce latency. The result will contain both IPv4 and IPv6 (you can further restrict this via `queryStrategy` in the built-in DNS). When a domain resolves to multiple IPs, each rule will try all IPs in turn. If any IP meets the requirement, the rule is considered matched.

When `sniff` + `routeOnly` is enabled, allowing the routing system to see both IP and domain, if the aforementioned resolution occurs, the routing system can only see the IP resolved from the domain and cannot see the original destination IP, unless resolution fails.

When two domains exist (target domain + sniffed result), the priority of the sniffed result is always higher, whether for resolution or domain matching.

Regardless of whether resolution occurs, the routing system will not affect the actual destination address. The requested target remains the original target.

> `rules`: \[[RuleObject](#ruleobject)\]

Corresponds to an array, where each item is a rule.

For each connection, routing will judge these rules from top to bottom. When the first effective rule is encountered, the connection is forwarded to the `outboundTag` or `balancerTag` specified by it.

::: tip
When no rule is matched, traffic is sent via the first outbound by default.
:::

> `balancers`: \[ [BalancerObject](#balancerobject) \]

An array, where each item is a load balancer configuration.

When a rule points to a load balancer, Xray will select an outbound through this load balancer and then forward traffic using it.

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
  "process": ["curl"],
  "outboundTag": "direct",
  "balancerTag": "balancer",
  "ruleTag": "rule name"
}
```

::: danger
When multiple attributes are specified simultaneously, these attributes must be satisfied **simultaneously** for the current rule to take effect.
:::

- **Pure string**: Same as substring below, but the `"keyword:"` prefix can be omitted.
- **Regular expression**: Starts with `"regexp:"`, the rest is a regular expression. The rule takes effect when the regular expression matches the target domain. For example, "regexp:\\\\.goo.\*\\\\.com\$" matches "www.google.com" and "fonts.googleapis.com", but not "google.com". Case sensitive.
- **Subdomain (Recommended)**: Starts with `"domain:"`, the rest is a domain name. The rule takes effect when the domain is the target domain or its subdomain. For example, "domain:xray.com" matches "www.xray.com" and "xray.com", but not "wxray.com".
- **Substring**: Starts with `"keyword:"`, the rest is a string. The rule takes effect when this string matches any part of the target domain. For example, "keyword:sina.com" matches "sina.com", "sina.com.cn", and "www.sina.com", but not "sina.cn".
- **Full match**: Starts with `"full:"`, the rest is a domain name. The rule takes effect when this domain exactly matches the target domain. For example, "full:xray.com" matches "xray.com" but not "www.xray.com".
- **Dotless domain**: Starts with `"dotless:"`, the rest is a string that cannot contain `.`. The rule takes effect when the domain contains no `.` and this string matches any part of the target domain. For example, "dotless:pc-" matches "pc-alice", "mypc-alice". Suitable for intranet NetBIOS domains, etc. Case sensitive.
- **Predefined domain list**: Starts with `"geosite:"`, the rest is a name, such as `geosite:google` or `geosite:cn`. Refer to [Predefined Domain List](#predefined-domain-list) for names and domain lists.
- **Load domains from file**: In the form of `"ext:file:tag"`. Must start with `ext:` (lowercase), followed by filename and tag. The file is stored in the [Resource Directory](./features/env.md#resource-file-path). The file format is the same as `geosite.dat`, and the tag must exist in the file.

::: tip
`"ext:geoip.dat:cn"` is equivalent to `"geoip:cn"`
:::

> `ip`: \[string\]

An array, where each item represents an IP range. The rule takes effect when an item matches the target IP. Available forms:

- **IP**: Like `"127.0.0.1"`.
- **[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)**: Like `"10.0.0.0/8"`. You can also use `"0.0.0.0/0"` or `"::/0"` to specify all IPv4 or IPv6.
- **Predefined IP list**: This list is pre-installed in every Xray installation package, named `geoip.dat`. Usage is like `"geoip:cn"`. Must start with `geoip:` (lowercase), followed by a two-character country code. Supports almost all countries with internet access.
  - **Special value**: `"geoip:private"`, includes all private addresses, such as `127.0.0.1`.
  - **Inverse selection `!`**: `"geoip:!cn"` means results not in geoip:cn. Multiple inverse options have an `AND` relationship, while positive options, or positive options and all inverse options, have an `OR` relationship. For example, `ip: ["geoip:!cn", "geoip:!us", "geoip:telegram"]` matches IPs that are not from the US AND not from China, OR are Telegram IPs.
- **Load IPs from file**: In the form of `"ext:file:tag"`. Must start with `ext:` (lowercase), followed by filename and tag. The file is stored in the [Resource Directory](./features/env.md#resource-file-path). The file format is the same as `geoip.dat`, and the tag must exist in the file.

> `port`: number | string

Target port range. Three forms:

- `"a-b"`: a and b are positive integers less than 65536. This is a closed interval. The rule takes effect when the target port falls within this range.
- `a`: a is a positive integer less than 65536. The rule takes effect when the target port is a.
- A mixture of the above two forms, separated by commas ",". For example: `"53,443,1000-2000"`.

> `sourcePort`: number | string

Source port. Three forms:

- `"a-b"`: a and b are positive integers less than 65536. This is a closed interval. The rule takes effect when the source port falls within this range.
- `a`: a is a positive integer less than 65536. The rule takes effect when the source port is a.
- A mixture of the above two forms, separated by commas ",". For example: `"53,443,1000-2000"`.

> `localPort`: number | string

Local inbound port. Format matches `port`/`sourcePort`. Useful when the inbound listens on a port range.

> `network`: "tcp" | "udp" | "tcp,udp"

Optional values are "tcp", "udp", or "tcp,udp". The rule takes effect when the connection method matches.

Since the core obviously only supports TCP and UDP layer 4 protocols, a routing rule containing only `"network": "tcp,udp"` can be used as a "catch-all" to match any traffic. An example usage is placing it at the very end of all routing rules to specify the default outbound when no other rules match (otherwise the core defaults to the first outbound).

Of course, other ways that obviously match any traffic, such as specifying ports 1-65535 or IPs 0.0.0.0/0 + ::/0, have a similar effect.

> `sourceIP`: \[string\]

An array, where each item represents an IP range. Forms include IP, CIDR, GeoIP, and loading IPs from a file. The rule takes effect when an item matches the source IP.

Alias: `source`

> `localIP`: \[string\]

Format is the same as other IPs. Used to specify the IP used by the local inbound (when using 0.0.0.0 to listen on all IPs, different actual incoming IPs will produce different localIPs).

Ineffective for UDP (due to UDP being message-oriented, tracking is not possible); it always sees the listening IP.

> `user`: \[string\]

An array, where each item is an email address. The rule takes effect when an item matches the source user.

Similar to domains, it also supports regex matching starting with `regexp:`. (Similarly, need to replace `\` with `\\`, see explanation in domain section).

> `vlessRoute`: number | string

VLESS inbound allows the client to modify the 7th and 8th bytes of the configured UUID to any bytes. The server routing will use this as `vlessRoute` data, allowing users to customize parts of the server routing based on needs without changing any external fields.

```
--------------↓↓↓↓------------------
xxxxxxxx-xxxx-0000-xxxx-xxxxxxxxxxxx
```

The configuration uses data after Big-Endian encoding to uint16 (if you don't understand, treat these four digits as a hexadecimal number and convert to decimal). E.g., `0001→1`, `000e→14`, `38b2→14514`. The reason for this is that the syntax here is the same as `port`; you can freely specify many segments for routing just like specifying ports.

> `inboundTag`: \[string\]

An array, where each item is an identifier. The rule takes effect when an item matches the identifier of the inbound protocol.

> `protocol`: \[ "http" | "tls" | "quic" | "bittorrent" \]

An array, where each item represents a protocol. The rule takes effect when a protocol matches the protocol type of the current connection.

`http` only supports 1.0 and 1.1; h2 is not supported yet (plaintext h2 traffic is also very rare).

`tls` TLS 1.0 ~ 1.3.

`quic` Due to the complexity of this protocol, sniffing may sometimes fail.

`bittorrent` Only has the most basic sniffing; may not work for much encrypted and obfuscated traffic.

::: tip
You must enable the `sniffing` option in the inbound proxy to sniff the protocol type used by the connection.
:::

> `attrs`: object

A JSON object where keys and values are strings. Used to detect HTTP traffic attribute values (due to obvious reasons, only supports 1.0 and 1.1). The rule is matched when HTTP headers contain all specified keys and values contain the specified substrings. Keys are case-insensitive. Values support regular expressions.

It also supports pseudo-headers like `:method` and `:path` from h2 for matching methods and paths (although these headers do not exist in HTTP/1.1).

For non-CONNECT methods of HTTP inbounds, `attrs` can be obtained directly. For other inbounds, sniffing must be enabled to obtain these values for matching.

Example:

- Detect HTTP GET: `{":method": "GET"}`
- Detect HTTP Path: `{":path": "/test"}`
- Detect Content Type: `{"accept": "text/html"}`

> `process`: \[string\]

If the connection originates from the local machine, match its process. If not from local, it is directly regarded as a match failure. Only supports Windows and Linux.

This option is an array, where each item has three matching modes.

1. **No slash**: Matches process name.
2. **Contains slash, does not end with slash**: Matches absolute path.
3. **Contains slash, ends with slash**: Matches folder; all processes under this folder are considered a match.

Note:

- All options are case-sensitive.
- On Windows, use backslash `\` for paths. Here it is uniformly required to use forward slash `/`, e.g., `C:/Windows/System32/curl.exe`, because backslashes are treated as escape characters in JSON, which is inconvenient (unless you choose to double the backslashes, which also works).
- When matching by process name, the core automatically removes the `.exe` suffix. Similarly, `["curl"]` can match curl on both Linux and Windows. When using absolute paths, the `.exe` suffix cannot be ignored.

Special syntax sugar:

- `self/`: Matches the current core process, very useful for avoiding routing loops.
- `xray/`: Will be replaced by the absolute path where the current core resides, matching all Xray processes started from this binary.

> `outboundTag`: string

Corresponds to an outbound identifier.

> `balancerTag`: string

Corresponds to a Balancer identifier.

::: tip
You must choose one between `balancerTag` and `outboundTag`. When both are specified, `outboundTag` takes effect.
:::

> `ruleTag`: string

Optional. No actual effect, only used to identify the name of this rule.

If set, information regarding this rule will be output at the Info level when the rule is matched, used for debugging which specific rule was hit.

### BalancerObject

Load balancer configuration. When a load balancer takes effect, it selects the most suitable outbound from the specified outbounds according to the configuration and forwards the traffic.

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

> `selector`: \[ string \]

An array of strings. Each string is used for prefix matching against outbound identifiers. Among the following outbound identifiers: `[ "a", "ab", "c", "ba" ]`, `"selector": ["a"]` will match `[ "a", "ab" ]`.

Generally matches multiple outbounds to distribute load among them.

> `fallbackTag`: string

If all outbounds cannot be connected based on observation results, the outbound specified by this configuration item is used.

Note: Requires adding [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject) configuration items.

> `strategy`: [StrategyObject](#strategyobject)

#### StrategyObject

```json
{
  "type": "roundRobin",
  "settings": {}
}
```

> `type` : "random" | "roundRobin" | "leastPing" | "leastLoad"

- `random`: Default value. Randomly selects a matched outbound proxy.
- `roundRobin`: Selects matched outbound proxies in order.
- `leastPing`: Selects the matched outbound proxy with the lowest latency based on observation results. Requires [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject).
- `leastLoad`: Selects the most stable outbound proxy based on observation results. Requires [observatory](./observatory.md#observatoryobject) or [burstObservatory](./observatory.md#burstobservatoryobject).

::: tip
Regardless of the mode, if all nodes corresponding to its `selector` have `observatory` or `burstObservatory` configured, healthy nodes can be filtered out. If no healthy nodes are available, it attempts `fallbackTag`.
:::

> `settings`: [StrategySettingsObject](#strategysettingsobject)

##### StrategySettingsObject

This is an optional configuration item. The configuration format varies for different load balancing strategies. Currently, only the `leastLoad` strategy supports this item.

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

The maximum acceptable RTT duration for speed tests.

> `tolerance`: float number

The maximum acceptable failure rate for speed tests. For example, 0.01 means accepting a 1% failure rate. (Seemingly unimplemented).

> `baselines`: \[ string \]

The maximum acceptable standard deviation duration for RTT speed tests.

> `costs`: \[ CostObject \]

Optional configuration item. An array to assign weights to all outbounds.

> `regexp`: true | false

Whether to use regular expressions to select outbound `Tag`.

> `match`: string

Matches outbound `Tag`.

> `value`: float number

Weight value. The larger the value, the less likely the corresponding node is to be selected.

### Load Balancer Configuration Example

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
        "balancers" : [
            {
                "selector": [
                    "out"
                ],
                "strategy": {
                    "type":"roundRobin"
                },
                "tag": "round"
            }
        ]
    },

    "inbounds": [
        {
            // Inbound config
            "tag": "in"
        }
    ],

    "outbounds": [
        {
            // Outbound config
            "tag": "out1"
        },
        {
            // Outbound config
            "tag": "out2"
        }
    ]
```

### Predefined Domain List

This list is pre-installed in every Xray installation package, named `geosite.dat`. This file contains some common domain names. Usage: `geosite:filename`, e.g., `geosite:google` represents routing filtering or DNS filtering for domains included within `google` in the file.

Common domains include:

- `category-ads`: Contains common advertising domains.
- `category-ads-all`: Contains common advertising domains, as well as domains of advertising providers.
- `cn`: Equivalent to the collection of `geolocation-cn` and `tld-cn`.
- `apple`: Contains the vast majority of Apple domains.
- `google`: Contains the vast majority of Google domains.
- `microsoft`: Contains the vast majority of Microsoft domains.
- `facebook`: Contains the vast majority of Facebook domains.
- `twitter`: Contains the vast majority of Twitter domains.
- `telegram`: Contains the vast majority of Telegram domains.
- `geolocation-cn`: Contains common mainland China site domains.
- `geolocation-!cn`: Contains common non-mainland China site domains.
- `tld-cn`: Contains top-level domains managed by CNNIC for mainland China, such as domains ending in `.cn`, `.中国`.
- `tld-!cn`: Contains top-level domains not used in mainland China, such as domains ending in `.tw` (Taiwan), `.jp` (Japan), `.sg` (Singapore), `.us` (USA), `.ca` (Canada), etc.

You can also view the complete domain list here: [Domain list community](https://github.com/v2fly/domain-list-community).
