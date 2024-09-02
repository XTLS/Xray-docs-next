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
    "domainMatcher": "hybrid",
    "rules": [],
    "balancers": []
  }
}
```

> `domainStrategy`: "AsIs" | "IPIfNonMatch" | "IPOnDemand"

The domain name resolution strategy, which uses different strategies based on different settings.

- `"AsIs"`: Use only the domain name for routing selection. Default value.

- `"IPIfNonMatch"`: If the domain name does not match any rule, resolve the domain name into an IP address (A record or AAAA record) and match it again;

  - When a domain name has multiple A records, it will try to match all A records until one of them matches a rule;
  - The resolved IP only works for routing selection, and the original domain name is still used in the forwarded packets;

- `"IPOnDemand"`: If any IP-based rules are encountered during matching, immediately resolve the domain name into an IP address for matching;

> `domainMatcher`: "hybrid" | "linear"

The domain name matching algorithm, which uses different algorithms based on different settings. This option affects all `RuleObject` that do not have a separately specified matching algorithm.

- `"hybrid"`: Use the new domain name matching algorithm, which is faster and takes up less space. Default value.
- `"linear"`: Use the original domain name matching algorithm.

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
  "domainMatcher": "hybrid",
  "type": "field",
  "domain": ["baidu.com", "qq.com", "geosite:cn"],
  "ip": ["0.0.0.0/8", "10.0.0.0/8", "fc00::/7", "fe80::/10", "geoip:cn"],
  "port": "53,443,1000-2000",
  "sourcePort": "53,443,1000-2000",
  "network": "tcp",
  "source": ["10.0.0.1"],
  "user": ["love@xray.com"],
  "inboundTag": ["tag-vmess"],
  "protocol": ["http", "tls", "bittorrent"],
  "attrs": { ":method": "GET" },
  "outboundTag": "direct",
  "balancerTag": "balancer"
}
```

::: danger
When multiple attributes are specified at the same time, these attributes need to be satisfied **simultaneously** in order for the current rule to take effect.
:::

> `domainMatcher`: "hybrid" | "linear"

The domain matching algorithm used varies depending on the settings. The option here takes priority over the `domainMatcher` configured in `RoutingObject`.

- `"hybrid"`: uses a new domain matching algorithm that is faster and takes up less space. This is the default value.
- `"linear"`: uses the original domain matching algorithm.

> `type`: "field"

Currently, only the option `"field"` is supported.

> `domain`: [string]

An array where each item is a domain match. There are several forms:

- Plain string: If this string matches any part of the target domain, the rule takes effect. For example, "sina.com" can match "sina.com", "sina.com.cn", and "www.sina.com", but not "sina.cn".
- Regular expression: Starts with `"regexp:"` followed by a regular expression. When this regular expression matches the target domain, the rule takes effect. For example, "regexp:\\\\.goo.\*\\\\.com$" matches "www.google.com" or "fonts.googleapis.com", but not "google.com".
- Subdomain (recommended): Starts with `"domain:"` followed by a domain. When this domain is the target domain or a subdomain of the target domain, the rule takes effect. For example, "domain:xray.com" matches "www.xray.com" and "xray.com", but not "wxray.com".
- Exact match: Starts with `"full:"` followed by a domain. When this domain is an exact match for the target domain, the rule takes effect. For example, "full:xray.com" matches "xray.com" but not "www.xray.com".
- Predefined domain list: Starts with `"geosite:"` followed by a name such as `geosite:google` or `geosite:cn`. The names and domain lists are listed in [Predefined Domain List](#predefined-domain-list).
- Load domains from a file: Formatted as `"ext:file:tag"`, where the file is stored in the [resource directory](./features/env.md#resource-file-path) and has the same format as `geosite.dat`. The tag must exist in the file.

::: tip
`"ext:geoip.dat:cn"` is equivalent to `"geoip:cn"`
:::

`ip`: [string]

An array where each item represents an IP range. This rule will take effect when the target IP matches any of the IP ranges in the array. There are several types of IP ranges:

- IP: In the format of `"127.0.0.1"`.

- [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing): In the format of `"10.0.0.0/8"`.

- Predefined IP lists: These lists are included in every Xray installation package under the file name `geoip.dat`. They can be used in the format of `"geoip:cn"`, where `cn` is a two-letter country code. The prefix `geoip:`(all lowercase) must be used, and nearly all countries that have internet access are supported.

  - Special value: `"geoip:private"`, which includes all private addresses, such as `127.0.0.1`.

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

> `network`: "tcp" | "udp" | "tcp,udp"

This can be "tcp", "udp", or "tcp,udp". This rule will take effect when the connection method is the specified one.

> `source`: [string]

An array where each item represents an IP range in the format of IP, CIDR, GeoIP, or loading IP from a file. This rule will take effect when the source IP matches any of the IP ranges in the array.

> `user`: [string]

An array where each item represents an email address. This rule will take effect when the source user matches any of the email addresses in the array.

> `inboundTag`: [string]

An array where each item represents an identifier. This rule will take effect when the inbound protocol matches any of the identifiers in the array.

> `protocol`: [ "http" | "tls" | "bittorrent" ]

An array where each item represents a protocol. This rule will take effect when the protocol of the current connection matches any of the protocols in the array.

::: tip
The `sniffing` option in the inbound proxy must be enabled to detect the protocol type used by the connection.
:::

`attrs`: object

A json object with string keys and values, used to detect the HTTP headers of the traffic. It matches when all specified keys exist in the header and corresponding values are a substring of the header value. The key is case in-sensitive. You can use regex to match with value.

Currently, only the inbound HTTP proxy sets this attribute.

Examples:

- Detect HTTP GET：`{":method": "GET"}`
- Detect HTTP Path：`{":path": "/test"}"`
- Detect Content Type：`{"accept": "text/html"}"`

> `outboundTag`: string

Corresponds to the identifier of an outbound.

> `balancerTag`: string

Corresponds to the identifier of a balancer.

::: tip
`balancerTag` and `outboundTag` are mutually exclusive. When both are specified, `outboundTag` takes effect.
:::

### BalancerObject

Load balancer configuration. When a load balancer is in effect, it selects the most appropriate outbound from the specified outbound according to the configuration and forwards traffic.

```json
{
  "tag": "balancer",
  "selector": []
}
```

> `tag`: string

The identifier of this load balancer, used to match `balancerTag` in `RuleObject`.

> `selector`: [ string ]

An array of strings, each of which will be used to match the prefix of the outbound identifier. For example, in the following outbound identifiers: `[ "a", "ab", "c", "ba" ]`, `"selector": ["a"]` will match `[ "a", "ab" ]`.

If multiple outbounds are matched, the load balancer currently selects one randomly as the final outbound.

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
