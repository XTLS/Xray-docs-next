# 路由

路由功能模块可以将入站数据按不同规则由不同的出站连接发出，以达到按需代理的目的。

如常见用法是分流国内外流量，Xray 可以通过内部机制判断不同地区的流量，然后将它们发送到不同的出站代理。

有关路由功能更详细的解析：[路由 (routing) 功能简析](../document/level-1/routing-lv1-part1.md)。

## RoutingObject

`RoutingObject` 对应配置文件的 `routing` 项。

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

域名解析策略，根据不同的设置使用不同的策略。

- `"AsIs"`：只使用域名进行路由选择。默认值。
- `"IPIfNonMatch"`：当域名没有匹配任何规则时，将域名解析成 IP（A 记录或 AAAA 记录）再次进行匹配；
  - 当一个域名有多个 A 记录时，会尝试匹配所有的 A 记录，直到其中一个与某个规则匹配为止；
  - 解析后的 IP 仅在路由选择时起作用，转发的数据包中依然使用原始域名；
- `"IPOnDemand"`：当匹配时碰到任何基于 IP 的规则，将域名立即解析为 IP 进行匹配；

> `domainMatcher`: "hybrid" | "linear"

域名匹配算法，根据不同的设置使用不同的算法。此处选项会影响所有未单独指定匹配算法的 `RuleObject`。

- `"hybrid"`：使用新的域名匹配算法，速度更快且占用更少。默认值。
- `"linear"`：使用原来的域名匹配算法。

> `rules`: \[[RuleObject](#ruleobject)\]

对应一个数组，数组中每一项是一个规则。

对于每一个连接，路由将根据这些规则从上到下依次进行判断，当遇到第一个生效规则时，即将这个连接转发至它所指定的 `outboundTag`或 `balancerTag`。

::: tip
当没有匹配到任何规则时，流量默认由第一个 outbound 发出。
:::

> `balancers`: \[ [BalancerObject](#balancerobject) \]

一个数组，数组中每一项是一个负载均衡器的配置。

当一个规则指向一个负载均衡器时，Xray 会通过此负载均衡器选出一个 outbound, 然后由它转发流量。

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
  "balancerTag": "balancer",
  "ruleTag": "rule name"
}
```

::: danger
当多个属性同时指定时，这些属性需要**同时**满足，才可以使当前规则生效。
:::

> `domainMatcher`: "hybrid" | "linear"

域名匹配算法，根据不同的设置使用不同的算法。此处选项优先级高于 `RoutingObject` 中配置的 `domainMatcher`。

- `"hybrid"`：使用新的域名匹配算法，速度更快且占用更少。默认值。
- `"linear"`：使用原来的域名匹配算法。

> `type`: "field"

目前只支持`"field"`这一个选项。

::: tip
Xray-core v1.8.7 或更高版本可省略该行。
:::

> `domain`: \[string\]

一个数组，数组每一项是一个域名的匹配。有以下几种形式：

- 纯字符串：当此字符串匹配目标域名中任意部分，该规则生效。比如 "sina.com" 可以匹配 "sina.com"、"sina.com.cn" 和 "www.sina.com"，但不匹配 "sina.cn"。
- 正则表达式：由 `"regexp:"` 开始，余下部分是一个正则表达式。当此正则表达式匹配目标域名时，该规则生效。例如 `"regexp:\\\\.goo.\*\\\\.com\$"` 匹配 "www.google.com" 或 "fonts.googleapis.com"，但不匹配 "google.com"。（注意，在 json 中，经常在正则表达式中使用的反斜杠会被用作转义，当正则表达式中的反斜杠 `\` 应改为 `\\`）
- 子域名（推荐）：由 `"domain:"` 开始，余下部分是一个域名。当此域名是目标域名或其子域名时，该规则生效。例如 "domain:xray.com" 匹配 "www.xray.com"、"xray.com"，但不匹配 "wxray.com"。
- 完整匹配：由 `"full:"` 开始，余下部分是一个域名。当此域名完整匹配目标域名时，该规则生效。例如 "full:xray.com" 匹配 "xray.com" 但不匹配 "www.xray.com"。
- 预定义域名列表：由 `"geosite:"` 开头，余下部分是一个名称，如 `geosite:google` 或者 `geosite:cn`。名称及域名列表参考 [预定义域名列表](#预定义域名列表)。
- 从文件中加载域名：形如 `"ext:file:tag"`，必须以 `ext:`（小写）开头，后面跟文件名和标签，文件存放在 [资源目录](./features/env.md#资源文件路径) 中，文件格式与 `geosite.dat` 相同，标签必须在文件中存在。

::: tip
`"ext:geoip.dat:cn"` 等价于 `"geoip:cn"`
:::

> `ip`: \[string\]

一个数组，数组内每一项代表一个 IP 范围。当某一项匹配目标 IP 时，此规则生效。有以下几种形式：

- IP：形如 `"127.0.0.1"`。
- [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)：形如 `"10.0.0.0/8"`，也可以用 `"0.0.0.0/0"` `"::/0"` 来指定所有 IPv4 或者 IPv6.
- 预定义 IP 列表：此列表预置于每一个 Xray 的安装包中，文件名为 `geoip.dat`。使用方式形如 `"geoip:cn"`，必须以 `geoip:`（小写）开头，后面跟双字符国家代码，支持几乎所有可以上网的国家。
  - 特殊值：`"geoip:private"`，包含所有私有地址，如 `127.0.0.1`。
  - 反选（!）功能，`"geoip:!cn"` 表示非 geoip:cn 中的结果。
- 从文件中加载 IP：形如 `"ext:file:tag"`，必须以 `ext:`（小写）开头，后面跟文件名和标签，文件存放在 [资源目录](./features/env.md#资源文件路径) 中，文件格式与 `geoip.dat` 相同标签必须在文件中存在。

> `port`：number | string

目标端口范围，有三种形式：

- `"a-b"`：a 和 b 均为正整数，且小于 65536。这个范围是一个前后闭合区间，当目标端口落在此范围内时，此规则生效。
- `a`：a 为正整数，且小于 65536。当目标端口为 a 时，此规则生效。
- 以上两种形式的混合，以逗号 "," 分隔。形如：`"53,443,1000-2000"`。

> `sourcePort`：number | string

来源端口，有三种形式：

- `"a-b"`：a 和 b 均为正整数，且小于 65536。这个范围是一个前后闭合区间，当目标端口落在此范围内时，此规则生效。
- `a`：a 为正整数，且小于 65536。当目标端口为 a 时，此规则生效。
- 以上两种形式的混合，以逗号 "," 分隔。形如：`"53,443,1000-2000"`。

> `network`: "tcp" | "udp" | "tcp,udp"

可选的值有 "tcp"、"udp" 或 "tcp,udp"，当连接方式是指定的方式时，此规则生效。

由于核心很明显只支持 tcp 和 udp 两种四层协议，所以一个仅包含 `"network": "tcp,udp"` 条件的路由可以用于 catch all 匹配任何流量。一个使用例子是放在所有路由规则的最末尾用于指定没有任何其他规则时使用的默认出站（否则核心默认走第一个）

当然其他很明显能匹配任何流量的写法比如指定 1-65535 的 port 或者 0.0.0.0/0 + ::/0 的 ip 也有类似作用

> `source`: \[string\]

一个数组，数组内每一项代表一个 IP 范围，形式有 IP、CIDR、GeoIP 和从文件中加载 IP。当某一项匹配来源 IP 时，此规则生效。

> `user`: \[string\]

一个数组，数组内每一项是一个邮箱地址。当某一项匹配来源用户时，此规则生效。

类似于域名，其也支持类似 `regexp:` 开头的正则进行匹配。（同样需要替换`\`为`\\`, 见domain部分的解释）

> `inboundTag`: \[string\]

一个数组，数组内每一项是一个标识。当某一项匹配入站协议的标识时，此规则生效。

> `protocol`: \[ "http" | "tls" | "bittorrent" \]

一个数组，数组内每一项表示一种协议。当某一个协议匹配当前连接的协议类型时，此规则生效。

::: tip
必须开启入站代理中的 `sniffing` 选项, 才能嗅探出连接所使用的协议类型.
:::

> `attrs`: object

一个 json object，键名字和值皆为字符串，用于检测流量的属性值。当 HTTP headers 包含所有指定的键，并且值包含指定的子字符串，则命中此规则。键大小写不敏感。值支持使用正则表达式。

同时也支持类似 h2 的伪头部 `:method` 和 `:path` 用于匹配方法和路径(尽管在 HTTP/1.1 中是不存在这些 header 的)

对于 HTTP 入站的非 CONNECT 方法，可以直接获取到attrs, 对于其他入站则需要开启 sniffing 嗅探才能获得这些值用于匹配。

示例：

- 检测 HTTP GET：`{":method": "GET"}`
- 检测 HTTP Path：`{":path": "/test"}`
- 检测 Content Type：`{"accept": "text/html"}`

> `outboundTag`: string

对应一个 outbound 的标识。

> `balancerTag`: string

对应一个 Balancer 的标识。

::: tip
`balancerTag` 和 `outboundTag` 须二选一。当同时指定时，`outboundTag` 生效。
:::

> `ruleTag`: string

可选，无实际作用，仅用于标识这条规则的名字

如果设置，则命中该条规则时会在 Info 等级输出相关信息，用于调试路由具体命中了哪条规则。

### BalancerObject

负载均衡器配置。当一个负载均衡器生效时，它会从指定的 outbound 中，按配置选出一个最合适的 outbound，进行流量转发。

```json
{
  "tag": "balancer",
  "selector": [],
  "fallbackTag": "outbound",
  "strategy": {}
}
```

> `tag`: string

此负载均衡器的标识，用于匹配 `RuleObject` 中的 `balancerTag`。

> `selector`: \[ string \]

一个字符串数组，其中每一个字符串将用于和 outbound 标识的前缀匹配。在以下几个 outbound 标识中：`[ "a", "ab", "c", "ba" ]`，`"selector": ["a"]` 将匹配到 `[ "a", "ab" ]`。

如果匹配到多个 outbound，负载均衡器目前会从中随机选出一个作为最终的 outbound。

> `fallbackTag`: string

如果负载均衡器无法选出合适的 outbound，则使用这个配置项指定的 outbound。

> `strategy`: [StrategyObject](#strategyobject)

#### StrategyObject
```json
{
    "type": "roundRobin",
    "settings": {}
}
```
> `type` : "random" | "roundRobin" | "leastPing" | "leastLoad"

- `random` 默认值。随机选择匹配到的出站代理。
- `roundRobin` 按顺序选择匹配到的出站代理。
- `leastPing` 根据连接观测结果选择延迟最小的匹配到的出站代理。需要添加 [observatory](./observatory.md#observatoryobject) 配置项。
- `leastLoad` 根据连接观测结果选择最稳定的出站代理。需要添加 [burstObservatory](./observatory.md#burstobservatoryobject) 配置项。

> `settings`: [StrategySettingsObject](#strategysettingsobject)

##### StrategySettingsObject
这是一个可选配置项，不同负载均衡策略的配置格式有所不同。目前只有 `leastLoad` 负载均衡策略可以添加这个配置项。

### 负载均衡配置示例

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
    }

    "inbounds": [
        {
            // 入站配置
            "tag": "in"
        }
    ]

    "outbounds": [
        {
            // 出站配置
            "tag": "out1"
        },
        {
            // 出站配置
            "tag": "out2"
        }
    ]
```

### 预定义域名列表

此列表预置于每一个 Xray 的安装包中，文件名为 `geosite.dat`。这个文件包含了一些常见的域名，使用方式：`geosite:filename`，如 `geosite:google` 表示对文件内符合 `google` 内包含的域名，进行路由筛选或 DNS 筛选。

常见的域名有：

- `category-ads`：包含了常见的广告域名。
- `category-ads-all`：包含了常见的广告域名，以及广告提供商的域名。
- `cn`：相当于 `geolocation-cn` 和 `tld-cn` 的合集。
- `apple`：包含了 Apple 旗下绝大部分域名。
- `google`：包含了 Google 旗下绝大部分域名。
- `microsoft`：包含了 Microsoft 旗下绝大部分域名。
- `facebook`：包含了 Facebook 旗下绝大部分域名。
- `twitter`：包含了 Twitter 旗下绝大部分域名。
- `telegram`：包含了 Telegram 旗下绝大部分域名。
- `geolocation-cn`：包含了常见的大陆站点域名。
- `geolocation-!cn`：包含了常见的非大陆站点域名。
- `tld-cn`：包含了 CNNIC 管理的用于中国大陆的顶级域名，如以 `.cn`、`.中国` 结尾的域名。
- `tld-!cn`：包含了非中国大陆使用的顶级域名，如以 `.tw`（台湾）、`.jp`（日本）、`.sg`（新加坡）、`.us`（美国）`.ca`（加拿大）等结尾的域名。

你也可以在这里查看完整的域名列表 [Domain list community](https://github.com/v2fly/domain-list-community)。
