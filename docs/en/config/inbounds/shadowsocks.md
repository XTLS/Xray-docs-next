# Shadowsocks

The [Shadowsocks](https://en.wikipedia.org/wiki/Shadowsocks) protocol is compatible with most other implementations of Shadowsocks. The server supports TCP and UDP packet forwarding, with an option to selectively disable UDP.

### Supported Encryption Methods
The currently supported methods are following:

- Recommended encryption methods:
  - `2022-blake3-aes-128-gcm`
  - `2022-blake3-aes-256-gcm`
  - `2022-blake3-chacha20-poly1305`
- Other encryption methods:
  - `aes-256-gcm`
  - `aes-128-gcm`
  - `chacha20-poly1305`/`chacha20-ietf-poly1305`
  - `xchacha20-poly1305`/`xchacha20-ietf-poly1305`
  - `none`/`plain`

The Shadowsocks 2022 new protocol format improves performance and includes complete replay protection, addressing the following security issues in the old protocol:

- [Serious vulnerabilities in Shadowsocks AEAD encryption, which cannot guarantee the integrity of the communication content](https://github.com/shadowsocks/shadowsocks-org/issues/183)
- Increasing false positive rate of the original TCP replay filter over time
- Lack of UDP replay protection
- TCP behaviors that can be used for active probing

::: danger
Traffic transmitted without encryption using the "none" method will be in plain text. **Do not use it on public networks** for security reasons.
:::

## InboundConfigurationObject

```json
{
  "settings": {
    "clients": [],
    "password": "password",
    "method": "aes-256-gcm",
    "level": 0,
    "email": "love@xray.com",
    "network": "tcp,udp"
  }
}
```

> `clients`: a list of [`ClientObject`](#clientobject), empty list considered valid

The `password` parameter can be specified for the server at all, but also in the [`ClientObject`](#clientobject) being dedicated to the given user. Server-level `password` is not guaranteed to override the client-specific one.

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

Required, any of the [supported methods](#supportedencryptionmethods)

> `password`: string

Required. For **Shadowsocks 2022** a pre-shared `base64` random key similar to WireGuard's keys should be used as the password. The command 
```sh
openssl rand -base64 <length>
```
could used to generate a key. The length of the required key for `shadowsocks-rust` implementation depends on the encryption method:

| Encryption Method               | Key Length |
| -----------------------------   | ---------: |
| `2022-blake3-aes-128-gcm`       |         16 |
| `2022-blake3-aes-256-gcm`       |         32 |
| `2022-blake3-chacha20-poly1305` |         32 |

In the `go-shadowsocks` implementation written in Golang, a 32-byte key always works. 

For **any other encryption method** _any string_ could be used. There is no limitation on the password length, but shorter passwords are more susceptible to cracking. It is recommended to use a random-generated password of 16 characters or longer. The following example generates 40-characters length password:
```sh
sudo strings /dev/urandom | grep -o '[[:alnum:]]' | head -n 40 | tr -d '\n'; echo
```

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `email`: string

The user's email, used to differentiate traffic from different users for logs or statistics.
