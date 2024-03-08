# Freedom

Freedom 是一个出站协议，可以用来向任意网络发送（正常的） TCP 或 UDP 数据。

## OutboundConfigurationObject

```json
{
  "domainStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0,
  "fragment": {
    "packets": "tlshello",
    "length": "100-200",
    "interval": "10-20" // 单位ms
  },
  "proxyProtocol": 0
}
```

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

默认值 `"AsIs"`。

当目标地址为域名时，配置相应的值，Freedom 的行为模式如下：

- 当使用 `"AsIs"` 时，Xray将直接使用系统栈发起连接，优先级与选择IP取决于系统设置。
- 当填写其他值时，将使用 Xray-core [内置 DNS 服务器](../dns.md) 服务器进行解析。若不存在DNSObject，则使用系统DNS。若有多个符合条件的IP地址时，核心会随机选择一个IP作为目标IP。
- `"IPv4"` 代表尝试仅使用IPv4进行连接，`"IPv4v6"` 代表尝试使用IPv4或IPv6连接，但对于双栈域名，尽量使用IPv4。（v4v6调换后同理，不再赘述）
- 当使用 `"Use"` 开头的选项时，若解析结果不符合要求（如，域名只有IPv4解析结果但使用了UseIPv6），则会回落回AsIs。
- 当使用 `"Force"` 开头的选项时，若解析结果不符合要求，则该连接会无法建立。

::: tip TIP 1
当使用 `"UseIP"`、`"ForceIP"` 模式时，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，Freedom 会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。若手动指定了单种IP类型（如UseIPv4），但与 `sendThrough` 指定的本地地址不匹配，将会导致连接失败。
:::

> `redirect`: address_port

Freedom 会强制将所有数据发送到指定地址（而不是 inbound 指定的地址）。

其值为一个字符串，样例：`"127.0.0.1:80"`，`":1234"`。

当地址不指定时，如 `":443"`，Freedom 不会修改原先的目标地址。
当端口为 `0` 时，如 `"xray.com: 0"`，Freedom 不会修改原先的端口。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `fragment`: map

一些键值对配置项，用于控制发出的 TCP 分片，在某些情况下可以欺骗审查系统，比如绕过 SNI 黑名单。

`"packets"`：支持两种分片方式 "1-3" 是 TCP 的流切片，应用于客户端第 1 至第 3 次写数据。"tlshello" 是 TLS 握手包切片。

`"length"`：分片包长 (byte)

`"interval"`：分片间隔（ms）

> `proxyProtocol`: number

PROXY protocol 通常配合 `redirect` 重定向到开启了 PROXY protocol 协议的 Nginx 或其他后端服务中。如果后端服务不支持 PROXY protocol 协议，连接将会被断开。

proxyProtocol 的值为 PROXY protocol 版本号，可选 `1` 或 `2`，如不指定，默认为 `0` 不启用。
