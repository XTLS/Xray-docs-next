# Loopback

Loopback 是一个环回出站，用于将流量重新送回 routing 处理，而无需离开核心。

::: tip 用途

- 在只能指定出站、不能直接写 `balancerTag` 的地方，借由 Loopback 间接使用 balancer<br>
  例如链式代理中的 `proxySettings`、`dialerProxy` 和负载均衡中的 `fallbackTag`
- 流量已经分流过一次后，再按更多条件继续细分<br>
  比如由同一组路由规则分流后的 TCP 流量和 UDP 要走不同的出站

:::

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "loopback",
      // [!code focus:4]
      "settings": {
        "inboundTag": "TagUseAsInbound",
        "sniffing": {}
      }
    }
  ]
}
```

> `inboundTag`: string

用于重新进入路由时的入站标识。

该标识可以在路由中用于 `inboundTag`，表示该出站中的数据会以这个 tag 重新进入路由，并被对应的规则再次处理。

> `sniffing`: [SniffingObject](../inbound.md#sniffingobject)

流量探测，具体配置和 [入站代理](../inbound.md#sniffingobject) 的相同。默认为不开启。
