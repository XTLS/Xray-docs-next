# HTTPUpgrade

一个实现了类似于 WebSocket 进行 HTTP 1.1 升级请求和响应的协议，这使得它可以像 WebSocket 一样可以被CDN或者Nginx进行反代，但无需实现 WebSocket 协议的其他部分，所以具有更高的效率。
其设计不推荐单独使用，而是和TLS等安全协议一起工作。

## HttpUpgradeObject

`HttpUpgradeObject` 对应传输配置的 `httpupgradeSettings` 项。

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

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `path`: string

HTTPUpgrade 所使用的 HTTP 协议路径，默认值为 `"/"`。

如果客户端路径中包含 `ed` 参数(如 ```/mypath?ed=2560```)，将会启用 `Early Data` 以降低延迟，其值为首包长度阈值。如果首包长度超过此值，就不会启用 `Early Data`。建议的值为2560。

> `host`: string

HTTPUpgrade 的HTTP请求中所发送的host，默认值为空。若服务端值为空时，不验证客户端发送来的host值。

当在服务端指定该值，或在 ```headers``` 中指定host，将会校验与客户端请求host是否一致。

客户端选择发送的host优先级 ```host``` >  ```headers``` > ```address```

> `headers`: map \{string: string\}

仅客户端，自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

默认值为空。
