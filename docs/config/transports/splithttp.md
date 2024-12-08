# XHTTP (SplitHTTP)

<Badge text="v1.8.16+" type="warning"/>

使用HTTP分块传输编码流式响应处理下载，使用多个 HTTP POST 请求（或者流式）进行上传。

可以通过不支持WebSocket的CDN上，但仍有一些要求：

- CDN必须支持HTTP分块传输，且支持流式响应而不会缓冲，核心将会发送各种信息以告知CDN，但是需要CDN遵守。如果中间盒不支持流式响应而导致连接被挂起，则该传输很可能无法工作。

目的与V2fly Meek相同，由于使用了流式响应处理下载，下行速率更为优秀，上行也经过优化但仍非常有限，也因此对 HTTP 中间盒要求更高（见上）。

`XHTTP` 也接受 `X-Forwarded-For` header。

## XHttpObject

The `XHttpObject` 对应传输配置的 `xhttpSettings` 项。

```json
{
  "mode": "auto",
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  },
  "scMaxEachPostBytes": 1000000,
  "scMaxConcurrentPosts": 100,
  "scMinPostsIntervalMs": 30,
  "noSSEHeader": false,
  "xPaddingBytes": "100-1000",
  "keepAlivePeriod": 45,
  "xmux": {
    "maxConcurrency": 0,
    "maxConnections": 0,
    "cMaxReuseTimes": 0,
    "cMaxLifetimeMs": 0
  },
  "downloadSettings": {
    "address": "example.com",
    "port": 443,
    "network": "xhttp",
    "security": "none",
    "tlsSettings": {},
    "realitySettings": {},
    "xhttpSettings": {
      "path": "/" // must be the same
    },
    "sockopt": {
      "dialerProxy": "" // just for example
    }
  },
  "extra": {}
}
```

> `mode`: string

XHTTP 上行所使用的模式。默认值为 `"auto"`，客户端与 REALITY 搭配时采用流式上行，否则采用分包上行。服务端同时兼容两种模式。

`"packet-up"`：两端使用分包上行。即将数据包包装为单个 HTTP POST 请求，在服务端重组。可以兼容任意 HTTP 中间盒。

`"stream-up"`：两端使用流式上行。开启一个 HTTP 长连接发送上行数据包，与现有的 H2 / H3 / gRPC 类似。速度快但兼容性低。

> `path`: string

XHTTP 所使用的 HTTP 协议路径，默认值为 `"/"`。

> `host`: string

XHTTP 的HTTP请求中所发送的host，默认值为空。若服务端值为空时，不验证客户端发送来的host值。

当在服务端指定该值，或在 ```headers``` 中指定host，将会校验与客户端请求host是否一致。

客户端选择发送的host优先级 ```host``` >  ```headers``` > ```address```

> `headers`: map \{string: string\}

仅客户端，自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

> `scMaxEachPostBytes`: int | string

上传分块的最大大小，单位为字节，默认值为 1000000, 即 1MB.

客户端设置的大小必须低于该值，否则当发送的 POST 请求大于服务端设置的值时，请求会被拒绝。

这个值应该小于CDN或其他HTTP反向代理所允许的最大请求体，否则将抛出 HTTP 413 错误。

也可以是字符串 "500000-1000000" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `scMaxConcurrentPosts`: int | string

单个连接上传post的最大并发数，默认为100.

上传并发同时也受(也主要受) `scMinPostsIntervalMs` 控制，故该值仅做保险。

客户端实际发起的数量必须低于服务端。(实际情况下由于上述很难达到上限，所以事实上客户端设置的值可以超过服务端，但不建议这么做)

也可以是字符串 "50-100" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `scMinPostsIntervalMs`: int | string

仅客户端，发起POST上传请求的最小间隔。默认值为 30.

也可以是字符串 "10-50" 的形式，核心每次会在范围内随机选择一个值，以减少指纹。

> `noSSEHeader`: bool

仅服务端，不发送 `Content-Type: text/event-stream` 响应头，默认 `false` (即会发送)

> `xPaddingBytes` int | string

设置请求（出站）和响应（入站）的填充大小，用于减少请求指纹。单位byte, 默认为 `"100-1000"` 每次会在该范围中随机选择一个数字。为 [Int32Range](../../development/intro/guide.md#int32range) 类型

设置为 `-1` 将完全禁用填充

> `keepAlivePeriod` int

发送保活请求的时间间隔，单位秒，设置为 `-1` 代表禁用该功能。

当使用 H2 和 H3 时分别对应 h2 ping 帧和 QUIC ping 帧。

默认值为：使用 H2 时 45 秒(Chrome 默认值), 使用 H3 时 10 秒(quic-go 默认值)

> `xmux`: [XmuxObject](#xmuxobject)

## XmuxObject

<Badge text="v24.9.19+" type="warning"/>

仅客户端，允许用户对 XHTTP 在 h2 与 h3 中的多路复用行为进行控制。使用该功能时不要启用 mux.cool。

```json
{
  "maxConcurrency": "16-32",
  "maxConnections": 0,
  "cMaxReuseTimes": "64-128",
  "cMaxLifetimeMs": 0
}
```

上为全设置为0或者不设置时核心会填入的默认值

术语解释：
- 流会复用物理连接，像这样 连接1(流1,流2,流3) 连接2(流4,流5,流6) .. 以此类推 在其他地方你可能看到 连接-子连接 这样的描述，都是一样的东西。
- 下述所有字段类型均为 为 [Int32Range](../../development/intro/guide.md#int32range) 类型

> `maxConcurrency`: int/string

默认值为 0(即无限) 每个连接中复用的流的最大数量，连接中流的数量达到该值后核心会新建更多连接以容纳更多的流，类似于 mux.cool 的 concurrency.

> `maxConnections`: int/string

默认值为 0(即无限) 要打开的最大连接数，连接达到此值前核心会积极打开连接，对每一条流都新建一个连接，直到达到该值。然后核心会开始复用已经建立的连接。 与 `maxConcurrency` 冲突。

> `cMaxReuseTimes`: int/string

默认值为 0(即无限) 一个连接最多被复用几次，当达到该值后核心不会向该连接再分配流，其将在内部最后一条流关闭后断开。

> `cMaxLifetimeMs`: int/string

默认值为 0(即无限) 一个连接最多可以“存活”多久，当连接打开的时间超过该值后核心不会向该连接再分配流，其将在内部最后一条流关闭后断开。

## downloadSettings

用于拆分 XHTTP 下行所使用的连接（可选项，注意拆分的流量必须抵达服务端的同一个入站）

`downloadSettings` 里面是嵌套的 [StreamSettingsObject](../transport.md#streamsettingsobject) ，可以使用 TLS 或者 REALITY 或者 `sockopt` 等各种选项。除此以外独有以下两个选项：

> `address`: address

下行服务端地址，支持域名、IPv4、IPv6。

> `port`: number

下行服务端端口。

## extra

```json
{
  "extra": {
    "headers": {
      "key": "value"
    },
    "scMaxEachPostBytes": 1000000,
    "scMaxConcurrentPosts": 100,
    "scMinPostsIntervalMs": 30,
    "noSSEHeader": false,
    "xPaddingBytes": "100-1000",
    "xmux": {
      "maxConcurrency": 0,
      "maxConnections": 0,
      "cMaxReuseTimes": 0,
      "cMaxLifetimeMs": 0
    },
    "downloadSettings": {
      "address": "example.com",
      "port": 443,
      "network": "xhttp",
      "security": "none",
      "tlsSettings": {},
      "realitySettings": {},
      "xhttpSettings": {
        "path": "/" // must be the same
      }
    }
  }
}
```

`extra` 是嵌套的 `XHttpObject`，用来实现分享原始 Json。`extra` 里面的配置会覆盖外面的配置。

目前以下选项在 `extra` 里面**不生效**:

`host` `path` `mode` `downloadSettings->sockopt` `extra`

## HTTP 版本

### 客户端行为

默认情况下，客户端将会默认在未启用 TLS 时使用 http/1.1, 启用 TLS 时，使用 h2.

当启用 TLS 时，允许在 TLS 设置的 alpn 数组内设置 http/1.1 h2 h3 来指定具体的http版本(仅当该数组只有一个元素时生效，若填入多个元素则返回默认行为)

### 服务端行为

默认情况下，服务端将会默认监听 TCP, 此时可以处理 http/1.1 和 h2 流量。

当启用 TLS 时，允许在 TLS 设置的 alpn 数组内设置 h3, 此时服务端将改为监听 UDP 端口, 处理 h3 流量。

### 小提示

由于该协议为标准的 HTTP 请求，所以对于 HTTP 版本的转换并不敏感，各种中间盒都可能转换 HTTP 版本。

列如：你希望使用 h3 连接 Cloudflare, 但是Cloudflare 不会使用 h3 回源, 而是使用 http/1.1 或 h2 回源，此时客户端 alpn 应为 h3, 而服务端就不应为 h3, 因为发往服务端的请求不是 h3.

## Browser Dialer

如果使用HTTPS，该传输还支持 [Browser Dialer](../features/browser_dialer.md)

## 协议细节

讨论详见 [#3412](https://github.com/XTLS/Xray-core/pull/3412) 和 [#3462](https://github.com/XTLS/Xray-core/pull/3462) 以下是简述和简要兼容实现要求

1. 使用 `GET /<UUID>` 开始下载。服务器立即回复 `200 OK` 和 `Transfer Encoding:chunked` , 并立即发送一个两字节的有效负载，以强制HTTP中间盒刷新标头。

现阶段服务器会发送以下标头

* `X-Accel-Buffering: no` 禁用缓冲
* `Content-Type: text/event-stream` 在部分中间盒中禁用缓冲，可以使用 `"noSSEHeader"` 选项关闭
* `Transfer-Encoding: chunked` 分块传输，仅在 HTTP/1.1 中使用
* `Cache-Control: no-store` to disable any potential response caching. 禁用CDN的缓存

2. 使用 `POST /<UUID>/<seq>` 开始发送上行数据. `seq` 作用类似于 TCP 序列号，从0开始，数据包可以被同时发送，服务端必须按序列号将数据重组。序列号不应重置。

   客户端可以以任意决定打开上行与下行请求的顺序，任何一种都可以启动会话，但是必须要在30秒内打开 `GET` 连接，否则会话将被终止。

3. `GET` 请求将一直保持在打开状态直到连接被终止，服务端和客户端都可以关闭连接。具体行为取决于HTTP版本。

建议:

* 不要期望CDN会正确传输所有标头，这个协议的目的是为了穿透不支持WS的CDN，而这些CDN的行为通常不怎么友好。

* 应当假设所有HTTP连接都不支持流式请求，所以上行连接发送的的每个包的大小应该基于延迟、吞吐量以及中间盒本身的限制考虑(类似TCP的MTU与纳格算法)。
