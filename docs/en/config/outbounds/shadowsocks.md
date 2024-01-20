# Shadowsocks

[Shadowsocks](https://en.wikipedia.org/wiki/Shadowsocks) protocol is compatible with most other implementations.

Here are the features and compatibility of Shadowsocks:

- It supports TCP and UDP packet forwarding, with the option to disable UDP.
- Recommended encryption methods:
  - 2022-blake3-aes-128-gcm
  - 2022-blake3-aes-256-gcm
  - 2022-blake3-chacha20-poly1305
- Other encryption methods:
  - aes-256-gcm
  - aes-128-gcm
  - chacha20-poly1305 (also known as chacha20-ietf-poly1305)
  - none or plain

The new protocol format of Shadowsocks 2022 improves performance and includes full replay protection, addressing security issues present in the old protocol:

- [Serious vulnerabilities in Shadowsocks AEAD encryption methods that compromise the integrity of communications](https://github.com/shadowsocks/shadowsocks-org/issues/183)
- Increasing false-positive rate of TCP replay filters over time
- Lack of replay protection for UDP
- TCP behaviors that can be used for active probing

::: danger
Using the "none" encryption method will transmit traffic in plaintext. It is not recommended to use "none" encryption on public networks to ensure security.
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "email": "love@xray.com",
      "address": "127.0.0.1",
      "port": 1234,
      "method": "encryption method",
      "password": "password",
      "uot": true,
      "level": 0
    }
  ]
}
```

> `servers`: \[[ServerObject](#serverobject)\]

An array representing a group of Shadowsocks server settings, where each item is a [ServerObject](#serverobject).

### ServerObject

```json
{
  "email": "love@xray.com",
  "address": "127.0.0.1",
  "port": 1234,
  "method": "encryption method",
  "password": "password",
  "uot": true,
  "level": 0
}
```

> `email`: string

Email address (optional) used to identify the user.

> `address`: address

The address of the Shadowsocks server, supporting IPv4, IPv6, and domain names. Required.

> `port`: number

The port of the Shadowsocks server. Required.

> `method`: string

Encryption method. Required.

> `password`: string

Password. Required.

> `uot`: bool

When enabled, UDP over TCP (UOT) will be used.

- Shadowsocks 2022

Use a pre-shared key (PSK) similar to WireGuard as the password.

To generate a compatible key with shadowsocks-rust, use `openssl rand -base64 <length>`, where the length depends on the encryption method used.

| Encryption Method             | Key Length |
| ----------------------------- | ---------: |
| 2022-blake3-aes-128-gcm       |         16 |
| 2022-blake3-aes-256-gcm       |         32 |
| 2022-blake3-chacha20-poly1305 |         32 |

In the Go implementation, a 32-byte key always works.

- Other encryption methods

Any string can be used as a password. There is no limit on the password length, but shorter passwords are more susceptible to cracking. It is recommended to use a password of 16 characters or longer.

> `level`: number

User level. Connections will use the corresponding [local policy](../policy.md#levelpolicyobject) associated with this user level.

The `level` value corresponds to the `level` value in the [policy](../policy.md#policyobject). If not specified, the default value is 0.
