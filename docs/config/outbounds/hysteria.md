# Hysteria

Hysteria 协议的客户端实现。

这个页面非常简单，因为 hysteria 协议实际上分为一个简单的代理控制协议和经过调优的 QUIC 底层传输，在 Xray 中代理协议和底层传输被拆分，更多内容（如 brutal）详见底层传输的 [hysteriaSettings](../transports/hysteria.md)


## OutboundConfigurationObject

```json
{
  "version": 2,
  "address": "192.168.108.1",
  "port": 3128,
}
```

> `version`: number

Hysteria 版本，必须位 2。

> `address`: string

Hysteria 代理服务器地址，必填。

> `port`: int

Hysteria 代理服务器端口，必填。