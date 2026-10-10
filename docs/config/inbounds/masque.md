# MASQUE

MASQUE CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的服务端，可被 MASQUE [出站](../outbounds/masque.md) 以及其他遵循该标准、使用 HTTP Basic 认证的客户端连接。

每条隧道都需要通过 HTTP Basic 认证，失败时返回 401。服务端从 `address` 中为每条隧道分配地址，并为分配到的地址族下发覆盖整个地址空间的路由。隧道内的 TCP 与 UDP 由服务端的用户态网络栈还原为普通连接，再交给路由处理，此时的来源地址是客户端在隧道内的地址；发往其他隧道地址的包直接转发，不经过路由。

监听的 HTTP 版本由 `tlsSettings` 的 `alpn` 决定，`path` 在传输配置 [masqueSettings](../transports/masque.md) 中设置。

::: tip
MASQUE 入站只能搭配 `masque` 传输方式，且必须使用 `tls`。
:::

## InboundConfigurationObject

`InboundConfigurationObject` 对应 [`InboundObject`](../inbound.md) 中的 `settings` 项。

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "masque",
      // [!field focus]
      "settings": {
        "users": [
          {
            "email": "love@xray.com",
            "pass": "password",
            "level": 0
          }
        ],
        "address": ["10.0.0.1/24", "fd00::1/64"],
        "mtu": 1280
      }
    }
  ]
}
```

> `users`: \[ [UserObject](#userobject) \]

一个数组，代表一组服务端认可的用户，也可以写作 `clients`。没有用户时所有连接都会被拒绝。

通过 API 删除用户时，该用户正在使用的隧道会被立即关闭。

> `address`: \[ string \]

分配给隧道的地址段，必填，最多一个 IPv4 和一个 IPv6 前缀（IPv4 前缀长度最大为 30，IPv6 最大为 126）。

前缀中的地址是服务端自己的地址，其余地址依次分配给各条隧道（IPv4 不含网络地址与广播地址），隧道断开后回收。某个地址族的地址用完时，新隧道只拿到另一个地址族的地址，两个都用完时返回 503。

> `mtu`: number

隧道的 MTU，范围为 1280 到 65535，默认为 1280。

### UserObject

```json
{
  "email": "love@xray.com",
  "pass": "password",
  "level": 0
}
```

> `email`: string

用户名，必填，不能包含 `:`，不能重复（不区分大小写）。对应出站 `masqueSettings` 中的 `user`。

> `pass`: string

密码，必填。对应出站 `masqueSettings` 中的 `pass`。

> `level`: number

用户等级。MASQUE 入站只使用该等级 [本地策略](../policy.md#levelpolicyobject) 中的用户流量统计设置。
