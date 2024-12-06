# 入站代理

入站连接用于接收发来的数据，可用的协议请见[入站协议](./inbounds/)。

## InboundObject

`InboundObject` 对应配置文件中 `inbounds` 项的一个子元素。

```json
{
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "port": 1080,
      "protocol": "协议名称",
      "settings": {},
      "streamSettings": {},
      "tag": "标识",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "allocate": {
        "strategy": "always",
        "refresh": 5,
        "concurrency": 3
      }
    }
  ]
}
```

> `listen`: address

监听地址，IP 地址或 Unix domain socket，默认值为 `"0.0.0.0"`，表示接收所有网卡上的连接.

可以指定一个系统可用的 IP 地址。

`"::"` 等价于`"0.0.0.0"` 两者都会同时监听 IPv6 和 IPv4. 不过如果只想监听IPv6可以将 `sockopt` 的 `v6only` 设置为 true. 如果只想监听ipv4 可以用 `ip a` 等命令查看网卡上的具体 IP (通常直接就是机器的公网 IP 地址或者一个类似 10.x.x.x 的内网地址) 然后监听，当然对于 IPv6 也可以这么做。

注意，因为UDP不是面向连接的，如果入站基于 UDP 且网卡上存在多个IP地址而外部连接的是网卡上的非首选地址，将会导致 Xray 使用错误地使用首选地址而非外部连接的目标作为源地址回复导致连接不通。
解决办法是不要监听 `0.0.0.0` 而是监听网卡上具体的 IP 地址。

支持填写 Unix domain socket，格式为绝对路径，形如 `"/dev/shm/domain.socket"`，可在开头加 `@` 代表 [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html)，`@@` 则代表带 padding 的 abstract。

填写 Unix domain socket 时，`port` 和 `allocate` 将被忽略，协议目前可选 VLESS、VMess、Trojan，仅适用于基于 TCP 的底层传输，如 `tcp` `websocket` `grpc` 不支持基于 UDP 的传输 如 `mkcp`

填写 Unix domain socket 时，填写为形如 `"/dev/shm/domain.socket,0666"` 的形式，即 socket 后加逗号及访问权限指示符，即可指定 socket 的访问权限，可用于解决默认情况下出现的 socket 访问权限问题。

> `port`: number | "env:variable" | string

端口。接受的格式如下:

- 整型数值：实际的端口号。
- 环境变量：以 `"env:"` 开头，后面是一个环境变量的名称，如 `"env:PORT"`。Xray 会以字符串形式解析这个环境变量。
- 字符串：可以是一个数值类型的字符串，如 `"1234"`；或者一个数值范围，如 `"5-10"` 表示端口 5 到端口 10，这 6 个端口。可以使用逗号进行分段，如 `11,13,15-17` 表示端口 11、端口 13、端口 15 到端口 17 这 5 个端口。

当只有一个端口时，Xray 会在此端口监听入站连接。当指定了一个端口范围时，取决于 `allocate` 设置。

> `protocol`: "dokodemo-door" | "http" | "shadowsocks" | "socks" | "vless" | "vmess" | "trojan" | "wireguard"

连接协议名称，可选的协议列表见左侧 入站代理。

> `settings`: InboundConfigurationObject

具体的配置内容，视协议不同而不同。详见每个协议中的 `InboundConfigurationObject`。

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

底层传输方式（transport）是当前 Xray 节点和其它节点对接的方式

> `tag`: string
> 此入站连接的标识，用于在其它的配置中定位此连接。

::: danger
当其不为空时，其值必须在所有 `tag` 中**唯一**。
:::

> `sniffing`: [SniffingObject](#sniffingobject)

流量探测主要作用于在透明代理等用途.
比如一个典型流程如下:

1. 如有一个设备上网,去访问 abc.com,首先设备通过 DNS 查询得到 abc.com 的 IP 是 1.2.3.4,然后设备会向 1.2.3.4 去发起连接.
2. 如果不设置嗅探,Xray 收到的连接请求是 1.2.3.4,并不能用于域名规则的路由分流.
3. 当设置了 sniffing 中的 enable 为 true,Xray 处理此连接的流量时,会从流量的数据中,嗅探出域名,即 abc.com
4. Xray 会把 1.2.3.4 重置为 abc.com.路由就可以根据域名去进行路由的域名规则的分流

因为变成了一个向 abc.com 请求的连接, 就可以做更多的事情, 除了路由域名规则分流, 还能重新做 DNS 解析等其他工作.

当设置了 sniffing 中的 enable 为 true, 还能嗅探出 bittorrent 类型的流量, 然后可以在路由中配置"protocol"项来设置规则处理 BT 流量, 比如服务端用来拦截 BT 流量, 或客户端固定转发 BT 流量到某个 VPS 去等.

> `allocate`: [AllocateObject](#allocateobject)

当设置了多个 port 时, 端口分配的具体设置

### SniffingObject

```json
{
  "enabled": true,
  "destOverride": ["http", "tls", "fakedns"],
  "metadataOnly": false,
  "domainsExcluded": [],
  "routeOnly": false
}
```

> `enabled`: true | false

是否开启流量探测。

> `destOverride`: \["http" | "tls" | "quic" | "fakedns" | "fakedns+others" \]

当流量为指定类型时，按其中包括的目标地址重置当前连接的目标。

其中 `["fakedns+others"]` 相当于 `["http", "tls", "quic", "fakedns"]`，当 IP 地址处于 FakeIP 区间内但没有命中域名记录时会使用 `http`、`tls` 和 `quic` 进行匹配。此项仅在 `metadataOnly` 为 `false` 时有效。

::: tip
Xray只会嗅探 `destOverride` 中协议的域名用作路由，如果只想进行嗅探用作路由而不想重置目标地址（如使用Tor浏览器时，重置目标地址会导致无法连接），请在这里添加对应的协议并启用 `routeOnly` 。
:::

> `metadataOnly`: true | false

当启用时，将仅使用连接的元数据嗅探目标地址。此时，除 `fakedns` 以外的 sniffer 将不能激活（包括 `fakedns+others`）。

如果关闭仅使用元数据推断目标地址，此时客户端必须先发送数据，代理服务器才会实际建立连接。此行为与需要服务器首先发起第一个消息的协议不兼容，如 SMTP 协议。

> `domainsExcluded`: [string] <Badge text="WIP" type="warning"/>

一个域名列表，如果流量探测结果在这个列表中时，将 **不会** 重置目标地址。

支持直接的域名（精确匹配），或 `regexp:` 开头后接正则表达式。

::: tip
填写一些域名，可能解决iOS 推送通知，米家智能设备，某些游戏（彩虹六号）语音问题。<br>
如果需要排查某些问题的原因，可以通过关闭 `"sniffing"` 或者启用 `"routeOnly"` 来测试。
:::

```json
"domainsExcluded": [
    "courier.push.apple.com", // iOS 推送通知
    "Mijia Cloud", // 米家智能设备
    "dlg.io.mi.com"
]

```

::: warning
目前，`domainsExcluded` 不支持类似路由中的域名匹配方式。此选项未来可能会改变，不保证跨版本兼容。
:::

> `routeOnly`: true | false

将嗅探得到的域名仅用于路由，代理目标地址仍为 IP。默认值为 `false`。

此项需要开启 `destOverride` 使用。

::: tip
在能保证 **被代理连接能得到正确的 DNS 解析** 时，使用 `routeOnly` 且开启 `destOverride` 的同时，将路由匹配策略 `domainStrategy` 设置为 `AsIs` 即可实现全程无 DNS 解析进行域名及 IP 分流。此时遇到 IP 规则匹配时使用的 IP 为域名原始 IP。
:::

### AllocateObject

```json
{
  "strategy": "always",
  "refresh": 5,
  "concurrency": 3
}
```

> `strategy`: "always" | "random"

端口分配策略。

- `"always"` 表示总是分配所有已指定的端口，`port` 中指定了多少个端口，Xray 就会监听这些端口。
- `"random"` 表示随机开放端口，每隔 `refresh` 分钟在 `port` 范围中随机选取 `concurrency` 个端口来监听。

> `refresh`: number

随机端口刷新间隔，单位为分钟。最小值为 `2`，建议值为 `5`。这个属性仅当 `strategy` 设置为 `"random"` 时有效。

> `concurrency`: number

随机端口数量。最小值为 `1`，最大值为 `port` 范围的三分之一。建议值为 `3`。
