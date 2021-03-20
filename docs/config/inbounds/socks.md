# Socks

标准 Socks 协议实现，兼容 [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol)、Socks 4a 和 [Socks 5](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol)。

::: danger
**socks 协议没有对传输加密，不适宜经公网中传输**
:::

`socks` 入站更有意义的用法是在局域网或本机环境下监听，为其他程序提供本地服务。


## InboundConfigurationObject

```json
{
  "auth": "noauth",
  "accounts": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ],
  "udp": false,
  "ip": "127.0.0.1",
  "userLevel": 0
}
```

> `auth`: "noauth" | "password"

Socks 协议的认证方式，支持 `"noauth"` 匿名方式和 `"password"` 用户密码方式。

默认值为 `"noauth"`。

> `accounts`: \[ [AccountObject](#accountobject) \]

一个数组，数组中每个元素为一个用户帐号。

此选项仅当 `auth` 为 `password` 时有效。

默认值为空。

> `udp`: true | false

是否开启 UDP 协议的支持。

默认值为 `false`。

> `ip`: address

当开启 UDP 时，Xray 需要知道本机的 IP 地址。

默认值为 `"127.0.0.1"`。

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
