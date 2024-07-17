# SplitHTTP

<Badge text="v1.8.16+" type="warning"/>

使用HTTP分块传输编码下载，使用多个HTTP POST请求进行上传。

可以通过不支持WebSocket的CDN上，但仍有一些要求：

- CDN必须支持HTTP分块传输，且支持流式响应不会缓冲，核心将会发送 `X-Accel-Buffering: no` 以及 `Content-Type: text/event-stream` 以告知CDN，但是需要CDN遵守此标头。如果中间盒不支持流式响应而导致连接被挂起，则该传输很可能无法工作。

目的与V2fly Meek相同，由于使用了分块下载，下行速率更为优秀，上行也经过优化但仍非常有限，也因此对 HTTP 中间盒要求更高（见上）。

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
  "maxUploadSize": 1000000,
  "maxConcurrentUploads": 10 
}
```

> `path`: string

SplitHTTP 所使用的 HTTP 协议路径，默认值为 `"/"`。

> `host`: string

SplitHTTP 的HTTP请求中所发送的host，默认值为空。若服务端值为空时，不验证客户端发送来的host值。

当在服务端指定该值，或在 ```headers``` 中指定host，将会校验与客户端请求host是否一致。

客户端选择发送的host优先级 ```host``` >  ```headers``` > ```address```

> `headers`: map \{string: string\}

自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

> `maxUploadSize`: int

上传分块的最大大小，单位为字节，默认为 1 MB.

这个值应该小于CDN或其他HTTP反向代理所允许的最大请求体，否则将抛出 HTTP 413 错误。

适当提升这个值可以增加上传速率。

> `maxConcurrentUploads`: int

上传连接的最大并发数，默认为10, 连接将尽可能被重用。

如果连接不稳定或者服务端内存占用过高可以尝试调低。

客户端所设定的值必须低于服务端，否则可能导致连接问题。

## 协议细节

讨论详见 [#3412](https://github.com/XTLS/Xray-core/pull/3412) 和 [#3462](https://github.com/XTLS/Xray-core/pull/3462) 以下是简述和简要兼容实现要求

1. 使用 `GET /<UUID>` 开始下载。服务器立即回复 `200 OK` 和 `Transfer Encoding:chunked` , 并立即发送一个两字节的有效负载，以强制HTTP中间盒刷新标头。

2. 使用 `POST /<UUID>/<seq>` 开始发送上行数据. `seq` 作用类似于 TCP 序列号，从0开始，数据包可以被同时发送，服务端必须按序列号将数据重组。序列号不应重置。

   客户端可以以任意决定打开上行与下行请求的顺序，任何一种都可以启动会话，但是必须要在30秒内打开 `GET` 连接，否则会话将被终止。

4. `GET` 请求将一直保持在打开状态直到连接被终止，服务端和客户端都可以关闭连接。具体行为取决于HTTP版本。

建议:

* 不要期望CDN会正确传输所有标头，这个协议的目的是为了穿透不支持WS的CDN，而这些CDN的行为通常不怎么友好。

* 应当假设所有HTTP连接都不支持流式请求，所以上行连接发送的的每个包的大小应该基于延迟、吞吐量以及中间盒本身的限制考虑(类似TCP的MTU与纳格算法)。

* 关于HTTP版本，核心暂时未支持 h2c，故未使用 HTTPS 时 Xray 仅会发送 http/1.1 请求。 

为了避免ALPN协商造成的额外复杂性，Xray客户端在使用 HTTPS 时使用 h2，也可以在客户端 tlsSettings 中手动指定 alpn 为 http/1.1 或者 h3 来使用对应的HTTP版本发起请求，Xray服务端则兼容包括h2c在内各种类型的入站连接(暂时没有h3)，因为入站连接可以由于中间盒的转发而出现各种类型的请求。

## Browser Dialer

如果使用HTTPS，该传输还支持 [Browser Dialer](../features/browser_dialer.md)
