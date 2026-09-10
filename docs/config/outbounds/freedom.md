# Freedom（fragment、noises）

Freedom 是一个直连出站协议，通常也是流量的终结点：它接收上游传来的 TCP 或 UDP 流量，并直接向最终目标地址发起连接、收发数据。

::: warning
该出站在服务器端和反向代理端存在默认安全策略，可能会阻止一些目标，放行方式见下文 `finalRules`。
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` 对应 [`OutboundObject`](../outbound.md) 中的 `settings` 项。

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "freedom",
      // [!code focus:28]
      "settings": {
        "redirect": "127.0.0.1:3366",
        "userLevel": 0,
        "fragment": {
          "packets": "tlshello",
          "length": "100-200",
          "interval": "10-20" // 单位ms
        },
        "noises": [
          {
            "type": "base64",
            "packet": "7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
            "delay": "10-16"
          }
        ],
        "proxyProtocol": 0,
        "finalRules": [
          {
            "action": "block",
            "network": "tcp",
            "port": "22,25,465,587"
          },
          {
            "action": "block",
            "ip": ["geoip:cn"]
          }
        ]
      }
    }
  ]
}
```

::: tip
Freedom 的目标域名解析策略由 [sockopt.domainStrategy](../transports/sockopt.md#sockoptobject) 控制。
:::

> `redirect`: address_port

Freedom 会将连接的当前目标地址和端口改写为 `redirect` 中指定的地址和端口。

其值为一个字符串，样例：`"127.0.0.1:80"`、`":1234"`。

当地址不指定时，如 `":443"`，Freedom 不会修改原先的目标地址。
当端口为 `0` 时，如 `"xray.com:0"`，Freedom 不会修改原先的端口。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。如不指定，默认为 0。

> `fragment`: [FragmentObject](#fragmentobject)

一些键值对配置项，用于控制发出的 TCP 分片，在某些情况下可以欺骗审查系统，比如绕过 SNI 黑名单。

> `noises`: \[ [NoiseObject](#noiseobject) \]

UDP noise, 用于在发出 UDP 连接前发出一些随机数据作为“噪声”，出现该结构体则视为启用，可能可以欺骗嗅探器，也可能破坏正常连接。Use at your own risk. 出于这个原因，它会绕过 53 端口因为这会破坏 DNS。

为一个数组，可以定义多个要发出的噪声数据包，数组中每个元素为一个 [NoiseObject](#noiseobject)。

> `proxyProtocol`: number

PROXY protocol 通常配合 `redirect` 重定向到开启了 PROXY protocol 协议的 Nginx 或其他后端服务中。如果后端服务不支持 PROXY protocol 协议，连接将会被断开。

proxyProtocol 的值为 PROXY protocol 版本号，可选 `1` 或 `2`，如不指定，默认为 `0` 不启用。

> `finalRules`: \[ [FinalRuleObject](#finalruleobject) \]

按顺序匹配 Freedom 最终出站规则，用于放行或阻止连接目标。

相比在 `routing` 中封锁，`finalRules` 在 Freedom 最终出站阶段、拨号前后匹配；此外 UDP 在收发时还会逐包匹配因此更严谨、彻底。（每条规则匹配耗时约 50~150ns 无需担心性能）

::: details 目标为域名？
目标为域名且需要执行规则时，Freedom 会在拨号前按照 `sockopt.domainStrategy` 解析域名，然后对返回的所有 IP 分别按规则顺序匹配；只要其中一个 IP 被阻止，就会阻止整个请求。

拨号成功后，Freedom 还会按规则再次检查实际连接的远端 IP。因此，拨号前解析失败或两次解析结果不一致时，仍可能在黑洞前发出 TCP 握手报文。

每个目标为域名的 UDP 数据包在发送时还会解析域名，但逐包检查只对本次选中的目标 IP 按规则顺序匹配并决定是否拦截，不会检查解析返回的所有 IP。
:::

::: tip
若此出站配置了 `sockopt.dialerProxy`，Freedom 就不再是最终出站，因此不会执行 `finalRules` 或下述默认安全策略。
:::

::: warning
服务器端和反向代理端存在默认兜底安全策略：

若未命中任何显式规则，则使用内置兜底规则：来自 VLESS 反向代理的流量默认阻止所有目标；来自 `VLESS`、`VMess`、`Trojan`、`Shadowsocks`、`Hysteria` 或 `WireGuard` 入站的流量默认阻止私有及保留 IP；其它流量默认全部放行。

若服务器端需要允许客户端访问某些内网服务，应显式配置 `allow` 规则，并尽量只放行必要的 `network`、`ip` 和 `port`。
:::

### FragmentObject

```json
{
  "packets": "tlshello",
  "length": "100-200",
  "interval": "10-20"
}
```

> `packets`: string

支持两种分片方式 "1-3" 是 TCP 的流切片，应用于客户端第 1 至第 3 次写数据。"tlshello" 是 TLS 握手包切片。

> `length`: [Int32Range](../../development/intro/guide.md#int32range)

分片包长 (byte)

> `interval`: [Int32Range](../../development/intro/guide.md#int32range)

分片间隔（ms）

当其为 0 且设置 `"packets": "tlshello"` 时，被分片的 Client Hello 将会在一个 TCP 包中发送（如果其原始大小未超过 MSS 或 MTU 导致被系统自动分片）

### NoiseObject

```json
{
  "type": "base64",
  "packet": "7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
  "delay": "10-16"
}
```

> `type`: string

噪声数据包类型，目前支持`"rand"`(随机数据), `"str"`(用户自定义字符串), `"base64"`(base64编码过的自定义二进制数据)

> `packet`: string

基于前面的 `type` 要发送的数据包内容

- 当 `type` 为 rand 时，这里指定随机数据的长度 可以是固定值 `"100"` 或者浮动值 `"50-150"`
- 当 `type` 为 str 时，这里指定要发送的字符串
- 当 `type` 为 hex 时，这里指定以 hex 形式表示的的二进制数据
- 当 `type` 为 base64 时，这里指定 base64 过的二进制数据

> `delay`: [Int32Range](../../development/intro/guide.md#int32range)

延迟，单位毫秒。发送该噪声包后核心会等待该时间后再发送下一个噪声包或真实数据，默认不等待。

### FinalRuleObject

```json
{
  "action": "block",
  "network": "tcp,udp",
  "port": "53,443",
  "ip": ["10.0.0.0/8", "2001:db8::/32"],
  "blockDelay": "30-90"
}
```

规则中的各匹配条件为与关系；省略某个条件时，表示对此条件不作限制。

> `action`: "allow" | "block"

定义规则命中后的动作。

- `allow`: 放行目标。
- `block`: 阻止目标。

> `network`: "tcp" | "udp" | "tcp,udp"

匹配网络类型。当连接方式是指定方式时，此规则生效。也可以写成字符串数组，如 `["tcp", "udp"]`。省略时匹配所有网络。

> `port`: number | string

目标端口范围，写法与 [路由规则中的 `port`](../routing.md#ruleobject) 一致。省略时匹配所有端口。

> `ip`: \[ string \]

一个数组，数组内每一项代表一个 IP 范围。当某一项匹配目标 IP 时，此规则生效。写法与 [路由规则中的 `ip`](../routing.md#ruleobject) 一致。省略时匹配所有 IP。

> `blockDelay`: string

设置阻止规则命中后的黑洞持续时间。

当规则的 `action` 为 `block` 且命中目标时，Freedom 会让连接进入黑洞状态，并在这段时间结束后关闭连接。单位为秒，可以写成固定值或范围，例如 `30` 或 `30-90`。省略时默认为 `30-90` 即此范围内随机一个值。
