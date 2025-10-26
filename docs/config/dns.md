# 内置 DNS 服务器

## DNS 服务器

Xray 内置的 DNS 模块，主要有两大用途：

- 在路由阶段，解析域名为 IP, 并且根据域名解析得到的 IP 进行规则匹配以分流。是否解析域名及分流和路由配置模块中 `domainStrategy` 的值有关，只有在设置以下两种值时，才会使用内置 DNS 服务器进行 DNS 查询:
  - "IPIfNonMatch", 请求一个域名时，进行路由里面的 domain 进行匹配，若无法匹配到结果，则对这个域名使用内置 DNS 服务器进行 DNS 查询，并且使用查询返回的 IP 地址再重新进行 IP 路由匹配。
  - "IPOnDemand", 当匹配时碰到任何基于 IP 的规则，将域名立即解析为 IP 进行匹配。

- 解析目标地址进行连接。
  - 如 在 `freedom` 出站中，将 `domainStrategy` 设置为 `UseIP`, 由此出站发出的请求, 会先将域名通过内置服务器解析成 IP, 然后进行连接。
  - 如 在 `sockopt` 中，将 `domainStrategy` 设置为 `UseIP`, 此出站发起的系统连接，将先由内置服务器解析为 IP, 然后进行连接。

::: tip TIP 1
内置 DNS 服务器所发出的 DNS 查询请求，会自动根据路由配置进行转发。
:::

::: tip TIP 2
只支持最基本的 IP 查询（A 和 AAAA 记录），CNAME 记录将会重复查询直至返回 A/AAAA 记录为止。其他查询不会进入内置 DNS 服务器。
:::

## DNS 处理流程

若当前要查询的域名：

- 命中了 `hosts` 中的「域名 - IP」、「域名 - IP 数组」映射，则将该 IP 或 IP 数组作为 DNS 解析结果返回。
- 命中了 `hosts` 中的「域名 - 域名」映射，则该映射的值（另一个域名）将作为当前要查询的域名，进入 DNS 处理流程，直到解析出 IP 后返回，或返回空解析。
- 没有命中 `hosts`，但命中了某（几）个 DNS 服务器中的 `domains` 域名列表，则按照命中的规则的优先级，依次使用该规则对应的 DNS 服务器进行查询。若命中的 DNS 服务器查询失败或 `expectedIPs` 不匹配，则使用下一个命中的 DNS 服务器进行查询；否则返回解析得到的 IP。若所有命中的 DNS 服务器均查询失败或 `expectedIPs` 不匹配，此时 DNS 组件：
  - 默认会进行 「DNS 回退（fallback）查询」：使用「上一轮失败查询中未被使用的、且 `skipFallback` 为默认值 `false` 的 DNS 服务器」依次查询。若查询失败或 `expectedIPs` 不匹配，返回空解析；否则返回解析得到的 IP。
  - 若 `disableFallback` 设置为 `true`，则不会进行「DNS 回退（fallback）查询」。
- 既没有命中 `hosts`，又没有命中 DNS 服务器中的 `domains` 域名列表，则：
  - 默认使用「`skipFallback` 为默认值 `false` 的 DNS 服务器」依次查询。若第一个被选中的 DNS 服务器查询失败或 `expectedIPs` 不匹配，则使用下一个被选中的 DNS 服务器进行查询；否则返回解析得到的 IP。若所有被选中的 DNS 服务器均查询失败或 `expectedIPs` 不匹配，返回空解析。
  - 若「`skipFallback` 为默认值 `false` 的 DNS 服务器」数量为 0 或 `disableFallback` 设置为 `true`，则使用 DNS 配置中的第一个 DNS 服务器进行查询。查询失败或 `expectedIPs` 不匹配，返回空解析；否则返回解析得到的 IP。

## DnsObject

`DnsObject` 对应配置文件的 `dns` 项。

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
    "disableFallback": false,
    "disableFallbackIfMatch": false,
    "useSystemHosts": false,
    "tag": "dns_inbound"
  }
}
```

> `hosts`: map{string: address} | map{string: [address]}

静态 IP 列表，其值为一系列的 "域名": "地址" 或 "域名": ["地址 1","地址 2"]。其中地址可以是 IP 或者域名。在解析域名时，如果域名匹配这个列表中的某一项：

- 当该项的地址为 IP 时，则解析结果为该项的 IP.
- 当该项的地址为域名时，会使用此域名进行 IP 解析，而不使用原始域名。
- 当地址中同时设置了多个 IP 和域名，则只会返回第一个域名，其余 IP 和域名均被忽略。
- 当地址中的第一个值为井号后加数字(如 `#3`)时，如果在使用 DNS 出站，核心会返回空的响应以及该数字编号对应的 rcode 以拒绝请求，如果请求来自内部查询则会单纯视为失败。

域名的格式有以下几种形式：

- 纯字符串：当此字符串完整匹配目标域名时，该规则生效。例如 "xray.com" 匹配 "xray.com"，但不匹配 "www.xray.com"。
- 正则表达式：由 `"regexp:"` 开始，余下部分是一个正则表达式。当此正则表达式匹配目标域名时，该规则生效。例如 "regexp:\\\\.goo.\*\\\\.com\$" 匹配 "www.google.com"、"fonts.googleapis.com"，但不匹配 "google.com"。
- 子域名 (推荐)：由 `"domain:"` 开始，余下部分是一个域名。当此域名是目标域名或其子域名时，该规则生效。例如 "domain:xray.com" 匹配 "www.xray.com" 与 "xray.com"，但不匹配 "wxray.com"。
- 子串：由 `"keyword:"` 开始，余下部分是一个字符串。当此字符串匹配目标域名中任意部分，该规则生效。比如 "keyword:sina.com" 可以匹配 "sina.com"、"sina.com.cn" 和 "www.sina.com"，但不匹配 "sina.cn"。
- 预定义域名列表：由 `"geosite:"` 开头，余下部分是一个名称，如 `geosite:google` 或者 `geosite:cn`。名称及域名列表参考 [预定义域名列表](./routing.md#预定义域名列表)。

> `servers`: \[string | [DnsServerObject](#dnsserverobject) \]

一个 DNS 服务器列表，支持的类型有两种：DNS 地址（字符串形式）和 [DnsServerObject](#dnsserverobject) 。

当值为 `"localhost"` 时，表示使用本机预设的 DNS 配置。

当它的值是一个 DNS `"IP:Port"` 地址时，如 `"8.8.8.8:53"`，Xray 会使用此地址的指定 UDP 端口进行 DNS 查询。该查询遵循路由规则。不指定端口时，默认使用 53 端口。

当值是 `"tcp://host:port"` 的形式，如 `"tcp://8.8.8.8:53"`，Xray 会使用 `DNS over TCP` 进行查询。该查询遵循路由规则。不指定端口时，默认使用 53 端口。

当值是 `"tcp+local://host:port"` 的形式，如 `"tcp+local://8.8.8.8:53"`，Xray 会使用 `TCP 本地模式 (TCPL)` 进行查询。即 DNS 请求不会经过路由组件，直接通过 Freedom outbound 对外请求，以降低耗时。不指定端口时，默认使用 53 端口。

当值是 `"https://host:port/dns-query"` 的形式，如 `"https://dns.google/dns-query"`，Xray 会使用 `DNS over HTTPS` (RFC8484, 简称 DOH) 进行查询。有些服务商拥有 IP 别名的证书，可以直接写 IP 形式，比如 `https://1.1.1.1/dns-query`。也可使用非标准端口和路径，如 `"https://a.b.c.d:8443/my-dns-query"`

当值是 `"h2c://host:port/dns-query"` 的形式，如 `"h2c://dns.google/dns-query"`，Xray 会使用 `DNS over HTTPS` 的请求格式但是将会以明文 h2c 发出请求，不能直接使用，在这种情况下需要自行配置 Freedom 出站 + streamSettings 设置 TLS 为其配置 TLS 以包装成正常的 DOH 请求。用于特殊目的，比如想要自定义 DOH 请求的 SNI 或者使用 utls 的指纹时使用。

当值是 `"https+local://host:port/dns-query"` 的形式，如 `"https+local://dns.google/dns-query"`，Xray 会使用 `DOH 本地模式 (DOHL)` 进行查询，即 DOH 请求不会经过路由组件，直接通过 Freedom outbound 对外请求，以降低耗时。一般适合在服务端使用。也可使用非标端口和路径。

当值是 `"quic+local://host"` 的形式，如 `"quic+local://dns.adguard.com"`，Xray 会使用 `DNS over QUIC 本地模式 (DOQL)` 进行查询，即 DNS 请求不会经过路由组件，直接通过 Freedom outbound 对外请求。该方式需要 DNS 服务器支持 DNS over QUIC。默认使用 853 端口进行查询，可以使用非标端口。

当值是 `fakedns` 时，将使用 FakeDNS 功能进行查询。

::: tip TIP 1
当使用 `localhost` 时，本机的 DNS 请求不受 Xray 控制，需要额外的配置才可以使 DNS 请求由 Xray 转发。
:::

::: tip TIP 2
不同规则初始化得到的 DNS 客户端会在 Xray 启动日志中以 `info` 级别体现，比如 `local DOH`、`remote DOH` 和 `udp` 等模式。
:::

::: tip TIP 3
(v1.4.0+) 可以在 [日志](./log.md) 中打开 DNS 查询日志。
:::

> `clientIp`: string

EDNS Client Subnet 扩展中使用的 IP 地址。

需要是一个有效的 IPv4 或者 IPv6. 实际发送时会自动抹掉最后几位，IPv4 和 IPv6 分别以 /24 和 /96 的子网发送。

> `queryStrategy`: "UseIP" | "UseIPv4" | "UseIPv6" | "UseSystem"

限制 DNS 模块中所有服务器的能力，以及由 Xray 自身发起的 IP 查询类型的默认值。

默认值 `UseIP` 允许查询 A + AAAA。由 Xray 自身发起的查询未指定 IP 类型时，同时向上游 DNS 服务器查询 A 和 AAAA 记录。`UseIPv4` 只查询且只允许查询 A 记录；`UseIPv6` 只查询且只允许查询 AAAA 记录。

`UseSystem` 自适应操作系统网络环境。查询前分别检查是否有 IPv4 和 IPv6 的默认网关，如果有就查询且只允许查询对应类型的记录。在图形环境操作系统上实时检查，在命令行环境只检查一次。

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
                "queryStrategy": "UseIPv4" // netflix 的域名查询 A 记录
            },
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:openai"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // openai 的域名查询 AAAA 记录
            }
        ],
        "queryStrategy": "UseIP" // 全局同时查询 A 和 AAAA 记录
    }
```

::: tip TIP 1
全局 `"queryStrategy"` 值优先，当子项中的 `"queryStrategy"` 值与全局 `"queryStrategy"` 值冲突时，子项的查询将空响应。
:::

::: tip TIP 2
当子项中不写 `"queryStrategy"` 参数时，使用全局 `"queryStrategy"` 参数值。与 Xray-core v1.8.6 以前版本行为相同。
:::

例如：<br>
全局 `"queryStrategy": "UseIPv6"` 与 子项 `"queryStrategy": "UseIPv4"` 冲突。<br>
全局 `"queryStrategy": "UseIPv4"` 与 子项 `"queryStrategy": "UseIPv6"` 冲突。<br>
全局 `"queryStrategy": "UseIP"` 与 子项 `"queryStrategy": "UseIPv6"` 不冲突。<br>
全局 `"queryStrategy": "UseIP"` 与 子项 `"queryStrategy": "UseIPv4"` 不冲突。

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
                "queryStrategy": "UseIPv6" // 全局 "UseIPv4" 与 子项 "UseIPv6" 冲突
            }
        ],
        "queryStrategy": "UseIPv4"
    }
```

子项 netflix 的域名查询由于 `"queryStrategy"` 值冲突，得到空响应。netflix 的域名由 `https://1.1.1.1/dns-query` 查询，得到 A 记录。

> `disableCache`: true | false

`true` 禁用 DNS 缓存，默认为 `false`，即不禁用。

它不会对 `localhost` DNS (系统 DNS) 生效，它总是跟随 golang 的 DNS 缓存行为(cgo 与 pure go 可能略有不同)。

> `disableFallback`: true | false

`true` 禁用 DNS 的 fallback 查询，默认为 `false`，即不禁用。

> `disableFallbackIfMatch`: true | false

`true` 当 DNS 服务器的优先匹配域名列表命中时，禁用 fallback 查询，默认为 `false`，即不禁用。

> `useSystemHosts`: true | false

如果为真，将系统 hosts 文件附加到内置 DNS 的 hosts 中。

> `tag`: string

由内置 DNS 发出的查询流量，除 `localhost`、`fakedns`、`TCPL`、`DOHL` 和 `DOQL` 模式外，都可以用此标识在路由使用 `inboundTag` 进行匹配。

### DnsServerObject

```json
{
  "tag": "dns-tag",
  "address": "1.2.3.4",
  "port": 5353,
  "domains": ["domain:xray.com"],
  "expectedIPs": ["geoip:cn"],
  "unexpectedIPs": ["geoip:cloudflare"],
  "skipFallback": false,
  "clientIP": "1.2.3.4",
  "queryStrategy": "UseIPv4",
  "timeoutMs": 4000,
  "disableCache": false,
  "finalQuery": false
}
```

> `tag`: string

该 DNS 服务器的 tag, 若设置，将使用该 tag 作为 inbound tag 发起请求(非 local 模式)，覆盖全局 tag 选项。

> `address`: address

一个 DNS 服务器列表，支持的类型有两种：DNS 地址（字符串形式）和 DnsServerObject 。

当值为 `"localhost"` 时，表示使用本机预设的 DNS 配置。

当它的值是一个 DNS `"IP"` 地址时，如 `"8.8.8.8"`，Xray 会使用此地址的指定 UDP 端口进行 DNS 查询。该查询遵循路由规则。默认使用 53 端口。

当值是 `"tcp://host"` 的形式，如 `"tcp://8.8.8.8"`，Xray 会使用 `DNS over TCP` 进行查询。该查询遵循路由规则。默认使用 53 端口。

当值是 `"tcp+local://host"` 的形式，如 `"tcp+local://8.8.8.8"`，Xray 会使用 `TCP 本地模式 (TCPL)` 进行查询。即 DNS 请求不会经过路由组件，直接通过 Freedom outbound 对外请求，以降低耗时。不指定端口时，默认使用 53 端口。

当值是 `"https://host:port/dns-query"` 的形式，如 `"https://dns.google/dns-query"`，Xray 会使用 `DNS over HTTPS` (RFC8484, 简称 DOH) 进行查询。有些服务商拥有 IP 别名的证书，可以直接写 IP 形式，比如 `https://1.1.1.1/dns-query`。也可使用非标准端口和路径，如 `"https://a.b.c.d:8443/my-dns-query"`

当值是 `"https+local://host:port/dns-query"` 的形式，如 `"https+local://dns.google/dns-query"`，Xray 会使用 `DOH 本地模式 (DOHL)` 进行查询，即 DOH 请求不会经过路由组件，直接通过 Freedom outbound 对外请求，以降低耗时。一般适合在服务端使用。也可使用非标端口和路径。

当值是 `"quic+local://host:port"` 的形式，如 `"quic+local://dns.adguard.com"`，Xray 会使用 `DOQ 本地模式 (DOQL)` 进行查询，即 DNS 请求不会经过路由组件，直接通过 Freedom outbound 对外请求。该方式需要 DNS 服务器支持 DNS over QUIC。默认使用 853 端口进行查询，可以使用非标端口。

当值是 `fakedns` 时，将使用 FakeDNS 功能进行查询。

::: tip 关于 local 模式和 DNS 服务器本身的域名
由 DNS 模块发出的 DNS 请求有两种情况：

local 模式将直接由核心向外连接，这种情况下如果地址是一个域名将交由系统本身进行解析，逻辑较为简单。

非 local 默认将视为一个从 tag 为 dns.tag(不知道在哪？ 浏览器 ctrl+f 搜索 `inboundTag`) 的入站进来的请求，将经过正常的核心处理流程，可能会被路由模块分配去本地 freedom 或者其他远端出站，它将被 freedom 的 domainStrategy解析(注意可能的回环) 或者直接以域名的形式被传送到远端根据服务端本身的解析方式解析。

由于普通人可能难以理清其中的逻辑，建议(特别是在透明代理的环境下)，直接在 DNS 模块的 host 选项中直接为带域名的服务器设置它们对应的 IP 防止出现回环。

顺便 DNS 模块非 local 模式发出的 DNS 请求将会自动在路由模块中跳过 IPIfNonMatch 和 IPOnDemand 的解析过程，防止它们的解析会被送回 DNS 模块导致回环。
:::

> `port`: number

DNS 服务器端口，如 `53`。此项缺省时默认为 `53`。当使用 DOH、DOHL、DOQL 模式时该项无效，非标端口应在 URL 中指定。

> `domains`: \[string\]

一个域名列表，此列表包含的域名，将优先使用此服务器进行查询。域名格式和 [路由配置](./routing.md#ruleobject) 中相同。

> `expectedIPs`:\[string\]

一个 IP 范围列表，格式和 [路由配置](./routing.md#ruleobject) 中相同。

当配置此项时，配置后，Xray DNS 会对返回的 IP 的进行校验，只返回包含 expectedIPs 列表中的地址。

如果列表中存在 \* 那么如果过滤后不存在 IP, 仍然返回原 IP 使请求不至于失败。

> `unexpectedIPs`: [string]

`expectedIPs` 的反向版本，去掉包含于这个列表的 IP. 星号的作用相同。

> `skipFallback`: true | false

`true`，在进行 DNS fallback 查询时将跳过此服务器, 默认为 `false`，即不跳过。

> `clientIP`: [string]

EDNS Client Subnet 扩展中使用的 IP 地址。

需要是一个有效的 IPv4 或者 IPv6. 实际发送时会自动抹掉最后几位，IPv4 和 IPv6 分别以 /24 和 /96 的子网发送。

> `queryStrategy`: "UseIP" | "UseIPv4" | "UseIPv6" | "UseSystem"

限制此服务器的能力，以及由 Xray 自身发起的 IP 查询命中此服务器时查询类型的默认值。

默认值 `UseIP` 允许查询 A + AAAA。由 Xray 自身发起的查询未指定 IP 类型时，同时向上游 DNS 服务器查询 A 和 AAAA 记录。`UseIPv4` 只查询且只允许查询 A 记录；`UseIPv6` 只查询且只允许查询 AAAA 记录。

`UseSystem` 自适应操作系统网络环境。查询前分别检查是否有 IPv4 和 IPv6 的默认网关，如果有就查询且只允许查询对应类型的记录。在图形环境操作系统上实时检查，在命令行环境只检查一次。

> `timeoutMs`: number

DNS 服务器超时时间，默认 4000 ms.

它不会对 `localhost` DNS (系统 DNS) 生效，它总是跟随 golang 的 DNS 超时行为(cgo 与 pure go 可能略有不同)。

> `disableCache`: true | false

`true` 禁用 DNS 缓存，默认为 `false`，即不禁用。

它不会对 `localhost` DNS (系统 DNS) 生效，它总是跟随 golang 的 DNS 缓存行为(cgo 与 pure go 可能略有不同)。

> `finalQuery`: true | false

如果设置为真，该 DNS 服务器的请求会是最终尝试，不会触发 fallback 行为。
