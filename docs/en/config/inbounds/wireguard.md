# WireGuard

User-space WireGuard protocol implementation.

::: danger
**The WireGuard protocol is not designed specifically for bypassing firewalls. If used as the outer layer to cross the firewall, its distinct characteristics may lead to the server being blocked.**
:::

## InboundConfigurationObject

```json
{
  "secretKey": "PRIVATE_KEY",
  "peers": [
    {
      "publicKey": "PUBLIC_KEY",
      "allowedIPs": [""]
    }
  ],
  "mtu": 1420 // optional, default 1420
}
```

> `secretKey`: string

Private key. Required.

> `mtu`: int

The MTU size of the underlying WireGuard TUN.

<details>
<summary>Method to Calculate MTU</summary>

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

`N-byte encrypted data` is the MTU value we need. Depending on whether the endpoint is IPv4 or IPv6, the specific value can be 1440 (IPv4) or 1420 (IPv6). If you are in a special network environment, you may need to subtract more (e.g., home broadband PPPoE requires an extra -8).

</details>

> `peers`: \[ [Peers](#peers) \]

List of peers, where each item is a peer configuration.

### Peers

```json
{
  "publicKey": "PUBLIC_KEY",
  "allowedIPs": ["0.0.0.0/0"] // optional, default ["0.0.0.0/0", "::/0"]
}
```

> `publicKey`: string

Public key, used for verification.

> `allowedIPs`: string array

Allowed source IPs.
