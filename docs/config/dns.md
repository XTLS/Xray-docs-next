# 内置 DNS 服务器

## DNS 服务器

Xray 内置的 DNS 模块，主要有两大用途：

- 在路由阶段, 解析域名为 IP, 并且根据域名解析得到的 IP 进行规则匹配以分流. 是否解析域名及分流和路由配置模块中 `domainStrategy` 的值有关, 只有在设置以下两种值时,才会使用内置 DNS 服务器进行 DNS 查询:

  - "IPIfNonMatch", 请求一个域名时，进行路由里面的 domain 进行匹配，若无法匹配到结果，则对这个域名使用内置 DNS 服务器进行 DNS 查询，并且使用查询返回的 IP 地址再重新进行 IP 路由匹配。
  - "IPOnDemand", 当匹配时碰到任何基于 IP 的规则，将域名立即解析为 IP 进行匹配。

- 解析目标地址进行连接。
  - 如 在 `freedom` 出站中，将 `domainStrategy` 设置为 `UseIP`, 由此出站发出的请求, 会先将域名通过内置服务器解析成 IP, 然后进行连接。
  - 如 在 `sockopt` 中，将 `domainStrategy` 设置为 `UseIP`, 此出站发起的系统连接，将先由内置服务器解析为 IP, 然后进行连接。

::: tip TIP 1
内置 DNS 服务器所发出的 DNS 查询请求，会自动根据路由配置进行转发。
:::

::: tip TIP 2
只支持最基本的 IP 查询（A 和 AAAA 记录）。其他查询不会进入内置 DNS 服务器。
:::

## DNS 处理流程

DNS 服务器配置模块可以配置多个 DNS 服务器, 并且指定优先匹配列表.

1. 查询的域名与某个 DNS 服务器指定的域名列表匹配时，Xray 会优先使用这个 DNS 服务器进行查询。
2. 无匹配时, 按从上往下的顺序进行查询，并且会跳过 1 步骤中使用的最后一个服务器。
3. 只返回匹配 expectIPs 的 IP 列表。

DNS 服务器的处理流程示意图如下：

![](./dns_flow.png?classes=border,shadow)

## DnsObject

`DnsObject` 对应配置文件的 `dns` 项。

```json
{
  "dns": {
    "hosts": {
      "baidu.com": "127.0.0.1"
    },
    "servers": [
      "8.8.8.8",
      "8.8.4.4",
      {
        "address": "1.2.3.4",
        "port": 5353,
        "domains": ["domain:xray.com"],
        "expectIPs": ["geoip:cn"]
      },
      "localhost"
    ],
    "clientIp": "1.2.3.4",
    "tag": "dns_inbound"
  }
}
```

> `hosts`: map{string: address}

静态 IP 列表，其值为一系列的 "域名": "地址"。其中地址可以是 IP 或者域名。在解析域名时，如果域名匹配这个列表中的某一项:

- 当该项的地址为 IP 时，则解析结果为该项的 IP
- 当该项的地址为域名时，会使用此域名进行 IP 解析，而不使用原始域名。

域名的格式有以下几种形式：

- 纯字符串：当此字符串完整匹配目标域名时，该规则生效。例如 "xray.com" 匹配 "xray.com"，但不匹配 "www.xray.com"。
- 正则表达式：由 `"regexp:"` 开始，余下部分是一个正则表达式。当此正则表达式匹配目标域名时，该规则生效。例如 "regexp:\\\\.goo.\*\\\\.com\$" 匹配 "www.google.com"、"fonts.googleapis.com"，但不匹配 "google.com"。
- 子域名 (推荐)：由 `"domain:"` 开始，余下部分是一个域名。当此域名是目标域名或其子域名时，该规则生效。例如 "domain:xray.com" 匹配 "www.xray.com" 与 "xray.com"，但不匹配 "wxray.com"。
- 子串：由 `"keyword:"` 开始，余下部分是一个字符串。当此字符串匹配目标域名中任意部分，该规则生效。比如 "keyword:sina.com" 可以匹配 "sina.com"、"sina.com.cn" 和 "www.sina.com"，但不匹配 "sina.cn"。
- 预定义域名列表：由 `"geosite:"` 开头，余下部分是一个名称，如 `geosite:google` 或者 `geosite:cn`。名称及域名列表参考 [预定义域名列表](./routing.md#预定义域名列表)。

> `servers`: \[string | [ServerObject](#serverobject) \]

一个 DNS 服务器列表，支持的类型有两种：DNS 地址（字符串形式）和 [ServerObject](#serverobject) 。

当它的值是一个 DNS IP 地址时，如 `"8.8.8.8"`，Xray 会使用此地址的 53 端口进行 DNS 查询。

当值为 `"localhost"` 时，表示使用本机预设的 DNS 配置。

当值是 `"https://host:port/dns-query"` 的形式，如 `"https://dns.google/dns-query"`，Xray 会使用 `DNS over HTTPS` (RFC8484, 简称 DOH) 进行查询。有些服务商拥有 IP 别名的证书，可以直接写 IP 形式，比如 `https://1.1.1.1/dns-query`。也可使用非标准端口和路径，如 `"https://a.b.c.d:8443/my-dns-query"`

当值是 `"https+local://host:port/dns-query"` 的形式，如 `"https+local://dns.google/dns-query"`，Xray 会使用 `DOH本地模式` 进行查询，即 DOH 请求不会经过 Routing/Outbound 等组件，直接对外请求，以降低耗时。一般适合在服务端使用。也可使用非标端口和路径。

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

用于 DNS 查询时通知服务器以指定 IP 位置。不能是私有地址。

> `tag`: string

由内置 DNS 发出的查询流量，除 `localhost` 和 `DOHL_` 模式外，都可以用此标识在路由使用 `inboundTag` 进行匹配。

### ServerObject

```json
{
  "address": "1.2.3.4",
  "port": 5353,
  "domains": ["domain:xray.com"],
  "expectIPs": ["geoip:cn"]
}
```

> `address`: address

一个 DNS 服务器列表，支持的类型有两种：DNS 地址（字符串形式）和 ServerObject 。

当它的值是一个 DNS IP 地址时，如 "8.8.8.8"，Xray 会使用此地址的 53 端口进行 DNS 查询。

当值为 "localhost" 时，表示使用本机预设的 DNS 配置。

当值是 "https://host:port/dns-query" 的形式，如 "https://dns.google/dns-query"，Xray 会使用 DNS over HTTPS (RFC8484, 简称 DOH) 进行查询。有些服务商拥有 IP 别名的证书，可以直接写 IP 形式，比如 https://1.1.1.1/dns-query。也可使用非标准端口和路径，如 "https://a.b.c.d:8443/my-dns-query"

当值是 "https+local://host:port/dns-query" 的形式，如 "https+local://dns.google/dns-query"，Xray 会使用 DOH 本地模式 进行查询，即 DOH 请求不会经过 Routing/Outbound 等组件，直接对外请求，以降低耗时。一般适合在服务端使用。也可使用非标端口和路径。

当值是 `fakedns` 时，将使用 FakeDNS 功能进行查询。

> `port`: number

DNS 服务器端口，如 `53`。此项缺省时默认为 `53`。当使用 DOH 模式该项无效，非标端口应在 URL 中指定。

> `domains`: \[string\]

一个域名列表，此列表包含的域名，将优先使用此服务器进行查询。域名格式和 [路由配置](./routing.md#ruleobject) 中相同。

> `expectIPs`:\[string\]

一个 IP 范围列表，格式和 [路由配置](./routing.md#ruleobject) 中相同。

当配置此项时，Xray DNS 会对返回的 IP 的进行校验，只返回包含 expectIPs 列表中的地址。

如果未配置此项，会原样返回 IP 地址。
