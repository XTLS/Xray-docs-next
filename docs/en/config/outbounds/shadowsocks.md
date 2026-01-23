# Shadowsocks

The [Shadowsocks](https://en.wikipedia.org/wiki/Shadowsocks) protocol, compatible with most other version implementations.

Current compatibility is as follows:

- Supports TCP and UDP packet forwarding, where UDP can be optionally disabled;
- Recommended encryption methods:
  - 2022-blake3-aes-128-gcm
  - 2022-blake3-aes-256-gcm
  - 2022-blake3-chacha20-poly1305
- Other encryption methods:
  - aes-256-gcm
  - aes-128-gcm
  - chacha20-poly1305 (or chacha20-ietf-poly1305)
  - xchacha20-poly1305 (or xchacha20-ietf-poly1305)
  - none (or plain)

The Shadowsocks 2022 new protocol format improves performance and includes complete replay protection, resolving the following security issues of the old protocol:

- [Severe vulnerabilities in the design of Shadowsocks AEAD encryption, unable to guarantee communication reliability](https://github.com/shadowsocks/shadowsocks-org/issues/183)
- The false positive rate of the original TCP replay filter increases over time
- No UDP replay protection
- TCP behavior that can be used for active probing

::: danger
Under the "none" encryption method, traffic will be transmitted in plain text. To ensure security, do not use it on public networks.
:::

## OutboundConfigurationObject

```json
{
  "email": "love@xray.com",
  "address": "127.0.0.1",
  "port": 1234,
  "method": "Encryption Method",
  "password": "Password",
  "uot": true,
  "UoTVersion": 2,
  "level": 0
}
```

> `email`: string

Email address, optional, used to identify the user.

> `address`: address

Shadowsocks server address. Supports IPv4, IPv6, and domain names. Required.

> `port`: number

Shadowsocks server port. Required.

> `method`: string

Shadowsocks encryption method. Required.

> `password`: string

Shadowsocks authentication password. Required.

> `uot`: bool

Enable `udp over tcp`.

> `UoTVersion`: number

Implementation version of `UDP over TCP`.

Current optional values: `1`, `2`.

- Shadowsocks 2022

Uses a pre-shared key similar to WireGuard as the password.

Use `openssl rand -base64 <length>` to generate a key compatible with shadowsocks-rust. The length depends on the encryption method used.

| Encryption Method             | Key Length |
| ----------------------------- | ---------: |
| 2022-blake3-aes-128-gcm       |         16 |
| 2022-blake3-aes-256-gcm       |         32 |
| 2022-blake3-chacha20-poly1305 |         32 |

In the Go implementation, 32-byte keys always work.

- Other encryption methods

Any string. There is no limit on password length, but short passwords are more likely to be cracked. It is recommended to use passwords of 16 characters or longer.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the `level` value in [policy](../policy.md#policyobject). If not specified, the default is 0.
