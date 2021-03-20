# Freedom

Freedom 是一个出站协议，可以用来向任意网络发送（正常的） TCP 或 UDP 数据。

## OutboundConfigurationObject

```json
{
  "domainStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0
}
```

> `domainStrategy`: "AsIs" | "UseIP" | "UseIPv4" | "UseIPv6"

在目标地址为域名时, 配置相应的值, Freedom 的行为模式如下:
- `"AsIs"`: Freedom 通过系统DNS服务器解析获取IP, 向此域名发出连接.
- `"UseIP"`、`"UseIPv4"` 和 `"UseIPv6"`: Xray 使用 [内置 DNS 服务器](../dns.md) 解析获取IP, 向此域名发出连接. 
默认值为 `"AsIs"`。

::: tip TIP 1
当使用 `"UseIP"` 模式，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，Freedom 会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。
:::

::: tip TIP 2
当使用 `"UseIPv4"` 或 `"UseIPv6"` 模式时，Freedom 会只使用对应的 IPv4 或 IPv6 地址。当 `sendThrough` 指定了不匹配的本地地址时，将导致连接失败。
:::

> `redirect`: address_port

Freedom 会强制将所有数据发送到指定地址（而不是 inbound 指定的地址）。

其值为一个字符串，样例：`"127.0.0.1:80"`，`":1234"`。

当地址不指定时，如 `":443"`，Freedom 不会修改原先的目标地址。
当端口为 `0` 时，如 `"xray.com: 0"`，Freedom 不会修改原先的端口。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
