# MASQUE

MASQUE CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）传输方式，在 HTTP/3 或 HTTP/2 之上承载 IP 包，与 MASQUE [出站](../outbounds/masque.md) 和 [入站](../inbounds/masque.md) 配合使用。

- HTTP/3：基于 QUIC，IP 包以 QUIC DATAGRAM 收发。
- HTTP/2：基于 TCP，以扩展 CONNECT（[RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)）建立隧道，可用于 UDP 不可用的网络。

使用哪个 HTTP 版本由 `tlsSettings` 的 `alpn` 决定：

- 出站：`alpn` 含 `h2` 且不含 `h3` 时使用 HTTP/2，否则使用 HTTP/3。
- 入站：`alpn` 含 `h2` 时在 TCP 上提供 HTTP/2，含 `h3` 或不含 `h2` 时在 UDP 上提供 HTTP/3，两者都有时在同一端口上同时提供。

::: tip
必须使用 `tls`，不支持 REALITY。

使用 HTTP/3 时，QUIC 初始包大小固定为 1350 字节，路径 MTU 更小时无法建立连接，也不像 Hysteria 与 XHTTP H3 那样模仿 Chrome 的 QUIC 指纹。[quicParams](./finalmask.md#quicparams) 的拥塞控制默认为 `bbr`，`brutal` 也按 `bbr` 运行，需要 Brutal 时请用 `force-brutal`。

使用 HTTP/2 时，出站的 TLS 握手使用 `tlsSettings` 的 `fingerprint`，默认为 `chrome`，`quicParams` 不生效。

[FinalMask](./finalmask.md) 的 UDP 掩码作用于 HTTP/3，TCP 掩码作用于 HTTP/2。
:::

接入 Cloudflare WARP 请看 [通过 MASQUE 接入 Warp](../../document/level-2/warp.md#通过-masque-接入-warp)。

## MasqueObject

`MasqueObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `masqueSettings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "masque",
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

CONNECT-IP 请求的 `:authority`。优先级为 `host` > `serverName` > `address`，后两者在端口不是 443 时会带上端口。

> `path`: string

URI 模板路径，默认为 RFC 9484 的 `/.well-known/masque/ip/{target}/{ipproto}/`。

只支持完整隧道，`{target}` 与 `{ipproto}`（包括 `{?target,ipproto}` 这类查询形式）会被填为 `*`，不支持其他变量，路径须以 `/` 开头。

入站只接受路径与之相同的请求，其余请求返回 404，因此两端的 `path` 要一致。

> `user`: string

> `pass`: string

HTTP Basic 认证的用户名与密码，对应 MASQUE 入站 [UserObject](../inbounds/masque.md#userobject) 的 `email` 与 `pass`。`user` 不能包含 `:`。

> `headers`: map \{string: string\}

请求中附加的 HTTP 头，可用于 `user` / `pass` 以外的认证方式，例如 `"Authorization": "Bearer ..."`。

不能包含 `Host` 和 `Capsule-Protocol`，设置了 `user` 或 `pass` 时也不能包含 `Authorization`。默认不发送 `User-Agent`，也可以填 `chrome`、`firefox`、`safari`、`edge`、`curl`、`golang` 这些特殊值。

> `warp`: [WarpObject](../../document/level-2/warp.md#warpobject)

接入 Cloudflare WARP 时的设备信息。设置后 `host` 默认为 `cloudflareaccess.com`，`path` 默认为 `/`，且不能再设置 `user` / `pass`，隧道地址使用其中的 `address`，不再由服务端分配。`tlsSettings` 中设置了 `pinnedPeerCertSha256` 或 `verifyPeerCertByName` 时，忽略其中的 `publicKey`，只按它们验证服务端证书。
