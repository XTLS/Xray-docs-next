# WireGuard

用户态 WireGuard 协议实现，用于与对端建立 WireGuard 隧道，将被路由到此出站的 TCP/UDP 请求封装为 IP 包后通过 WireGuard 隧道发送。

::: danger
**WireGuard 协议并非专门为翻墙而设计，若在最外层过墙，存在特征可能导致服务器被封锁**
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "wireguard",
      // [!code focus:23]
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

客户端的私钥。必填。

使用命令 `xray wg` 生成客户端密钥对时。此处对应将输出的 `PrivateKey`。

> `address`: \[ string \]

Wireguard 接口的本地 IP 地址列表。存在多个时根据 peer 自动选择。

默认值为 `["10.0.0.1", "fd59:7153:2388:b5fd:0000:0000:0000:0001"]`。

> `noKernelTun`: true | false

是否无视自动检测强制不使用系统 TUN，默认值为 `false`；在 LXC 或 Docker 环境中可能需要设为 `true`。

::: details 关于 kernel TUN
Xray 将 wiregurad 的 IP 包重新还原为 TCP/UDP 载荷的方式。
默认情况下 Xray 会自动检测：在 Linux 上且 Xray 进程具有 `CAP_NET_ADMIN` 权限时，创建 TUN 并由内核网络栈处理；在其他平台或权限不足时，使用进程内的 gVisor 网络栈。设为 `true` 时，仅使用 gVisor 网络栈，不会创建 TUN。使用 TUN 通常性能更高。

上述自动判断不一定准确，例如某些 LXC 环境即使具有 `CAP_NET_ADMIN` 权限，也可能无法使用 TUN，导致出站无法工作，此时将 `noKernelTun` 设为 `true` 即可解决问题。

此选项只选择内层 IP 包的处理方式。WireGuard 协议本身仍由 Xray 的用户态实现处理，与内核 WireGuard 模块无关。

使用 TUN 时会占用 IPv6 的 10230 号路由表，每一个其他 WireGuard 出站会依次往后使用路由表，比如第二个会使用 10231 号路由表，以此类推。

注意如果在同一个机器上启动第二个 Xray 实例不会接着分配路由表号，会继续尝试使用 10230 号路由表，因为已经被第一个 Xray 实例占用所以会失败无法连接，如果实在需要也需要设置这个选项禁用 TUN。
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

`N-byte encrypted data` 即为我们需要的 MTU 的值，根据 endpoint 是 IPv4 还是 IPv6，具体的值可以是 1440(IPv4) 或者 1420(IPv6)，如果处于特殊环境下再额外减掉即可 (如家宽 PPPoE 额外 -8)。
:::

> `reserved` \[ byte \]

WireGuard 协议保留字节，长度为 3，默认全 0，按需填写。

> `peers`: \[ [PeersObject](#peersobject) \]

连接 WireGuard 远端 peers 列表。

> `remoteDNS`: \[ string \]

用于解析被代理目标的域名。列表项必须为 IP。默认值为 `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`。

不同于其他出站，WireGuard 隧道内的目标地址必须为 IP。当被代理目标为域名时，需要一个 DNS 服务器将域名转化为 IP 地址。这部分 DNS 服务器在这里配置，并且**直接通过这个 WireGuard 隧道发送 DNS 请求**。想将其接入 Xray 内置 DNS 系统请考虑在出站的 [`targetStrategy`](../outbound.md#outboundobject) 提前解析。

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

服务器地址和端口，可以是 IP 或域名，必填。

> `publicKey`: string

peer 的公钥，用于验证。必填。

使用 `xray wg` 生成密钥对时。此处对应将输出的 `Password (PublicKey)`

> `preSharedKey`: string

额外的对称加密密钥，可选。需与服务端配置一致。

> `keepAlive`: int

客户端向该服务器发送持久保活包的间隔，单位为秒，用于在空闲时维持可能存在的 NAT 映射或防火墙状态。仅特殊场景需要开启，且仅客户端开启即可；默认值为 `0`，表示不发送。

> `allowedIPs`: \[ string \]

应该使用该 peer 转发的请求，使用 CIDR 表示。默认值为 `["0.0.0.0/0", "::/0"]`，即所有 IPv4 和 IPv6 目标流量均由该服务器转发。多个命中时按最长前缀匹配原则选择。
