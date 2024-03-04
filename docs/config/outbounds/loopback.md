# Loopback

Loopback 是个出站数据协议，其作用为将经该出站传出的数据重新送入路由入站，以达到数据再次被路由处理的效果。

## OutboundConfigurationObject

```json
{
  "inboundTag": "TagUseAsInbound"
}
```

> `inboundTag`: string

用于重新路由的入站协议标识。

该标识可以在路由中用于 `inboundTag` ，表示该出站中的数据可以被对应的路由规则再次处理。
