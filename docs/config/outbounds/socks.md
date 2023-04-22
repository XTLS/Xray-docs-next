# Socks

标准 Socks 协议实现，兼容 Socks 5。

::: danger
**Socks 协议没有对传输加密，不适宜经公网中传输**
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "127.0.0.1",
      "port": 1234,
      "users": [
        {
          "user": "test user",
          "pass": "test pass",
          "level": 0
        }
      ]
    }
  ]
}
```

> `servers`: \[ [ServerObject](#serverobject) \]

Socks 服务器列表，其中每一项是一个服务器配置。

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "users": [
    {
      "user": "test user",
      "pass": "test pass",
      "level": 0
    }
  ]
}
```

> `address`: address

服务器地址, 必填

::: tip
仅支持连接到 Socks 5 服务器。
:::

> `port`: number

服务器端口, 必填

> `users`: \[ [UserObject](#userobject) \]

一个数组表示的用户列表，数组中每个元素为一个用户配置。

当列表不为空时，Socks 客户端会使用用户信息进行认证；如未指定，则不进行认证。

默认值为空。

#### UserObject

```json
{
  "user": "test user",
  "pass": "test pass",
  "level": 0
}
```

> `user`: string

用户名，字符串类型。必填。

> `pass`: string

密码，字符串类型。必填。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
