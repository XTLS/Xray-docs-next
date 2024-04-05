# Loopback

Loopback 是个出站数据协议，其作用为将经该出站传出的数据重新送入路由入站，以达到数据无需离开 Xray-core 即可再次被路由处理的效果。

## OutboundConfigurationObject

```json
{
  "inboundTag": "TagUseAsInbound"
}
```

> `inboundTag`: string

用于重新路由的入站协议标识。

该标识可以在路由中用于 `inboundTag` ，表示该出站中的数据可以被对应的路由规则再次处理。

### 如何使用？

如果需要将已经通过路由规则分流过的流量再由其它路由规则做更细致的分流，比如由同一组路由规则分流后的 TCP 流量和 UDP 要走不同的出站，则可以使用 `loopback` 出站完成。

``` json
{
  "outbounds": [
    {
      "protocol": "loopback",
      "tag": "need-to-split",
      "settings": {
        "inboundTag": "traffic-input" // 该 tag 在下方用于 RuleObject 的 inboundTag
      }
    },
    {
      "tag": "tcp-output",
      // protocol, settings, streamSettings 之类的设置
    },
    {
      "tag": "udp-output",
      // protocol, settings, streamSettings 之类的设置
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["traffic-input"], // loopback 设定的 tag
        "network": "tcp",
        "outboundTag": "tcp-output"
      },
      {
        "inboundTag": ["traffic-input"], // loopback 设定的 tag
        "network": "udp",
        "outboundTag": "udp-output"
      }
    ]
  }
}
```
