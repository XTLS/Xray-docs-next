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

## InboundConfigurationObject

```json
{
  "settings": {
    "clients": [
      {
        "password": "密码",
        "method": "aes-256-gcm",
        "level": 0,
        "email": "love@xray.com"
      }
    ],
    "network": "tcp,udp"
  }
}
```

> `network`: "tcp" | "udp" | "tcp,udp"

可接收的网络协议类型。比如当指定为 `"tcp"` 时，仅会接收 TCP 流量。默认值为 `"tcp"`。

## ClientObject

```json
{
  "password": "密码",
  "method": "aes-256-gcm",
  "level": 0,
  "email": "love@xray.com"
}
```

::: tip
(v1.2.3+) Xray 支持 Shadowsocks 单端口多用户，但是需要将该入站所有用户的加密方式设置为 AEAD。
:::

> `method`: string

必填。

- 推荐的加密方式：
    - AES-256-GCM
    - AES-128-GCM
    - ChaCha20-Poly1305 或称 ChaCha20-IETF-Poly1305
    - none 或 plain

> `password`: string

必填，任意字符串。

Shadowsocks 协议不限制密码长度，但短密码会更可能被破解，建议使用 16 字符或更长的密码。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

`level` 的值, 对应 [policy](../policy.md#levelpolicyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `email`: string

用户邮箱，用于区分不同用户的流量（日志、统计）。