# HTTP

HTTP 协议。

::: danger
**http 协议没有对传输加密，不适宜经公网中传输，更容易成为被人用作攻击的肉鸡。**
:::

`http` 入站更有意义的用法是在局域网或本机环境下监听，为其他程序提供本地服务。

::: tip TIP 1
`http proxy` 只能代理 tcp 协议，udp 系的协议均不能通过。
:::

::: tip TIP 2
在 Linux 中使用以下环境变量即可在当前 session 使用全局 HTTP 代理（很多软件都支持这一设置，也有不支持的）。

- `export http_proxy=http://127.0.0.1:8080/` (地址须改成你配置的 HTTP 入站代理地址)
- `export https_proxy=$http_proxy`
  :::

## InboundConfigurationObject

```json
{
  "accounts": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ],
  "allowTransparent": false,
  "userLevel": 0
}
```

> `accounts`: \[[AccountObject](#accountobject)\]

一个数组，数组中每个元素为一个用户帐号。默认值为空。

当 `accounts` 非空时，HTTP 代理将对入站连接进行 Basic Authentication 验证。

> `allowTransparent`: true | false

当为 `true` 时，会转发所有 HTTP 请求，而非只是代理请求。

::: tip
若配置不当，开启此选项会导致死循环。
:::

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

### AccountObject

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
