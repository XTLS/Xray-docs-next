# 反向代理

反向代理可以把服务器端的流量向客户端转发，即逆向流量转发。

::: tip 
这个反向代理为通用反向代理（不限制代理协议类型），配置更为复杂，不要和 VLESS 简易配置反向弄混（见 VLESS 出入站文档相关部分）。
:::

其底层协议为 Mux.cool, 不过方向是相反的，服务端向客户端发起请求。

反向代理的大致工作原理如下:

- 假设在主机 A 中有一个网页服务器，这台主机没有公网 IP，无法在公网上直接访问。另有一台主机 B，它可以由公网访问。现在我们需要把 B 作为入口，把流量从 B 转发到 A。
  - 在主机 B 中配置 Xray，接收外部请求，所以称为 `portal` （门户）。
  - 在主机 A 中配置 Xray，负责将B的转发和网页服务器桥接起来，称为`bridge`。

- `bridge`
  - `bridge` 会向 `portal` 主动建立连接以注册反向通道，此连接的目标地址（domain）可以自行设定。
  - `bridge` 在收到`portal`转发过来的公网流量之后，会将其原封不动地发给主机 A 中的网页服务器。当然，这一步需要路由模块的配置。
  - `bridge` 收到响应后，也会将响应原封不动地返回给`portal`。

- `portal`
  - `portal` 收到请求且domain匹配，则说明是由 `bridge` 发来的响应数据，这条连接会用于建立反向通道。
  - `portal` 收到请求，domain不匹配，则说明是公网用户发来的连接，这种连接数据会转发给bridge.

- `bridge` 会根据流量的大小进行动态的负载均衡。

::: tip
如上所述，反向代理默认已开启 [Mux](../../development/protocols/muxcool/)，请不要在其用到的 outbound 上再次开启 Mux。
:::

::: warning
反向代理功能尚处于测试阶段，可能会有一些问题。
:::

## ReverseObject

`ReverseObject` 对应配置文件的 `reverse` 项。

```json
{
  "reverse": {
    "bridges": [
      {
        "tag": "bridge",
        "domain": "reverse-proxy.xray.internal"
      }
    ],
    "portals": [
      {
        "tag": "portal",
        "domain": "reverse-proxy.xray.internal"
      }
    ]
  }
}
```

> `bridges`: \[[BridgeObject](#bridgeobject)\]

数组，每一项表示一个 `bridge`。每个 `bridge` 的配置是一个 [BridgeObject](#bridgeobject)。

> `portals`: \[[PortalObject](#portalobject)\]

数组，每一项表示一个 `portal`。每个 `portal` 的配置是一个 [PortalObject](#bridgeobject)。

### BridgeObject

```json
{
  "tag": "bridge",
  "domain": "reverse-proxy.xray.internal"
}
```

> `tag`: string

所有由 `bridge` 发出的连接，都会带有这个标识。可以在 [路由配置](./routing.md) 中使用 `inboundTag` 进行识别。

> `domain`: string

指定一个域名，`bridge` 向 `portal` 建立的连接，都会借助这个域名进行发送。
这个域名只作为 `bridge` 和 `portal` 的通信用途，不必真实存在。

### PortalObject

```json
{
  "tag": "portal",
  "domain": "reverse-proxy.xray.internal"
}
```

> `tag`: string

`portal` 的标识。在 [路由配置](./routing.md) 中使用 `outboundTag` 将流量转发到这个 `portal`。

> `domain`: string

一个域名。当 `portal` 接收到流量时，如果流量的目标域名是此域名，则 `portal` 认为当前连接上是 `bridge` 发来的通信连接。而其它流量则会被当成需要转发的流量。`portal` 所做的工作就是把这两类连接进行识别并做对应的转发。

::: tip
一个 Xray 既可以作为 `bridge`，也可以作为 `portal`，也可以同时两者，以适用于不同的场景需要。
:::

## 完整配置样例

::: tip
在运行过程中，建议先启用 `bridge`，再启用 `portal`。
:::

### bridge 配置

`bridge` 通常需要两个 outbound，一个用于连接 `portal`，另一个用于发送实际的流量。也就是说，你需要用路由区分两种流量。

反向代理配置:

```json
"reverse": {
  "bridges": [
    {
      "tag": "bridge",
      "domain": "reverse-proxy.xray.internal"
    }
  ]
}
```

outbound:

```json
{
  // 转发到网页服务器
  "tag": "out",
  "protocol": "freedom",
  "settings": {
    "redirect": "127.0.0.1:80"
  }
}
```

```json
{
  // 连接到 portal
  "protocol": "vmess",
  "settings": {
    "vnext": [
      {
        "address": "portal 的 IP 地址",
        "port": 1024,
        "users": [
          {
            "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
          }
        ]
      }
    ]
  },
  "tag": "interconn"
}
```

路由配置:

```json
{
  "rules": [
    {
      // bridge 发出的请求，且域名为配置的域名，那么说明这是尝试向 portal 建立反向隧道的请求，
      // 则路由到 interconn，即连接到 portal
      "type": "field",
      "inboundTag": ["bridge"],
      "domain": ["full:reverse-proxy.xray.internal"],
      "outboundTag": "interconn"
    },
    {
      // 从 portal 过来的流量，也会从 bridge 出来，但是不带上面的domain
      // 则路由到 out，即转发给网页服务器
      "type": "field",
      "inboundTag": ["bridge"],
      "outboundTag": "out"
    }
  ]
}
```

### portal 配置

`portal` 通常需要两个 inbound，一个用于接收 `bridge` 的连接，另一个用于接收实际的流量。同时你也需要用路由区分两种流量。

反向代理配置:

```json
"reverse": {
  "portals": [
    {
      "tag": "portal",
      "domain": "reverse-proxy.xray.internal" // 必须和 bridge 的配置一样
    }
  ]
}
```

inbound:

```json
{
  // 直接接收来自公网的请求
  "tag": "external",
  "port": 80,
  "protocol": "dokodemo-door",
  "settings": {
    "address": "127.0.0.1",
    "port": 80,
    "network": "tcp"
  }
}
```

```json
{
  // 接收来自 bridge 尝试建立反向隧道的请求
  "tag": "interconn",
  "port": 1024,
  "protocol": "vmess",
  "settings": {
    "clients": [
      {
        "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
      }
    ]
  }
}
```

路由配置:

```json
{
  "rules": [
    {
      // 如果入站是 external，说明是来自公网的请求，
      // 则路由到 portal, 最终会转发给 bridge
      "type": "field",
      "inboundTag": ["external"],
      "outboundTag": "portal"
    },
    {
      // 如果来自 interconn 入站，说明是来自 bridge 的尝试建立反向隧道请求，
      // 则路由到 portal, 最终会转发给对应的公网客户端
      // 注意：这里进入的请求会带上了前文配置的domain，所以 portal 能够区分两种被路由到 portal 的请求
      "type": "field",
      "inboundTag": ["interconn"],
      "outboundTag": "portal"
    }
  ]
}
```
