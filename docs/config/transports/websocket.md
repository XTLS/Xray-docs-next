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

## Browser Dialer <Badge text="BETA" type="warning"/>

### Background

[v2ray/discussion#754](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994) 基于一年前的想法，原生 JS 实现了简洁的 WSS Browser Dialer，真实浏览器的 TLS 指纹、行为特征。

不过 WSS 仍存在 ALPN 明显的问题，所以下一步是浏览器转发 HTTP/2、QUIC。

### Xray & JS

创造了一个非常简单、巧妙的通信机制：

- Xray 监听地址端口 A，作为 HTTP 服务，浏览器访问 A，加载网页中的 JS。
- JS 主动向 A 建立 WebSocket 连接，成功后，Xray 将连接发给 channel。
- 需要建立连接时，Xray 从 channel 接收一个可用的连接，并发送目标 URL 和可选的 early data。
- JS 成功连接到目标后告知 Xray，并继续用这个 conn 全双工双向转发数据，连接关闭行为同步。
- 连接使用后就会被关闭，但 JS 会确保始终有新空闲连接可用。

### Early data

根据浏览器的需求，对 early data 机制进行了如下调整：

- 服务端响应头会带有请求的 `Sec-WebSocket-Protocol`，这也初步混淆了 WSS 握手响应的长度特征。
- 用于浏览器的 early data 编码是 `base64.RawURLEncoding` 而不是 `StdEncoding`，服务端做了兼容。
- 此外，由于 [#375](https://github.com/XTLS/Xray-core/pull/375) 推荐 `?ed=2048`，这个 PR 顺便将服务端一处 `MaxHeaderBytes` 扩至了 4096。 ~~（虽然好像不改也没问题）~~

### Configuration <Badge text="v1.4.1" type="warning"/>

这是一个探索的过程，目前两边都是 Xray-core v1.4.1 时的配置方式：

- 准备一份可用的 WSS 配置，注意 address 必须填域名，若需要指定 IP，请配置 DNS 或系统 hosts。
- 若浏览器的流量也会经过 Xray-core，务必将这个域名设为直连，否则会造成流量回环。
- 设置环境变量指定要监听的地址端口，比如 `XRAY_BROWSER_DIALER = 127.0.0.1:8080`。
- 先运行 Xray-core，再用任一浏览器访问上面指定的地址端口，还可以 `F12` 看 `Console` 和 `Network`。
- 浏览器会限制 WebSocket 连接数，所以建议开启 `Mux.Cool`。


