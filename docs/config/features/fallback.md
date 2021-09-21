# Fallback 回落

> **Fallback 是 Xray 的最强大功能之一, 可有效防止主动探测, 自由配置常用端口多服务共享**

fallback 为 Xray 提供了高强度的防主动探测性, 并且具有独创的首包回落机制.

fallback 也可以将不同类型的流量根据 path 进行分流, 从而实现一个端口, 多种服务共享.

目前您可以在使用 VLESS 或者 trojan 协议时, 通过配置 fallbacks 来使用回落这一特性, 并且创造出非常丰富的组合玩法.

## fallbacks 配置

```json
  "fallbacks": [
    {
      "dest": 80
    }
  ]
```

> `fallbacks`: \[ [FallbackObject](#fallbackobject) \]

一个数组，包含一系列强大的回落分流配置。

### FallbackObject

```json
{
  "name": "",
  "alpn": "",
  "path": "",
  "dest": 80,
  "xver": 0
}
```

**`fallbacks` 是一个数组，这里是其中一个子元素的配置说明。**

`fallbacks` 项是可选的，只能用于 TCP+TLS 传输组合

- 该项有子元素时，[Inbound TLS](../transport.md#tlsobject) 需设置 `"alpn":["http/1.1"]`。\*\*

通常，你需要先设置一组 `alpn` 和 `path` 均省略或为空的默认回落，然后再按需配置其它分流。

VLESS 会把 TLS 解密后首包长度 < 18 或协议版本无效、身份认证失败的流量转发到 `dest` 指定的地址。

其它传输组合必须删掉 `fallbacks` 项或所有子元素，此时也不会开启 Fallback，VLESS 会等待读够所需长度，协议版本无效或身份认证失败时，将直接断开连接。

> `name`: string

尝试匹配 TLS SNI(Server Name Indication)，空为任意，默认为 ""

> `alpn`: string

尝试匹配 TLS ALPN 协商结果，空为任意，默认为 ""

有需要时，VLESS 才会尝试读取 TLS ALPN 协商结果，若成功，输出 info `realAlpn =` 到日志。
用途：解决了 Nginx 的 h2c 服务不能同时兼容 http/1.1 的问题，Nginx 需要写两行 listen，分别用于 1.1 和 h2c。
注意：fallbacks alpn 存在 `"h2"` 时，[Inbound TLS](../transport.md#tlsobject) 需设置 `"alpn":["h2","http/1.1"]`，以支持 h2 访问。

::: tip
Fallback 内设置的 `alpn` 是匹配实际协商出的 ALPN，而 Inbound TLS 设置的 `alpn` 是握手时可选的 ALPN 列表，两者含义不同。
:::

> `path`: string

尝试匹配首包 HTTP PATH，空为任意，默认为空，非空则必须以 `/` 开头，不支持 h2c。

智能：有需要时，VLESS 才会尝试看一眼 PATH（不超过 55 个字节；最快算法，并不完整解析 HTTP），若成功，输出 INFO 日志 `realPath =`。
用途：分流其它 inbound 的 WebSocket 流量或 HTTP 伪装流量，没有多余处理、纯粹转发流量，理论性能比 Nginx 更强。

注意：**fallbacks 所在入站本身必须是 TCP+TLS**，这是分流至其它 WS 入站用的，被分流的入站则无需配置 TLS。

> `dest`: string | number

决定 TLS 解密后 TCP 流量的去向，目前支持两类地址：（该项必填，否则无法启动）

1. TCP，格式为 `"addr:port"`，其中 addr 支持 IPv4、域名、IPv6，若填写域名，也将直接发起 TCP 连接（而不走内置的 DNS）。
2. Unix domain socket，格式为绝对路径，形如 `"/dev/shm/domain.socket"`，可在开头加 `@` 代表 [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html)，`@@` 则代表带 padding 的 abstract。

若只填 port，数字或字符串均可，形如 `80`、`"80"`，通常指向一个明文 http 服务（addr 会被补为 `"127.0.0.1"`）。

> `xver`: number

发送 [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt)，专用于传递请求的真实来源 IP 和端口，填版本 1 或 2，默认为 0，即不发送。若有需要建议填 1。

目前填 1 或 2，功能完全相同，只是结构不同，且前者可打印，后者为二进制。Xray 的 TCP 和 WS 入站均已支持接收 PROXY protocol。

::: warning
若你正在 [配置 Nginx 接收 PROXY protocol](https://docs.nginx.com/nginx/admin-guide/load-balancer/using-proxy-protocol/#configuring-nginx-to-accept-the-proxy-protocol)，除了设置 proxy_protocol 外，还需设置 set_real_ip_from，否则可能会出问题。
:::

### 补充说明

- 将匹配到最精确的子元素，与子元素的排列顺序无关。若配置了几个 alpn 和 path 均相同的子元素，则会以最后的为准。
- 回落分流均是解密后 TCP 层的转发，而不是 HTTP 层，只在必要时检查首包 PATH。
- 您可以查看更多的关于 Fallbacks 的使用技巧和心得
  - [Fallbacks 功能简析](../../documents/level-1/fallbacks-lv1)

## Fallbacks 设计理论 <Badge text="WIP" type="warning"/>
