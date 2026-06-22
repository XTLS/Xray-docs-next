# XHTTP

XHTTP 是 Xray 原生的 HTTP 传输层，前身为 SplitHTTP。支持三种传输模式：`packet-up`（分包上行 + 流式下行，兼容性最佳）、`stream-up`（流式上行 + 流式下行，效率更高）、`stream-one`（双向流式，单 HTTP 请求完成上下行），以及自动选择模式的 `auto`。

XHTTP 默认有多路复用（XMUX），支持头部填充（header padding）以消除固定长度特征、上下行分离以实现反审查、H3 QUIC 过 CDN 等特性。

::: danger
使用 XHTTP 时**不要**启用 mux.cool，新版 Xray 服务端已有检查，只接受纯 XUDP。
:::

## XHTTPSettingsObject

`XHTTPSettingsObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `xhttpSettings` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "network": "xhttp",
        // [!code focus:42]
        "xhttpSettings": {
          "host": "example.com",
          "path": "/yourpath",
          "mode": "auto",
          "extra": {
            "headers": {
              "key": "value"
            },
            "xPaddingBytes": "100-1000",
            "xPaddingObfsMode": false,
            "xPaddingKey": "",
            "xPaddingHeader": "",
            "xPaddingPlacement": "header",
            "xPaddingMethod": "repeat-x",
            "noGRPCHeader": false,
            "noSSEHeader": false,
            "scMaxEachPostBytes": 1000000,
            "scMinPostsIntervalMs": 30,
            "scMaxBufferedPosts": 30,
            "scStreamUpServerSecs": "20-80",
            "xmux": {
              "maxConcurrency": "16-32",
              "maxConnections": 0,
              "cMaxReuseTimes": 0,
              "hMaxRequestTimes": "600-900",
              "hMaxReusableSecs": "1800-3000",
              "hKeepAlivePeriod": 0
            },
            "downloadSettings": {
              "address": "",
              "port": 443,
              "network": "xhttp",
              "security": "tls",
              "tlsSettings": {},
              "xhttpSettings": {
                "path": "/yourpath"
              }
            }
          }
        }
      }
    }
  ]
}
```

> `host`: string

客户端发送 HTTP 请求时使用的 Host 头部值。

优先级：`host` > `serverName` > `address`。

服务端若设了 `host`，将会检查客户端发来的值是否一致，否则不会检查。

`host` 不可填在 `headers` 内。

> `path`: string

HTTP 请求的路径前缀。客户端实际使用的路径由 Xray 内部自动拼接 UUID 和序号。

`path` 为服务端与客户端的必要约定，两端必须一致。

> `mode`: "auto" | "packet-up" | "stream-up" | "stream-one"

传输模式，默认值为 `"auto"`。

各模式行为：

- `"auto"` — 客户端：TLS H2 时使用 `stream-up`，REALITY 时使用 `stream-one`（有 `downloadSettings` 时使用 `stream-up`），否则使用 `packet-up`。服务端：同时接受三种模式。
- `"packet-up"` — 分包上行 + 流式下行。兼容性最强，可穿透绝大多数 HTTP 中间盒。上行拆分为多个 POST 请求，下行通过 GET 请求实现流式响应。
- `"stream-up"` — 流式上行 + 流式下行。上下行均为流式，不牺牲上行效率。`Content-Type` 默认伪装为 `application/grpc`。
- `"stream-one"` — 单 HTTP 请求完成上下行。`POST /yourpath/` 的响应即为下行。

::: tip
`"stream-up"` 是例外，接受 `stream-one` 连接。若设为具体模式，则仅接受该模式。
:::

> `extra`: [ExtraObject](#extraobject)

除 `host`、`path`、`mode` 以外的所有参数。当 `extra` 存在时，仅上述三项会从顶层读取，其余参数均从 `extra` 读取。

## ExtraObject

`ExtraObject` 包含 XHTTP 的增强功能配置。

> `headers`: map \{string: string\}

自定义 HTTP 头部，一个键值对。仅客户端。

> `xPaddingBytes`: string | number

请求头与响应头的 padding 长度，用于消除 HTTP 头部固定长度特征。

可填固定值如 `100`，或范围如 `"100-1000"`（每次请求在该范围内随机）。默认值为 `"100-1000"`。

当 `xPaddingObfsMode` 为 `false`（默认）时，客户端 padding 通过 `Referer` 头部实现（格式为 `Referer: ...?x_padding=XXX...`），服务端 padding 通过 `X-Padding` 响应头实现。

> `xPaddingObfsMode`: true | false

是否启用新的 padding 混淆模式。默认值为 `false`。

`false` 时保持向后兼容，padding 使用旧方式生成和放置。`true` 时可通过以下参数自定义 padding 的生成方式与放置位置。

> `xPaddingKey`: string

padding 值的存储键名。具体含义取决于 `xPaddingPlacement`：

- `"queryInHeader"` — 嵌入在 HTTP 头部的 URL 中的查询参数名
- `"cookie"` — Cookie 名称
- `"header"` — HTTP 头部名称
- `"query"` — 查询参数名

> `xPaddingHeader`: string

HTTP 头部名称。仅在 `xPaddingPlacement` 为 `"queryInHeader"` 时有意义。

指定包含 padding 查询参数的 URL 所在的 HTTP 头部。

> `xPaddingPlacement`: "queryInHeader" | "cookie" | "header" | "query"

padding 的放置位置。仅在 `xPaddingObfsMode` 为 `true` 时生效。

- `"queryInHeader"` — padding 以查询参数形式嵌入到某 HTTP 头部值的 URL 中
- `"cookie"` — padding 以 Cookie 形式发送
- `"header"` — padding 以独立的 HTTP 头部发送
- `"query"` — padding 以查询参数形式附加在请求 URL 中

::: tip
`multipart` 方式（在请求/响应体中填充）暂不支持。
:::

> `xPaddingMethod`: "repeat-x" | "tokenish"

padding 的生成方式。默认值为 `"repeat-x"`。

- `"repeat-x"` — 与旧版本一致，重复字符填充。
- `"tokenish"` — 生成类似 token 的随机序列，利用 Huffman 编码压缩。base62 序列在 Huffman 编码下约有 20% 的大小缩减，生成时会根据此压缩比进行调整，直到达到验证容差（目前为 2 字节）。

> `noGRPCHeader`: true | false

仅客户端，仅适用于 `stream-up` / `stream-one` 模式。

设为 `true` 时，上行请求头中不添加 `Content-Type: application/grpc`。默认值为 `false`。

> `noSSEHeader`: true | false

仅服务端。

设为 `true` 时，下行响应头中不添加 `Content-Type: text/event-stream`。默认值为 `false`。

> `scMaxEachPostBytes`: number

仅 `packet-up` 模式。客户端每个 POST 最多携带的字节数，服务端会拒绝大于该值的 POST。

默认值为 `1000000`（1 MB）。该值应小于 CDN 等 HTTP 中间盒所允许的最大值。

::: tip
支持填写范围字符串如 `"500000-1000000"`，每次随机取值以降低指纹特征。
:::

> `scMinPostsIntervalMs`: number

仅客户端，仅 `packet-up` 模式。基于单个代理请求，客户端发起 POST 请求的最小间隔。

默认值为 `30`（毫秒）。

::: tip
支持填写范围字符串如 `"10-50"`，每次随机取值以降低指纹特征。
:::

> `scMaxBufferedPosts`: number

仅服务端，仅 `packet-up` 模式。基于单个代理请求，服务端最多缓存多少个乱序到达的 POST 请求。

默认值为 `30`。超限断连。

> `scStreamUpServerSecs`: string | number

仅服务端，仅 `stream-up` 模式。服务端每隔此时间发送 padding 字节以保活，防止 CDN 因下行无数据而掐断连接。

默认值为 `"20-80"`（每次随机）。设为 `-1` 可关闭该机制。

> `xmux`: [XMUXObject](#xmuxobject)

仅客户端，多路复用控制。详见 [XMUXObject](#xmuxobject)。

> `downloadSettings`: [DownloadSettingsObject](#downloadsettingsobject)

仅客户端，下行分离配置。用于实现上下行分离，详见 [DownloadSettingsObject](#downloadsettingsobject)。

## XMUXObject

`XMUXObject` 控制 H2 / H3 的多路复用行为。当所有项均为 `0` 时，部分项会取默认值以消除特征。

::: tip
全不填也相当于全为零，会取到默认值。但若填了任一项，其它项就没有默认值了，全都要自己填。除 `maxConcurrency` 和 `maxConnections` 外，其它项均可同时填。
:::

> `maxConcurrency`: string | number

每条 TCP/QUIC 连接中最多同时存在的代理请求数。达到该值后 core 会建立新连接以容纳更多代理请求。

默认值为 `"16-32"`（每次随机）。与 `maxConnections` 冲突，只能二选一。

> `maxConnections`: string | number

最多同时存在的连接数。达到该值前每个新代理请求都会开启一条新连接，此后 core 会复用已有连接。

默认值为 `0`（不限制）。与 `maxConcurrency` 冲突，只能二选一。

> `cMaxReuseTimes`: string | number

一条连接最多被复用的次数。复用该次数后将不再分配新的代理请求，将在内部最后一条代理请求关闭后断开。

默认值为 `0`（不限制）。支持填写范围，每次随机。

> `hMaxRequestTimes`: string | number

基于 HTTP 请求计数，一条连接上累计最大 HTTP 请求数。超过该值后将不再分配新请求。

Nginx 默认每连接最多 1000 个 HTTP 请求。当 XMUX 全为 `0` 时，该项默认值为 `"600-900"`（取随机）。否则默认 `0`（不限制）。

::: tip
`stream-one` 只产生一个 HTTP 请求，`stream-up` 是两个，`packet-up` 为 N 个。packet-up 上行循环 POST 若超过该值，会自动切换到另一 TCP/QUIC 连接，占一个复用次数但不占并发。
:::

> `hMaxReusableSecs`: string | number

基于时间，一条连接最长可被复用的时间（秒）。超过该时间后将不再分配新 HTTP 请求。

Nginx 默认每连接最多复用 1 小时。当 XMUX 全为 `0` 时，该项默认值为 `"1800-3000"`（取随机）。否则默认 `0`（不限制）。

> `hKeepAlivePeriod`: number

H2 / H3 连接空闲时，客户端每隔此时间（秒）发送一次保活包。

默认值为 `0`，即 Chrome H2 的 45 秒，或 quic-go H3 的 10 秒。

该项是 XMUX 中唯一不允许填写范围的项（取随机才是特征），且允许填负数（如 `-1` 以关闭空闲保活包）。

## DownloadSettingsObject

`DownloadSettingsObject` 用于配置独立的传输层下行通道，是实现**上下行分离**的关键。

该对象本质是一套完整的 [`StreamSettings`](../transport.md#streamsettingsobject)，但多了以下参数用于指向另一个人口。

```json
{
  "downloadSettings": {
    "address": "",
    "port": 443,
    "network": "xhttp",
    "security": "tls",
    "tlsSettings": {},
    "realitySettings": {},
    "xhttpSettings": {
      "path": "/yourpath"
    },
    "sockopt": {}
  }
}
```

> `address`: string

下行连接的服务器地址（域名或 IP）。未指定时，使用上行的 `address`。

> `port`: number

下行连接的服务器端口。未指定时，使用上行的 `port`。

> `network`: "xhttp"

必须为 `"xhttp"`，不可省略。

> `security`: "none" | "tls" | "reality"

下行连接的传输安全机制。未指定时，使用上行的 `security`。

> `tlsSettings`: [TLSObject](./tls.md)

下行连接的 TLS 配置。

> `realitySettings`: [RealityObject](./reality.md)

下行连接的 REALITY 配置。

> `xhttpSettings`: [XHTTPSettingsObject](#xhttpsettingsobject)

下行连接的 XHTTP 配置。**`path` 必须与上行一致。**

> `sockopt`: [SockoptObject](./sockopt.md)

下行连接的 Socket 选项。

::: tip
`sockopt` 可通过上行 `sockopt` 中设置 `"penetrate": true` 来覆盖下行配置。
:::

::: tip
上下行分离时下行配置是完全独立的，不会继承上行的任何配置。即使 XMUX 均未填而取默认值时，各自的随机值也是独立无关的。
:::

## 传输模式详解

三种模式的原理、HTTP 版本行为及快速上手指南，详见 [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113)。

xPaddingObfsMode 相关细节，详见 [PR #5414](https://github.com/XTLS/Xray-core/pull/5414)
