# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) 协议

::: danger
Trojan 被设计工作在正确配置的加密 TLS 隧道
:::

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "password": "password",
      "email": "love@xray.com",
      "level": 0
    }
  ],
  "fallbacks": [
    {
      "dest": 80
    }
  ]
}
```

> `clients`: \[ [ClientObject](#clientobject) \]

一个数组，代表一组服务端认可的用户.

其中每一项是一个用户 [ClientObject](#clientobject)。

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

一个数组，包含一系列强大的回落分流配置（可选）。
fallbacks 的具体配置请点击[FallbackObject](../features/fallback.md#fallbacks-配置)

::: tip
Xray 的 Trojan 有完整的 fallbacks 支持，配置方式完全一致。
触发回落的条件也与 VLESS 类似：首包长度 < 58 或第 57 个字节不为 `\r`（因为 Trojan 没有协议版本）或身份认证失败。
:::

### ClientObject

```json
{
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

> `password`: string

必填，任意字符串。

> `email`: string

邮件地址，可选，用于标识用户

::: danger
如果存在多个 ClientObject, 请注意 email 不可以重复。
:::

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
