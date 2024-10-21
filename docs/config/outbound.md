# 出站代理（Mux、XUDP）

出站连接用于发送数据，可用的协议请见 [出站协议](./outbounds/)。

## OutboundObject

`OutboundObject` 对应配置文件中 `outbounds` 项的一个子元素。

::: tip
列表中的第一个元素作为主 outbound。当路由匹配不存在或没有匹配成功时，流量由主 outbound 发出。
:::

```json
{
  "outbounds": [
    {
      "sendThrough": "0.0.0.0",
      "protocol": "协议名称",
      "settings": {},
      "tag": "标识",
      "streamSettings": {},
      "proxySettings": {
        "tag": "another-outbound-tag"
      },
      "mux": {}
    }
  ]
}
```

> `sendThrough`: address

用于发送数据的 IP 地址，当主机有多个 IP 地址时有效，默认值为 `"0.0.0.0"`。

允许在其中填入 IPv6 CIDR 块(如114:514:1919:810::/64)，Xray将会使用地址块中随机的IP地址对外发起连接。
需要正确配置网络接入方式，路由表以及内核参数以允许 Xray bind 至地址块内的任意IP。

对于使用ndp接入的网络，不建议设置小于 /120 的子网，否则可能会造成 NDP flood 导致路由器邻居缓存被占满等一系列问题。

> `protocol`: string

连接协议名称，可选的协议列表见左侧 出站代理。

> `settings`: OutboundConfigurationObject

具体的配置内容，视协议不同而不同。详见每个协议中的 `OutboundConfigurationObject`。

> `tag`: string

此出站连接的标识，用于在其它的配置中定位此连接。

::: danger
当其不为空时，其值必须在所有 `tag` 中 **唯一**。
:::

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

底层传输方式（transport）是当前 Xray 节点和其它节点对接的方式

> `proxySettings`: [ProxySettingsObject](#proxysettingsobject)

出站代理配置。当出站代理生效时，此 outbound 的 `streamSettings` 将不起作用。

> `mux`: [MuxObject](#muxobject)

Mux 相关的具体配置。

### ProxySettingsObject

```json
{
  "tag": "another-outbound-tag"
}
```

> `tag`: string

当指定另一个 outbound 的标识时，此 outbound 发出的数据，将被转发至所指定的 outbound 发出。

::: danger
这种转发方式**不经过**底层传输方式。如果需要使用支持底层传输方式的转发，请使用 [SockOpt.dialerProxy](./transport.md#sockoptobject)。
:::

::: danger
此选项与 SockOpt.dialerProxy 不兼容
:::

::: tip
兼容 v2fly/v2ray-core 的配置 [transportLayer](https://www.v2fly.org/config/outbounds.html#proxysettingsobject)
:::

### MuxObject

Mux 功能是在一条 TCP 连接上分发多个 TCP 连接的数据。实现细节详见 [Mux.Cool](../../development/protocols/muxcool)。Mux 是为了减少 TCP 的握手延迟而设计，而非提高连接的吞吐量。使用 Mux 看视频、下载或者测速通常都有反效果。Mux 只需要在客户端启用，服务器端自动适配。Mux 的第二个用途是分发多个 UDP 连接，即 XUDP。

`MuxObject` 对应 `OutboundObject` 中的 `mux` 项。

```json
{
  "enabled": true,
  "concurrency": 8,
  "xudpConcurrency": 16,
  "xudpProxyUDP443": "reject"
}
```

> `enabled`: true | false

是否启用 Mux 转发请求，默认值 `false`。

> `concurrency`: number

最大并发连接数。最小值 `1`，最大值 `128`。省略或者填 `0` 时都等于 `8`, 大于`128` 的值都将视为128.

这个数值表示了一个 TCP 连接上最多承载的子连接数量。比如设置 `concurrency=8` 时，当客户端发出了 8 个 TCP 请求，Xray 只会发出一条实际的 TCP 连接，客户端的 8 个请求全部由这个 TCP 连接传输。

核心并不会回收关闭子连接id, 这意味着这其实是一个连接最大可以被复用的次数，比方说如果设置为 16, 如果该连接已经被复用了 16 次，其中 10 条已经关闭了，这并不会为该连接“腾出”十个位置，核心仍会认为该连接复用次数已满并打开新的连接

::: tip
填负数时，如 `-1`，不使用 Mux 模块承载 TCP 流量。
:::

> `xudpConcurrency`: number

使用新 XUDP 聚合隧道（也就是另一条 Mux 连接）代理 UDP 流量，填写最大并发子 UoT 数量。最小值 `1`，最大值 `1024`。
省略或者填 `0` 时，将与 TCP 流量走同一条路，也就是传统的行为。

::: tip
填负数时，如 `-1`，不使用 Mux 模块承载 UDP 流量。将使用代理协议原本的 UDP 传输方式。例如 `Shadowsocks` 会使用原生 UDP，`VLESS` 会使用 UoT。
:::

> `xudpProxyUDP443`: string

控制 Mux 对于被代理的 UDP/443（QUIC）流量的处理方式：

- 默认 `reject` 拒绝流量（一般浏览器会自动回落到 TCP HTTP2）
- `allow` 允许走 Mux 连接。
- 填 `skip` 时，不使用 Mux 模块承载 UDP 443 流量。将使用代理协议原本的 UDP 传输方式。例如 `Shadowsocks` 会使用原生 UDP，`VLESS` 会使用 UoT。
