# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) 协议

::: danger
Trojan 被设计工作在正确配置的加密 TLS 隧道
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "127.0.0.1",
      "port": 1234,
      "password": "password",
      "email": "love@xray.com",
      "level": 0
    }
  ]
}
```

> `servers`: \[ [ServerObject](#serverobject) \]

一个数组，其中每一项是一个 [ServerObject](#serverobject)。

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

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
