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
    "interval": "10-20" // ms
  }
}
```

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

Xray-core v1.8.6 新增功能：<br>
`"UseIPv6v4"` | `"UseIPv4v6"`<br>
`"ForceIP"` | `"ForceIPv6v4"` | `"ForceIPv6"` | `"ForceIPv4v6"` | `"ForceIPv4"`

若不写此参数，或留空，默认值 `"AsIs"`。

在目标地址为域名时, 配置相应的值, Freedom 的行为模式如下:

- `"AsIs"`: Freedom 通过系统 DNS 服务器解析获取 IP, 向此域名发出连接。
- `"UseIP"`、`"UseIPv4"` 和 `"UseIPv6"`: Xray 使用 [内置 DNS 服务器](../dns.md) 解析获取 IP, 向此域名发出连接。

::: tip TIP 1
当使用 `"UseIP"` 模式，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，Freedom 会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。
:::

::: tip TIP 2
当使用 `"UseIPv4"` 或 `"UseIPv6"` 模式时，Freedom 会只使用对应的 IPv4 或 IPv6 地址。当 `sendThrough` 指定了不匹配的本地地址时，将导致连接失败。
:::

```jsonc
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query"
        ],
        "queryStrategy": "UseIP" // 默认值 UseIP
    }
```

- UseIP 同时查询 A 和 AAAA 记录
- UseIPv4 只查询 A 记录
- UseIPv6 只查询 AAAA 记录

| | UseIP | UseIPv6v4 | UseIPv6 | UseIPv4v6 | UseIPv4 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `"queryStrategy": "UseIP"` | **1** | **2** | IPv6 | **3** | IPv4 |
| `"queryStrategy": "UseIPv4"` | IPv4 | **4** | **5** | **6** | IPv4 |
| `"queryStrategy": "UseIPv6"` | IPv6 | **7** | IPv6 | **8** | **9** |

| | ForceIP | ForceIPv6v4 | ForceIPv6 | ForceIPv4v6 | ForceIPv4 |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `"queryStrategy": "UseIP"` | **1** | **2** | IPv6 | **3** | IPv4 |
| `"queryStrategy": "UseIPv4"` | IPv4 | IPv4 | 冲突 | IPv4 | IPv4 |
| `"queryStrategy": "UseIPv6"` | IPv6 | IPv6 | IPv6 | IPv6 | 冲突 |

**1：** IPv4 IPv6 地址，随机优先<br>
**2：** IPv4 IPv6 地址，IPv6 优先<br>
**3：** IPv4 IPv6 地址，IPv4 优先<br>
**4：** IPv4 IPv6 地址，IPv6 优先，IPv6 地址由系统 DNS 查询<br>
**5：** IPv6 地址，IPv6 地址由系统 DNS 查询<br>
**6：** IPv4 IPv6 地址，IPv4 优先，IPv6 地址由系统 DNS 查询<br>
**7：** IPv4 IPv6 地址，IPv6 优先，IPv4 地址由系统 DNS 查询<br>
**8：** IPv4 IPv6 地址，IPv4 优先，IPv4 地址由系统 DNS 查询<br>
**9：** IPv4 地址，IPv4 地址由系统 DNS 查询

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
