# Shadowsocks

The [Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks) protocol, compatible with most other version implementations.

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

The network type that the server port **listens** on. The default value is `"tcp"`.

Note that this is only for listening; it mainly affects and controls the native UDP transmission of Shadowsocks. Setting it to `"tcp"` does not mean the inbound will reject UDP proxy requests. UDP proxy requests can still be wrapped into TCP packets by Shadowsocks outbound features like UoT or mux.cool and sent to the server, and are not controlled by this option.

> `method`: string

Encryption method. See above for options.

> `password`: string

Required.

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
The value of `level` corresponds to the `level` value in [policy](../policy.md#levelpolicyobject). If not specified, the default is 0.

> `email`: string

User email, used to distinguish traffic from different users (logs, statistics).

## ClientObject

```json
{
  "password": "1919810",
  "method": "aes-256-gcm",
  "level": 0,
  "email": "love@xray.com"
}
```

When this option exists, it indicates that multi-user mode is enabled.

When the `method` in `InboundConfigurationObject` is not an SS2022 option, you can specify `"method"` for each user here (only non-SS2022 options are supported in `"method"`) along with `"password"` (at the same time, the `"password"` set in `InboundConfigurationObject` will be ignored).

When the `method` in `InboundConfigurationObject` is an SS2022 option, for security reasons, setting `"method"` for individual users is no longer supported. It is unified to the `"method"` specified in `InboundConfigurationObject`.

Note that SS2022 does not ignore the upper-level `"password"` like the old SS did. The correct password format for the client should be `ServerPassword:UserPassword`. For example: `"password": "114514:1919810"`.

The remaining options have the same meaning as in `InboundConfigurationObject`.
