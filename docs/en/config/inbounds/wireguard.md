# WireGuard

User-space WireGuard protocol implementation for establishing a WireGuard tunnel with a peer, converting received TCP and UDP packets into internal Xray proxy requests for processing and response.

::: danger
**The WireGuard protocol is not designed specifically for bypassing firewalls. If used as the outer layer to cross the firewall, its distinct characteristics may lead to the server being blocked.**
:::

## InboundConfigurationObject

`InboundConfigurationObject` corresponds to the `settings` item in [`InboundObject`](../inbound.md).

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "wireguard",
      // [!code focus:14]
      "settings": {
        "secretKey": "SERVER_PRIVATE_KEY",
        "peers": [
          {
            "publicKey": "CLIENT_PUBLIC_KEY",
            "preSharedKey": "PRE_SHARED_KEY",
            "keepAlive": 0,
            "allowedIPs": ["0.0.0.0/0", "::/0"],
            "email": "love@xray.com",
            "level": 0
          }
        ],
        "mtu": 1420
      }
    }
  ]
}
```

> `secretKey`: string

Server private key. Required.

When generating a server key pair using the command `xray wg`, this corresponds to the output `PrivateKey`.

> `peers`: \[ [PeersObject](#peersobject) \]

List of WireGuard client peers.

> `mtu`: int

The MTU of the inner IP packets carried by the WireGuard tunnel. The default is 1420.

::: details How to calculate the MTU
The structure of a WireGuard packet is as follows:

```
- 20-byte IPv4 header or 40 byte IPv6 header
- 8-byte UDP header
- 4-byte type
- 4-byte key index
- 8-byte nonce
- N-byte encrypted data
- 16-byte authentication tag
```

`N-byte encrypted data` is the MTU value. Depending on whether the endpoint uses IPv4 or IPv6, the value can be 1440 (IPv4) or 1420 (IPv6). Reduce it further for special network environments if necessary (for example, subtract an additional 8 bytes for home broadband using PPPoE).
:::

### PeersObject

```json
{
  "publicKey": "CLIENT_PUBLIC_KEY",
  "preSharedKey": "PRE_SHARED_KEY",
  "keepAlive": 0,
  "allowedIPs": ["0.0.0.0/0", "::/0"],
  "email": "love@xray.com",
  "level": 0
}
```

> `publicKey`: string

Client public key used for verification. Required.

When generating a key pair using `xray wg`, this corresponds to the output `Password (PublicKey)`.

> `preSharedKey`: string

Optional additional symmetric encryption key. It must match the client configuration.

> `keepAlive`: int

Interval, in seconds, at which the server sends persistent keepalive packets to this client. The default is `0`, which disables keepalive packets.

> `allowedIPs`: \[ string \]

Specifies the source IP addresses or networks that this client is allowed to send, using CIDR notation. The default value is `["0.0.0.0/0", "::/0"]`, meaning all IPv4 and IPv6 source addresses are allowed.

Can be omitted when only one client is configured, with a default value of `["0.0.0.0/0", "::/0"]`. When configuring multiple clients, unlike the client-side `allowedIPs`, the `allowedIPs` here should not overlap; at best it prevents properly matching the client peer, and at worst it may prevent properly routing return packets.

> `email`: string

Optional user email used to distinguish traffic from different users. It appears in logs and statistics.

> `level`: number

User level. Connections use the [local policy](../policy.md#levelpolicyobject) associated with this user level. The default is 0.
