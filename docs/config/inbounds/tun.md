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

> `desc`: string

Windows 系统中的网络接口名称描述，默认为 `Wintun`。该字符串会与 "Tunnel" 拼接成 "xxx Tunnel"

在 Windows 中使用 `route print` 可查看具体信息

> `mtu`: number

接口的 mtu。默认值为 `1500`。

> `gateway`: [string]

为 TUN 接口配置的地址前缀列表，通常分别填写 IPv4 / IPv6，例如 `"10.0.0.1/16"`、`"fc00::1/64"`。

未配置时，结果取决于系统：在 Linux 上，Xray 不会分配地址；在 Windows 上，系统会自动为 TUN 接口分配链路本地地址（IPv6 立即分配，IPv4 在几秒后从 `169.254.0.0/16` 中分配）；在 macOS 和 FreeBSD 上，使用 `169.254.10.1/30`。macOS 和 FreeBSD 只使用第一个 IPv4 前缀。

> `dns`: [string]

为 TUN 接口配置的 DNS 服务器列表，例如 `"1.1.1.1"`、`"8.8.8.8"`。

该项配置只在 Windows 系统上有效，服务器会被设置到 TUN 接口上。Windows 除了向它们发送查询，也会向其他网络接口的 DNS 服务器发送查询；`autoSystemWfpBlockLeak` 中的 `"dns"` 会阻止后者。只有当这些服务器在 `gateway` 或 `autoSystemRoutingTable` 的范围内时，发往它们的查询才会经由 TUN 接口。在 Xray 中它们就是发往 53 端口的普通流量：可以用路由规则交给 [DNS 出站](../outbounds/dns.md)，否则会像其他流量一样被转发到这些服务器。TUN 接口的地址不会被注册到 DNS 中，并且 TUN 接口启动和停止时会清空 DNS 缓存。

使用 `autoOutboundsInterface` 时，Xray 的 `localhost` DNS 服务器会跳过这些服务器（除非其他接口也在使用它们），因为发往它们的查询会回到 TUN 接口中。

在 Linux 上，系统 DNS 不会从该项获取，参见 `autoSystemDnsToGateway`；在 macOS 上不会配置系统 DNS。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值. 如不指定, 默认为 0。

> `autoSystemRoutingTable`: [string]

自动写入系统路由表要导入该 TUN 接口的目标网段列表。每一项均为 CIDR，例如 `"0.0.0.0/0"` 表示所有 IPv4 流量，`"::/0"` 表示所有 IPv6 流量。

当前支持 Windows, macOS, Linux。FreeBSD 系统需要手动配置路由表。

> `autoOutboundsInterface`: string

自动为 Xray 的出站绑定物理网络接口，用于避免把 Xray 自己发出的流量再次送回 TUN 造成回环。

相当于为所有出站自动设置 [sockopt](../transports/sockopt.md).interface（同时还会额外包括一些无法配置出站设置的请求，比如 内置 DNS 的各种 local 模式）可以被手动设置 sockopt 覆盖。

默认值为 `null`，即未配置。可填写具体接口名，也可填写 `"auto"` 让 Xray 自动选择。如果配置了 `autoSystemRoutingTable` 但未显式指定此项，Xray 会自动按 `"auto"` 处理。

> `autoSystemDnsToGateway`: true | false

该项配置只在 Linux 系统上有效，默认值为 `false`。

启用后，Xray 会（通过 `resolvectl`）把系统解析器 systemd-resolved 指向 TUN 接口，使系统的域名查询经过 Xray。使用的地址是 `gateway` 中第一个 IPv4 地址加一（例如 `10.0.0.1/16` → `10.0.0.2`），没有 IPv4 地址时使用第一个 IPv6 地址加一（例如 `fc00::1/64` → `fc00::2`）；未配置 `gateway` 时 Xray 会报错退出。该地址不取自 `dns`，否则 systemd-resolved 会在 TUN 接口之外直接查询那些服务器。

发往该地址的查询必须由 Xray 应答，因此需要一条路由规则，把该入站的 53 端口交给 [DNS 出站](../outbounds/dns.md)。Xray 会在更改系统 DNS 之前进行检查：如果这样的查询不会到达 DNS 出站，或者 Xray 自身的 [DNS](../dns.md) 可能通过系统解析器解析（没有配置 DNS 服务器，或配置了 `localhost`），会造成循环，则不会更改系统 DNS，Xray 也不会启动。

需要 systemd-resolved 240 或更高版本正在运行。只要无法更改系统 DNS，Xray 就不会启动。Xray 正常退出时会恢复该设置；如果 Xray 被强制结束（例如 `SIGKILL`），可以运行 `resolvectl revert <接口名>` 手动恢复。

> `autoSystemWfpBlockLeak`: [string]

该项配置只在 Windows 系统上有效，默认为空，即不添加过滤器。

该项需要配置 `autoSystemRoutingTable`，否则 Xray 会报错退出。Xray 会按列表中的值添加 Windows 筛选平台（WFP）过滤器，防止其他程序的流量从 TUN 接口之外泄漏：

- `"dns"`（需要配置 `dns`，否则 Xray 会报错退出）：DNS（53 端口）只能经由 TUN 接口或由 Xray 自身发出。Windows 会向所有网络接口的 DNS 服务器发送查询，并且无论路由如何都经由各自的接口发出，其他程序也会经由更具体的局域网路由访问本地网络中的 DNS 服务器（例如 DHCP 分配的 `192.168.1.1`），否则这些服务器仍会在 TUN 之外被查询。在 Windows 11、Windows Server 2022 及更高版本上，这些查询还可能使用 DNS over HTTPS 或 DNS over TLS，所以 Windows 的 DNS Client 服务（Dnscache）完全不能在 TUN 接口之外建立连接，本地网络中的名称解析（LLMNR、mDNS）除外。因此 `dns` 中的服务器必须在 `gateway` 或 `autoSystemRoutingTable` 的范围内，需要直连的 DNS 服务器应配置在 Xray 自身的 [DNS](../dns.md) 设置中。
- `"misconfigtun"`：如果 `autoSystemRoutingTable` 中没有某个 IP 版本（IPv4 或 IPv6）的路由，则双向阻止该版本，但 Xray 自身、环回以及 Windows 在本地链路上所需的流量（DHCP、IPv6 邻居发现）除外。TUN 接口承载某个 IP 版本不需要在 `gateway` 中配置该版本的地址：未配置时，Windows 会自动为其分配链路本地地址（IPv6 立即分配，IPv4 在几秒后从 `169.254.0.0/16` 中分配）。

过滤器生效期间，Xray 自身的出站连接也不受 Windows 防火墙阻止规则的限制。

过滤器会在 Xray 退出时自动移除，即使 Xray 崩溃也是如此。如果无法添加过滤器，Xray 不会启动。

该项默认为空，因为这些过滤器会在某些情况下造成问题：`"dns"` 会影响其他程序使用的本地 DNS 解析器（例如 `127.0.0.1:53`）、其他 VPN 的 DNS、在主机上解析域名的虚拟机 NAT，以及登录强制门户（captive portal）；`"misconfigtun"` 会影响没有路由通往 TUN 接口的 IP 版本（IPv4 或 IPv6）在本地网络中的通信。不使用这些过滤器时，DNS 可能会如上所述泄漏。如果有意让某个 IP 版本不经过 TUN 接口，同时仍要阻止 DNS 泄漏，只使用 `["dns"]` 即可。

## 使用提示

如果未配置 `autoSystemRoutingTable`，仍需要手动配置路由将数据导向创建的 TUN 接口，否则它只是个接口。

配置了 `gateway`、`dns`、`autoSystemRoutingTable` 和 `autoOutboundsInterface` 后，Xray 可以在支持的平台上自动完成一部分系统侧配置；如果你的平台尚未实现这些自动设置，或者需要更细粒度的策略路由，仍然需要配合系统工具手动处理。

如果只想代理某一个或一些进程，Xray 路由系统中的进程名路由会十分有用。

::: warning
注意可能的流量回环的问题，设置路由后可能将 Xray 发出的请求发回 Xray 造成回环！
优先使用 `autoOutboundsInterface` 避免此问题；如果你需要手动控制，也可以使用 `sockopt` 中的 `interface` 绑定实际的物理网络接口。`ipconfig` (Windows) `ip a` (Linux) 将有助于找到你需要的接口名。
或者使用出站的 `sendThrough` 它直接在 OutboundObject 中可用，没有 sockOpt.interface 那么深的嵌套层级，这里需要使用的是网卡上的 IP，比如 192.168.1.2 （如你所见它的缺点是不能自动支持双栈，请按你出站的实际使用的 IP 选择）。
:::
