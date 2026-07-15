# XHTTP: Beyond REALITY

一个原生的 HTTP 传输层，支持三种模式（packet-up / stream-up / stream-one），可穿透绝大多数支持 HTTP 的中间盒（CDN / 反代），并原生支持 QUIC H3 过 CDN。

它实现了真正的上下行分离、header padding、XMUX 多路复用等特性，全场景通吃。

::: tip
XHTTP 默认有多路复用，延迟比 Vision 低但多线程测速不如它，除非测速前设了 `"maxConcurrency": 1`。
:::

::: danger
使用 XHTTP 时不要启用 mux.cool，新版 Xray 服务端已有检查，只接受纯 XUDP。
:::

## 快速上手

无论 TLS 还是 REALITY，一般只需填 `path`：

1. **配置只需填 `path`，其它不填即可**
2. 服务端支持 QUIC H3，客户端 `alpn` 选 `"h3"` 即可使用 QUIC
3. CDN 优选 IP，客户端 `address` 填 IP，`serverName`（SNI）填域名
4. 连不上 CF，启用 CF 面板内的 gRPC 支持
5. 无法穿透 Nginx，把 Nginx 的 `proxy_pass` 改为 `grpc_pass`
6. 无法穿透其它 CDN 或反代，`mode` 选 `"packet-up"`，兼容性最强

## XHTTPObject

`XHTTPObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `xhttpSettings` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "method": "xhttp",
        // [!code focus:54]
        "xhttpSettings": {
          "host": "example.com",
          "path": "/yourpath",
          "mode": "auto",
          "extra": {
            "headers": {
              "Key": "Value"
            },
            "xPaddingBytes": "100-1000",
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
              },
              "sockopt": {}
            }
          }
        }
      }
    }
  ]
}
```

> `host`: string

客户端发送的 HTTP Host 头。客户端选择优先级为 `host` > `serverName` > `address`。

服务端若设了 `host`，将会检查客户端发来的值是否一致，否则不会检查。建议没事别设。`host` 不可填在 `headers` 内。

默认值为空。

> `path`: string

XHTTP 所使用的 HTTP 请求路径，默认值为 `"/"`。

服务端基于 path 中随机生成的 UUID 关联上下行。

> `mode`: "auto" | "packet-up" | "stream-up" | "stream-one"

传输模式，默认值为 `"auto"`。

客户端 `"auto"` 行为：
- **TLS H2 时** → `stream-up`
- **REALITY 时** → `stream-one`（有 `downloadSettings` 时 → `stream-up`）
- **否则** → `packet-up`

服务端 `"auto"` 行为：默认同时接受三种模式。若设为具体的模式则仅接受它，`"stream-up"` 例外——它还接受 `stream-one`。

| 模式 | 上行 | 下行 | 兼容性 | 适用场景 |
|------|------|------|--------|----------|
| `packet-up` | 分包 POST | 流式 GET | 最高 | 穿透各种 CDN / 中间盒 |
| `stream-up` | 流式 POST | 流式 GET | 高 | TLS H2 过 CDN、REALITY |
| `stream-one` | 单 POST 双向流式 | 中 | REALITY、HTTP 传输层升级 |

> `extra`: object

`host`、`path`、`mode` 以外的所有参数的原始 JSON 容器。当 `extra` 存在时，只有这四项（host / path / mode / extra）会生效。

分享链接中只有这四项，GUI 一般也只有这四项。extra 应由服务发布者直接下发给客户端，不应让客户端随意改。

### extra 通用

> `headers`: map {string: string}

仅客户端。自定义 HTTP 头，键值对。默认值为空。

> `xPaddingBytes`: string | number

header padding 字节数。解决 HTTP 请求头和响应头的固定长度特征。

可填写范围字符串如 `"100-1000"`，每次请求随机。默认值为 `"100-1000"`。

> `noGRPCHeader`: true | false

仅客户端（stream-up / stream-one）。关闭上行 `Content-Type: application/grpc` 伪装。

默认值为 `false`。

> `noSSEHeader`: true | false

仅服务端。关闭下行 `Content-Type: text/event-stream` 伪装。

默认值为 `false`。

### extra packet-up 专用

> `scMaxEachPostBytes`: number | string

客户端每个 POST 最多携带多少数据（字节）。该值应小于 CDN 等 HTTP 中间盒所允许的最大值，服务端也会拒绝大于该值的 POST。

可填写范围字符串如 `"500000-1000000"`，每次随机。默认值为 `1000000`（1MB）。

> `scMinPostsIntervalMs`: number | string

仅客户端。基于单个代理请求，客户端发起 POST 请求的最小间隔（毫秒）。

可填写范围字符串如 `"10-50"`，每次随机。默认值为 `30`。

> `scMaxBufferedPosts`: number

仅服务端。基于单个代理请求，服务端最多缓存多少个 POST 请求，超限断连。

默认值为 `30`。

### extra stream-up 专用

> `scStreamUpServerSecs`: number | string

仅服务端。服务端每隔这段时间发一个 padding 包以保活，避免 CDN 掐断下行 100 秒无实际数据的 HTTP 连接。

可填写范围字符串如 `"20-80"`，每次随机。默认值为 `"20-80"`。填 `-1` 关闭该机制。

### extra XMUX

仅客户端。控制 H2 / H3 的多路复用。

::: warning
当 XMUX 中任意一项填值后，其余项不再自动取默认值，需全部显式填写。
:::

> `maxConcurrency`: number | string

每条 TCP/QUIC 连接中最多同时存在多少代理请求。达到该值后 core 会建立新的连接以容纳更多请求。

与 `maxConnections` 冲突，只能二选一。全为 0 时默认值为 `"16-32"`（每次随机）。

> `maxConnections`: number | string

最多同时存在多少条连接。达到该值前每个新代理请求都会开启一条新连接，此后 core 会复用已有连接。

与 `maxConcurrency` 冲突，只能二选一。默认值 `0`（不限制），支持范围。

> `cMaxReuseTimes`: number | string

一条连接最多被复用几次，之后不会被分配新的代理请求。默认值 `0`（不限制），支持范围。

> `hMaxRequestTimes`: number | string

每条连接累计 HTTP 请求数上限。Nginx 默认最多允许每条连接 1000 个请求。

全为 0 时默认值为 `"600-900"`（取随机），否则默认 `0`（不限制）。

> `hMaxReusableSecs`: number | string

每条连接最长可复用时间（秒）。Nginx 默认最多 1 小时。

全为 0 时默认值为 `"1800-3000"`（取随机），否则默认 `0`（不限制）。

> `hKeepAlivePeriod`: number

H2 / H3 连接空闲时客户端每隔多少秒发一次保活包。

`0` = Chrome H2 的 45 秒，或 quic-go H3 的 10 秒。可填负数（如 `-1`）关闭。建议留 `0`。

### extra 上下行分离

> `downloadSettings`: object

仅客户端。一套完整的下行 `streamSettings`，多了 `address` 和 `port` 以指向另一个入口。

```json
"downloadSettings": {
  "address": "",
  "port": 443,
  "network": "xhttp",
  "security": "tls",
  "tlsSettings": {},
  "xhttpSettings": {
    "path": "/yourpath"
  },
  "sockopt": {}
}
```

`network` 必须为 `"xhttp"`（不可省略），`security` 可以为 `"tls"` 或 `"reality"`。下行 `xhttpSettings.path` 必须与上行一致。

`sockopt` 可被分享，上行 `sockopt` 中将 `penetrate` 设为 `true` 可覆盖下行配置。

## 工作原理

### packet-up（分包上行、流式下行）

1. **客户端** `POST /yourpath/sameUUID/seq` 发送上行数据
   - UUID 随机生成，下行 UUID 与之相同以关联
   - seq 从 0 开始递增，必须发完上一个 body 再发下一个
   - 多个 POST 可能乱序，服务端按 seq 重组
2. **客户端** `GET /yourpath/sameUUID` 启动下行
   - 服务端响应头包含：`X-Accel-Buffering: no`、`Cache-Control: no-store`、`Content-Type: text/event-stream`
3. 服务端响应头始终包含 `Access-Control-Allow-Origin: *` 和 `Access-Control-Allow-Methods: GET, POST`

### stream-up（流式上行、流式下行）

将 packet-up 的分包上行改为流式 `POST /yourpath/sameUUID`，不牺牲上行效率。上行默认有 `Content-Type: application/grpc` 伪装。

### stream-one（单请求双向流式）

`POST /yourpath/` 即可，响应即为下行，双向流式。末尾无 `/` 会自动补上。

## H1 / H2 / H3

服务端默认仅监听 TCP 端口处理 H1 和 H2。当启用 TLS 且 `alpn` 仅设 `"h3"` 时，才用 quic-go 监听 UDP 处理 H3。

客户端行为：
1. 启用 TLS/REALITY 时默认 H2，否则 HTTP/1.1
2. `alpn` 仅有 `"http/1.1"` 则 H1
3. `alpn` 仅有 `"h3"` 则 quic-go H3
4. 使用 Browser Dialer 时由浏览器决定

::: tip
确认客户端实际使用的 HTTP 版本、host、mode、上下行分离等信息，将日志调至 `"info"` 级别即可。
:::

## stream-up 对比 gRPC

| 对比项 | stream-up | gRPC 传输层 |
|--------|-----------|-------------|
| 实现 | 无需 gRPC 库，性能更好 | 依赖 gRPC 库 |
| 下行流量 | 独立 GET 请求，不受 CDN 对 gRPC 的流量限制 | 受 CDN 限制 |
| 增强特性 | header padding、XMUX、上下行分离、extra 分享 | 无 |
