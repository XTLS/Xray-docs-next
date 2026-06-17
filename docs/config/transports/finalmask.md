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
        // [!code focus:33]
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
    }
  ]
}
```

## TCPMask

一个数组，用以伪装核心发出的 TCP流量，数组第一个为最外层伪装。

```json
{
  "finalmask": {
    // [!code focus:6]
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

> `settings`: string

该伪装类型的具体设置。

每个类型的字段见下

### header-custom

```json
{
  "type": "header-custom",
  // [!code focus:35]
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
  // [!code focus:6]
  "settings": {
    "packets": "tlshello",
    "length": "100-200",
    "delay": "10-20",
    "maxSplit": "3-6"
  }
}
```

控制发出的 TCP 分片，在某些情况下可以欺骗审查系统，比如绕过 SNI 黑名单。

`"length"`、`"delay"`、`"maxSplit"` 均为 [Int32Range](../../development/intro/guide.md#int32range) 类型

`"packets"`：支持两种分片方式 "1-3" 是 TCP 的流切片，应用于客户端第 1 至第 3 次写数据。"tlshello" 是 TLS 握手包切片。

`"length"`：分片包长 (byte)，不能为 0。

`"delay"`：分片间隔（ms）

当其为 0 且设置 `"packets": "tlshello"` 时，被分片的 Client Hello 将会在一个TCP包中发送（如果其原始大小未超过MSS或MTU导致被系统自动分片）

`"maxSplit"`：最大分片次数，限制单个包被分割的片数。为 0 表示不限制。

### sudoku

```json
{
  "type": "sudoku",
  // [!code focus:10]
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

## UDPMask

一个数组，用以伪装核心发出的 UDP 流量，数组第一个为最外层伪装。

```json
{
  "finalmask": {
    // [!code focus:6]
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

> `settings`: string

该伪装类型的具体设置。

每个类型的字段见下

### header-custom

总是合包到数据包头。

```json
{
  "type": "header-custom",
  // [!code focus:18]
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
  // [!code focus:4]
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
  // [!code focus:12]
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

`type`: `packet` 类型，`array | str | hex | base64`，默认为 array。

`packet`: 添加固定数据，与 `rand` 冲突

`delay`: 单位毫秒，发送噪声后延迟指定时间后再发下一个。

### salamander

Salamander 混淆。（来自 Hysteria2）

```json
{
  "type": "salamander",
  // [!code focus:3]
  "settings": {
    "password": "your-password"
  }
}
```

### sudoku

```json
{
  "type": "sudoku",
  // [!code focus:10]
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

利用 DNS 查询来传输数据（类似 DNSTT）。它将执行标准的 DNS 查询来传输载荷，支持 TXT、A、AAAA 查询类型。

由于技术限制，它给出的 MTU 非常小，无法使用 QUIC，建议搭配 mKCP 使用。推荐的 MTU 值：客户端 130，服务端若为 TXT（几乎传递原始字节信息） 则 900， AAAA 酌情修改为 1/2 以下，A 则为 1/8 以下（理论编码性能差距，实际取决于中间转发器能容忍回复中存在多少 AAAA/A 记录）。

因为执行的查询是标准的，它可以透过任何 UDP DNS 服务器进行转发，尽管效率可能十分不理想。

要使用这个功能，需要服务端监听 53 端口，然后代理协议将目标指向一个 DNS 服务器（如 8.8.8.8:53），并且你拥有 `domains` 中的域名，然后将其 NS 记录指向服务端。

比如持有 example.com，那么设置 a.example.com A记录 指向 ip，设置 t.example.com NS记录 指向 a.example.com，最后使用的是 t.example.com。设置 A记录 的不能为 NS记录 的子域。

```json
{
  "type": "xdns",
  // [!code focus:4]
  "settings": {
    "domains": ["t.example.com"],
    "resolvers": ["t.example.com+udp://8.8.8.8:53"]
  }
}
```

`domains`: 服务端使用，域名列表。支持指定查询类型 `domain:method`，method 可为 `txt`、`a`、`aaaa`，不指定则不限制查询类型。

`resolvers`: 客户端使用，DNS 解析器列表。格式为 `domain[:method]+udp://server:port`，method 可为 `txt`（默认）、`a`、`aaaa`。

`domains` 与 `resolvers` 至少填写一个。

### xicmp

```json
{
  "type": "xicmp",
  // [!code focus:4]
  "settings": {
    "dgram": false, // optional
    "ips": [] // optional
  }
}
```

`dgram`: 更低的权限，仅客户端 (Linux, Mac, iOS)

`ips`: ips

### realm

自建 https://github.com/apernet/hysteria-realm-server

```json
{
  "type": "realm",
  // [!code focus:8]
  "settings": {
    "url": "realm://public@xxx/your-realm-name",
    "stunServers": [
      "stun.nextcloud.com:3478",
      "global.stun.twilio.com:3478"
    ],
    "tlsConfig": {} // optional
  }
}
```

`url`: realm[+http]\://token@host[:port]/id

`stunServers`: 多个 ipv4/ipv6 用于进行 NAT 端口预测

`tlsConfig`: 同 tlsSettings

连接不通需要 debug 级别日志，可能的影响因素有 stun提供商 realm提供商 punch包影响了quic握手（极小概率）

## quicParams

```json
{
  "finalmask": {
    // [!code focus:19]
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

用于 XHTTP H3 以及 hysteria 的 QUIC 配置调整。

> `congestion`: reno | bbr | brutal | force-brutal

拥塞控制算法，Hysteria 默认为 `brutal`，XHTTP H3 默认使用 `bbr`。

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
