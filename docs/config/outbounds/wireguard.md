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
  "noKernelTun": false,
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

> `noKernelTun`: true | false

默认情况下核心会检测是否处于 Linux 并且当前用户具有 NET_CAP_ADMIN 权限决定是否启用系统虚拟网卡，否则使用 gvisor, 使用系统虚拟网卡相对性能更高。注意这只是用来处理 IP 包的，和 wireguard kernel module 没有任何关系。

这个判断不一定准确，比如一些 lxc 虚拟化可能本来就没有 TUN 权限，这会导致出站无法工作，所以可以在这里设置是否手动禁用。

使用系统虚拟网卡时会占用 IPv6 的 10230 号路由表，每一个其他 wireguard 出站会依次往后使用路由表，比如第二个会使用 10231 号路由表，以此类推。

注意如果在同一个机器上启动第二个 Xray 实例不会接着分配路由表号，会继续尝试使用 10230 号路由表，因为已经被第一个 Xray 实例占用所以会失败无法连接，如果实在需要也需要设置这个选项禁用系统虚拟网卡。

> `mtu`: int

Wireguard 底层 tun 的MTU大小。

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

> `reserved` \[ number \]

Wireguard 保留字节，按需填写。

> `workers`: int

Wireguard 使用线程数，默认为系统的核心数。

> `peers`: \[ [Peers](#peers) \]

Wireguard 服务器列表，其中每一项是一个服务器配置。

> `domainStrategy`: "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4" | "ForceIP"

不像绝大多数代理协议，Wireguard不允许传递域名作为目标，所以如果传入目标为一域名需要解析为IP地址后传送，这会经由 Xray 内置DNS处理，此处字段含义见 `Freedom` 出站的 `domainStrategy` ，默认值为 `ForceIP`

PS: `Freedom` 出站的 `domainStrategy` 包含诸如 `UseIP` 的选项，在这里不提供，因为Wiregiard必须获取一个可用的IP，不能进行 `UseIP` 回落行为。

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
