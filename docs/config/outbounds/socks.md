# Socks

标准 Socks 协议实现，兼容 Socks 5。

::: danger
**Socks 协议没有对传输加密，不适宜经公网中传输**
:::

## OutboundConfigurationObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "user": "test user",
  "pass": "test pass",
  "level": 0,
  "email": "love@xray.com"
}
```

> `address`: address

服务器地址, 必填

::: tip
仅支持连接到 Socks 5 服务器。
:::

> `port`: number

服务器端口, 必填。

> `user`: string

用户名，字符串类型。如果对接服务端需要认证则必填，否则不要包含此项。

> `pass`: string

密码，字符串类型。如果对接服务端需要认证则必填，否则不要包含此项。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。如果对接服务端需要认证则选填，否则不要包含此项。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `email`: string

邮件地址，用于标识用户。如果对接服务端需要认证则选填，否则不要包含此项。
