# MASQUE

IETF MASQUE 中 CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的客户端实现：通过 HTTP/3 在代理服务器上建立一条 IP 隧道，可连接任何遵循该标准的服务端。

与 WireGuard 出站类似，Xray 在本地运行一个用户态网络栈，以服务端分配的地址把 TCP 和 UDP 流量转换为 IP 包送入隧道。同一个出站的所有连接共用一条隧道，隧道在第一个连接时建立，断开后在下一个连接时重建。

HTTP/3 请求与认证在传输配置 [masqueSettings](../transports/masque.md) 中，QUIC 参数见 [FinalMask.quicParams](../transports/finalmask.md#quicparams)。

::: tip
MASQUE 出站只能搭配 `masque` 传输层，且必须使用 `tls`。
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

> `port`: int

MASQUE 服务器端口，必填。

> `remoteDNS`: \[ string \]

目标为域名时，在隧道内使用的 DNS 服务器，必须是 IP。只会使用与服务端所分配地址同族的服务器。

默认为 `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`。如需在本地解析域名，请使用出站的 `targetStrategy`。
