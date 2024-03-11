# HttpUpgrade

一个实现了类似于 WebSocket 进行 HTTP 1.1 升级请求和响应的协议，这使得它可以像 WebSocket 一样可以被CDN或者Nginx进行反代，但无需实现 WebSocket 协议的其他部分，所以具有更高的效率。
其设计不推荐单独使用，而是和TLS等安全协议一起工作。

## HttpUpgradeObject

`HttpUpgradeObject` 对应传输配置的 `httpupgradeSettings` 项。

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "host": "xray.com"
}
```

> `acceptProxyProtocol`: true | false

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `path`: string

HTTPUpgrade 所使用的 HTTP 协议路径，默认值为 `"/"`。

> `host`: string

HTTPUpgrade 的HTTP请求中所发送的Host，默认值为空。
