# MASQUE

MASQUE CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的 HTTP/3 传输，与 masque [出站](../outbounds/masque.md) 搭配使用。

它以 HTTP/3 扩展 CONNECT（`:protocol` 为 `connect-ip`）建立隧道，IP 包通过 HTTP Datagram（[RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)）传输。只支持以 QUIC DATAGRAM 帧收发 IP 包，服务端改用 DATAGRAM capsule 发来的包会被丢弃。

::: tip
始终使用 HTTP/3，ALPN 固定为 `h3`，不支持 REALITY。

RFC 9484 要求隧道能承载 1280 字节的 IPv6 包，Chrome 的初始包大小（1250 字节）装不下，因此 MASQUE 不使用 [quicParams](./finalmask.md#quicparams) 的 Chrome 指纹，QUIC 初始包大小固定为 1350 字节。路径 MTU 更小时无法建立连接。
:::

## MasqueObject

`MasqueObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `masqueSettings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "method": "masque",
        // [!field focus]
        "masqueSettings": {
          "host": "example.com",
          "path": "/.well-known/masque/ip/{target}/{ipproto}/",
          "headers": {
            "Authorization": "Basic dXNlcjpwYXNz"
          }
        },
        "security": "tls",
        "tlsSettings": {
          "serverName": "example.com"
        }
      }
    }
  ]
}
```

> `host`: string

请求的 `:authority`。优先级为 `host` > `serverName` > `address`，后两者在端口不是 443 时会带上端口。

> `path`: string

服务端的 URI 模板路径，默认为 RFC 9484 的 `/.well-known/masque/ip/{target}/{ipproto}/`。

只支持完整隧道，`{target}` 与 `{ipproto}` 会被填为 `*`，不支持其他模板变量。

> `headers`: map \{string: string\}

请求中附加的 HTTP 头，常用于认证，例如 `"Authorization": "Basic " + base64("用户名:密码")` 或 `"Authorization": "Bearer ..."`。

不能包含 `host` 和 `Capsule-Protocol`。默认不发送 `User-Agent`，也支持 `chrome`、`firefox`、`safari`、`edge`、`curl`、`golang` 等特殊值。
