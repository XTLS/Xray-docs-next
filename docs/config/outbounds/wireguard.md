# Wireguard

标准 Wireguard 协议实现。

::: danger
**Wireguard 协议并非专门为翻墙而设计，若在最外层过墙，存在特征可能导致服务器被封锁**
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
  "workers": 2, // optional, default runtime.NumCPU()
  "domainStrategy": "ForceIP"
}
```

::: tip
目前 Wireguard 协议 outbound 中不支持设置 `streamSettings`
:::

> `secretKey`: string

用户私钥。必填。

> `address`: string array

Wireguard 会在本地开启虚拟网卡 tun。使用一个或多个 IP 地址，支持 IPv6

> `mtu`: int

Wireguard 底层 tun 的分片大小。

> `reserved` \[ number \]

Wireguard 保留字节。

Xray-core v1.8.0 新增参数。<br>
通过 wireguard 连接 warp 时，由于 cloudflare 的限制，香港、洛杉矶部分 IP 需要有 `reserved` 的值才能成功连接。<br>
`reserved` 的值可使用第三方工具获得，例如：[warp-reg](https://github.com/badafans/warp-reg)、[warp-reg.sh](https://github.com/chise0713/warp-reg.sh)。

> `workers`: int

Wireguard 使用线程数。

> `peers`: \[ [Peers](#peers) \]

Wireguard 服务器列表，其中每一项是一个服务器配置。

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

Xray-core v1.8.6 新增参数。<br>
若不写此参数，或留空，默认值 `"ForceIP"`。<br>
当目标地址为域名时，使用 Xray-core [内置 DNS 服务器](./dns.md)查询获取 IP（若没写 `"dns"` 配置，使用系统 DNS），将此 IP 通过 wireguard 发出连接。<br>

| domainStrategy | test-ipv6.com | bgp.he.net | chat.openai.com |
| :--- | :---: | :---: | :---: |
| ForceIPv6v4 | IPv6v4地址 | IPv6地址 | IPv6地址 |
| ForceIPv6 | 网站打不开 | IPv6地址 | IPv6地址 |
| ForceIPv4v6 | IPv6v4地址 **1** | IPv4地址 | IPv4地址 |
| ForceIPv4 | IPv4地址 | IPv4地址 | IPv4地址 |
| ForceIP | IPv6v4地址 **2** | IPv6地址 | IPv6地址 |

**1：** 提示`你已经有 IPv6 地址了，但你的浏览器不太愿意用，这一点比较令人担心。`<br>
**2：** 有机率提示`你已经有 IPv6 地址了，但你的浏览器不太愿意用，这一点比较令人担心。`

::: tip
若 `domainStrategy` 的值与 `"dns"` 配置中 `"queryStrategy"` 的值产生冲突，会造成网站打开失败。
:::

```json
    "dns": {
        "servers": [
            "https://1.1.1.1/dns-query",
            {
                "address": "https://1.1.1.1/dns-query",
                "domains": [
                    "geosite:openai"
                ],
                "skipFallback": true,
                "queryStrategy": "UseIPv6" // 只查询 AAAA 记录
            }
        ],
        "queryStrategy": "UseIP" // 同时查询 A 和 AAAA 记录，若不写此参数，默认值 UseIP，
    },
```

当 `domainStrategy: "ForceIPv4"` 时，控制 geosite:openai 域名查询的 DNS 字段使用了 `"queryStrategy": "UseIPv6"`，将会导致 geosite:openai 的网站打开失败。

::: tip
Xray-core v1.8.0 - v1.8.4 没有 `"domainStrategy"`。<br>
当目标地址为域名时，使用 Xray-core 内置 DNS 服务器查询获取 IP。使用 `"dns"` 配置中 `"queryStrategy"` 的值控制 IPv4 或 IPv6 优先级。<br>
若没写 `"dns"` 配置，使用系统 DNS 查询获取 IP，IPv4 或 IPv6 优先级由系统控制。
:::

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

服务器地址, 必填

URL:端口 格式，例如 `engage.cloudflareclient.com:2408`<br>
IP:端口 格式，例如 `162.159.192.1:2408` 或  `[2606:4700:d0::a29f:c001]:2408`

> `publicKey`: string

服务器公钥，用于验证, 必填

> `preSharedKey`: string

额外的对称加密密钥

> `keepAlive`: int

心跳包时间间隔，单位为秒，默认为 0 表示无心跳

> `allowedIPs`: string array

Wireguard 仅允许特定源 IP 的流量
