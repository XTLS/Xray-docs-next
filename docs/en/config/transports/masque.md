# MASQUE

The transport of MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), used with the masque [outbound](../outbounds/masque.md) and [inbound](../inbounds/masque.md).

It sets up the tunnel with an extended CONNECT request (`:protocol` is `connect-ip`), and carries IP packets in HTTP Datagrams ([RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)). Two HTTP versions are supported:

- HTTP/3 (default): runs over QUIC. IP packets are carried in QUIC DATAGRAM frames; packets the peer sends in DATAGRAM capsules are dropped.
- HTTP/2 ([RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)): runs over TCP. IP packets are carried in DATAGRAM capsules on the request stream. It can be used on networks where UDP is not available.

The HTTP version is decided by `alpn` of `tlsSettings`:

- Outbound: HTTP/2 is used when `alpn` contains `h2` and does not contain `h3`, otherwise HTTP/3.
- Inbound: it listens for HTTP/2 (TCP) when `alpn` contains `h2`, and for HTTP/3 (UDP) when `alpn` contains `h3` or does not contain `h2`. With both, they are served on the same port at the same time.

::: tip
REALITY is not supported.

With HTTP/3, RFC 9484 requires the tunnel to carry 1280-byte IPv6 packets, which Chrome's initial packet size (1250 bytes) cannot hold. So MASQUE does not use the Chrome fingerprint of [quicParams](./finalmask.md#quicparams), and the initial QUIC packet size is fixed to 1350 bytes. The connection cannot be set up if the path MTU is smaller.

With HTTP/2, the TLS handshake of the outbound uses `fingerprint` of `tlsSettings`, which defaults to `chrome`, and [quicParams](./finalmask.md#quicparams) has no effect.
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

The inbound only uses `path`; the other items are for the outbound only.

> `host`: string

The `:authority` of the request. The priority is `host` > `serverName` > `address`, and the latter two include the port unless it is 443.

> `path`: string

The URI template path of the server. Defaults to `/.well-known/masque/ip/{target}/{ipproto}/` from RFC 9484.

Only full tunnels are supported: `{target}` and `{ipproto}` are filled with `*`, and other template variables are not supported.

The inbound only accepts requests with the same path and answers the others with 404, so `path` must be the same on both sides.

> `user`: string

> `pass`: string

Username and password of HTTP Basic authentication, corresponding to `email` and `pass` in [UserObject](../inbounds/masque.md#userobject) of the masque inbound. `user` must not contain `:`.

> `headers`: map \{string: string\}

Extra HTTP headers of the request. They can be used for authentication other than `user` and `pass`, e.g. `"Authorization": "Bearer ..."`.

Must not contain `host` or `Capsule-Protocol`, nor `Authorization` when `user` or `pass` is set. No `User-Agent` is sent by default, and the special values `chrome`, `firefox`, `safari`, `edge`, `curl` and `golang` are supported.
