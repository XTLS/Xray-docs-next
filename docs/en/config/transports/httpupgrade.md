# HttpUpgrade

A WebSocket-like transport protocol implementing the HTTP/1.1 upgrade and response, allowing it to be reverse proxied by web servers or CDNs just like WebSocket, but without the need to implement the remaining portions of the WebSocket protocol, yielding better performance.

Standalone usage is not recommended, but rather in conjunction with other security protocols like TLS.

## HttpUpgradeObject

The `HttpUpgradeObject` corresponds to the `httpupgradeSettings` section under transport configurations.

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "host": "xray.com"
}
```

> `acceptProxyProtocol`: true | false

For inbounds only. Specifies whether to accept the PROXY protocol.

The [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to pass the real IP address and port of a connection along. **Ignore it if you have no knowledge regarding this**.

Common reverse proxies (e.g. HAProxy, NGINX) and VLESS fallbacks xver can be configured for its inclusion.

When `true`, the downstream must first send PROXY protocol version 1 or 2 after establishing the underlying TCP connection, or the connection will be closed.

> `path`: string

HTTP path used by the HTTPUpgrade connection. Defaults to `"/"`.

> `host`: string

HTTP Host sent by the HTTPUpgrade connection. Empty by default.