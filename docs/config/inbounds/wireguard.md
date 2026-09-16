# WireGuard

用户态 WireGuard 协议实现，用于与对端建立 WireGuard 隧道，将收到的 TCP 和 UDP 数据包转换为 Xray 内部的代理请求进行处理和响应。

::: danger
**WireGuard 协议并非专门为翻墙而设计，若在最外层过墙，存在特征可能导致服务器被封锁**
:::

## InboundConfigurationObject

`InboundConfigurationObject` 对应 [`InboundObject`](../inbound.md) 中的 `settings` 项。

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

服务器私钥。必填。

使用命令 `xray wg` 生成服务器密钥对时。此处对应将输出的 `PrivateKey`。

> `peers`: \[ [PeersObject](#peersobject) \]

WireGuard 客户端 peers 列表。

> `mtu`: int

WireGuard 隧道内层 IP 包的 MTU。默认 1420。

::: details MTU 的计算方法
一个 WireGuard 数据包的结构如下

```
- 20-byte IPv4 header or 40 byte IPv6 header
- 8-byte UDP header
- 4-byte type
- 4-byte key index
- 8-byte nonce
- N-byte encrypted data
- 16-byte authentication tag
```

`N-byte encrypted data` 即为我们需要的 MTU 的值，根据 endpoint 是 IPv4 还是 IPv6，具体的值可以是 1440 (IPv4) 或者 1420 (IPv6)，如果处于特殊环境下再额外减掉即可 (如家宽 PPPoE 额外 -8)。
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

客户端公钥，用于验证。必填。

使用 `xray wg` 生成密钥对时。此处对应将输出的 `Password (PublicKey)`。

> `preSharedKey`: string

额外的对称加密密钥，可选。需与客户端配置一致。

> `keepAlive`: int

服务器向该客户端发送持久保活包的间隔，单位为秒。默认值为 `0`，表示不发送。

> `allowedIPs`: \[ string \]

指定允许由该客户端发送的源 IP 地址或网段，使用 CIDR 表示。默认值为 `["0.0.0.0/0", "::/0"]`，即允许所有 IPv4 和 IPv6 源地址。

仅有一个客户端时可省略，默认值为 `["0.0.0.0/0", "::/0"]`。配置多个客户端时，与客户端的 `allowedIPs` 不同，这里的 `allowedIPs`，不应重叠，轻则无法正确匹配客户端 peer，重则可能导致无法正确路由回包。

> `email`: string

用户邮箱，可选，用于区分不同用户的流量（会体现在日志、统计中）。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。默认值为 0。
