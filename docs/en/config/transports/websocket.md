# WebSocket

Use standard WebSocket to transmit data.

WebSocket connections can be peoxied by other HTTP servers (such as Nginx) or by VLESS fallbacks path.

::: tip
Websocket will recognize the X-Forwarded-For header of the HTTP request to override the source address of the traffic, with a higher priority than the PROXY protocol.
:::

## WebSocketObject

`WebSocketObject` corresponds to the `wsSettings` item of the transport configuration.

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "headers": {
    "Host": "xray.com"
  }
}
```

> `acceptProxyProtocol`: true | false

Only used for inbound, indicating whether to accept the PROXY protocol.

The [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to transmit the real source IP and port of the request. **If you are not familiar with it, please ignore this item.**

Common reverse proxy software (such as HAProxy and Nginx) can be configured to send it, and VLESS fallbacks xver can also send it.

When filled in as `true`, after the underlying TCP connection is established, the requesting party must first send PROXY protocol v1 or v2, otherwise the connection will be closed.

> `path` string

The HTTP protocol path used by WebSocket. Default is `"/"`

If the path contains the `ed` parameter, `Early Data` will be enabled to reduce latency, and its value is the first packet length threshold. If the length of the first packet exceeds this value, `Early Data` will not be enabled. The recommended value is 2048.

An example usage of `ed` parameter:
```
"path": "/aabbcc" //original path
	
"path": "/aabbcc?ed=2048" //added ed parameter
```

::: warning
`Early Data` uses the `Sec-WebSocket-Protocol` header to carry data. If you encounter compatibility issues, try lowering the threshold.
:::

> `headers`: map \{string: string\}

Custom HTTP headers, a key-value pair, where each key represents the name of an HTTP header, and the corresponding value is a string.

The default value is empty.

## Browser Dialer

Use the browser to handle TLS, see [Browser Dialer](../features/browser_dialer.md)
