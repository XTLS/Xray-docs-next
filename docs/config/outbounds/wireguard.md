# Wireguard

标准 Wireguard 协议实现。

::: danger
**Wireguard 协议并非专门为翻墙而设计，若在最外层过墙，存在特征可能导致服务器被封锁**
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "wireguard",
      // [!code focus:19]
      "settings": {
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
        "domainStrategy": "ForceIP"
      }
    }
  ]
}
```

::: tip
Wireguard 出站支持 `streamSettings.sockopt` 中的套接字选项。特别是，
[`dialerProxy`](../transports/sockopt.md#sockoptobject) 可以通过另一个出站连接
Wireguard peer。
:::

### Wireguard 出站链式嵌套

若要将一个 Wireguard 隧道嵌套在另一个隧道中，请在内层出站上设置
`dialerProxy`，并将其指向外层出站的 tag：

```json
{
  "outbounds": [
    {
      "tag": "exit-wg",
      "protocol": "wireguard",
      "settings": {
        "secretKey": "EXIT_PRIVATE_KEY",
        "address": ["10.0.0.2/32"],
        "peers": [
          {
            "endpoint": "EXIT_ENDPOINT:51820",
            "publicKey": "EXIT_PUBLIC_KEY",
            "allowedIPs": ["0.0.0.0/0", "::/0"]
          }
        ],
        "noKernelTun": true,
        "mtu": 1280
      },
      "streamSettings": {
        "sockopt": {
          "dialerProxy": "entry-wg"
        }
      }
    },
    {
      "tag": "entry-wg",
      "protocol": "wireguard",
      "settings": {
        "secretKey": "ENTRY_PRIVATE_KEY",
        "address": ["10.1.0.2/32"],
        "peers": [
          {
            "endpoint": "ENTRY_ENDPOINT:51820",
            "publicKey": "ENTRY_PUBLIC_KEY",
            "allowedIPs": ["0.0.0.0/0", "::/0"]
          }
        ],
        "noKernelTun": true,
        "mtu": 1360
      }
    }
  ]
}
```

路由到 `exit-wg` 的流量会先进入出口隧道，而到出口 peer 的 UDP 连接会通过
`entry-wg` 传输。因此，`entry-wg` 是物理网络上可见的最外层加密。更长的链可以
重复使用相同的关系。

链接多个 Wireguard 出站时，设置 `noKernelTun: true` 可以避免为每个出站创建
和协调系统路由表。每进入一层内部隧道，都应降低 MTU，为额外封装预留空间。
此示例仅定义出站；请使用路由规则和 [`tun`](../inbounds/tun.md) 等入站来选择
哪些主机流量进入 `exit-wg`。

请勿使用 `dialerProxy` 创建自引用或循环引用。在 Linux 和 macOS 上，TUN 入站
不会根据其 `dns` 字段配置系统 DNS，因此全设备 VPN 配置还需要特定于系统的
DNS 方案。

> `secretKey`: string

用户私钥。必填。

> `address`: string array

Wireguard 会在本地开启虚拟网卡 tun。使用一个或多个 IP 地址，支持 IPv6。

> `noKernelTun`: true | false

默认情况下核心会检测是否处于 Linux 并且当前用户具有 CAP_NET_ADMIN 权限决定是否启用系统虚拟网卡，否则使用 gvisor, 使用系统虚拟网卡相对性能更高。注意这只是用来处理 IP 包的，和 wireguard kernel module 没有任何关系。

这个判断不一定准确，比如一些 lxc 虚拟化可能本来就没有 TUN 权限，这会导致出站无法工作，所以可以在这里设置是否手动禁用。

使用系统虚拟网卡时会占用 IPv6 的 10230 号路由表，每一个其他 wireguard 出站会依次往后使用路由表，比如第二个会使用 10231 号路由表，以此类推。

注意如果在同一个机器上启动第二个 Xray 实例不会接着分配路由表号，会继续尝试使用 10230 号路由表，因为已经被第一个 Xray 实例占用所以会失败无法连接，如果实在需要也需要设置这个选项禁用系统虚拟网卡。

> `mtu`: int

Wireguard 底层 tun 的MTU大小。

<details>
<summary>MTU 的计算方法</summary>

一个 Wireguard 数据包的结构如下

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

</details>

> `reserved` \[ number \]

Wireguard 保留字节，按需填写。

> `peers`: \[ [Peers](#peers) \]

Wireguard 服务器列表，其中每一项是一个服务器配置。

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

当 Wireguard 服务器地址为域名、被代理流量目标地址是域名时，控制它们的域名解析策略。

不像绝大多数代理协议，Wireguard 不允许传递域名作为目标，所以如果传入目标为一域名需要解析为 IP 地址后传送，这会经由 Xray 内置DNS处理，此处字段含义见 `Freedom` 出站的 `domainStrategy`，默认值为 `ForceIP`。

`Freedom` 出站的 `domainStrategy` 包含诸如 `UseIP` 的选项，在这里不提供，因为 Wiregiard 必须获取一个可用的 IP，不能执行 `UseIP` 解析失败后回落为域名的行为。<br>
注意：作用于被代理流量时，此选项还受 `address` 选项的约束，比如你设置了 ForceIPv6v4 但是 address 中没有设置 IPv6 地址，尽管目标域名有 AAAA 记录也不会解析。

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

服务器地址, 必填。

URL: 端口 格式，例如 `engage.cloudflareclient.com:2408`<br>
IP: 端口 格式，例如 `162.159.192.1:2408` 或 `[2606:4700:d0::a29f:c001]:2408`

> `publicKey`: string

服务器公钥，用于验证, 必填。

> `preSharedKey`: string

额外的对称加密密钥。

> `keepAlive`: int

心跳包时间间隔，单位为秒，默认为 0 表示无心跳。

> `allowedIPs`: string array

Wireguard 仅允许特定源 IP 的流量。
