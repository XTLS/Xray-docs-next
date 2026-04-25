# DNS

DNS 是一个出站协议，用于接收由 routing 送入的 DNS 查询，并按规则转发或处理。

此出站只支持传统明文 DNS，即基于 UDP 和 TCP 的查询；DoH、DoT、DoQ 等非传统明文 DNS 不适用于此出站。常见场景是 TUN、透明代理或 `dokodemo-door` 接收到 DNS 流量后，再由 routing 将其分流到此出站。

它可以按规则将查询放行到目标 DNS 服务器、`hijack` 到内置的 [DNS 服务器](../dns.md) 进一步处理、直接丢弃或显式拒绝，也可以改写目标地址、端口和传输协议。

## OutboundConfigurationObject

```json
{
  "network": "udp",
  "address": "1.1.1.1",
  "port": 53,
  "userLevel": 0,
  "rules": [
    {
      "action": "reject",
      "domain": ["domain:example.com"]
    },
    {
      "action": "direct",
      "qtype": 65,
      "domain": ["geosite:geolocation-!cn"]
    }
  ]
}
```

上例仅示意各字段写法，完整配置见下方示例。

> `network`: [ "tcp" | "udp" ]

修改 DNS 流量的传输层协议，可选值为 `"tcp"` 和 `"udp"`。当不指定时，保持来源的传输方式不变。

> `address`: address

修改 DNS 服务器地址。当不指定时，保持来源中指定的地址不变。

> `port`: number

修改 DNS 服务器端口。当不指定时，保持来源中指定的端口不变。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

`userLevel` 的值，对应 [policy](../policy.md#policyobject) 中 `level` 的值。如不指定，默认为 `0`。

> `rules`: \[[RuleObject](#ruleobject)\]

按顺序匹配 DNS 查询规则，并支持按 `qtype` 和 `domain` 进行细粒度控制。

若未命中任何规则，则使用内置兜底规则：A 和 AAAA 查询会被导入内置 DNS 模块，其它类型会被显式拒绝。

## RuleObject

```json
{
  "action": "hijack",
  "qtype": 1,
  "domain": ["geosite:cn"]
}
```

规则中的各匹配条件为与关系；省略某个条件时，表示对此条件不作限制。

> `action`: [ "direct" | "hijack" | "drop" | "reject" ]

定义规则命中后的动作。

- `direct`: 直接放行到目标 DNS 服务器；若同时配置了出站级别的 `network`、`address` 或 `port`，则按改写后的目标继续转发。
- `hijack`: 将查询导入内置的 [DNS 服务器](../dns.md) 继续处理，可用于按照内置 DNS 的配置进一步分流；目前仅支持 A 和 AAAA 记录。
- `drop`: 直接丢弃请求，不返回响应。
- `reject`: 返回显式拒绝响应，相比 `drop` 可以避免应用长时间等待 DNS 超时。

> `qtype`: number | string

匹配 DNS 查询类型，有三种形式：

- `"a-b"`：`a` 和 `b` 均为整数。这个范围是一个前后闭合区间，当查询类型落在此范围内时，此规则生效。
- `a`：`a` 为整数。当查询类型为 `a` 时，此规则生效。
- 以上两种形式的混合，以逗号 `,` 分隔。形如：`"1,3,23-24"`。

常见类型编号可参考 [DNS 记录类型列表](https://zh.wikipedia.org/zh-cn/DNS%E8%AE%B0%E5%BD%95%E7%B1%BB%E5%9E%8B%E5%88%97%E8%A1%A8)。

省略时表示匹配所有查询类型。

> `domain`: [string]

匹配域名列表，写法与 [路由规则中的 `domain`](../routing.md#ruleobject) 一致，例如 `domain:example.com`、`full:example.com`、`geosite:cn`。省略时表示不限制域名。

## DNS 配置实例

下面的示例演示一个实际场景：透明代理环境中，入站开启 `sniffing` 做域名 / SNI 分流，国外域名走代理，其余 IP 流量直连；同时通过 `dns-out` 拒绝国外域名的 HTTPS 记录，以减少客户端获取 ECH 配置后影响明文 SNI 分流的情况，并将常见的 MX、TXT、SRV 等查询转发到指定上游；代理服务器没有 IPv6 环境因此还需要屏蔽 AAAA 查询。

```json
{
  "inbounds": [
    {
      "tag": "all-in",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"],
        "routeOnly": true
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "dns": {
    "servers": ["https+local://1.1.1.1/dns-query"]
  },
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        // 忽略...
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "settings": {
        "network": "tcp",
        "address": "1.1.1.1",
        "port": 53,
        "rules": [
          {
            "action": "reject",
            "qtype": "28,65",
            "domain": ["geosite:geolocation-!cn"]
          },
          {
            "action": "direct",
            "qtype": "15-16,33"
          }
        ]
      }
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "inboundTag": ["all-in"],
        "network": "tcp,udp",
        "port": "53",
        "outboundTag": "dns-out"
      },
      {
        "domain": ["geosite:geolocation-!cn"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

上例的行为如下：

- `all-in` 开启了 `sniffing`，并使用 `routeOnly: true` 让 routing 能基于嗅探出的 HTTP、TLS、QUIC 目标域名进行分流，同时保留原始目标地址。
- 来自 `all-in`、发往 53 端口的 UDP/TCP 明文 DNS 查询，会被 routing 规则分流到 `dns-out`。
- 普通流量中，`geosite:geolocation-!cn` 走 `proxy`，未命中该域名规则的流量自动默认走第一个出站 `direct`。
- `geosite:geolocation-!cn` 中域名的 `qtype` 为 `65` 的 HTTPS 记录会被显式拒绝，可用于配合基于明文 SNI 的分流。
- `geosite:geolocation-!cn` 中域名的 `qtype` 为 `28` 的 AAAA 查询会被显式拒绝，可用于屏蔽国外域名的 IPv6 解析。
- `qtype` 为 `15-16,33` 的查询会被直接放行，并按出站配置转发到 `1.1.1.1:53`，传输方式改为 TCP。
- 其余未命中的查询会进入默认兜底逻辑：A 和 AAAA 查询被导入内置 DNS 模块，其它类型被显式拒绝；内置 DNS 再通过 `https+local://1.1.1.1/dns-query` 向上游发起查询，避免形成回环。
