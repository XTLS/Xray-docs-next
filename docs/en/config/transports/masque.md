# MASQUE

The MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)) transport, which carries IP packets over HTTP/3 or HTTP/2 and is used together with the MASQUE [outbound](../outbounds/masque.md) and [inbound](../inbounds/masque.md).

- HTTP/3: based on QUIC; IP packets are sent and received as QUIC DATAGRAMs.
- HTTP/2: based on TCP; it establishes the tunnel with Extended CONNECT ([RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)) and can be used on networks where UDP is unavailable.

Which HTTP version is used is determined by `alpn` in `tlsSettings`:

- Outbound: HTTP/2 is used when `alpn` contains `h2` but not `h3`; otherwise HTTP/3 is used.
- Inbound: when `alpn` contains `h2`, HTTP/2 is served over TCP; when it contains `h3` or does not contain `h2`, HTTP/3 is served over UDP; when it contains both, both are served on the same port at the same time.

::: tip
`tls` must be used; REALITY is not supported.

When HTTP/3 is used, the QUIC initial packet size is fixed at 1350 bytes, and the connection cannot be established when the path MTU is smaller; unlike Hysteria and XHTTP H3, it does not mimic Chrome's QUIC fingerprint. The congestion control of [quicParams](./finalmask.md#quicparams) defaults to `bbr`, and `brutal` also runs as `bbr`; use `force-brutal` when you need Brutal.

When HTTP/2 is used, the outbound TLS handshake uses `fingerprint` from `tlsSettings`, which defaults to `chrome`, and `quicParams` has no effect.

The UDP masks of [FinalMask](./finalmask.md) apply to HTTP/3, and the TCP masks apply to HTTP/2.
:::

To connect to Cloudflare WARP, see [Connecting to Warp via MASQUE](../../document/level-2/warp.md#connecting-to-warp-via-masque).

## MasqueObject

`MasqueObject` corresponds to the `masqueSettings` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

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

The inbound only uses `path`; all other items are used only by the outbound.

> `host`: string

The `:authority` of the CONNECT-IP request. The priority is `host` > `serverName` > `address`; the latter two include the port when it is not 443.

> `path`: string

URI template path. The default is the RFC 9484 path `/.well-known/masque/ip/{target}/{ipproto}/`.

Only full tunnels are supported. `{target}` and `{ipproto}` (including query forms such as `{?target,ipproto}`) are filled in as `*`, other variables are not supported, and the path must start with `/`.

The inbound only accepts requests whose path is the same as this one and returns 404 for all other requests, so `path` must be the same on both sides.

> `user`: string

> `pass`: string

Username and password for HTTP Basic authentication, corresponding to `email` and `pass` in the MASQUE inbound [UserObject](../inbounds/masque.md#userobject). `user` cannot contain `:`.

> `headers`: map \{string: string\}

Additional HTTP headers sent with the request. They can be used for authentication methods other than `user` / `pass`, for example `"Authorization": "Bearer ..."`.

They cannot contain `Host` or `Capsule-Protocol`, and when `user` or `pass` is set they cannot contain `Authorization` either. `User-Agent` is not sent by default; it can also be set to one of the special values `chrome`, `firefox`, `safari`, `edge`, `curl`, or `golang`.

> `warp`: [WarpObject](../../document/level-2/warp.md#warpobject)

Device information for connecting to Cloudflare WARP. When it is set, `host` defaults to `cloudflareaccess.com` and `path` defaults to `/`, `user` / `pass` can no longer be set, and the tunnel addresses come from its `address` instead of being assigned by the server.
