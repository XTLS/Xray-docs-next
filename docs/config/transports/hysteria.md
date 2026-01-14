# Hysteria

Hysteria2 的底层 QUIC 传输的 Xray 实现，通常需要搭配 [hysteria2 出站](../outbounds/hysteria2.md) 使用。

## HysteriaObject

`HysteriaObject` 对应传输配置的 `hysteriaSettings` 项。

```json
{
  "version": 2,
  "auth": "password",
  "up": "0",
  "down": "0",
  "udphop": {
    "port": "1145-1919",
    "interval": "30s"
  },
  "initStreamReceiveWindow": 8388608,
  "maxStreamReceiveWindow": 8388608,
  "initConnectionReceiveWindow": 20971520,
  "maxConnectionReceiveWindow": 20971520,
  "maxIdleTimeout": 30,
  "keepAlivePeriod": 0,
  "disablePathMTUDiscovery": false
}
```

> `version`: number

Hysteria 版本，必须为 2。

> `auth`: string

Hysteria 认证密码，服务端和客户端需要保持一致。

> `up`: string

> `down`: string

限制的上传/下载速率。默认值为 0.

格式用户友好，支持各种常见的比特每秒写法，包括 `1000000` `100kb` `20 mb` `100 mbps` `1g` `1 tbps` 等等等，大小写不敏感，单位之间可以带或者不带空格，无单位时默认为 bps（比特每秒），不能低于 65535 bps。

协商行为和 Hysteria 原版一致：

服务端的值将限制客户端可以选择的最大 Brutal 模式速率，为 0 表示不限制客户端。

客户端为 0 则表示使用 BBR 模式，不为 0 则表示使用 Brutal 模式，会受到服务端的限制。

注意相对论，服务端的上传是客户端的下载，服务端的下载是客户端的上传。

> `udphop`: {"port": string, "interval": string}

UDP 端口跳跃配置。

port 为跳跃的端口范围，可以是一个数值类型的字符串，如 `"1234"`；或者一个数值范围，如 `"1145-1919"` 表示端口 1145 到端口 1919，这 775 个端口。可以使用逗号进行分段，如 `11,13,15-17` 表示端口 11、端口 13、端口 15 到端口 17 这 5 个端口。

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
