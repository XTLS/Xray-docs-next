# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) 协议

## InboundConfigurationObject

`InboundConfigurationObject` 对应 [`InboundObject`](../inbound.md) 中的 `settings` 项。

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "trojan",
      // [!code focus:14]
      "settings": {
        "users": [
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
    }
  ]
}
```

::: warning
Trojan 必须配合传输安全 [TLS](https://xtls.github.io/config/transports/tls.html) 使用；只有当对端是 private 地址（如私有 IP、私有域名）且链路处于受信网络中时，才允许使用 `streamSettings.security: "none"`。公网环境中还要求启用 Mux；否则一旦内层载荷本身也是 TLS，就会形成 TiT，很容易被检测（[PoC](https://github.com/XTLS/Trojan-killer)）。
:::

> `users`: \[ [UserObject](#userobject) \]

一个数组，代表一组服务端认可的用户.

其中每一项是一个用户 [UserObject](#userobject)。

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

一个数组，包含一系列强大的回落分流配置（可选）。
fallbacks 的具体配置请点击[FallbackObject](../features/fallback.md#fallbacks-配置)

::: tip
Xray 的 Trojan 有完整的 fallbacks 支持，配置方式完全一致。
触发回落的条件也与 VLESS 类似：首包长度 < 58 或第 57 个字节不为 `\r`（因为 Trojan 没有协议版本）或身份认证失败。
:::

### UserObject

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
如果存在多个 UserObject, 请注意 email 不可以重复。
:::

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
