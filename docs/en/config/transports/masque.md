# MASQUE

The HTTP/3 transport of MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), used with the masque [outbound](../outbounds/masque.md).

It sets up the tunnel with an HTTP/3 extended CONNECT request (`:protocol` is `connect-ip`), and carries IP packets in HTTP Datagrams ([RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)). Only QUIC DATAGRAM frames are supported; packets a server sends in DATAGRAM capsules are dropped.

::: tip
HTTP/3 is always used, with ALPN fixed to `h3`. REALITY is not supported.

RFC 9484 requires the tunnel to carry 1280-byte IPv6 packets, which Chrome's initial packet size (1250 bytes) cannot hold. So MASQUE does not use the Chrome fingerprint of [quicParams](./finalmask.md#quicparams), and the initial QUIC packet size is fixed to 1350 bytes. The connection cannot be set up if the path MTU is smaller.
:::

## MasqueObject

`MasqueObject` corresponds to the `masqueSettings` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

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

The `:authority` of the request. The priority is `host` > `serverName` > `address`, and the latter two include the port unless it is 443.

> `path`: string

The URI template path of the server. Defaults to `/.well-known/masque/ip/{target}/{ipproto}/` from RFC 9484.

Only full tunnels are supported: `{target}` and `{ipproto}` are filled with `*`, and other template variables are not supported.

> `headers`: map \{string: string\}

Extra HTTP headers of the request, usually for authentication, e.g. `"Authorization": "Basic " + base64("username:password")` or `"Authorization": "Bearer ..."`.

Must not contain `host` or `Capsule-Protocol`. No `User-Agent` is sent by default, and the special values `chrome`, `firefox`, `safari`, `edge`, `curl` and `golang` are supported.
