# Shadowsocks

The [Shadowsocks](https://en.wikipedia.org/wiki/Shadowsocks) protocol is compatible with most other implementations of Shadowsocks.

The current compatibility is as follows:

- Supports TCP and UDP packet forwarding, with the option to selectively disable UDP.
- Recommended encryption methods:
  - 2022-blake3-aes-128-gcm
  - 2022-blake3-aes-256-gcm
  - 2022-blake3-chacha20-poly1305
  - Other encryption methods:
  - aes-256-gcm
  - aes-128-gcm
  - chacha20-poly1305 or chacha20-ietf-poly1305
  - xchacha20-poly1305 or xchacha20-ietf-poly1305
  - none or plain

The Shadowsocks 2022 new protocol format improves performance and includes complete replay protection, addressing the following security issues in the old protocol:

- [Serious vulnerabilities in Shadowsocks AEAD encryption, which cannot guarantee the integrity of the communication content](https://github.com/shadowsocks/shadowsocks-org/issues/183)
- Increasing false positive rate of the original TCP replay filter over time
- Lack of UDP replay protection
- TCP behaviors that can be used for active probing

::: danger
Traffic transmitted without encryption using the "none" method will be in plain text. Do not use it on public networks for security reasons.
:::

## InboundConfigurationObject

```json
{
  "settings": {
    "password": "password",
    "method": "aes-256-gcm",
    "level": 0,
    "email": "love@xray.com",
    "network": "tcp,udp"
  }
}
```

> `network`: "tcp" | "udp" | "tcp,udp"

The supported network protocol type. For example, when specified as `"tcp"`, it will only handle TCP traffic. The default value is `"tcp"`.

## ClientObject

```json
{
  "password": "密码",
  "method": "aes-256-gcm",
  "level": 0,
  "email": "love@xray.com"
}
```

> `method`: string

Required.

> `password`: string

Required.

- Shadowsocks 2022

Use a pre-shared key similar to WireGuard as the password.

Use `openssl rand -base64 <length>` to generate a compatible key with shadowsocks-rust, where the length depends on the encryption method used.

| Encryption Method             | Key Length |
| ----------------------------- | ---------: |
| 2022-blake3-aes-128-gcm       |         16 |
| 2022-blake3-aes-256-gcm       |         32 |
| 2022-blake3-chacha20-poly1305 |         32 |

In the Go implementation, a 32-byte key always works.

- Other encryption methods

Any string. There is no limitation on the password length, but shorter passwords are more susceptible to cracking. It is recommended to use a password of 16 characters or longer.

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `email`: string

The user's email, used to differentiate traffic from different users (logs, statistics).
