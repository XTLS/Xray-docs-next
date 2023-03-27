# QUIC

QUIC (Quick UDP Internet Connection) is a protocol proposed by Google for multiplexed and concurrent transmission using UDP. Its main advantages are:

1. Reduced number of roundtrips in handshake phase. (1-RTT or 0-RTT)
2. Multiplexing, and no [Head-of-Line blocking](https://calendar.perfplanet.com/2020/head-of-line-blocking-in-quic-and-http-3-the-details/) problem.
3. Connection migration, (mainly on the client side) when switching from Wifi to 4G, the connection will not be interrupted.

QUIC is currently in the experimental phase and uses IETF implementation that is still being standardized, so compatibility with the final version cannot be guaranteed.

- Default settings:
  - 12-byte Connection ID
  - Automatically disconnect the connection if no data is transmitted for 30 seconds (which may affect the use of some [persistent connections](https://en.wikipedia.org/wiki/HTTP_persistent_connection)).

## QuicObject

`QuicObject` corresponds to the `quicSettings` item in the [Transport Protocol](../transport.md).

::: danger
The configurations of both endpoints must be identical, otherwise the connection will fail.

QUIC requires TLS to be enabled and if it is not enabled in the [Transport Protocol](../transport.md), Xray will issue a self-signed certificate for TLS communication.
:::

```json
{
  "security": "none",
  "key": "",
  "header": {
    "type": "none"
  }
}
```

> `security`: "none" | "aes-128-gcm" | "chacha20-poly1305"

Encryption method.

Extra encryption over entire QUIC packet, include the frame head part. Default value is "none" for no encryption. After being encrypted, QUIC packets will not be detected as QUIC but some other unknow traffic.

The default value is `none`

> `key`: string

Encryption key used for encryption.

It can be any string and is effective when "security" is not set to "none".

> `header`: [HeaderObject](#headerobject)

Packet header obfuscation settings.

### HeaderObject

```json
{
  "type": "none"
}
```

> `type`: string

Type of obfuscation. Corresponding inbound and outbound proxy must have the same settings. Choices are:

- `"none"`: Default value. No obfuscation is used.
- `"srtp"`: Obfuscated as SRTP traffic. It may be recognized as video calls such as Facetime.
- `"utp"`: Obfuscated as uTP traffic. It may be recognized as Bittorrent traffic.
- `"wechat-video"`: Obfuscated to WeChat traffic.
- `"dtls"`: Obfuscated as DTLS 1.2 packets.
- `"wireguard"`: Obfuscated as WireGuard packets. (NOT true WireGuard protocol)

::: tip
When neither encryption nor obfuscation is enabled, QUIC transport is compatible with other QUIC tools.
However it is recommended to enable either or both for better undetectable communication.
:::
