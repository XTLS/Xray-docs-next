# TUN

创建一个 TUN 接口，发往此接口的流量将由 Xray 处理。目前支持 Windows、Linux、macOS 和 FreeBSD。

Android 和 iOS 需要外部 APP 通过环境变量 `XRAY_TUN_FD` 传入 TUN FD，使用系统指定的接口重定向流量。无法独立使用，仅作为 APP 将流量接入 Xray 的方式。

Linux 可选使用该环境变量传入 TUN FD 以进行某些轻量化或非特权实现。

## InboundConfigurationObject

`InboundConfigurationObject` 对应 [`InboundObject`](../inbound.md) 中的 `settings` 项。

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "tun",
      // [!field focus]
      "settings": {
        "name": "utun10",
        "desc": "Wintun",
        "mtu": 1500,
        "gateway": ["10.0.0.1/16", "fc00::1/64"],
        "dns": ["1.1.1.1", "8.8.8.8"],
        "userLevel": 0,
        "autoSystemRoutingTable": ["0.0.0.0/0", "::/0"],
        "autoOutboundsInterface": "auto",
        "autoSystemDnsToGateway": false,
        "autoSystemWfpBlockLeak": ["dns", "misconfigtun"]
      }
    }
  ]
}
```

> `name`: string

创建的 TUN 接口名。默认 `"utunN"`

其中 N 为 10~1024 之间的随机数

在 macOS 上名称必须为 `utunN`，在 FreeBSD 上必须为 `tunN`。在 Windows 上，已有的同名 Wintun 适配器会被直接复用。

> `desc`: string

Windows 系统中的网络接口名称描述，默认为 `Wintun`。该字符串会与 "Tunnel" 拼接成 "xxx Tunnel"

在 Windows 中使用 `route print` 可查看具体信息

> `mtu`: number

接口的 mtu。默认值为 `1500`。

> `gateway`: [string]

为 TUN 接口配置的地址前缀列表，通常分别填写 IPv4 / IPv6，例如 `"10.0.0.1/16"`、`"fc00::1/64"`。

未配置时，结果取决于系统：在 Linux 上，Xray 不会分配地址；在 Windows 上，系统会自动为 TUN 接口分配链路本地地址（IPv6 立即分配，IPv4 在几秒后从 `169.254.0.0/16` 中分配）；在 macOS 和 FreeBSD 上，使用 `169.254.10.1/30`。macOS 和 FreeBSD 只使用第一个 IPv4 前缀。

在系统全局禁用了 IPv6 的 Windows 上，TUN 接口只有 IPv4，此时该项或 `autoSystemRoutingTable` 中的 IPv6 条目会使其无法启动。

> `dns`: [string]

为 TUN 接口配置的 DNS 服务器列表，例如 `"1.1.1.1"`、`"8.8.8.8"`。

该项配置只在 Windows 系统上有效，服务器会被设置到 TUN 接口上。Windows 除了向它们发送查询，也会向其他网络接口的 DNS 服务器发送查询；`autoSystemWfpBlockLeak` 中的 `"dns"` 会阻止后者。只有当这些服务器在 `gateway` 或 `autoSystemRoutingTable` 的范围内时，发往它们的查询才会经由 TUN 接口。在 Xray 中它们就是发往 53 端口的普通流量：可以用路由规则交给 [DNS 出站](../outbounds/dns.md)，否则会像其他流量一样被转发到这些服务器。TUN 接口的地址不会被注册到 DNS 中，并且 TUN 接口启动和停止时会清空 DNS 缓存。

使用 `autoOutboundsInterface` 时，Xray 的 `localhost` DNS 服务器会跳过这些服务器（除非其他接口也在使用它们），因为发往它们的查询会回到 TUN 接口中。

在 Linux 和 FreeBSD 上，系统 DNS 不会从该项获取，参见 `autoSystemDnsToGateway`；在 macOS 上不会配置系统 DNS。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值. 如不指定, 默认为 0。

> `autoSystemRoutingTable`: [string]

自动写入系统路由表要导入该 TUN 接口的目标网段列表。每一项均为 CIDR，例如 `"0.0.0.0/0"` 表示所有 IPv4 流量，`"::/0"` 表示所有 IPv6 流量。

当前支持 Windows、Linux、macOS 和 FreeBSD。

> `autoOutboundsInterface`: string

自动为 Xray 的出站绑定物理网络接口，用于避免把 Xray 自己发出的流量再次送回 TUN 造成回环。

如果某个连接无法绑定到该接口，该连接会直接失败，而不会在未绑定的情况下发出（那样可能会回到 TUN 接口造成回环）。在 Windows 上，只启用了 IPv4 或只启用了 IPv6 的接口同样可用：缺少的那个 IP 版本的连接会失败，而不会经由其他接口发出。

发往环回地址的连接不会绑定。在 FreeBSD 上，Xray 的连接会改用第二张路由表（FIB 1），其中镜像了物理接口的默认路由，这需要将启动参数 `net.fibs` 设置为至少 2，否则 Xray 不会启动。

在 Windows 上，只有当该接口对路由到 TUN 接口的 IP 版本关闭了弱主机发送（weak host send）和转发（forwarding）时，这种绑定才会生效，否则 Windows 会把 Xray 自身的连接送入 TUN 接口，导致连接卡住。因此 TUN 接口运行期间，Xray 会关闭该接口的弱主机发送，并在停止时恢复。转发是移动热点和 Internet 连接共享所需要的，Xray 不会更改它，而是输出一条警告：请让热点共享 TUN 接口（设置 → 网络和 Internet → 移动热点，在共享来源中选择 TUN 接口），这样热点上的设备也会经过 Xray。只有 Xray 运行时，TUN 接口才会出现在该列表中。

相当于为所有出站自动设置 [sockopt](../transports/sockopt.md).interface（同时还会额外包括一些无法配置出站设置的请求，比如 内置 DNS 的各种 local 模式）可以被手动设置 sockopt 覆盖。

默认值为 `null`，即未配置。可填写具体接口名，也可填写 `"auto"` 让 Xray 自动选择。如果配置了 `autoSystemRoutingTable` 但未显式指定此项，Xray 会自动按 `"auto"` 处理。

> `autoSystemDnsToGateway`: true | false

该项配置只在 Linux 和 FreeBSD 系统上有效，默认值为 `false`。

启用后，Xray 会把系统解析器指向 TUN 接口，使系统的域名查询经过 Xray：在 Linux 上（通过 `resolvectl`）指向 systemd-resolved，使用的地址是 `gateway` 中第一个 IPv4 地址加一（例如 `10.0.0.1/16` → `10.0.0.2`），没有 IPv4 地址时使用第一个 IPv6 地址加一（例如 `fc00::1/64` → `fc00::2`）；在 FreeBSD 上（通过 `resolvconf(8)`），使用 `gateway` 中第一个 IPv4 地址本身（例如 `10.0.0.1/16` → `10.0.0.1`），因为 TUN 接口在那里使用其后的下一个地址。未配置 `gateway` 时 Xray 会报错退出。该地址不取自 `dns`，否则系统会在 TUN 接口之外直接查询那些服务器。

发往该地址的查询必须由 Xray 应答，因此需要一条路由规则，把该入站的 53 端口交给 [DNS 出站](../outbounds/dns.md)。Xray 会在更改系统 DNS 之前进行检查：如果这样的查询不会到达 DNS 出站，或者 Xray 自身的 [DNS](../dns.md) 可能通过系统解析器解析（没有配置 DNS 服务器，或配置了 `localhost`），会造成循环，则不会更改系统 DNS，Xray 也不会启动。

在 Linux 上，需要 systemd-resolved 240 或更高版本正在运行。在 FreeBSD 上，`resolvconf` 必须会写入解析器文件（`resolvconf.conf` 中不能设置 `resolvconf=NO`，`inclusive_interfaces` 也不能包含 TUN 接口）；使用 `local_unbound` 时需要关闭 unbound 的 DNSSEC 验证，因为验证所需的额外查询经由 DNS 出站得不到应答。只要无法更改系统 DNS，Xray 就不会启动。Xray 正常退出时会恢复该设置；如果 Xray 被强制结束（例如 `SIGKILL`），可以在 Linux 上运行 `resolvectl revert <接口名>`、在 FreeBSD 上运行 `resolvconf -d <接口名>` 手动恢复。

> `autoSystemWfpBlockLeak`: [string]

建议至少配置 `["dns"]` 以阻止 DNS 泄漏。

该项配置只在 Windows 系统上有效，并且需要配置 `autoSystemRoutingTable`，否则 Xray 会报错退出；默认为空，即不添加过滤器。Xray 会按列表中的值添加 Windows 筛选平台（WFP）过滤器，使其他程序的流量只能经由 TUN 接口发出：

- `"dns"`：等同于 `"53"`、`"853"`（DNS over TLS 和 DNS over QUIC）和 `"windnsclient"`。Windows 会向所有网络接口的 DNS 服务器发送查询，并且无论路由如何都经由各自的接口发出，其他程序也会经由更具体的路由访问本地网络中的 DNS 服务器（例如 DHCP 分配的 `192.168.1.1`），否则这些服务器仍会在 TUN 接口之外被查询。
- `"windnsclient"`：Windows 的 DNS Client 服务（Dnscache），本地网络中的名称解析（LLMNR、mDNS）除外。在 Windows 11、Windows Server 2022 及更高版本上，它可以通过 DNS over HTTPS 或 DNS over TLS 向任意端口发送查询；更早的版本只查询 53 端口，因此该项在这些版本上不起作用。
- `"tcp"`、`"udp"`：该协议的所有端口，或用 `/<端口>` 或 `/<起始>-<结束>`（1-65535）指定的部分端口，例如 `"tcp/853"` 或 `"udp/10-20"`。只写端口时同时表示 TCP 和 UDP，例如 `"53"` 或 `"10-20"`。
- `"icmp"`：ICMP 和 ICMPv6，例如 `ping`。
- `"misconfigtun"`：`autoSystemRoutingTable` 中没有路由的 IP 版本（IPv4 或 IPv6），其流量会绕过 TUN 接口。
- `"all"`：双向的所有流量。此时除非把本地网络也路由到 TUN 接口，否则无法访问本地网络；其他程序的入站连接、其他 VPN，以及由主机上的程序提供 NAT 的虚拟机也会受到影响。
- `"allexceptlan"`：与 `"all"` 相同，但允许与本地网络之间的双向流量，例如访问打印机或投屏到电视：私有、链路本地、多播和广播地址（`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`169.254.0.0/16`、`224.0.0.0/4`、`255.255.255.255`、`fc00::/7`、`fe80::/10`、`ff00::/8`），不包括全局 IPv6 地址。它包含 `"dns"`，其他值在本地网络中同样生效。同时配置 `"all"` 时以 `"all"` 为准。

在值前加上 CIDR 可以将其限制为这些地址，IPv6 的 CIDR 需要加方括号，例如 `"8.8.8.8/32:all"`、`"1.1.1.0/24:53"` 或 `"[::/0]:all"`（仅 IPv6）。该值所代表或包含的值也同样受此限制：例如 `"0.0.0.0/0:allexceptlan"` 不会阻止 IPv6 上的 DNS。

环回、DHCP、DHCPv6 和 IPv6 邻居发现始终允许。过滤器生效期间，Xray 自身的出站连接也不受 Windows 防火墙阻止规则的限制。如果无法添加过滤器，Xray 不会启动；过滤器会在 Xray 退出时自动移除，即使 Xray 崩溃也是如此。

使用 `"all"`、`"allexceptlan"`、`"dns"`、`"windnsclient"`，或任何包含 TCP 或 UDP 53 端口的值（即使只针对部分地址）将系统的 DNS 限制在 TUN 接口内时需要配置 `dns`，否则 Xray 会报错退出。此时 `dns` 中的服务器必须在 `gateway` 或 `autoSystemRoutingTable` 的范围内，或者是环回地址（例如 `127.0.0.1`），需要直连的 DNS 服务器应配置在 Xray 自身的 [DNS](../dns.md) 设置中。

这些过滤器会在某些情况下造成问题：`"dns"` 会影响经由其他接口发出自身查询的本地 DNS 解析器、其他 VPN 的 DNS、在主机上解析域名的虚拟机 NAT，以及登录强制门户（captive portal）；`"misconfigtun"` 会影响没有路由通往 TUN 接口的 IP 版本（IPv4 或 IPv6）在本地网络中的通信。

## 使用提示

如果未配置 `autoSystemRoutingTable`，仍需要手动配置路由将数据导向创建的 TUN 接口，否则它只是个接口；需要更细粒度的策略路由时，同样需要配合系统工具手动处理。

即使配置了路由，系统的 DNS 仍可能在 TUN 接口之外泄漏：在 Windows 上，请配置 `dns`，并在 `autoSystemWfpBlockLeak` 中至少配置 `["dns"]`；在 Linux 和 FreeBSD 上，请使用 `autoSystemDnsToGateway`；在 macOS 上，请自行配置系统 DNS，例如使用会被路由到 TUN 接口的 DNS 服务器。

`ping`（ICMP Echo）的回复由 Xray 自身生成，并不代表目标可达。

如果只想代理某一个或一些进程，Xray 路由系统中的进程名路由会十分有用。

::: warning
注意可能的流量回环的问题，设置路由后可能将 Xray 发出的请求发回 Xray 造成回环！
优先使用 `autoOutboundsInterface` 避免此问题；如果你需要手动控制，也可以使用 `sockopt` 中的 `interface` 绑定实际的物理网络接口。`ipconfig` (Windows) `ip a` (Linux) 将有助于找到你需要的接口名。
或者使用出站的 `sendThrough` 它直接在 OutboundObject 中可用，没有 sockOpt.interface 那么深的嵌套层级，这里需要使用的是网卡上的 IP，比如 192.168.1.2 （如你所见它的缺点是不能自动支持双栈，请按你出站的实际使用的 IP 选择）。
:::
