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
    "rules": [],
    "balancers": []
  }
}
```

> `domainStrategy`: "AsIs" | "IPIfNonMatch" | "IPOnDemand"

域名解析策略，根据不同的设置使用不同的策略。

- `"AsIs"`：不进行额外操作，使用目标地址里的域名或者 sniff 到的域名。默认值；
- `"IPIfNonMatch"`：一整轮匹配结束后，当没有命中任何规则时，将域名解析成 IP 再次进行二次匹配；
- `"IPOnDemand"`：在开始进行匹配前，直接先将域名解析为 IP 进行匹配；

实际解析行为会被推迟到第一次遇到 IP 规则以降低延迟。结果将同时包含 IPv4 与 IPv6(你可以在内置 DNS 的 `queryStrategy` 进行二次限制) 域名解析出多条 IP 时每条规则将依次尝试全部 IP 然后再匹配下一条路由(如果该条未命中)。

当开启 sniff + routeOnly 使路由系统可以同时看见 IP 和域名时，如果发生上述的解析，路由系统只能看到由域名解析出的 IP 而无法看见原始目标 IP, 除非解析失败。

当存在两个域名时(目标域名 + sniff 结果) 无论是用于解析还是用于域名匹配，sniff 结果的优先级总是更高。

无论解析与否，路由系统不会影响真正目标地址，请求的目标仍然是原始目标。

> `rules`: \[[RuleObject](#ruleobject)\]

对应一个数组，数组中每一项是一个规则。

对于每一个连接，路由将根据这些规则从上到下依次进行判断，当遇到第一个生效规则时，即将这个连接转发至它所指定的 `outboundTag` 或 `balancerTag`。

::: tip
当没有匹配到任何规则时，流量默认由第一个 outbound 发出。
:::

> `balancers`: \[ [BalancerObject](#balancerobject) \]

一个数组，数组中每一项是一个负载均衡器的配置。

当一个规则指向一个负载均衡器时，Xray 会通过此负载均衡器选出一个 outbound, 然后由它转发流量。

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
当多个属性同时指定时，这些属性需要**同时**满足，才可以使当前规则生效。
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

> `localPort`：number | string

本地入站的端口，格式和 `port`/`sourcePort` 一致，在入站监听一个端口范围时可能有用。

> `network`: "tcp" | "udp" | "tcp,udp"

可选的值有 "tcp"、"udp" 或 "tcp,udp"，当连接方式是指定的方式时，此规则生效。

由于核心很明显只支持 tcp 和 udp 两种四层协议，所以一个仅包含 `"network": "tcp,udp"` 条件的路由可以用于 catch all 匹配任何流量。一个使用例子是放在所有路由规则的最末尾用于指定没有任何其他规则时使用的默认出站（否则核心默认走第一个）

当然其他很明显能匹配任何流量的写法比如指定 1-65535 的 port 或者 0.0.0.0/0 + ::/0 的 ip 也有类似作用

> `sourceIP`: \[string\]

一个数组，数组内每一项代表一个 IP 范围，形式有 IP、CIDR、GeoIP 和从文件中加载 IP。当某一项匹配来源 IP 时，此规则生效。

别名: `source`

> `localIP`: \[string\]

格式同其他 IP, 用以指定本地入站使用的 IP(使用 0.0.0.0 监听全部IP时不同的实际进入 IP 将产生不同的 localIP).

对 UDP 无效(UDP 面向报文的原因无法跟踪), 总是看到 listen 的 IP

> `user`: \[string\]

一个数组，数组内每一项是一个邮箱地址。当某一项匹配来源用户时，此规则生效。

类似于域名，其也支持类似 `regexp:` 开头的正则进行匹配。（同样需要替换`\`为`\\`, 见domain部分的解释）

> `vlessRoute` number | string

VLESS 入站会允许配置的 UUID 第七和第八个字节被客户端修改为任何字节，服务端路由会将其作为 vlessRoute 数据，允许用户不更改任何外部字段的情况下根据需求自定义部分服务端路由。

```
--------------↓↓↓↓------------------
xxxxxxxx-xxxx-0000-xxxx-xxxxxxxxxxxx
```

配置中使用的是大端序编码为uint16后的数据(听不懂的话，把这四位当成一个十六进制数并化为十进制) 如 `0001→1` `000e→14` `38b2→14514`. 这么做的原因是这里的写法同 `port`, 可以像指定 port 一样自由指定许多段进行路由。

> `inboundTag`: \[string\]

一个数组，数组内每一项是一个标识。当某一项匹配入站协议的标识时，此规则生效。

> `protocol`: \[ "http" | "tls" | "quic" | "bittorrent" \]

一个数组，数组内每一项表示一种协议。当某一个协议匹配当前连接的协议类型时，此规则生效。

`http` 仅支持 1.0 和 1.1 暂不支持 h2. (明文h2流量也非常少见)

`tls` TLS 1.0 ~ 1.3

`quic` 由于该协议复杂性，嗅探有时可能失效。

`bittorrent` 只有最基础的嗅探，对很多加密和混淆可能不会奏效。

::: tip
必须开启入站代理中的 `sniffing` 选项, 才能嗅探出连接所使用的协议类型.
:::

> `attrs`: object

一个 json object，键名字和值皆为字符串，用于检测 HTTP 流量的属性值(由于显而易见的原因，只支持 1.0 和 1.1)。当 HTTP headers 包含所有指定的键，并且值包含指定的子字符串，则命中此规则。键大小写不敏感。值支持使用正则表达式。

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

一般匹配到多个 outbound，使他们均衡的承担负载。

> `fallbackTag`: string

如果根据连接观测结果所有 outbound 都无法连接，则使用这个配置项指定的 outbound。

注意：需要添加 [observatory](./observatory.md#observatoryobject) 或者 [burstObservatory](./observatory.md#burstobservatoryobject) 配置项

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
- `leastPing` 根据连接观测结果选择延迟最小的匹配到的出站代理。需要添加 [observatory](./observatory.md#observatoryobject) 或者 [burstObservatory](./observatory.md#burstobservatoryobject) 配置项。
- `leastLoad` 根据连接观测结果选择最稳定的出站代理。需要添加 [observatory](./observatory.md#observatoryobject) 或者 [burstObservatory](./observatory.md#burstobservatoryobject) 配置项。

::: tip
无论哪一种模式，一旦其所有的 `selector` 对应节点同时配置了 `observatory` 或 `burstObservatory`，则可以过滤出健康节点。若没有任何健康节点可用，会尝试 `fallbackTag`
:::

> `settings`: [StrategySettingsObject](#strategysettingsobject)

##### StrategySettingsObject

这是一个可选配置项，不同负载均衡策略的配置格式有所不同。目前只有 `leastLoad` 负载均衡策略可以添加这个配置项。

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

负载均衡器选出最优节点的个数，流量将在这几个节点中随机分配。

> `maxRTT`: string

最高可接受的测速 RTT 时长。

> `tolerance`: float number

最多可接受的测速失败比例，例如 0.01 指可接受百分之一测速失败。（似乎未实现）

> `baselines`: \[ string \]

最高可接受的测速 RTT 标准差时长。

> `costs`: \[ CostObject \]

可选配置项，一个数组，可以给所有出站指定权重。

> `regexp`: true | false

是否用正则表达式选择出站 `Tag`。

> `match`: string

匹配出站 `Tag`。

> `value`: float number

权重值，值越大，对应节点越不易被选中。

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
