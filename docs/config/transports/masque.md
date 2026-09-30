# MASQUE

MASQUE CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的传输，与 masque [出站](../outbounds/masque.md) 和 [入站](../inbounds/masque.md) 搭配使用。

它以扩展 CONNECT（`:protocol` 为 `connect-ip`）建立隧道，IP 包通过 HTTP Datagram（[RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)）传输，支持两种 HTTP 版本：

- HTTP/3（默认）：基于 QUIC，IP 包以 QUIC DATAGRAM 帧收发，对端改用 DATAGRAM capsule 发来的包会被丢弃。
- HTTP/2（[RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)）：基于 TCP，IP 包以 DATAGRAM capsule 在请求流中收发，可用于 UDP 不可用的网络。

HTTP 版本由 `tlsSettings` 的 `alpn` 决定：

- 出站：`alpn` 含 `h2` 且不含 `h3` 时使用 HTTP/2，否则使用 HTTP/3。
- 入站：`alpn` 含 `h2` 时监听 HTTP/2（TCP），含 `h3` 或不含 `h2` 时监听 HTTP/3（UDP）。两者都有时在同一端口上同时提供。

::: tip
不支持 REALITY。

使用 HTTP/3 时，RFC 9484 要求隧道能承载 1280 字节的 IPv6 包，Chrome 的初始包大小（1250 字节）装不下，因此 MASQUE 不使用 [quicParams](./finalmask.md#quicparams) 的 Chrome 指纹，QUIC 初始包大小固定为 1350 字节。路径 MTU 更小时无法建立连接。

使用 HTTP/2 时，出站的 TLS 握手使用 `tlsSettings` 的 `fingerprint`，默认为 `chrome`，[quicParams](./finalmask.md#quicparams) 不生效。
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
          "user": "love@xray.com",
          "pass": "password",
          "headers": {}
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

入站只使用 `path`，其余各项仅用于出站。

> `host`: string

请求的 `:authority`。优先级为 `host` > `serverName` > `address`，后两者在端口不是 443 时会带上端口。

> `path`: string

服务端的 URI 模板路径，默认为 RFC 9484 的 `/.well-known/masque/ip/{target}/{ipproto}/`。

只支持完整隧道，`{target}` 与 `{ipproto}` 会被填为 `*`，不支持其他模板变量。

入站只接受路径与之相同的请求，其余请求会得到 404，因此两端的 `path` 需要一致。

> `user`: string

> `pass`: string

HTTP Basic 认证的用户名与密码，对应 masque 入站 [UserObject](../inbounds/masque.md#userobject) 的 `email` 与 `pass`。`user` 不能包含 `:`。

> `headers`: map \{string: string\}

请求中附加的 HTTP 头，可用于 `user` 与 `pass` 以外的认证方式，例如 `"Authorization": "Bearer ..."`。

不能包含 `host` 和 `Capsule-Protocol`，设置了 `user` 或 `pass` 时也不能包含 `Authorization`。默认不发送 `User-Agent`，也支持 `chrome`、`firefox`、`safari`、`edge`、`curl`、`golang` 等特殊值。
