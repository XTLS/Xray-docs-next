# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) 协议

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "trojan",
      // [!field focus]
      "settings": {
        "address": "127.0.0.1",
        "port": 1234,
        "password": "password",
        "email": "love@xray.com",
        "level": 0
      }
    }
  ]
}
```

::: warning
Trojan 请配合 [TLS](../transports/tls.md) 等传输安全使用。只有对端为私有地址且链路处于受信网络时，才允许使用 `streamSettings.security: "none"`。
:::

Trojan 出站不使用 Multiplex 连接池。[Multiplex](../multiplex.md) 由 VLESS 和 VMess 出站支持。

> `address`: address

服务端地址，支持 IPv4、IPv6 和域名。必填。

> `port`: number

服务端端口，通常与服务端监听的端口相同。

> `password`: string

密码. 必填，任意字符串。

> `email`: string

邮件地址，可选，用于标识用户

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
