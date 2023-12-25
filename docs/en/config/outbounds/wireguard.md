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
  "domainStrategy": "ForceIP"
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

Wireguard Reserved Bytes.

Xray-core v1.8.0 New parameter.<br>
When connecting to warp via wireguard, due to cloudflare limitations, some IPs in Hong Kong and Los Angeles need to have a `reserved` value in order to connect successfully.<br>
The value of `reserved` can be obtained using third-party tools such as [warp-reg](https://github.com/badafans/warp-reg), [warp-reg.sh](https://github.com/chise0713/warp-reg.sh).。

> `workers`: int

The number of threads used by Wireguard.

> `peers`: \[ [Peers](#peers) \]

A list of Wireguard servers, where each item is a server configuration.

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

Xray-core v1.8.6 New parameter.<br>
If you do not write this parameter, or leave it blank, the default value is `"ForceIP"`.<br>
When the destination address is a domain name, use the Xray-core [built-in DNS server](./dns.md) to get an IP (if no `"dns"` configuration is written, system DNS is used), and send a connection to this IP via wireguard.<br>

| domainStrategy | test-ipv6.com | bgp.he.net | chat.openai.com |
| :--- | :---: | :---: | :---: |
| ForceIPv6v4 | IPv6v4 | IPv6 | IPv6 |
| ForceIPv6 | The website won't open. | IPv6 | IPv6 |
| ForceIPv4v6 | IPv6v4 **1** | IPv4 | IPv4 |
| ForceIPv4 | IPv4 | IPv4 | IPv4 |
| ForceIP | IPv6v4 **2** | IPv6 | IPv6 |

**1：** Tip `You already have an IPv6 address, but your browser is less inclined to use it, which is more worrying. `<br>
**2：** The chances of prompting `You already have an IPv6 address, but your browser is less inclined to use it, which is more worrisome. `

**Note 1**：
- Conflicts with `"queryStrategy"` may cause the site to fail to open.
- For example when `domainStrategy: "ForceIPv4"` is used, geosite:openai's site with `"queryStrategy": "UseIPv6"` will fail to open.

```jsonc
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:openai"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // Query only AAAA records.
            }
        ],
        "queryStrategy": "UseIP" // If this parameter is not written, the default value is UseIP, i.e. both A and AAAA records are queried, optional values are UseIPv4 and UseIPv6, other record types are queried by the system DNS.
    },
```

**Note 2**：
- Xray-core v1.8.0 - v1.8.4 without `"domainStrategy"`.
- When the destination address is a domain name, use the Xray-core built-in DNS server query to obtain the IP, using the value of `"queryStrategy"` in the `"dns"` configuration to control the IPv4 or IPv6 priority.
- If the `"dns"` configuration is not written, the system DNS query is used to obtain IP, and the IPv4 or IPv6 priority is controlled by the system.

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

URL:port format, e.g. `engage.cloudflareclient.com:2408`.<br>
IP:port format, e.g. `162.159.192.1:2408` or `[2606:4700:d0::a29f:c001]:2408`.

> `publicKey`: string

The server's public key used for verification. Required.

> `preSharedKey`: string

An additional symmetric encryption key.

> `keepAlive`: int

The interval of keep-alive packets in seconds. The default is 0, which means no keep-alive.

> `allowedIPs`: string array

Only allow traffic from specific source IP addresses in Wireguard.
