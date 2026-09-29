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
        "strictRoute": true
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

macOS 系统中，仅 IPv4 会生效，如未设置，则使用 `169.254.10.1/30`。

> `dns`: [string]

该项配置只在 Windows 系统上有效，可为 TUN 接口配置的 DNS 服务器列表，例如 `"1.1.1.1"`、`"8.8.8.8"`。

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

> `strictRoute`: true | false

该项配置只在 Windows 系统上有效，默认值为 `false`。

启用该项并配置了 `autoSystemRoutingTable` 时，Xray 会添加 Windows 筛选平台（WFP）过滤器，防止其他程序的流量从 TUN 接口之外泄漏：

- 如果配置了 `dns`，DNS（53 端口）只能经由 TUN 接口或由 Xray 自身发出。Windows 会向所有网络接口的 DNS 服务器发送查询，否则本地网络中的 DNS 服务器（例如 DHCP 分配的 `192.168.1.1`）仍会在 TUN 之外被查询。因此 `dns` 中的服务器必须在 `gateway` 或 `autoSystemRoutingTable` 的范围内，需要直连的 DNS 服务器应配置在 Xray 自身的 [DNS](../dns.md) 设置中。
- 如果 TUN 接口无法承载 IPv6（`gateway` 中没有 IPv6 地址，或 `autoSystemRoutingTable` 中没有 IPv6 路由），则双向阻止 IPv6，但 Xray 自身、环回以及 Windows 在本地链路上所需的流量（邻居发现、DHCPv6）除外。

过滤器生效期间，Xray 自身的出站连接也不受 Windows 防火墙阻止规则的限制。

过滤器会在 Xray 退出时自动移除，即使 Xray 崩溃也是如此。如果无法添加过滤器，TUN 接口将不会启动（Windows 10 及更高版本；更早的版本只记录警告）。

该项默认关闭，因为这些过滤器会在某些情况下造成问题：其他程序使用的本地 DNS 解析器（例如 `127.0.0.1:53`）、其他 VPN 的 DNS、TUN 接口没有 IPv6 时本地网络中的 IPv6、在主机上解析域名的虚拟机 NAT，或登录强制门户（captive portal）。不使用这些过滤器时，DNS 可能会如上所述泄漏。

## 使用提示

如果未配置 `autoSystemRoutingTable`，仍需要手动配置路由将数据导向创建的 TUN 接口，否则它只是个接口。

配置了 `gateway`、`dns`、`autoSystemRoutingTable` 和 `autoOutboundsInterface` 后，Xray 可以在支持的平台上自动完成一部分系统侧配置；如果你的平台尚未实现这些自动设置，或者需要更细粒度的策略路由，仍然需要配合系统工具手动处理。

如果只想代理某一个或一些进程，Xray 路由系统中的进程名路由会十分有用。

::: warning
注意可能的流量回环的问题，设置路由后可能将 Xray 发出的请求发回 Xray 造成回环！
优先使用 `autoOutboundsInterface` 避免此问题；如果你需要手动控制，也可以使用 `sockopt` 中的 `interface` 绑定实际的物理网络接口。`ipconfig` (Windows) `ip a` (Linux) 将有助于找到你需要的接口名。
或者使用出站的 `sendThrough` 它直接在 OutboundObject 中可用，没有 sockOpt.interface 那么深的嵌套层级，这里需要使用的是网卡上的 IP，比如 192.168.1.2 （如你所见它的缺点是不能自动支持双栈，请按你出站的实际使用的 IP 选择）。
:::
