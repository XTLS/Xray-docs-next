# Sockopt

Sockopt 用于配置底层网络行为。

可用于调整透明代理、域名解析策略以及各类底层 socket 选项。

## SockoptObject

`SockoptObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `sockopt` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        // [!code focus:21]
        "sockopt": {
          "mark": 0,
          "tcpMaxSeg": 1440,
          "tcpFastOpen": false,
          "tproxy": "off",
          "domainStrategy": "AsIs",
          "happyEyeballs": {},
          "dialerProxy": "",
          "acceptProxyProtocol": false,
          "trustedXForwardedFor": [],
          "tcpKeepAliveInterval": 0,
          "tcpKeepAliveIdle": 300,
          "tcpUserTimeout": 10000,
          "tcpcongestion": "bbr",
          "interface": "wg0",
          "V6Only": false,
          "tcpWindowClamp": 600,
          "tcpMptcp": false,
          "addressPortStrategy": "",
          "customSockopt": []
        }
      }
    }
  ]
}
```

> `mark`: number

一个整数。当其值非零时，在 outbound 连接上以此数值标记 SO_MARK。

- 仅适用于 Linux 系统。
- 需要 CAP_NET_ADMIN 权限。

> `tcpMaxSeg`: number

用于设置 TCP 数据包的最大传输单元。

> `tcpFastOpen`: true | false | number

是否启用 [TCP Fast Open](https://zh.wikipedia.org/wiki/TCP%E5%BF%AB%E9%80%9F%E6%89%93%E5%BC%80)。

当其值为 `true` 或`正整数`时，启用 TFO；当其值为 `false` 或`负数`时，强制关闭 TFO；当此项不存在或为 `0` 时，使用系统默认设置。 可用于 inbound/outbound。

- 仅在以下版本（或更新版本）的操作系统中可用:
  - Linux 3.16：需要通过内核参数 `net.ipv4.tcp_fastopen` 进行设定，此参数是一个 bitmap，`0x1` 代表客户端允许启用，`0x2` 代表服务器允许启用；默认值为 `0x1`，如果服务器要启用
    TFO，请把此内核参数值设为 `0x3`。
  - ~~Windows 10 (1607)~~（实现不正确）
  - Mac OS 10.11 / iOS 9（需要测试）
  - FreeBSD 10.3 (Server) / 12.0 (Client)：需要把内核参数 `net.inet.tcp.fastopen.server_enabled`
    以及 `net.inet.tcp.fastopen.client_enabled` 设为 `1`。（需要测试）

- 对于 Inbound，此处所设定的`正整数`代表 [待处理的 TFO 连接请求数上限](https://tools.ietf.org/html/rfc7413#section-5.1) ，**注意并非所有操作系统都支持在此设定**：
  - Linux / FreeBSD：此处的设定的`正整数`值代表上限，可接受的最大值为 2147483647，为 `true` 时将取 `256`；注意在 Linux，`net.core.somaxconn`
    会限制此值的上限，如果超过了 `somaxconn`，请同时提高 `somaxconn`。
  - Mac OS：此处为 `true` 或`正整数`时，仅代表启用 TFO，上限需要通过内核参数 `net.inet.tcp.fastopen_backlog` 单独设定。
  - Windows：此处为 `true` 或`正整数`时，仅代表启用 TFO。

- 对于 Outbound，设定为 `true` 或`正整数`在任何操作系统都仅表示启用 TFO。

> `tproxy`: "redirect" | "tproxy" | "off"

是否开启透明代理（仅适用于 Linux）。

- `"redirect"`：使用 Redirect 模式的透明代理。支持所有基于 IPv4/6 的 TCP 连接。
- `"tproxy"`：使用 TProxy 模式的透明代理。支持所有基于 IPv4/6 的 TCP 和 UDP 连接。
- `"off"`：关闭透明代理。

透明代理需要 Root 或 `CAP_NET_ADMIN` 权限。

::: danger
当 [tunnel](../inbounds/tunnel.md) 中指定了 `followRedirect`为`true`，且 Sockopt 设置中的`tproxy` 为空时，Sockopt
设置中的`tproxy` 的值会被设为 `"redirect"`。
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

默认值 `"AsIs"`。

此选项控制出站建立底层连接时，对连接目标域名的解析方式。

- VLESS、VMess、Trojan 等代理出站：底层连接的目标是代理服务器，因此此选项控制代理服务器域名的解析。被代理请求中的目标域名是否在本地解析，由出站的 [`targetStrategy`](../outbound.md#outboundobject) 控制。
- Freedom 出站：底层连接的目标就是请求的目标，因此此选项控制请求目标域名的解析。

各策略的含义如下：

- 当使用 `"AsIs"` 时，Xray 将域名交给 Go 按操作系统 DNS 设置解析并连接。通常 TCP 优先尝试 IPv6，并在连接不顺利时尝试 IPv4；UDP 则优先使用 IPv4。

  ::: details AsIs 的地址选择与回退细节
  TCP 使用 Go 内置的 Happy Eyeballs。解析结果中第一个地址所属的地址族为首选地址族：若在 300 ms 后仍未连接成功，则开始尝试另一地址族；若首选地址族的全部连接尝试提前失败，则立即尝试另一地址族。这不受 Xray `sockopt.happyEyeballs` 配置控制。参见 [Go 拨号实现](https://go.dev/src/net/dial.go)。

  使用纯 Go 编译的 Xray 时，地址按照 RFC 6724 的精简规则排序，条件相当时通常优先 IPv6，不读取 `/etc/gai.conf`。Xray 官方 release 版大多采用这种方式；部分操作系统或下游项目编译的版本行为可能略有不同不再赘述。参见 [Go 地址排序实现](https://go.dev/src/net/addrselect.go)。

  UDP 优先选择解析结果中的 IPv4 地址，没有 IPv4 时才选择 IPv6；发送失败不会自动切换到另一地址族。参见 [Go UDP 地址选择实现](https://go.dev/src/net/ipsock.go)。

  注意，`Use` 策略可能因解析失败或结果不符合要求而回退到 `AsIs`，此时 TCP 和 UDP 均遵循上述行为。
  :::

- 当填写其他值时，将使用 Xray [内置 DNS 模块](../dns.md) 进行解析。若未配置 `DNSObject`，则使用系统 DNS。若有多个符合条件的 IP 地址，默认随机选择一个；TCP 启用 `sockopt.happyEyeballs` 后则通过竞速选择。
- `"IPv4"` 代表只解析 IPv4。`"IPv4v6"` 代表先解析 IPv4，仅当解析报错或没有返回 IP 时再解析 IPv6；如果已经解析出 IPv4，之后连接失败不会回退到 IPv6。`"IPv6"`、`"IPv6v4"` 同理，地址族顺序相反。
- 当在内置 DNS 模块中设置了 `"queryStrategy"` 后，实际解析的 IP 类型取两个选项的交集，只有两者都允许的 IP 类型才会被解析。例如，`"queryStrategy": "UseIPv4"` 配合 `"domainStrategy": "UseIP"`，实际上等同于 `"domainStrategy": "UseIPv4"`。
- 当使用 `"Use"` 开头的选项时，若解析失败或结果不符合要求（如域名只有 IPv4 解析结果，但使用了 `UseIPv6`），则会回退到 `AsIs`。
- 当使用 `"Force"` 开头的选项时，若解析失败或结果不符合要求，则无法建立连接。

::: tip
当使用 `"UseIP"`、`"ForceIP"` 模式时，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，核心会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。若手动指定了单种 IP 类型（如 UseIPv4），但与 `sendThrough` 指定的本地地址不匹配，将会导致连接失败。
:::

:::: danger 启用了此功能后，不当的配置可能会导致死循环！
连接到服务器，需要等待 DNS 查询结果；完成 DNS 查询，需要连接到服务器。

**不建议** 经验不足的用户擅自使用此功能。

::: details 详细解释

1. 触发条件：代理服务器地址是域名（proxy.com）。内置 DNS 服务器是非 Local 模式。
2. Xray 尝试向 proxy.com 建立 TCP 连接 **前** ，通过内置 DNS 服务器查询 proxy.com。
3. 内置 DNS 服务器向 dns.com 建立连接，并发送查询，以获取 proxy.com 的 IP。
4. **不当的** 的路由规则，导致 proxy.com 代理了步骤 3 中发出的查询。
5. Xray 尝试向 proxy.com 建立另一个 TCP 连接。
6. 在建立连接前，通过内置 DNS 服务器查询 proxy.com。
7. 内置 DNS 服务器复用步骤 3 中的连接，发出查询。
8. 问题出现。步骤 3 中连接的建立，需要等待步骤 7 中的查询结果；步骤 7 完成查询，需要等待步骤 3 中的连接完全建立。
9. Good Game！

Freedom 直连也可能出现同样的问题：若连接 DNS 服务器前，需要通过该服务器解析其自身域名，就会形成循环依赖。

解决方案：

- 改内置 DNS 服务器的分流。
- 用 Hosts。
- ~~如果你还是不知道解决方案，就别用这个功能了。~~

:::
::::

> `dialerProxy`: ""

一个出站代理的标识。当值不为空时，将使用指定的 outbound 发出连接。通常用于配置链式代理。

> `acceptProxyProtocol`: true | false

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `trustedXForwardedFor`: [ string ]

仅适用于 `XHTTP`、`WebSocket`、`HTTPUpgrade`、`gRPC` 这四种基于 HTTP 的传输方式，用于控制是否信任 XFF（`X-Forwarded-For`）头，即是否将其视为来自可信反向代理。

Xray 会检查该数组中的各个字符串对应的 Header 是否出现在请求中；只要任意一项存在（无论其值为何），就允许使用 XFF 头的第 0 个值覆盖源 IP，否则将忽略该 XFF 头。

> `tcpKeepAliveIdle`: number

TCP 空闲时间阈值，单位为秒。当 TCP 连接空闲时间达到这个阈值时，将开始发送 Keep-Alive 探测包。

对于出站, xray 使用 Chrome 的默认值 idle 与 interval 均为 45s, 该选项与 `tcpKeepAliveInterval` 任意一个设置为负数将禁用该默认 keepalive, 正数则会覆盖该默认值。

对于入站, Keep-Alive 默认禁用，该选项与 `tcpKeepAliveInterval` 任意一个非零时启用，如果只设置二者之一那么另一个将跟随操作系统设置。

> `tcpKeepAliveInterval`: number

TCP 进入 Keep-Alive 状态后发送 Keep-Alive 数据包间的时间间隔，单位为秒。其他行为见上。

> `tcpUserTimeout`: number

单位为毫秒。详细介绍：https://github.com/grpc/proposal/blob/master/A18-tcp-user-timeout.md

> `tcpcongestion`: ""

TCP 拥塞控制算法。仅支持 Linux。
不配置此项表示使用系统默认值。

::: tip 常见的算法

- bbr（推荐）
- cubic
- reno

:::

::: tip
执行命令 `sysctl net.ipv4.tcp_congestion_control` 获取系统默认值。
:::

> `interface`: ""

指定绑定出口网卡名称，支持 linux / iOS / Mac OS / Windows。

> `V6Only`: true | false

填写 `true` 时，监听 `::` 地址仅接受 IPv6 连接。仅支持 Linux。

> `tcpWindowClamp`: number

绑定通告的 windows 大小为该值。内核会在它与 SOCK_MIN_RCVBUF/2 之间选一个最大值。

> `tcpMptcp`: true | false

默认值 `false`，填写 `true` 时，启用 [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP)，仅客户端参数，因为 golang 在 1.24+ 版本已默认在监听时启用 MPTCP.
当前仅支持Linux，需要Linux Kernel 5.6及以上。

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

使用 SRV 记录或 TXT 记录指定出站使用的目标地址/端口，默认 `none` 即关闭。

查询直接通过系统 DNS 而不是 Xray 的内置 DNS, 尝试去查询的域名将会是出站中的域名。如果查询失败请求会按原地址和端口发出。

`Srv` 开头代表查询 SRV 记录(标准格式), `Txt` 开头代表查询 TXT 记录 (格式形如 `127.0.0.1:80`)。

`PortOnly` 仅重置端口 `AddressOnly` 仅重置地址 `PortAndAddress` 则重置地址和端口。

该选项在 `sockopt.domainStrategy` 解析之前生效，地址重置后仍会按 `domainStrategy` 的规则进行解析。

Freedom 出站不支持此选项。

> `customSockopt`: []

一个数组，用于高级用户指定需要的任何 sockopt, 理论上上述所有与连接有关的设置均可以在此等价设置, 自然也可以设置存在但是核心未添加的其他选项。目前支持 Linux Winows Darwin 操作系统。下方示例等价于核心中的 `"tcpcongestion": "bbr"`

使用前请确保你了解 Socket 编程。

```json
{
  "customSockopt": [
    {
      "system": "linux",
      "network": "tcp",
      "type": "str",
      "level": "6",
      "opt": "13",
      "value": "bbr"
    }
  ]
}
```

> `system`: ""

可选，指定生效的系统，使用小写，如果运行的系统不匹配则跳过该 sockopt，若留空则直接执行。目前可选 `linux` `windows` `darwin` `android` （只在使用专门的 Android 构建时才使用 `android`，在安卓上运行 Linux 构建仍是 `linux`）

> `network`: ""

可选，指定生效的网络类型，目前可选 `tcp` `tcp4` `tcp6` `udp` `udp4` `udp6`. 无后缀数字代表执行双栈都应用该 sockopt。 注意目标是 IPv4 **不代表**标准库传入的 network 一定是 `tcp4`/`udp4`，比如系统有可能使用 IPv6 Socket 来连接一个 IPv4 地址，使用前请确认标准库行为。

> `type`: ""

必填，设置的类型，目前可选 `int` 或 `str`.

> `level`: ""

可选，协议级别，用于指定生效范围，默认为 `6`, 即TCP.

> `opt`: ""

操作的选项名称，使用十进制(此处示例为 TCP_CONGESTION 的值 定义为 0xd 转换为10进制即为13)

> `value`: ""

要设置的选项值，此处示例为设置为bbr.

当 type 指定为 int 时需要使用十进制数字。

> `happyEyeballs`: [HappyEyeballsObject](#happyeyeballsobject)

RFC-8305 实现的 happyEyeballs，仅适用于 TCP。当目标为域名时对它们竞速并选择第一个成功的返回，仅当 `sockopt.domainStrategy` 被设置为非 `AsIs` 时生效。

注意：`UseIPv4v6` / `ForceIPv4v6` 会使可用的 IP 列表被缩减到仅剩 IPv4，仅当 IPv4 解析报错或没有返回 IP 时才会改为解析 IPv6；IPv4 连接失败不会触发该回退。不推荐这么用。建议使用 UseIP / ForceIP 配合 `happyEyeballs.interleave`。

::: warning
不能与 `dialerProxy` 一起使用，否则 `happyEyeballs` 无法生效。
:::

### HappyEyeballsObject

```json
{
  "happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4
  }
}
```

> `tryDelayMs`: number

每个竞速请求发起时间的间隔，单位毫秒，默认为0(代表禁用该功能)，推荐值为 250.

> `prioritizeIPv6`: bool

排序 IP 时首个 IP 的类型，默认为 false (即 IPv4 会被排在第一个)

> `interleave`: number

RFC-8305 中的 "First Address Family count", 默认值为 1. 它定义了对不同IP版本进行排序时的交错行为。

比如等待 dial 的 IP 队列会被排序为 46464646 (设置为1) 44664466 (设置为2) (6 代表 IPv6 地址, 4 代表 IPv4 地址).

> `maxConcurrentTry`: number

最大并发数量，用于防止解析出的IP过多且均未成功时候核心也对这些IP产生大量连接。默认为4, 设置为0代表禁用 happyEyeballs.
