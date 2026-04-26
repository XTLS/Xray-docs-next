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
- `reject`: 返回显式拒绝响应，相比 `drop` 可以避免部分应用长时间等待 DNS 超时或反复重试。

> `qtype`: number | string

匹配 DNS 查询类型，形式如下：

- 整型数值 具体的查询类型，如 `"qtype": 1` 代表 A 查询，`"qtype": 28` 代表 AAAA 查询。
- 字符串：可以是一个只有数字的字符串，如 `"qtype": "28"`；或者一个数值范围，如 `"qtype": "5-10"` 表示type 5 到 type 10，这 6 个类型。可以使用逗号进行分段，如 `11,13,15-17` 表示type 11、type 13、type 15 到 type 17 这 5 个类型。

具体数字编号可参考 [IANA 文档](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml)。

> `domain`: [string]

匹配域名列表，写法与 [路由规则中的 `domain`](../routing.md#ruleobject) 一致。
