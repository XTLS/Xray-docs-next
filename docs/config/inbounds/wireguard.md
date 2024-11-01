# Wireguard

User-space Wireguard 协议实现。

::: danger
**Wireguard 协议并非专门为翻墙而设计，若在最外层过墙，存在特征可能导致服务器被封锁**
:::

## InboundConfigurationObject

```json
{
  "secretKey": "PRIVATE_KEY",
  "peers": [
    {
      "publicKey": "PUBLIC_KEY",
      "allowedIPs":[""]
    }
  ],
  "mtu": 1420, // optional, default 1420
}
```

> `secretKey`: string

私钥。必填。

> `mtu`: int

Wireguard 底层 tun 的分片大小。

<details>
<summary>MTU的计算方法</summary>

一个wireguard数据包的结构如下

```
- 20-byte IPv4 header or 40 byte IPv6 header
- 8-byte UDP header
- 4-byte type
- 4-byte key index
- 8-byte nonce
- N-byte encrypted data
- 16-byte authentication tag
```

```N-byte encrypted data```即为我们需要的MTU的值，根据endpoint是IPv4还是IPv6，具体的值可以是1440(IPv4)或者1420(IPv6)，如果处于特殊环境下再额外减掉即可(如家宽PPPoE额外-8)。
</details>

> `peers`: \[ [Peers](#peers) \]

peers 服务器列表，其中每一项是一个服务器配置。

### Peers

```json
{
  "publicKey": "PUBLIC_KEY",
  "allowedIPs": ["0.0.0.0/0"] // optional, default ["0.0.0.0/0", "::/0"]
}
```

> `publicKey`: string

公钥，用于验证

> `allowedIPs`: string array

允许的源IP