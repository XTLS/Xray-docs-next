# SplitHTTP（H2、QUIC H3）

<Badge text="v1.8.16+" type="warning"/>

使用HTTP分块传输编码流式响应处理下载，使用多个HTTP POST请求进行上传。

可以通过不支持WebSocket的CDN上，但仍有一些要求：

- CDN必须支持HTTP分块传输，且支持流式响应而不会缓冲，核心将会发送 `X-Accel-Buffering: no` 以及 `Content-Type: text/event-stream` 以告知CDN，但是需要CDN遵守此标头。如果中间盒不支持流式响应而导致连接被挂起，则该传输很可能无法工作。

目的与V2fly Meek相同，由于使用了流式响应处理下载，下行速率更为优秀，上行也经过优化但仍非常有限，也因此对 HTTP 中间盒要求更高（见上）。

`SplitHTTP` 也接受 `X-Forwarded-For` header。

## SplitHttpObject

The `SplitHttpObject` 对应传输配置的 `splithttpSettings` 项。

```json
{
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  },
  "scMaxEachPostBytes": 1000000,
  "scMaxConcurrentPosts": 100,
  "scMinPostsIntervalMs": 30,
  "noSSEHeader": false
}
```

> `path`: string

SplitHTTP 所使用的 HTTP 协议路径，默认值为 `"/"`。

> `host`: string

SplitHTTP 的HTTP请求中所发送的host，默认值为空。若服务端值为空时，不验证客户端发送来的host值。

当在服务端指定该值，或在 ```headers``` 中指定host，将会校验与客户端请求host是否一致。

客户端选择发送的host优先级 ```host``` >  ```headers``` > ```address```

> `headers`: map \{string: string\}

仅客户端，自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

> `scMaxEachPostBytes`: int/string

上传分块的最大大小，单位为字节，默认值为 1000000, 即 1MB.

客户端设置的大小必须低于该值，否则当发送的 POST 请求大于服务端设置的值时，请求会被拒绝。

这个值应该小于CDN或其他HTTP反向代理所允许的最大请求体，否则将抛出 HTTP 413 错误。

也可以是字符串 "500000-1000000" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `scMaxConcurrentPosts`: int/string

单个连接上传post的最大并发数，默认为100.

上传并发同时也受(也主要受) `scMinPostsIntervalMs` 控制，故该值仅做保险。

客户端实际发起的数量必须低于服务端。(实际情况下由于上述很难达到上限，所以事实上客户端设置的值可以超过服务端，但不建议这么做)

也可以是字符串 "50-100" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `scMinPostsIntervalMs`: int/string

仅客户端，发起POST上传请求的最小间隔。默认值为 30.

也可以是字符串 "10-50" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `noSSEHeader`: bool

仅服务端，不发送 `Content-Type: text/event-stream` 响应头，默认 `false` (即会发送)

## HTTP 版本

### 客户端行为

默认情况下，客户端将会默认在未启用 TLS 时使用 http/1.1, 启用 TLS 时，使用 h2.

当启用 TLS 时，允许在 TLS 设置的 alpn 数组内设置 http/1.1 h2 h3 来指定具体的http版本(仅当该数组只有一个元素时生效，若填入多个元素则返回默认行为)

### 服务端行为

默认情况下，客户端将会默认监听 TCP, 此时可以处理 http/1.1 和 h2 流量。

当启用 TLS 时，允许在 TLS 设置的 alpn 数组内设置 h3, 此时服务端将改为监听 UDP 端口, 处理 h3 流量。

### 小提示

由于该协议为标准的 HTTP 请求，所以对于 HTTP 版本的转换并不敏感，各种中间盒都可能转换 HTTP 版本。

列如：你希望使用 h3 连接 Cloudflare, 但是Cloudflare 不会使用 h3 回源, 而是使用 http/1.1 或 h2 回源，此时客户端 alpn 应为 h3, 而服务端就不应为 h3, 因为发往服务端的请求不是 h3.

## Browser Dialer

如果使用HTTPS，该传输还支持 [Browser Dialer](../features/browser_dialer.md)

## 协议细节

讨论详见 [#3412](https://github.com/XTLS/Xray-core/pull/3412) 和 [#3462](https://github.com/XTLS/Xray-core/pull/3462) 以下是简述和简要兼容实现要求

1. 使用 `GET /<UUID>` 开始下载。服务器立即回复 `200 OK` 和 `Transfer Encoding:chunked` , 并立即发送一个两字节的有效负载，以强制HTTP中间盒刷新标头。

2. 使用 `POST /<UUID>/<seq>` 开始发送上行数据. `seq` 作用类似于 TCP 序列号，从0开始，数据包可以被同时发送，服务端必须按序列号将数据重组。序列号不应重置。

   客户端可以以任意决定打开上行与下行请求的顺序，任何一种都可以启动会话，但是必须要在30秒内打开 `GET` 连接，否则会话将被终止。

4. `GET` 请求将一直保持在打开状态直到连接被终止，服务端和客户端都可以关闭连接。具体行为取决于HTTP版本。

建议:

* 不要期望CDN会正确传输所有标头，这个协议的目的是为了穿透不支持WS的CDN，而这些CDN的行为通常不怎么友好。

* 应当假设所有HTTP连接都不支持流式请求，所以上行连接发送的的每个包的大小应该基于延迟、吞吐量以及中间盒本身的限制考虑(类似TCP的MTU与纳格算法)。
