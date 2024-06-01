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

## InboundConfigurationObject

```json
{
  "settings": {
    "network": "tcp,udp",
    "method": "aes-256-gcm",
    "password": "114514",
    "level": 0,
    "email": "love@xray.com",
    "clients": [
      {
        "password": "1919810",
        "method": "aes-128-gcm"
      }
    ]
  }
}
```

> `network`: "tcp" | "udp" | "tcp,udp"

可接收的网络协议类型。比如当指定为 `"tcp"` 时，仅会接收 TCP 流量。默认值为 `"tcp"`。

> `method`: string

加密方式，可选项见上。

> `password`: string

必填。

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

任意字符串。 不限制密码长度，但短密码会更可能被破解，建议使用 16 字符或更长的密码。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。
`level` 的值, 对应 [policy](../policy.md#levelpolicyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `email`: string

用户邮箱，用于区分不同用户的流量（日志、统计）。

## ClientObject

```json
{
  "password": "1919810",
  "method": "aes-256-gcm",
  "level": 0,
  "email": "love@xray.com"
}
```

当存在此选项时，代表启用多用户模式.

当 InboundConfigurationObject 中的 `method` 不为SS2022选项时，可以在此为每个用户指定 `"method"`。(`"method"`中也仅支持非SS2022选项)与`"password"`(与此同时 InboundConfigurationObject 中的设置的 `"password"` 将会被忽略)。

当 InboundConfigurationObject 中的 `method` 为SS2022选项时，出于安全考量，不再支持为单个用户设置 `"method"`，统一为 InboundConfigurationObject 所指定的`"method"`。

注意SS2022并不会像旧SS一样忽略上层 `"password"`, 客户端的正确密码写法应为, `ServerPassword:UserPassword`。如:`"password": "114514:1919810"`

其余选项与 InboundConfigurationObject 中的含义一致。
