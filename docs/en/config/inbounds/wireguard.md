# WireGuard

User-space WireGuard protocol implementation for establishing a WireGuard tunnel with a peer and receiving traffic through the tunnel.

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

You can generate a server key pair with the `xray wg` command. Enter the generated `PrivateKey` here; the accompanying `Password (PublicKey)` is the server public key. When using Xray as a WireGuard client, enter the server public key in `outbounds[].settings.peers[].publicKey`.

> `peers`: \[ [PeersObject](#peersobject) \]

List of WireGuard clients, where each item is a client configuration. When multiple clients are configured, Xray matches the source address of each decrypted inner IP packet against the clients' `allowedIPs` to identify which client the traffic belongs to.

::: details Network model of an Xray WireGuard inbound
A conventional WireGuard network—including point-to-point, point-to-site, and site-to-site configurations—requires both endpoints to participate in IP routing through Layer 3 network interfaces.

In contrast, an Xray WireGuard inbound does not create a TUN interface on the system, nor does the server need an in-tunnel IP address. The built-in network stack processes the decrypted inner IP packets, converts their TCP and UDP traffic into proxy connections, and passes those connections to the Xray routing system instead of forwarding the original IP packets.

A client can send its own traffic or act as a gateway for networks behind it. The Xray server does not act as a Layer 3 node that clients can access inside the tunnel, and it does not pass the original IP packets to the system kernel for further forwarding or NAT.

`allowedIPs` participates in packet processing in both directions: when receiving packets, WireGuard verifies the source address of the decrypted inner IP packet and Xray uses that address to identify the client; when sending response packets, WireGuard selects the corresponding client based on the inner destination address.
:::

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

When using Xray as a WireGuard client, enter the `Password (PublicKey)` paired with the client's `outbounds[].settings.secretKey` here.

> `preSharedKey`: string

Optional additional symmetric encryption key. It must match the client configuration.

> `keepAlive`: int

Interval, in seconds, at which the server sends persistent keepalive packets to this client. The default is `0`, which disables keepalive packets.

> `allowedIPs`: \[ string \]

Specifies the source IP addresses or networks that this client is allowed to send, with each item expressed in CIDR notation.

The client's outbound `address` must be included in the corresponding server peer's `allowedIPs`. For example, if the client's `outbounds[].settings.address` is `["10.0.0.2"]`, this field can be set to `["10.0.0.2/32"]`.

`allowedIPs` can contain not only the client's in-tunnel IP address, but also networks routed through that peer. For example, if a third-party WireGuard client acts as a gateway for `192.168.10.0/24`, that network can be included here; the client must also configure routing and enable IP forwarding itself.

This field can be omitted when only one client is configured; the default is `["0.0.0.0/0", "::/0"]`. When multiple clients are configured, explicitly specify non-overlapping `allowedIPs`; otherwise, Xray cannot reliably distinguish between clients.

> `email`: string

Optional user email used to distinguish traffic from different users. It appears in logs and statistics.

> `level`: number

User level. Connections use the [local policy](../policy.md#levelpolicyobject) associated with this user level. The default is 0.
