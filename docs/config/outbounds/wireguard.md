# WireGuard

用户态 WireGuard 协议实现，用于与对端建立 WireGuard 隧道，并通过该隧道发送出站流量。

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
      // [!code focus:18]
      "settings": {
        "secretKey": "CLIENT_PRIVATE_KEY",
        "address": [
          "10.0.0.1",
          "fd59:7153:2388:b5fd:0000:0000:0000:0001",
          "and more..."
        ],
        "peers": [
          {
            "endpoint": "SERVER_ADDR",
            "publicKey": "SERVER_PUBLIC_KEY"
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

客户端私钥。必填。

可以使用命令 `xray wg` 生成客户端密钥对。将输出的 `PrivateKey` 填入此项；与其成对出现的 `Password (PublicKey)` 是客户端公钥。以 Xray 作为 WireGuard 服务器时，应将客户端公钥填入 `inbounds[].settings.peers[].publicKey`。

> `address`: \[ string \]

指定 WireGuard 出站生成的内层 IP 包所使用的本地源地址，即客户端的隧道内 IP。可以配置一个或多个 IPv4 或 IPv6 地址。

默认值为 `["10.0.0.1", "fd59:7153:2388:b5fd:0000:0000:0000:0001"]`。

Xray 会根据目标地址的地址族自动选择相应的 IP 作为源地址；如果同一地址族配置了多个 IP，则会按照内部规则选择合适的地址。<br>
WireGuard 服务器的入站配置必须允许这些 IP，并且这些 IP 在服务器的 WireGuard 入站配置中必须唯一。

> `noKernelTun`: true | false

是否禁用 TUN，默认值为 `false`；在 LXC 或 Docker 环境中可能需要设为 `true`。

::: details 我需要启用 `noKernelTun` 吗？
设为 `false` 时，Xray 会自动选择内层 IP 包的处理方式：在 Linux 上且 Xray 进程具有 `CAP_NET_ADMIN` 权限时，创建 TUN 并由内核网络栈处理；在其他平台或权限不足时，使用进程内的 gVisor 网络栈。设为 `true` 时，仅使用 gVisor 网络栈，不会创建 TUN。使用 TUN 通常性能更高。

此选项只选择内层 IP 包的处理方式。WireGuard 协议本身仍由 Xray 的用户态实现处理，与内核 WireGuard 模块无关。

上述自动判断不一定准确，例如某些 LXC 环境即使具有 `CAP_NET_ADMIN` 权限，也可能无法使用 TUN，导致出站无法工作；此时应将本项设为 `true`。

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

WireGuard 服务器列表，其中每一项是一个服务器配置。配置多个服务器时，Xray 会根据目标 IP 地址对各服务器的 `allowedIPs` 进行前缀匹配，将流量路由至匹配的服务器，从而使不同目标网段可以通过不同的 WireGuard 服务器转发。

::: details Xray WireGuard 出站的数据包模型
进入 WireGuard 出站的 TCP 和 UDP 连接会由网络栈转换为内层 IP 包。内层源地址从 `address` 中选择，内层目标地址则是被代理流量的目标 IP。

Xray 会使用内层目标地址对各 peer 的 `allowedIPs` 进行前缀匹配，由匹配到的 peer 加密封装，并将外层 UDP 数据包发送到该 peer 的 `endpoint`。因此，`address` 表示客户端使用的内层源地址，`allowedIPs` 相当于选择 peer 的目标路由表，而 `endpoint` 才是外层连接的服务器地址。
:::

::: tip
每个 WireGuard 服务器都应根据其 `allowedIPs`，放行 `address` 中相同 IP 族的所有地址：`allowedIPs` 仅包含 IPv4 网段时，应放行 `address` 中列出的所有 IPv4 地址；仅包含 IPv6 网段时同理；同时包含 IPv4 和 IPv6 网段时，应放行其中所有地址。

以 Xray 作为 WireGuard 服务器为例，应在 `inbounds[].settings.peers[].allowedIPs` 中列出这些地址。
:::

> `remoteDNS`: \[ string \]

解析被代理目标域名的 DNS 服务器。列表项必须为 IP。默认值为 `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`。

::: details `remoteDNS` 与 `targetStrategy`
使用 `remoteDNS` 时，DNS 查询经 WireGuard 隧道发送；所有服务器 IP 均须包含在某个 peer 的 `allowedIPs` 中并能通过隧道访问。

出站的 [`targetStrategy`](../outbound.md#outboundobject) 决定使用哪套 DNS：

- `AsIs`：使用 `remoteDNS`。
- `UseIP*`：优先使用 Xray 内置 DNS，解析失败时回退到 `remoteDNS`。
- `ForceIP*`：使用 Xray 内置 DNS，解析失败时直接失败。

`UseIP*` 或 `ForceIP*` 返回的 IP 地址族必须已配置在 `address` 中，否则无法连接；解析成功后不会因地址族冲突而回退到 `remoteDNS`。

如何取舍？`remoteDNS` 配置更简单；但若 Xray 内置 DNS 已有符合预期的解析结果，使用内置 DNS 通常可复用缓存，省去一次经 WireGuard 隧道的 DNS 查询。
:::

### PeersObject

```json
{
  "endpoint": "SERVER_ADDR",
  "publicKey": "SERVER_PUBLIC_KEY",
  "preSharedKey": "PRE_SHARED_KEY",
  "keepAlive": 0,
  "allowedIPs": ["0.0.0.0/0", "::/0"]
}
```

> `endpoint`: address

服务器地址, 必填。

URL: 端口 格式，例如 `engage.cloudflareclient.com:2408`<br>
IP: 端口 格式，例如 `162.159.192.1:2408` 或 `[2606:4700:d0::a29f:c001]:2408`

> `publicKey`: string

服务器公钥，用于验证。必填。

以 Xray 作为 WireGuard 服务器时，此处应填写与服务器 `inbounds[].settings.secretKey` 成对的 `Password (PublicKey)`。

> `preSharedKey`: string

额外的对称加密密钥，可选。需与服务端配置一致。

> `keepAlive`: int

客户端向该服务器发送持久保活包的间隔，单位为秒，用于在空闲时维持可能存在的 NAT 映射或防火墙状态。仅特殊场景需要开启，且仅客户端开启即可；默认值为 `0`，表示不发送。

> `allowedIPs`: \[ string \]

指定由该服务器转发的目标 IP 网段，每项使用 CIDR 表示。仅配置一个服务器时可以省略，因为默认值为 `["0.0.0.0/0", "::/0"]`，即所有 IPv4 和 IPv6 目标流量均由该服务器转发。配置多个服务器时，需为每个服务器显式设置 `allowedIPs`，将不同的目标网段分配给相应服务器；Xray 会根据目标 IP 的前缀匹配结果选择服务器。
