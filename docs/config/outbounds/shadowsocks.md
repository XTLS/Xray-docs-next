# Shadowsocks

[Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks) 协议，兼容大部分其它版本的实现。

目前兼容性如下：

- 支持 TCP 和 UDP 数据包转发，其中 UDP 可选择性关闭；
- 推荐的加密方式：
  - 2022-blake3-aes-128-gcm
  - 2022-blake3-aes-256-gcm
  - 2022-blake3-chacha20-poly1305
- 其他加密方式
  - aes-256-gcm
  - aes-128-gcm
  - chacha20-poly1305 或称 chacha20-ietf-poly1305
  - xchacha20-poly1305 或称 xchacha20-ietf-poly1305
  - none 或 plain

Shadowsocks 2022 新协议格式提升了性能并带有完整的重放保护，解决了旧协议的以下安全问题：

- [Shadowsocks AEAD 加密方式设计存在严重漏洞，无法保证通信内容的可靠性](https://github.com/shadowsocks/shadowsocks-org/issues/183)
- 原有 TCP 重放过滤器误报率随时间增加
- 没有 UDP 重放保护
- 可用于主动探测的 TCP 行为

::: danger
"none" 不加密方式下流量将明文传输。为确保安全性, 不要在公共网络上使用。
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
      "uot": true,
      "UoTVersion": 2,
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
  "uot": true,
  "UoTVersion": 2,
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

> `password`: string

必填。

> `uot`: bool

启用`udp over tcp`。

> `UoTVersion`: number

`UDP over TCP` 的实现版本。

当前可选值：`1`, `2`

- Shadowsocks 2022

使用与 WireGuard 类似的预共享密钥作为密码。

使用 `openssl rand -base64 <长度>` 以生成与 shadowsocks-rust 兼容的密钥，长度取决于所使用的加密方法。

| 加密方法                      | 密钥长度 |
| ----------------------------- | -------: |
| 2022-blake3-aes-128-gcm       |       16 |
| 2022-blake3-aes-256-gcm       |       32 |
| 2022-blake3-chacha20-poly1305 |       32 |

在 Go 实现中，32 位密钥始终工作。

- 其他加密方法

任意字符串。不限制密码长度，但短密码会更可能被破解，建议使用 16 字符或更长的密码。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

`level` 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。
