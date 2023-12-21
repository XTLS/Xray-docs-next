# Wireguard

Wireguard is a standard implementation of the Wireguard protocol.

::: danger
**The Wireguard protocol is not specifically designed for circumvention purposes. If used as the outer layer for circumvention, its characteristics may lead to server blocking.**
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
  "mtu": 1420, // optional, default 1420
  "reserved": [1, 2, 3],
  "workers": 2 // optional, default runtime.NumCPU()
  "domainStrategy": "ForceIP" // Requires Xray-core v1.8.6 or higher
}
```

::: tip
Currently, the Wireguard protocol outbound does not support setting `streamSettings`.
:::

> `secretKey`: string

The user's private key. Required.

> `address`: string array

Wireguard will create a virtual network interface `tun` locally. Use one or more IP addresses, including IPv6.

> `mtu`: int

The fragment size of the underlying `tun` device in Wireguard.

> `reserved` \[ number \]

Wireguard Reserved Bytes.<br>
For example, when connecting to warp via wireguard, some IPs in Hong Kong and Los Angeles need to have a reserved value in order to connect successfully due to cloudflare limitations.<br>
The value of reserved can be obtained using third-party tools such as [warp-reg](https://github.com/badafans/warp-reg)、[warp-reg.sh](https://github.com/chise0713/warp-reg.sh)

> `workers`: int

The number of threads used by Wireguard.

> `peers`: \[ [Peers](#peers) \]

A list of Wireguard servers, where each item is a server configuration.

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

Requires Xray-core v1.8.6 or higher.<br>
The default value is `"ForceIP"` when left blank.<br>
When the incoming request is for a domain name, regardless of whether `domainStrategy` is left empty (or if `domainStrategy` is not written), use the [built-in DNS server](./dns.md) to get an IP (if the DNS part is not written in the configuration, system DNS is used), and this IP is used to send the connection via wireguard.

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

The server address. Required.

::: tip
Use the format `url:port`, for example, `engage.cloudflareclient.com:2408`.
:::

> `publicKey`: string

The server's public key used for verification. Required.

> `preSharedKey`: string

An additional symmetric encryption key.

> `keepAlive`: int

The interval of keep-alive packets in seconds. The default is 0, which means no keep-alive.

> `allowedIPs`: string array

Only allow traffic from specific source IP addresses in Wireguard.
