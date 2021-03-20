# HTTP

HTTP 协议。

::: danger
**http 协议没有对传输加密，不适宜经公网中传输，更容易成为被人用作攻击的肉鸡。**
:::

::: tip
 `http` 只能代理 tcp 协议，udp 系的协议均不能通过。
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "192.168.108.1",
      "port": 3128,
      "users": [
        {
          "user": "my-username",
          "pass": "my-password"
        }
      ]
    }
  ]
}
```

::: tip
目前 HTTP 协议 outbound 中 `streamSettings` 设置 `security` 和 `tlsSettings` 是生效的。
:::

> `servers`: \[ [ServerObject](#serverobject) \]

HTTP 服务器列表，其中每一项是一个服务器配置，若配置多个，循环使用 (RoundRobin)。

### ServerObject

```json
{
  "address": "192.168.108.1",
  "port": 3128,
  "users": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ]
}
```

> `address`: string

HTTP 代理服务器地址，必填。

> `port`: int

HTTP 代理服务器端口，必填。

> `user`: \[[AccountObject](#accountobject)\]

一个数组，数组中每个元素为一个用户帐号。默认值为空。

#### AccountObject

```json
{
  "user": "my-username",
  "pass": "my-password"
}
```

> `user`: string

用户名，字符串类型。必填。

> `pass`: string

密码，字符串类型。必填。
