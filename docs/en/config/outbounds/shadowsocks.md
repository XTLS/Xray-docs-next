# Shadowsocks

[Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks) 协议，兼容大部分其它版本的实现。

目前兼容性如下：

- 支持 TCP 和 UDP 数据包转发，其中 UDP 可选择性关闭；
- 推荐的加密方式：

  - AES-256-GCM
  - AES-128-GCM
  - ChaCha20-Poly1305 或称 ChaCha20-IETF-Poly1305
  - none 或 plain

  不推荐的加密方式:

  - AES-256-CFB
  - AES-128-CFB
  - ChaCha20
  - ChaCha20-IETF

::: danger
"none" 不加密方式下，服务器端不会验证 "password" 中的密码。为确保安全性, 一般需要加上 TLS 并在传输层使用安全配置，例如 WebSocket 配置较长的 path
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "email": "love@xray.com",
      "address": "127.0.0.1",
      "port": 1234,
      "method": "加密方式",
      "password": "密码",
      "level": 0
    }
  ]
}
```

> `servers`: \[[ServerObject](#serverobject)\]

一个数组，代表一组 Shadowsocks 服务端设置, 其中每一项是一个 [ServerObject](#serverobject)。

### ServerObject

```json
{
  "email": "love@xray.com",
  "address": "127.0.0.1",
  "port": 1234,
  "method": "加密方式",
  "password": "密码",
  "level": 0
}
```

> `email`: string

邮件地址，可选，用于标识用户

> `address`: address

Shadowsocks 服务端地址，支持 IPv4、IPv6 和域名。必填。

> `port`: number

Shadowsocks 服务端端口。必填。

> `method`: string

必填。

- 推荐的加密方式：
  - AES-256-GCM
  - AES-128-GCM
  - ChaCha20-Poly1305 或称 ChaCha20-IETF-Poly1305
  - none 或 plain

> `password`: string

必填。任意字符串。

Shadowsocks 协议不限制密码长度，但短密码会更可能被破解，建议使用 16 字符或更长的密码。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

`level` 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
