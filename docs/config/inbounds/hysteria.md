# Hysteria

::: tip
`hysteria protocol` 本身无认证，`clients` 仅在搭配 `hysteria` 传输层时生效
:::

## InboundConfigurationObject

```json
{
  "version": 2,
  "clients": [
    {
      "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com"
    }
  ]
}
```

> `version`: number

Hysteria 版本，必须为 2。

> `clients`: \[ [ClientObject](#clientobject) \]

一个数组，代表一组服务端认可的用户。

### ClientObject

```json
{
  "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com"
}
```

> `auth`: string

任意长度字符串。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `email`: string

用户邮箱，用于区分不同用户的流量（会体现在日志、统计中）。