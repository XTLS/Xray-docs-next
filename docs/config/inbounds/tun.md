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
      // [!code focus:9]
      "settings": {
        "name": "xray0",
        "mtu": 1500,
        "gateway": ["10.0.0.1/16", "fc00::1/64"],
        "dns": ["1.1.1.1", "8.8.8.8"],
        "userLevel": 0,
        "autoSystemRoutingTable": ["0.0.0.0/0", "::/0"],
        "autoOutboundsInterface": "auto"
      }
    }
  ]
}
```

> `name`: string

创建的 TUN 接口名。默认 `"xray0"`

在 macOS 应为 `"utunN"`，其中 N 为正整数。

> `mtu`: number

接口的 MTU。默认值为 `1500`。

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

## 使用提示

如果未配置 `autoSystemRoutingTable`，仍需要手动配置路由将数据导向创建的 TUN 接口，否则它只是个接口。

配置了 `gateway`、`dns`、`autoSystemRoutingTable` 和 `autoOutboundsInterface` 后，Xray 可以在支持的平台上自动完成一部分系统侧配置；如果你的平台尚未实现这些自动设置，或者需要更细粒度的策略路由，仍然需要配合系统工具手动处理。

如果只想代理某一个或一些进程，Xray 路由系统中的进程名路由会十分有用。

::: warning
注意可能的流量回环的问题，设置路由后可能将 Xray 发出的请求发回 Xray 造成回环！
优先使用 `autoOutboundsInterface` 避免此问题；如果你需要手动控制，也可以使用 `sockopt` 中的 `interface` 绑定实际的物理网络接口。`ipconfig` (Windows) `ip a` (Linux) 将有助于找到你需要的接口名。
或者使用出站的 `sendThrough` 它直接在 OutboundObject 中可用，没有 sockOpt.interface 那么深的嵌套层级，这里需要使用的是网卡上的 IP，比如 192.168.1.2 （如你所见它的缺点是不能自动支持双栈，请按你出站的实际使用的 IP 选择）。
:::
