# 出站代理

出站连接用于发送数据，可用的协议请见 [出站协议](./outbounds/)。

## OutboundObject

`OutboundObject` 对应配置文件中 `outbounds` 项的一个子元素。

::: tip
列表中的第一个元素作为主 outbound。当路由匹配不存在或没有匹配成功时，流量由主 outbound 发出。
:::

```json
{
  "outbounds": [
    {
      "sendThrough": "0.0.0.0",
      "protocol": "协议名称",
      "settings": {},
      "tag": "标识",
      "streamSettings": {},
      "targetStrategy": "AsIs"
    }
  ]
}
```

> `sendThrough`: address

用于发送数据的 IP 地址，当主机有多个 IP 地址时有效，默认值为 `"0.0.0.0"`。

允许在其中填入 IPv6 CIDR 块 (如 114:514:1919:810::/64)，Xray 将会使用地址块中随机的 IP 地址对外发起连接。
需要正确配置网络接入方式，路由表以及内核参数以允许 Xray bind 至地址块内的任意 IP。

对于使用 ndp 接入的网络，不建议设置小于 /120 的子网，否则可能会造成 NDP flood 导致路由器邻居缓存被占满等一系列问题。

特殊值 `origin` 若使用该值，将使用本机被连接的 IP 发出请求。

特殊值 `srcip` 若使用该值，将使用入站时的源 IP 发出请求。

例如机器上存在一整段 IPv4 `11.4.5.0/24` 且监听 0.0.0.0 (网卡上的全部 IPv4 与 IPv6)，若客户端通过 `11.4.5.14` 连接到本机，那么出站也会通过 `11.4.5.14` 发送对外请求；如果使用 `11.4.5.10` 连接到本机，那么出站就会通过 `11.4.5.10` 发送请求。 同样适用于机器上有整段/复数个 IPv6 的情况。

和入站介绍的一样，因为 UDP 的无连接特性 Xray 无从得知这个请求进入核心的原目标 IP (举个例子，在同一个 QUIC 连接里它甚至可能变动)，所以这个功能无法生效。

> `protocol`: "blackhole" | "dns" | "freedom" | "http" | "loopback" | "shadowsocks" | "socks" | "trojan" | "vless" | "vmess" | "hysteria" | "wireguard" | "masque"

连接协议名称，可选的协议列表见左侧 [出站协议](./outbounds/)。

> `settings`: OutboundConfigurationObject

具体的配置内容，视协议不同而不同。详见每个协议中的 `OutboundConfigurationObject`。
VLESS 和 VMess 的 [Multiplex 参数](#multiplex) 也在此处配置。

> `tag`: string

此出站连接的标识，用于在其它的配置中定位此连接。

::: danger
当其不为空时，其值必须在所有 `tag` 中 **唯一**。
:::

> `streamSettings`: [StreamSettingsObject](./transport.md)

此出站的传输配置。

> `targetStrategy`: "AsIs" | "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4" | "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

适用于 Freedom 以外的出站，控制被代理请求中的目标域名是否在本地解析为 IP，以及使用何种解析策略。

默认值为 `AsIs`，即保持目标域名原样发送到远端服务器。各策略的含义与 [sockopt](./transports/sockopt.md#sockoptobject) 中的 `domainStrategy` 基本相同。

::: tip
这里控制的是**被代理的请求**，如果出站代理服务器的地址是域名，并需要为这个域名本身选择解析策略，则应配置 [sockopt](./transports/sockopt.md#sockoptobject) 中的 `domainStrategy`。

Freedom 出站的域名解析策略也应配置 `sockopt.domainStrategy`。
:::

<span id="muxobject"></span>

### Multiplex

VLESS 或 VMess 出站的 Multiplex 配置路径为 `outbounds[].settings.multiplex`。`concurrency` 启用公共连接池，`xudpConcurrency` 启用独立 UDP 连接池。参见 [Multiplex 字段、配置方式与旧版 `mux` 迁移](./multiplex.md)。
