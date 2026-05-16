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
        "sockopt": {
          // [!code focus:19]
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
当 [Dokodemo-door](../inbounds/tunnel.md) 中指定了 `followRedirect`为`true`，且 Sockopt 设置中的`tproxy` 为空时，Sockopt
设置中的`tproxy` 的值会被设为 `"redirect"`。
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

默认值 `"AsIs"`。

当目标地址为域名时，配置相应的值，Outbound 连接远端服务器的行为模式如下：

- 当使用 `"AsIs"` 时, Xray 不对域名进行特殊处理，到最后 Xray 将直接使用 go 自带的 Dial 发起连接，优先级固定为 RFC6724 的默认值(不会遵守 gai.conf 等配置) 通常来说为 IPv6 优先。
- 当填写其他值时，将使用 Xray-core [内置 DNS 服务器](../dns.md) 服务器进行解析。若不存在DNSObject，则使用系统DNS。若有多个符合条件的IP地址时，核心会随机选择一个IP作为目标IP。
- `"IPv4"` 代表尝试仅使用 IPv4 进行连接，`"IPv4v6"` 代表尝试使用 IPv4 或 IPv6 连接，但对于双栈域名，使用 IPv4。（v4v6 调换后同理，不再赘述）
- 当在内置DNS设置了 `"queryStrategy"` 后，实际行为将会与这个选项取并，只有都被包含的IP类型才会被解析，如 `"queryStrategy": "UseIPv4"` `"domainStrategy": "UseIP"`，实际上等同于 `"domainStrategy": "UseIPv4"`。
- 当使用 `"Use"` 开头的选项时，若解析结果不符合要求（如，域名只有IPv4解析结果但使用了UseIPv6），则会回落回AsIs。
- 当使用 `"Force"` 开头的选项时，若解析结果不符合要求，则该连接会无法建立。

::: tip TIP
当使用 `"UseIP"`、`"ForceIP"` 模式时，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，核心会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。若手动指定了单种IP类型（如UseIPv4），但与 `sendThrough` 指定的本地地址不匹配，将会导致连接失败。
:::

::: danger

启用了此功能后，不当的配置可能会导致死循环。

一句话版本：连接到服务器，需要等待 DNS 查询结果；完成 DNS 查询，需要连接到服务器。

> Tony: 先有鸡还是先有蛋?

详细解释：

1. 触发条件：代理服务器（proxy.com）。内置 DNS 服务器，非 Local 模式。
2. Xray 尝试向 proxy.com 建立 TCP 连接 **前** ，通过内置 DNS 服务器查询 proxy.com。
3. 内置 DNS 服务器向 dns.com 建立连接，并发送查询，以获取 proxy.com 的 IP。
4. **不当的** 的路由规则，导致 proxy.com 代理了步骤 3 中发出的查询。
5. Xray 尝试向 proxy.com 建立另一个 TCP 连接。
6. 在建立连接前，通过内置 DNS 服务器查询 proxy.com。
7. 内置 DNS 服务器复用步骤 3 中的连接，发出查询。
8. 问题出现。步骤 3 中连接的建立，需要等待步骤 7 中的查询结果；步骤 7 完成查询，需要等待步骤 3 中的连接完全建立。
9. Good Game！

解决方案：

- 改内置 DNS 服务器的分流。
- 用 Hosts。
- ~~如果你还是不知道解决方案，就别用这个功能了。~~

因此，**不建议** 经验不足的用户擅自使用此功能。
:::

> `dialerProxy`: ""

一个出站代理的标识。当值不为空时，将使用指定的 outbound 发出连接。可用于支持传输配置的链式转发。

::: danger
此选项与 ProxySettingsObject.Tag 不兼容
:::

> `acceptProxyProtocol`: true | false

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `trustedXForwardedFor`: [ string ]

仅用于 `XHTTP`、`WebSocket`、`HTTPUpgrade` 这三个基于 HTTP 的 inbound。

用于限制何时信任请求头里的 `X-Forwarded-For`，并用它覆写 `SourceIP`。

默认不设置时，仍保持旧行为：只要请求中带有 `X-Forwarded-For`，Xray 就会读取它。

设置后，数组中的每一项都表示一个额外要求存在的请求头名。只有当请求中存在其中任意一个头时，Xray 才会信任 `X-Forwarded-For`；这些头的值无所谓，只检查键是否存在。

::: details 示例与用途

```json
"sockopt": {
  "trustedXForwardedFor": ["ABCDEF", "XYZ"]
}
```

这表示请求中必须额外出现 `ABCDEF` 或 `XYZ` 这两个头里的任意一个，Xray 才会接受同一请求中的 `X-Forwarded-For` 作为来源 IP。

通常可以让 CDN、Nginx 等你自己信任的 HTTP 反代额外注入一个只有服务端知道的自定义请求头，以避免客户端伪造来源 IP。
:::

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

> `tcpNoDelay`: true | false

该选项已被删除，因为 golang 默认启用 TCP no delay。 相反地，如果想要禁用，请通过使用 customSockopt 禁用。

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

使用 SRV 记录或 TXT 记录指定出站使用的目标地址/端口，默认 `none` 即关闭

查询直接通过系统DNS而不是Xray的内置DNS, 尝试去查询的域名将会是出站中的域名。如果查询失败请求会按原地址和端口发出

`Srv` 开头代表查询 SRV 记录(标准格式), `Txt` 开头代表查询 TXT 记录(格式形如 `127.0.0.1:80`)

`PortOnly` 仅重置端口 `AddressOnly` 仅重置地址 `PortAndAddress` 则重置地址和端口

该选项生效在 sockopt 里的 domainStrategy 解析之前，地址重置后仍会按 domainStrategy 的规则进行解析(如果有), 但是在 Freedom 的 domainStrategy 之后，如果在其中设置了解析为 IP 则本选项无法生效。

PS: 如果有正常上网的域名流量被 AsIs 的 freedom 出站送过来，那么在此设置后会尝试解析并重置地址和端口，比如核心会尝试查询 google.com 的 SRV 记录并按记录重置目标。

> `customSockopt`: []

一个数组，用于高级用户指定需要的任何 sockopt, 理论上上述所有与连接有关的设置均可以在此等价设置, 自然也可以设置存在但是核心未添加的其他选项。目前支持 Linux Winows Darwin 操作系统。下方示例等价于核心中的 `"tcpcongestion": "bbr"`

使用前请确保你了解 Socket 编程。

```json
"customSockopt": [
  {
    "system": "linux",
    "type": "str",
    "level":"6",
    "opt": "13",
    "value": "bbr"
  }
]
```

> `system`: ""

可选，指定生效的系统，如果运行的系统不匹配则跳过该 sockopt. 目前可选 `linux` `windows` `darwin` (全部小写). 若留空则直接执行

> `type`: ""

必填，设置的类型，目前可选int或str.

> `level`: ""

可选，协议级别，用于指定生效范围，默认为6, 即TCP.

> `opt`: ""

操作的选项名称，使用十进制(此处示例为 TCP_CONGESTION 的值 定义为 0xd 转换为10进制即为13)

> `value`: ""

要设置的选项值，此处示例为设置为bbr.

当 type 指定为 int 时需要使用十进制数字。

> `happyEyeballs`: [HappyEyeballsObject](#happyeyeballsobject)

RFC-8305 实现的 happyEyeballs，仅适用于 TCP。当目标为域名时对它们竞速并选择第一个成功的返回，仅当 `Sockopt.domainStrategy` 被设置为非 `AsIs` 时生效。

注意：`UseIPv4v6` / `ForceIPv4v6` 会使可用的 IP 列表被缩减到仅剩 IPv4，仅查询失败时才会回退查询 IPv6。不推荐这么用。建议使用 UseIP / ForceIP 配合 `HappyEyeballs.interleave`。

::: warning
使用这个功能时不要使用 `Freedom` 出站的 `domainStrategy`, 这会导致 `Sockopt` 只能看到被替换完毕的 IP.
:::

### HappyEyeballsObject

```json
"happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4
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
