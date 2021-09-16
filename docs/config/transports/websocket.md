# WebSocket

使用标准的 WebSocket 来传输数据。

WebSocket 连接可以被其它 HTTP 服务器（如 Nginx）分流，也可以被 VLESS fallbacks path 分流。

::: tip
Websocket 会识别 HTTP 请求的 X-Forwarded-For 头来覆写流量的源地址，优先级高于 PROXY protocol。
:::

## WebSocketObject

`WebSocketObject` 对应传输配置的 `wsSettings` 项。

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

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `path` string

WebSocket 所使用的 HTTP 协议路径，默认值为 `"/"`。

如果路径中包含 `ed` 参数，将会启用 `Early Data` 以降低延迟，其值为首包长度阈值。如果首包长度超过此值，就不会启用 `Early Data`。建议的值为 2048。

::: warning
`Early Data` 使用 `Sec-WebSocket-Protocol` 头承载数据。如果你遇到兼容性问题，可以尝试调低阈值。
:::

> `headers`: map \{string: string\}

自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

默认值为空。

## Browser Dialer

使用浏览器处理 TLS，详见 [Browser Dialer](../features/browser_dialer.md)
