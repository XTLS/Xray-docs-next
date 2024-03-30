# HTTPUpgrade

A WebSocket-like transport protocol implementing the HTTP/1.1 upgrade and response, allowing it to be reverse proxied by web servers or CDNs just like WebSocket, but without the need to implement the remaining portions of the WebSocket protocol, yielding better performance.

Standalone usage is not recommended, but rather in conjunction with other security protocols like TLS.

## HttpUpgradeObject

The `HttpUpgradeObject` corresponds to the `httpupgradeSettings` section under transport configurations.

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "host": "xray.com",
  "headers": {
  	"key": "value"
  }
}
```

> `acceptProxyProtocol`: true | false

For inbounds only. Specifies whether to accept the PROXY protocol.

The [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to pass the real IP address and port of a connection along. **Ignore it if you have no knowledge regarding this**.

Common reverse proxies (e.g. HAProxy, NGINX) and VLESS fallbacks xver can be configured for its inclusion.

When `true`, the downstream must first send PROXY protocol version 1 or 2 after establishing the underlying TCP connection, or the connection will be closed.

> `path`: string

HTTP path used by the HTTPUpgrade connection. Defaults to `"/"`.

If the `path` property include an `ed` query field (e.g. ```/mypath?ed=2560```), "early data" will be used to decrease latency, with the value defining the threshold of the first packet's size. If the size of the first packet exceeds the defined value, "early data" will not be applied. The recommended value is `2560`.

> `host`: string

HTTP Host sent by the HTTPUpgrade connection. Empty by default. If this value is empty on the server, the host header sent by clients will not be validated.

If the `Host` header has been defined on the server in any way, the server will validate if the `Host` header matches.

The current priority of the `Host` header sent by clients: ```host``` > ```headers``` > ```address```

> `headers`: map \{string: string\}

Customized HTTP headers defined in key-value pairs. Defaults to empty.