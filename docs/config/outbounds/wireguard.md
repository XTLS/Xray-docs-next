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
  "workers": 2 // optional, default runtime.NumCPU()
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

Wireguard 底层 tun 的分片大小

> `workers`: int

Wireguard 使用线程数

> `peers`: \[ [Peers](#peers) \]

Wireguard 服务器列表，其中每一项是一个服务器配置。

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

::: tip
使用 url:端口号 格式，形如 `engage.cloudflareclient.com:2408`
:::

> `publicKey`: string

服务器公钥，用于验证, 必填

> `preSharedKey`: string

额外的对称加密密钥

> `keepAlive`: int

心跳包时间间隔，单位为秒，默认为 0 表示无心跳

> `allowedIPs`: string array

Wireguard 仅允许特定源 IP 的流量
