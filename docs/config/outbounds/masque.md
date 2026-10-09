# MASQUE

MASQUE CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的客户端，通过 HTTP/3 或 HTTP/2 在服务端建立一条 IP 隧道，可连接 MASQUE [入站](../inbounds/masque.md)、Cloudflare WARP 以及其他遵循该标准、为客户端分配地址的服务端。

与 WireGuard 出站类似，Xray 在本地运行一个用户态网络栈，用服务端分配的地址把 TCP 和 UDP 流量转换为 IP 包送入隧道。同一个出站的所有连接共用一条隧道，隧道在第一个连接时建立，断开后在下一个连接时重建。

HTTP 请求与认证在传输配置 [masqueSettings](../transports/masque.md) 中设置，HTTP 版本由 `tlsSettings` 的 `alpn` 决定，接入 WARP 见 [通过 MASQUE 接入 Warp](../../document/level-2/warp.md#通过-masque-接入-warp)。

::: tip
MASQUE 出站只能搭配 `masque` 传输方式，且必须使用 `tls`，不支持 Mux。
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "masque",
      // [!field focus]
      "settings": {
        "address": "example.com",
        "port": 443,
        "remoteDNS": ["1.1.1.1", "2606:4700:4700::1111"]
      }
    }
  ]
}
```

> `address`: string

MASQUE 服务器地址，必填。

> `port`: number

MASQUE 服务器端口，必填。

> `remoteDNS`: \[ string \]

目标为域名时在隧道内使用的 DNS 服务器，必须是 IP。优先使用与服务端所分配地址同一地址族的服务器，都不匹配时使用全部。

默认为 `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`。如需在本地解析域名，请使用出站的 `targetStrategy`。
