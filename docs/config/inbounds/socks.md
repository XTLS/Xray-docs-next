# Socks

标准 Socks 协议实现，兼容 [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol)、[Socks 4a](https://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4A.protocol) Socks 5, 以及 **HTTP**。

::: danger
**Socks 协议没有对传输加密，不适宜经公网中传输**
:::

`Socks` 入站更有意义的用法是在局域网或本机环境下监听，为其他程序提供本地服务。

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

当使用 password 时，发往入站的HTTP请求也会要求同样的账号密码。

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

“本机的 IP 地址” 含义是客户端发起UDP连接时可以拿着这个 IP 找到服务端，默认是服务器被TCP连接时的本地 IP. 大多数时候应该可以正常工作，但是在经过一些经过 NAT 的系统时可能导致工作异常需要修改这个参数为正确的公网IP.

警告，如果你的机器上存在多个IP地址，将会受到 [入站监听](../inbound.md#inboundobject) 里UDP监听 0.0.0.0 时有关的影响。

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
