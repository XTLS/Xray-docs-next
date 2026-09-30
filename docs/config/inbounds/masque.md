# MASQUE

IETF MASQUE 中 CONNECT-IP（[RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)）的服务端实现，可供 masque [出站](../outbounds/masque.md) 以及其他遵循该标准的客户端连接。

与 WireGuard 入站类似，Xray 在本地运行一个用户态网络栈：每条隧道从 `address` 的网段中分得地址，隧道内的 IP 包被还原为 TCP 和 UDP 连接后进入路由，因此 sniffing、路由和按用户的流量统计都可用。

客户端使用 HTTP Basic 认证，用户名为 `email`，密码为 `pass`。

::: tip
MASQUE 入站只能搭配 `masque` 传输层，且必须使用 `tls`。

默认只监听 HTTP/3（UDP），HTTP/2 的开启方式以及请求路径见传输配置 [masqueSettings](../transports/masque.md)。
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
        "address": ["10.14.0.1/24", "fd14::1/64"],
        "mtu": 1280
      },
      "streamSettings": {
        "method": "masque",
        "security": "tls",
        "tlsSettings": {
          "alpn": ["h3", "h2"],
          "certificates": [
            {
              "certificateFile": "/path/to/certificate.crt",
              "keyFile": "/path/to/key.key"
            }
          ]
        }
      }
    }
  ]
}
```

> `users`: \[ [UserObject](#userobject) \]

一个数组，代表一组服务端认可的用户。

通过 API 移除用户时，该用户已建立的隧道会被关闭。

> `address`: \[ string \]

服务端在隧道内的地址及其所在网段，CIDR 格式，必填。IPv4 与 IPv6 最多各填一个。

每条隧道从各网段中分得一个地址，所有网段都已分完时请求会得到 503。地址需为网段内的主机地址，不能是网络地址或 IPv4 广播地址。

> `mtu`: number

用户态网络栈的 MTU，默认为 1280，取值范围为 1280 至 65535。

::: tip
同一入站的客户端之间可以通过隧道内的地址互相访问，这部分 IP 包由服务端直接转发，不经过路由。
:::

### UserObject

```json
{
  "email": "love@xray.com",
  "pass": "password",
  "level": 0
}
```

> `email`: string

用户邮箱，必填，同时作为 Basic 认证的用户名，也用于区分不同用户的流量（会体现在日志、统计中）。

不区分大小写，不能重复，不能包含 `:`。

> `pass`: string

密码，必填，任意长度字符串。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
