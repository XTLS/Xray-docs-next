# WireGuard

User-space WireGuard protocol implementation for establishing a WireGuard tunnel with a peer, encapsulating TCP/UDP requests routed to this outbound into IP packets and sending them through the WireGuard tunnel.

::: danger
**The WireGuard protocol is not designed specifically for bypassing firewalls. If used as the outer layer to cross the firewall, its distinct characteristics may lead to the server being blocked.**
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "wireguard",
      // [!field focus]
      "settings": {
        "secretKey": "CLIENT_PRIVATE_KEY",
        "address": ["10.0.0.1", "fd59:7153:2388:b5fd:0000:0000:0000:0001"],
        "peers": [
          {
            "endpoint": "example.com:2408",
            "publicKey": "SERVER_PUBLIC_KEY",
            "allowedIPs": ["0.0.0.0/0", "::/0"]
          }
        ],
        "noKernelTun": false,
        "mtu": 1420,
        "reserved": [0, 0, 0],
        "remoteDNS": [
          "1.1.1.1",
          "1.0.0.1",
          "2606:4700:4700::1111",
          "2606:4700:4700::1001"
        ]
      }
    }
  ]
}
```

> `secretKey`: string

Client private key. Required.

When generating a client key pair using the command `xray wg`, this corresponds to the output `PrivateKey`.

> `address`: \[ string \]

List of local IP addresses for the WireGuard interface. When multiple addresses are specified, it is automatically selected based on the peer.

The default is `["10.0.0.1", "fd59:7153:2388:b5fd:0000:0000:0000:0001"]`.

> `noKernelTun`: true | false

Whether to forcibly disable system TUN regardless of automatic detection. The default is `false`; you may need to set it to `true` in LXC or Docker environments.

::: details About kernel TUN
The way Xray restores WireGuard IP packets back into TCP/UDP payloads.
By default, Xray automatically detects: on Linux, if the Xray process has the `CAP_NET_ADMIN` capability, it creates a TUN interface and uses the kernel network stack; on other platforms or when permissions are insufficient, it uses the in-process gVisor network stack. When set to `true`, only the gVisor network stack is used and no TUN interface is created. Using TUN generally provides better performance.

The automatic detection described above is not always accurate. For example, some LXC environments may be unable to use TUN even when they have the `CAP_NET_ADMIN` capability, causing the outbound to fail; in this case, setting `noKernelTun` to `true` solves the problem.

This option only selects how inner IP packets are processed. The WireGuard protocol itself is still handled by Xray's user-space implementation and is unrelated to the kernel WireGuard module.

When TUN is used, it occupies IPv6 routing table 10230. Each additional WireGuard outbound uses the next routing table in sequence; for example, the second one uses routing table 10231, and so on.

If a second Xray instance is started on the same machine, it does not continue allocating routing table numbers. Instead, it also tries to use routing table 10230. Because that table is already occupied by the first Xray instance, the second instance cannot connect. If multiple instances are necessary, use this option to disable TUN.
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

> `reserved` \[ byte \]

The three WireGuard reserved bytes. All three default to 0; set them as needed.

> `peers`: \[ [PeersObject](#peersobject) \]

List of remote WireGuard peers to connect to.

> `remoteDNS`: \[ string \]

Used to resolve proxied target domain names. Each item must be an IP address. The default is `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`.

Prioritize IPv4 when `address` is dual-stack.

Unlike other outbounds, targets inside a WireGuard tunnel must be IP addresses. When a proxied target is a domain name, a DNS server is required to convert the domain name into an IP address. These DNS servers are configured here and **send DNS requests directly through this WireGuard tunnel**. If you wish to integrate this with Xray's built-in DNS system, consider resolving in advance via the outbound's [`targetStrategy`](../outbound.md#outboundobject).

### PeersObject

```json
{
  "endpoint": "example.com:2408",
  "publicKey": "SERVER_PUBLIC_KEY",
  "preSharedKey": "PRE_SHARED_KEY",
  "keepAlive": 0,
  "allowedIPs": ["0.0.0.0/0", "::/0"]
}
```

> `endpoint`: address

Server address and port, can be an IP or a domain name. Required.

> `publicKey`: string

Peer public key used for verification. Required.

When generating a key pair using `xray wg`, this corresponds to the output `Password (PublicKey)`.

> `preSharedKey`: string

Optional additional symmetric encryption key. It must match the server configuration.

> `keepAlive`: int

Interval, in seconds, at which the client sends persistent keepalive packets to this server. This maintains any NAT mappings or firewall state during idle periods. Enable it only in special situations and only on the client. The default is `0`, which disables keepalive packets.

> `allowedIPs`: \[ string \]

Requests that should be forwarded using this peer, represented in CIDR notation. The default value is `["0.0.0.0/0", "::/0"]`, meaning all IPv4 and IPv6 destination traffic is forwarded by this server. When multiple peers match, the longest prefix match rule is used.
