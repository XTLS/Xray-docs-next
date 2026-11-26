# FinalMask

FinalMask 在核心处理完包括 TLS/REALITY 在内的传输层加密后，对流量进行最后一层伪装。

可用于 TCP、UDP 方向的多种伪装，以及 QUIC 相关参数调整。

## FinalMaskObject

`FinalMaskObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `finalmask` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        // [!field focus]
        "finalmask": {
          "tcp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "udp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "quicParams": {}
        }
      }
    }
  ]
}
```

## TCPMask

一个数组，用以伪装核心发出的 TCP流量，数组第一个为最内层伪装。

```json
{
  "finalmask": {
    // [!field focus]
    "tcp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: string

该层伪装的类型。

> `settings`: object

该伪装类型的具体设置。

每个类型的字段见下

### header-custom

```json
{
  "type": "header-custom",
  // [!field focus]
  "settings": {
    "clients": [
      [
        {
          "delay": 0,
          "rand": 0,
          "randRange": "0-255",
          "type": "",
          "packet": []
        }
      ]
    ],
    "servers": [
      [
        {
          "delay": 0,
          "rand": 0,
          "randRange": "0-255",
          "type": "",
          "packet": []
        }
      ]
    ],
    "errors": [
      [
        {
          "delay": 0,
          "rand": 0,
          "randRange": "0-255",
          "type": "",
          "packet": []
        }
      ]
    ]
  }
}
```

`clients[n][m].delay`: 单位毫秒，为 0 则于前面的粘包发送。

`clients[n][m].rand`: 添加指定长度随机字节，与 `packet` 冲突。

`clients[n][m].randRange`: 随机字节范围，默认 0-255。

`clients[n][m].type`: `packet` 类型，`array | str | hex | base64`，默认为 array。

`clients[n][m].packet`: 添加固定数据，与 `rand` 冲突。

### fragment

```json
{
  "type": "fragment",
  // [!field focus]
  "settings": {
    "packets": "tlshello",
    "lengths": ["3-5", "6-8", "10-20"],
    "delays": ["10-20"],
    "maxSplit": "3-6"
  }
}
```

控制发出的 TCP 分片，在某些情况下可以欺骗审查系统，比如绕过 SNI 黑名单。

`"length"`、`"delay"`、`"maxSplit"` 均为 [Int32Range](../../development/intro/guide.md#int32range) 类型

`"packets"`：支持两种分片方式 "1-3" 是 TCP 的流切片，应用于客户端第 1 至第 3 次写数据。"tlshello" 是 TLS 握手包切片。

`"lengths"`：分片包长 (byte)

数组的第 n 个表示当前处理的单个数据包所切出的第 n 个分片期望的长度，最后一项则持续对当前数据包后续切出的分片生效。除最后一项外可以为 0（否则会导致无限空转），对于 TCP 流切片表现为不发送数据，对于 tlshello 则表现为发送违反 RFC 的空 TLS record（部分实现容忍，但是不包括 golang）。

`"delays"`：分片间隔（ms）

数组的第 n 个表示当前处理的单个数据包所切出的第 n 个分片发送后等待的间隔，最后一项则持续对当前数据包后续切出的分片生效。

当其为 0 且设置 `"packets": "tlshello"` 时，被分片的 Client Hello 将会在一个TCP包中发送（如果其原始大小未超过MSS或MTU导致被系统自动分片）

`"maxSplit"`：最大分片次数，限制单个包被分割的片数。为 0 表示不限制。

### sudoku

```json
{
  "type": "sudoku",
  // [!field focus]
  "settings": {
    "password": "",
    "ascii": "",

    "customTable": "", // 官方文档字段名为 custom_table
    "customTables": [""], // 官方文档字段名为 custom_tables

    "paddingMin": 0, // 官方文档字段名为 padding_min
    "paddingMax": 0 // 官方文档字段名为 padding_max
  }
}
```

含义见其 [官方文档](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.zh_CN.md) 文档字段

### filter

```json
{
  "type": "filter",
  // [!field focus]
  "settings": {
    "allowedSourceIPs": ["geoip:cn", "10.0.0.0/8", "fd00::/8"],
    "blockedSourceIPs": ["10.20.0.0/16", "fd00:20::/48"]
  }
}
```

流量过滤器，用于访问控制。目前仅支持[入站](../inbound.md)来源 IP 筛选（出站不生效）。在 TCP 三次握手成功后进行过滤。

如无特殊原因，应将 `filter` 放在最外层，即数组的最后一项。

`allowedSourceIPs`: 来源 IP 白名单。非空时，来源 IP 必须存在且匹配其中任一项才会放行。

`blockedSourceIPs`: 来源 IP 黑名单。来源 IP 匹配其中任一项时会被拒绝。

两个字段均支持 GeoIP（如 `geoip:cn`）以及 IPv4、IPv6 的 CIDR 范围，用法与[路由规则中的 IP 匹配](../routing.md#ruleobject)类似。

黑白名单同时存在时，来源 IP 必须命中白名单且不命中黑名单才会放行。

## UDPMask

一个数组，用以伪装核心发出的 UDP 流量，数组第一个为最内层伪装。

```json
{
  "finalmask": {
    // [!field focus]
    "udp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: string

该层伪装的类型。

> `settings`: object

该伪装类型的具体设置。

每个类型的字段见下

### header-custom

总是合包到数据包头。

```json
{
  "type": "header-custom",
  // [!field focus]
  "settings": {
    "client": [
      {
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ],
    "server": [
      {
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  }
}
```

`client[n].rand`: 添加指定长度随机字节，与 `packet` 冲突。

`client[n].randRange`: 随机字节范围，默认 0-255。

`client[n].type`: `packet` 类型，`array | str | hex | base64`，默认为 array。

`client[n].packet`: 添加固定数据，与 `rand` 冲突。

### mkcp-legacy

```json
{
  "type": "mkcp-legacy",
  // [!field focus]
  "settings": {
    "header": "", // dns dtls srtp utp wechat wireguard
    "value": "" // password domain
  }
}
```

旧 mKCP 的包头伪装/混淆，`value` 的含义随 `header` 变化。注意伪造只是简单的包头伪造，不代表实现了完整协议。

> 为空时: 进行 AES-128-GCM 加密，`value` 为其密码，若 `value` 为空则改为使用默认的简单 xor 混淆。

> `dns`: 伪造为 DNS 查询，`value` 为指定的域名，为空时默认 `www.baidu.com`。

> `dtls`: 伪造为 DTLS 1.2 应用数据，`value` 无作用。

> `srtp`: 伪造为 SRTP。`value` 无作用。

> `utp`: 伪造为 uTP（BitTorrent）。`value` 无作用。

> `wechat`: 伪造为微信视频通话。`value` 无作用。

> `wireguard`: 伪造为 WireGuard。`value` 无作用。

### noise

在发送数据前发送的噪声。

```json
{
  "type": "noise",
  // [!field focus]
  "settings": {
    "reset": "30-60",
    "noise": [
      {
        "rand": "1-8192",
        "randRange": "0-255",
        "type": "",
        "packet": [],
        "delay": "10-20"
      }
    ]
  }
}
```

`reset`: [Int32Range](../../development/intro/guide.md#int32range) 类型，单位秒。噪声发送后经过该时间后重置，允许对同一地址再次发送噪声。为 0 表示不重置（仅发送一次）。

`rand`: 添加随机或指定长度随机字节，与 `packet` 冲突。

`randRange`: 随机字节范围，默认 0-255。

`type`: `packet` 类型，`array | str | hex | base64 | exp`，默认为 array。

`packet`: 添加固定数据，与 `rand` 冲突

`type` 为 `exp` 时，`packet` 是一个表达式字符串，由它拼成一个噪声包，每次发送时重新生成，因此可以携带时间戳等变化的内容。表达式的各部分按顺序拼接成一个包：

- `<b hex>`：固定字节，以十六进制书写，可省略的 `0x` 前缀会被忽略
- `<r N>` 或 `<r A-B>`：`N` 个随机字节，或 `A` 到 `B` 之间随机个数
- `<rc N>` 或 `<rc A-B>`：同上，随机字母（`a-zA-Z`）
- `<rd N>` 或 `<rd A-B>`：同上，随机数字（`0-9`）
- `<t>`：当前 Unix 时间（秒），4 字节大端
- `<c>`：计数器，4 字节大端，每次加一
- `<n>`：8 个随机字节

例如 `{"type": "exp", "packet": "<b 0d0a0d0a><t><r 24>"}` 会把 `\r\n\r\n`、时间戳和 24 个随机字节作为一个包发送。

`delay`: 单位毫秒，发送噪声后延迟指定时间后再发下一个。

### salamander

Salamander 混淆。（来自 Hysteria2）

```json
{
  "type": "salamander",
  // [!field focus]
  "settings": {
    "password": "your-password",
    "packetSize": "512-1200"
  }
}
```

`password`: 混淆密码。

#### gecko

`packetSize`: [Int32Range](../../development/intro/guide.md#int32range)

不为空则启用 Gecko 混淆，对 QUIC 的长包头数据包进行额外分片填充混淆（短包头直接使用 Salamander），packetSize 指定具体分片大小，上限不能超过 2048。

### sudoku

```json
{
  "type": "sudoku",
  // [!field focus]
  "settings": {
    "password": "",
    "ascii": "",

    "customTable": "",
    "customTables": [""],

    "paddingMin": 0,
    "paddingMax": 0
  }
}
```

同 TCP 版本

### xdns

利用 DNS 查询来传输数据（类似 DNSTT）。客户端将携带载荷的标准 DNS 查询发给 `resolvers` 中的解析器，由它们转给作为 `domains` 中域名的权威服务器的服务端，服务端以 TXT、CNAME、A 或 AAAA 记录应答。可以使用任何 DNS 解析器，支持 UDP、TCP 和 DoH，尽管效率可能十分不理想。

要使用这个功能，需要持有一个域名，比如 example.com：设置 a.example.com A记录 指向服务端 IP，设置 t.example.com NS记录 指向 a.example.com，然后在两端的 `domains` 中使用 t.example.com，服务端监听 53 端口。设置 A记录 的不能为 NS记录 的子域。

```json
{
  "type": "xdns",
  // [!field focus]
  "settings": {
    "domains": [
      {
        "names": ["t.example.com"],
        "lenLimit": 255, // 0-255; default: 255
        "labelLimit": 63, // 0-63; default: 63
        "types": [1, 5, 16, 28], // 1:A 5:CNAME 16:TXT 28:AAAA; client default: 16, server default: all
        "edns0": 1232, // 0,512-4096; default: 0
        "alphabet": "v9u8t0s1rqponmlkjihgfedcba765432" // 32 of a-z0-9; default: base32
      }
    ],
    "resolvers": [
      {
        "addrs": ["udp://8.8.8.8:53", "tcp://1.1.1.1"] // [protocol://]host[:port], no defaults
      },
      {
        "addrs": ["https://dns.google/dns-query"],
        "worker": 32, // tcp, https; default: 32
        "tlsConfig": { "serverName": "dns.google" }, // required for https
        "quicConfig": {} // https with "alpn": ["h3"]
      }
    ],
    "extraPoll": 0 // 0-3; default: 0
  }
}
```

仅可搭配 mKCP（无法使用 QUIC），推荐设置 tti 200。仅服务端需要配置 mKCP 的 mtu，即一个应答能携带的数据量，因为客户端会把数据包拆分到多个查询中。它取决于 `edns0` 和记录类型，CNAME 在 AAAA 与 TXT 之间；应按客户端所用类型中最小的设置，放不进应答的数据包会被丢弃：

- edns0 为 512 时，A 39 TXT 215 AAAA 117
- edns0 为 1232 时，A 174 TXT 932 AAAA 492

对于 A 和 AAAA，实际还取决于中间的解析器能容忍一个应答中存在多少条记录。

每个查询随机使用客户端 `names` 和 `types` 中的一个。客户端默认的 TXT 每个应答携带的数据最多。

- `lenLimit` 和 `labelLimit` 限制查询域名及其每一段（label）的长度，用于拒绝长域名的解析器。
- `alphabet` 用 `a`-`z` 和 `0`-`9` 中的 32 个字符（各不相同，大小写均可）代替查询域名中的 base32（`a`-`z`、`2`-`7`），客户端与服务端必须相同。在看起来像 base32 的域名会被阻断的地方，应使用同时包含 `0`、`1`、`8`、`9`（base32 中没有的字符）的字母表，使域名很少再像 base32。
- `resolvers`（客户端）：`udp://`（默认）和 `tcp://` 默认使用 53 端口；`https://` 为 DoH，使用不带 User-Agent 的 POST 请求。`worker` 对 `tcp://` 是连接数，对 `https://` 是同时进行的请求数。
- `tlsConfig`（`https://` 必填）为 [TLSObject](./tls.md#tlsobject)：除非用 `fingerprint` 另行指定，Client Hello 为 Chrome 的；`serverName` 可以与 URL 的主机不同，HTTP Host 仍为 URL 的主机，可用于域前置等。`alpn` 仅为 `["h3"]` 时，DoH 使用 HTTP/3，由 `quicConfig`（[quicParams](#quicparams)，默认模仿 Chrome）配置；否则使用基于 TLS 的 HTTP/2。
- `extraPoll`（客户端）：服务端只能在应答中发送数据，因此客户端会在每个查询之后额外发送这么多个空查询，可以提高下载速度，代价是查询更多。

### xicmp

```json
{
  "type": "xicmp",
  // [!field focus]
  "settings": {
    "dgram": false, // optional
    "ips": [] // optional
  }
}
```

`dgram`: 更低的权限，仅客户端 (Linux, Mac, iOS)

`ips`: 暂不支持 cidr

### realm

自建 https://github.com/apernet/hysteria-realm-server

```json
{
  "type": "realm",
  // [!field focus]
  "settings": {
    "url": "realm://public@xxx/your-realm-name",
    "stunServers": [
      "stun.nextcloud.com:3478",
      "global.stun.twilio.com:3478"
    ],
    "tlsConfig": {}, // optional
    "ipMode": "dual",
    "portMapping": {
      "enabled": false,
      "timeout": 10,
      "lifetime": 600
    }
  }
}
```

`url`: realm[+http]\://token@host[:port]/id

`stunServers`: 多个 ipv4/ipv6 用于进行 NAT 端口预测

`tlsConfig`: 同 tlsSettings

`ipMode`: 控制 stun 的域名地址解析以及 realm peer 的过滤

`portMapping.enabled`: 启用固定端口映射，更强的入站可达性

`portMapping.timeout`: 单位秒

`portMapping.lifetime`: 单位秒

连接不通需要 debug 级别日志，可能的影响因素有 stun提供商 realm提供商

### udphop

```json
{
  "type": "udphop",
  // [!field focus]
  "settings": {
    "mode": "intervallocal,intervalremote", // intervallocal intervalremote perconnremote
    "interval": "5-10",
    "remoteIPs": [""],
    "remotePorts": "20000-50000,443"
  }
}
```

`intervallocal`: 仅支持 wireguard hysteria xhttph3

`intervalremote`: 需要搭配 iptables 或 nftables

`perconnremote`: 需要搭配 iptables 或 nftables

`mode`: 逗号分割，一般为 `intervallocal,intervalremote` 或仅 `intervallocal` 或仅 `perconnremote`

`interval`: 单位秒

`remoteIPs`: 仅 mode 含 intervalremote 或 perconnremote 时需要，未填继承上层地址，支持 cidr

`remotePorts`: 仅 mode 含 intervalremote 或 perconnremote 时需要，未填继承上层地址

### filter

流量过滤器，用于访问控制。目前仅支持[入站](../inbound.md)来源 IP 筛选（出站不生效）。UDP 逐包过滤，其余配置和行为同 [TCP 版本](#filter)。

如无特殊原因，应将 `filter` 放在最外层，即数组的最后一项。

## quicParams

```json
{
  "finalmask": {
    // [!field focus]
    "quicParams": {
      "congestion": "force-brutal",
      "bbrProfile": "standard",
      "debug": false,
      "brutalUp": "60 mbps",
      "brutalDown": 0,
      "udpHop": {
        "ports": "20000-50000",
        "interval": "5-10"
      },
      "initStreamReceiveWindow": 8388608,
      "maxStreamReceiveWindow": 8388608,
      "initConnectionReceiveWindow": 20971520,
      "maxConnectionReceiveWindow": 20971520,
      "maxIdleTimeout": 30,
      "keepAlivePeriod": 0,
      "disablePathMTUDiscovery": false,
      "maxIncomingStreams": 1024
    }
  }
}
```

用于 XHTTP H3、hysteria 以及 MASQUE H3 的 QUIC 配置调整。

> `congestion`: reno | bbr | brutal | force-brutal

拥塞控制算法，Hysteria 默认为 `brutal`，XHTTP H3 与 MASQUE 默认使用 `bbr`，MASQUE 的 `brutal` 也按 `bbr` 运行。

`reno`/`bbr`: 知名算法。

`brutal`: 与对端协商固定发包速率或降级到 BBR。

`force-brutal`: 同 `brutal`，但强制使上行使用 `brutalUp` 固定发包速率，无视对端协商。

注意 XHTTP H3 因为无协商机制所以无法使用 `brutal` 模式，但是支持无协商过程的 `force-brutal`。

> `bbrProfile`: conservative | standard | aggressive

当 QUIC 阻塞控制被选择为 BBR 时，控制其 BBR 预设。 默认为 `standard`，`conservative` 稍微更保守，`aggressive` 则稍微更激进。

> `debug`: false | true

启用 bbr/brutal congestion control 日志。

> `brutalUp`: string

> `brutalDown`: string

限制的上传/下载速率。默认值为 0。

格式用户友好，支持各种常见的比特每秒写法，包括 `1000000` `100kb` `20 mb` `100 mbps` `1g` `1 tbps` 等等等，大小写不敏感，单位之间可以带或者不带空格，无单位时默认为 bps（比特每秒），不能低于 65535 bps。

协商行为和 Hysteria brutal 一致：

服务端的值将限制客户端可以选择的最大 Brutal 模式速率，为 0 表示不限制客户端。

客户端为 0 则表示使用 BBR 模式，不为 0 则表示使用 Brutal 模式，会受到服务端的限制。

注意相对论，服务端的上传是客户端的下载，服务端的下载是客户端的上传。

> `udpHop`: {"ports": string, "interval": number}

UDP 端口跳跃配置。

ports 为跳跃的端口范围，可以是一个数值类型的字符串，如 `"1234"`；或者一个数值范围，如 `"1145-1919"` 表示端口 1145 到端口 1919，这 775 个端口。可以使用逗号进行分段，如 `11,13,15-17` 表示端口 11、端口 13、端口 15 到端口 17 这 5 个端口。

interval 为端口跳跃间隔，单位为秒，至少为 5，默认 30 秒。

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

这四个为具体的 QUIC 窗口参数，**除非你完全明白自己在做什么，否则不建议修改这些值**。如果要改，建议保持流接收窗口与连接接收窗口的比例为 2:5

> `maxIdleTimeout`: number

最长空闲超时时间（秒）。服务器会在多长时间没有收到任何客户端数据后关闭连接，范围为 4~120 秒，默认为 30 秒。

> `keepAlivePeriod`: number

QUIC KeepAlive 间隔（秒）。范围为 2~60 秒。默认禁用。

> `disablePathMTUDiscovery`: bool

是否禁用路径 MTU 发现。

其他实现里对于 !linux && !windows && !darwin OS 为强制禁用，xray 里则非强制，如果你为非 (linux || windows || darwin) 可能需要手动禁用。

> `maxIncomingStreams`: number

服务端参数，如果设置则不得小于 8
