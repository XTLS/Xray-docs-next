# 出站代理

出站连接用于发送数据，可用的协议请见 [outbound 可用协议列表](./outbounds/)。

## OutboundObject

`OutboundObject` 对应配置文件中 `outbounds` 项的一个子元素。

::: tip
列表中的第一个元素作为主outbound。当路由匹配不存在或没有匹配成功时，流量由主outbound发出。
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

>`sendThrough`: address

用于发送数据的 IP 地址，当主机有多个 IP 地址时有效，默认值为 `"0.0.0.0"`。
>`protocol`: string

连接协议名称，可选的协议类型见 [outbound 可用协议列表](./outbounds/)。
>`settings`: OutboundConfigurationObject

具体的配置内容，视协议不同而不同。详见每个协议中的 `OutboundConfigurationObject`。
>`tag`: string

此出站连接的标识，用于在其它的配置中定位此连接。

::: danger
当其不为空时，其值必须在所有 `tag` 中 **唯一**。
:::

>`streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

底层传输方式（transport）是当前 Xray 节点和其它节点对接的方式

>`proxySettings`: [ProxySettingsObject](#proxysettingsobject)

出站代理配置。当出站代理生效时，此outbound的 `streamSettings` 将不起作用。

>`mux`: [MuxObject](#muxobject)

Mux 相关的具体配置。


### ProxySettingsObject
```json
{
  "tag": "another-outbound-tag"
}
```

>`tag`: string

当指定另一个outbound的标识时，此outbound发出的数据，将被转发至所指定的outbound发出。

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
Mux 功能是在一条 TCP 连接上分发多个 TCP 连接的数据。实现细节详见 [Mux.Cool](../development/protocols/muxcool)。Mux 是为了减少 TCP 的握手延迟而设计，而非提高连接的吞吐量。使用 Mux 看视频、下载或者测速通常都有反效果。Mux 只需要在客户端启用，服务器端自动适配。

`MuxObject` 对应 `OutboundObject` 中的 `mux` 项。

```json
{
  "enabled": false,
  "concurrency": 8
}
```

>`enabled`: true | false

是否启用 Mux 转发请求，默认值 `false`。
>`concurrency`: number

最大并发连接数。最小值 `1`，最大值 `1024`，默认值 `8`。

这个数值表示了一个 TCP 连接上最多承载的 Mux 连接数量。比如设置 `concurrency=8` 时，当客户端发出了 8 个 TCP 请求，Xray 只会发出一条实际的 TCP 连接，客户端的 8 个请求全部由这个 TCP 连接传输。

::: tip
填负数时，如 `-1`，不加载 mux 模块。
:::
