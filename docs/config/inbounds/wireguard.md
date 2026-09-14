# WireGuard

用户态 WireGuard 协议实现，用于与对端建立 WireGuard 隧道，并接收通过该隧道进入的流量。

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

可以使用命令 `xray wg` 生成服务器密钥对。将输出的 `PrivateKey` 填入此项；与其成对出现的 `Password (PublicKey)` 是服务器公钥。以 Xray 作为 WireGuard 客户端时，应将服务器公钥填入 `outbounds[].settings.peers[].publicKey`。

> `peers`: \[ [PeersObject](#peersobject) \]

WireGuard 客户端列表，其中每一项是一个客户端配置。配置多个客户端时，Xray 会将解密后内层 IP 包的源地址与各客户端的 `allowedIPs` 进行匹配，以识别流量所属的客户端。

::: details Xray WireGuard 入站的网络模型
常规 WireGuard 组网（包括点到点、点到站和站到站）需要通信两端各自通过三层网络接口参与 IP 路由。

与之不同，Xray 的 WireGuard 入站无需在系统中创建 TUN，也无需为服务端配置用于组网的隧道内 IP。WireGuard 解密得到的内层 IP 包由内置网络栈处理，其中的 TCP 和 UDP 流量会转换为代理连接并交给 Xray 路由系统，而不是继续转发原始 IP 包。

客户端既可以发送自身流量，也可以作为网关转发其后方网段的流量。Xray 服务端不作为隧道内供客户端访问的三层网络节点，也不会将原始 IP 包交给系统内核继续转发或 NAT。

`allowedIPs` 同时参与两个方向的数据包处理：接收时，WireGuard 会校验解密后内层 IP 包的源地址，Xray 也会根据该地址识别客户端；回包时，WireGuard 会根据内层目标地址选择对应客户端。
:::

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

以 Xray 作为 WireGuard 客户端时，此处应填写与客户端 `outbounds[].settings.secretKey` 成对的 `Password (PublicKey)`。

> `preSharedKey`: string

额外的对称加密密钥，可选。需与客户端配置一致。

> `keepAlive`: int

服务器向该客户端发送持久保活包的间隔，单位为秒。默认值为 `0`，表示不发送。

> `allowedIPs`: \[ string \]

指定允许由该客户端发送的源 IP 地址或网段，每项使用 CIDR 表示。

客户端出站的 `address` 必须包含在对应服务端 peer 的 `allowedIPs` 中。例如，客户端 `outbounds[].settings.address` 为 `["10.0.0.2"]`，则此处可配置为 `["10.0.0.2/32"]`。

`allowedIPs` 不只可以填写客户端的隧道内 IP，也可以包含由该 peer 负责转发的网段。例如，第三方 WireGuard 客户端作为 `192.168.10.0/24` 的网关时，可以将该网段填入此处；客户端还需自行配置路由并开启 IP 转发。

仅有一个客户端时可省略，默认值为 `["0.0.0.0/0", "::/0"]`。配置多个客户端时，应显式配置互不冲突的 `allowedIPs`，否则无法可靠地区分客户端。

> `email`: string

用户邮箱，可选，用于区分不同用户的流量（会体现在日志、统计中）。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。默认值为 0。
