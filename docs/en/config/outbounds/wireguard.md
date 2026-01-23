# Wireguard

Standard Wireguard protocol implementation.

::: danger
**The Wireguard protocol is not designed specifically for bypassing firewalls. If used at the outermost layer to cross the Great Firewall, distinctive characteristics may lead to the server being blocked.**
:::

## OutboundConfigurationObject

```json
{
  "secretKey": "PRIVATE_KEY",
  "address": [
    // optional, default ["10.0.0.1", "fd59:7153:2388:b5fd:0000:0000:0000:0001"]
    "IPv4_CIDR",
    "IPv6_CIDR",
    "and more..."
  ],
  "peers": [
    {
      "endpoint": "ENDPOINT_ADDR",
      "publicKey": "PUBLIC_KEY"
    }
  ],
  "noKernelTun": false,
  "mtu": 1420, // optional, default 1420
  "reserved": [1, 2, 3],
  "workers": 2, // optional, default runtime.NumCPU()
  "domainStrategy": "ForceIP"
}
```

::: tip
Currently, configuring `streamSettings` is not supported in the Wireguard protocol outbound.
:::

> `secretKey`: string

User private key. Required.

> `address`: string array

Wireguard will start a virtual network interface (tun) locally. Use one or more IP addresses; IPv6 is supported.

> `noKernelTun`: true | false

By default, the core detects if it is running on Linux and if the current user has `CAP_NET_ADMIN` permissions to decide whether to enable the system virtual network interface; otherwise, it uses gVisor. Using the system virtual interface offers relatively higher performance. Note that this is only for processing IP packets and has nothing to do with the wireguard kernel module.

This detection may not always be accurate. For example, some LXC virtualization environments may not have TUN permissions at all, causing the outbound to fail. Therefore, you can set this option to manually disable it.

When using the system virtual interface, it occupies IPv6 routing table number `10230`. Each additional Wireguard outbound will use subsequent routing tables sequentially; for example, the second one will use routing table `10231`, and so on.

Note that if a second Xray instance is started on the same machine, it will not assign the next routing table number but will continue trying to use routing table `10230`. Since it is already occupied by the first Xray instance, it will fail to connect. If absolutely needed, you must set this option to disable the system virtual interface.

> `mtu`: int

MTU size of the underlying Wireguard tun.

<details>
<summary>MTU Calculation Method</summary>

The structure of a Wireguard packet is as follows:

```
- 20-byte IPv4 header or 40 byte IPv6 header
- 8-byte UDP header
- 4-byte type
- 4-byte key index
- 8-byte nonce
- N-byte encrypted data
- 16-byte authentication tag
```

`N-byte encrypted data` is the MTU value we need. Depending on whether the endpoint is IPv4 or IPv6, the specific value can be 1440 (IPv4) or 1420 (IPv6). If in a special environment, subtract further (e.g., home broadband PPPoE requires an extra -8).

</details>

> `reserved` \[ number \]

Wireguard reserved bytes, fill as needed.

> `workers`: int

Number of threads used by Wireguard. Defaults to the number of system cores.

> `peers`: \[ [Peers](#peers) \]

List of Wireguard servers, where each item is a server configuration.

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

Controls the domain resolution strategy when the Wireguard server address is a domain name or the target address of the proxied traffic is a domain name.

Unlike most proxy protocols, Wireguard does not allow passing domain names as targets. Therefore, if the incoming target is a domain, it needs to be resolved to an IP address before transmission. This is handled by Xray's built-in DNS. The meaning of this field is the same as `domainStrategy` in `Freedom` outbound. The default value is `ForceIP`.

The `domainStrategy` of `Freedom` outbound includes options like `UseIP`, which are not provided here because Wireguard must obtain a usable IP and cannot perform the behavior of falling back to a domain name after `UseIP` resolution fails.<br>
Note: When applied to proxied traffic, this option is also constrained by the `address` option. For example, if you set `ForceIPv6v4` but no IPv6 address is set in `address`, even if the target domain has AAAA records, they will not be resolved/used.

### Peers

```json
{
  "endpoint": "ENDPOINT_ADDR",
  "publicKey": "PUBLIC_KEY",
  "preSharedKey": "PRE_SHARED_KEY", // optional, default "0000000000000000000000000000000000000000000000000000000000000000"
  "keepAlive": 0, // optional, default 0
  "allowedIPs": ["0.0.0.0/0"] // optional, default ["0.0.0.0/0", "::/0"]
}
```

> `endpoint`: address

Server address, required.

URL:Port format, e.g., `engage.cloudflareclient.com:2408`<br>
IP:Port format, e.g., `162.159.192.1:2408` or `[2606:4700:d0::a29f:c001]:2408`

> `publicKey`: string

Server public key, used for verification, required.

> `preSharedKey`: string

Additional symmetric encryption key.

> `keepAlive`: int

Heartbeat interval in seconds. Default is 0, meaning no heartbeat.

> `allowedIPs`: string array

Wireguard only allows traffic from specific source IPs.
