# XHTTP

基于 HTTP 的高可拓展性传输协议，主要用于在 CDN 或反代环境下，将代理流量拆分为上行下行流量、配置不同的协议、域名等信息，从而伪装成标准网页浏览流量以实现高效穿透。

See [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113)。

## XHTTPObject

`XHTTPObject` 对应传输配置的 `xhttpSettings` 项。

```json
{
  "path": "/xhttp",
  "mode": "auto",
  "extra": {
    "noSSEHeader": false,
    "scMaxEachPostBytes": 1000000,
    "scMaxBufferedPosts": 30,
    "xPaddingBytes": "10-100"
  }
}
```

> `path`: string

XHTTP 所使用的 HTTP 协议路径前缀。

最终请求为`GET /yourpath/sameUUID`(上行)，`POST /yourpath/sameUUID/seq`(下行)。

> `mode`: "auto" | "packet-up" | "stream-up" | "stream-one"

XHTTP使用的模式，默认为`"auto"`。

> `host`: string

XHTTP 的HTTP请求中所发送的host，默认值为空。若服务端值为空时，不验证客户端发送来的host值。

当在服务端指定该值，或在 `headers` 中指定host，将会校验与客户端请求host是否一致。

客户端选择发送的host优先级 `host` > `headers` > `address`

> `headers`: map \{string: string\}

仅客户端，自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头的名称，对应的值是字符串。

不可在此处设置host header。

默认值为空。

> `scStreamUpServerSecs`: string

[Int32Range](../../development/intro/guide.md#int32range)类型。

仅客户端，测试发现 CF 会掐断下行 100 秒无实际数据的 HTTP，导致 stream-up 的上行方向被掐断，所以为服务端添加了 scStreamUpServerSecs，默认值 "20-80" 取随机。

设置为-1则关闭此机制。

> `xPaddingBytes`: string

[Int32Range](../../development/intro/guide.md#int32range)类型。

服务端每隔 scStreamUpServerSecs 时间就会发 xPaddingBytes 个字节以保活

> `noGRPCHeader`: bool

仅客户端，

false: 上行均默认有 `Content-Type: application/grpc` 以伪装成 gRPC
true: 关闭上述行为

> `noSSEHeader`: bool

仅服务端，

false: 下行的服务端响应头会包含`Content-Type: text/event-stream`，以伪装为SSE。
true: 关闭上述行为。

> `scMaxEachPostBytes`: string

[Int32Range](../../development/intro/guide.md#int32range)类型。

客户端每个 POST 最多携带多少数据，默认值 1000000 即 1MB，该值应小于 CDN 等 HTTP 中间盒所允许的最大值，服务端也会拒绝大于该值的 POST

> `scMinPostsIntervalMs`: string

[Int32Range](../../development/intro/guide.md#int32range)类型。

仅客户端，基于单个代理请求，客户端发起 POST 请求的最小间隔，默认值 30 毫秒

> `scMaxBufferedPosts`: int64

仅服务端，基于单个代理请求，服务端最多缓存多少个 POST 请求，默认值 30 个，超限断连

> `xmux`: \[ [XmuxObject](#xmuxobject) \]

仅客户端，

> `downloadSettings`: \[ [StreamSettingsObject](../transport.md#streamsettingsobject) \]

可以对下行流量进行单独配置，比如更换域名等。

> `extra`: json object

`extra` 是 `host`、`path`、`mode` 以外的所有参数的原始 JSON，当 extra 存在时，只有该四项会生效。

## XmuxObject

多路复用配置。

> maxConcurrency: [Int32Range](../../development/intro/guide.md#int32range)

每条 H2/H3 连接中最多同时存在的代理请求数量，超出后会建立新的连接

> maxConnections: [Int32Range](../../development/intro/guide.md#int32range)

同时存在的连接数。 0 为不限制。

> cMaxReuseTimes: [Int32Range](../../development/intro/guide.md#int32range)

每条连接最多被复用的次数

> cMaxLifetimeMs: [Int32Range](../../development/intro/guide.md#int32range)

每条连接的存活时间。 0 为不限制。

> hMaxRequestTimes: [Int32Range](../../development/intro/guide.md#int32range)

每条连接最多承载多少个请求。

> hKeepAlivePeriod: int64

H2/H3 连接空闲时客户端每隔多少秒发一次保活包，默认 0，即 Chrome H2 的 45 秒，或 quic-go H3 的 10 秒。
