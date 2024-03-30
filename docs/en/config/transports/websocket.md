# WebSocket

Uses standard WebSocket for data transmission.

WebSocket connections can be proxied by other web servers (like NGINX) or by VLESS fallback paths.

::: tip
WebSocket inbounds will parse the `X-Forwarded-For` header received, overriding the source address with a higher priority than the source address got from PROXY protocol.
:::

## WebSocketObject

`WebSocketObject` corresponds to the `wsSettings` property of the transport configs.

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

Only used by inbounds. Indicates whether to accept the PROXY protocol.

The [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to transmit the real source IP and port of connections. **If you are not familiar with this, leave it alone.**

Commonplace reverse proxy software solutions (like HAProxy and NGINX) can be configured to have source IPs and ports sent with PROXY protocol. Same goes to VLESS fallbacks `xver`.

When `true`, after the underlying TCP connection is established, the downstream must first send the source IPs and ports in PROXY protocol v1 or v2, or the connection will be terminated.

> `path`: string

The HTTP path used by the WebSocket connection. Defaults to `"/"`.

If `path` contains the `ed` query parameter, `early data` will be activated for latency reduction, and its value will be the length threshold of the first packet. If the length of the first packet exceeds this value, `early data` won't be activated. The recommended value is 2560, with a maximum of 8192. Compatibility problems can occur when the value is set too high. Try lowering the threshold when encountering such problems.

> `host`: string

The `Host` header sent in HTTP requests. Defaults to an empty string. Servers will not validate the `Host` header sent by clients when left blank.

If the `Host` header has been defined on the server in any way, the server will validate if the `Host` header matches.

The current priority of the `Host` header sent by clients: ```host``` > ```headers``` > ```address```

> `headers`: map \{string: string\}

Customized HTTP headers defined in key-value pairs. Defaults to empty.

## Browser Dialer

Use the browser to handle TLS, see [Browser Dialer](../features/browser_dialer.md)
