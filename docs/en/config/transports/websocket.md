# WebSocket

Uses standard WebSocket to transport data.

WebSocket connections can be routed by other HTTP servers (such as Nginx) or by VLESS fallbacks path.

::: danger
**It is recommended to switch to [XHTTP](https://github.com/XTLS/Xray-core/discussions/4113) to avoid significant traffic characteristics like WebSocket "ALPN is http/1.1".**
:::

::: tip
WebSocket will recognize the `X-Forwarded-For` header in HTTP requests to overwrite the source address of the traffic, which has higher priority than the PROXY protocol.
:::

## WebSocketObject

`WebSocketObject` corresponds to the `wsSettings` item in the transport configuration.

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  },
  "heartbeatPeriod": 10
}
```

> `acceptProxyProtocol`: true | false

Only used for inbound, indicating whether to receive PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is specifically used to pass the real source IP and port of the request. **If you don't understand it, please ignore this item.**

Common reverse proxy software (such as HAProxy, Nginx) can be configured to send it, and VLESS fallbacks xver can also send it.

When set to `true`, after the underlying TCP connection is established, the requester must send PROXY protocol v1 or v2 first; otherwise, the connection will be closed.

> `path`: string

The HTTP protocol path used by WebSocket. The default value is `"/"`.

If the client path contains the `ed` parameter (e.g., `/mypath?ed=2560`), `Early Data` will be enabled to reduce latency. It uses the `Sec-WebSocket-Protocol` header to carry the first packet data during the upgrade, where the value represents the first packet length threshold. If the length of the first packet exceeds this value, `Early Data` will not be enabled. The recommended value is 2560, and the maximum value is 8192. Excessively large values may cause some compatibility issues. If you encounter compatibility issues, try lowering the threshold.

> `host`: string

The host sent in the WebSocket HTTP request. Default value is empty. If the server-side value is empty, the host value sent by the client is not verified.

When this value is specified on the server side, or `host` is specified in `headers`, it will verify whether it matches the client request host.

Client priority for sending host: `host` > `headers` > `address`.

> `headers`: map \{string: string\}

Client only. Custom HTTP headers, key-value pairs. Each key represents the name of an HTTP header, and the corresponding value is a string.

Default is empty.

> `heartbeatPeriod`: int

Specifies a fixed time interval to send a Ping message to keep the connection alive. If not specified or set to 0, no Ping message is sent, which is the current default behavior.

## Browser Dialer

Use a browser to handle TLS. See [Browser Dialer](../features/browser_dialer.md) for details.
