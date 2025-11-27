# DNS

DNS 是一个出站协议，主要用于拦截和转发 DNS 查询。

此出站协议只能接收 DNS 流量（包含基于 UDP 和 TCP 协议的查询），其它类型的流量会导致错误。

在处理 DNS 查询时，此出站协议会将 IP 查询（即 A 和 AAAA）转发给内置的 [DNS 服务器](../dns.md)。其它类型的查询流量见下的 `nonIPQuery`。

## OutboundConfigurationObject

```json
{
  "network": "tcp",
  "address": "1.1.1.1",
  "port": 53,
  "nonIPQuery": "drop",
  "blockTypes": []
}
```

> `network`: "tcp" | "udp"

修改 DNS 流量的传输层协议，可选的值有 `"tcp"` 和 `"udp"`。当不指定时，保持来源的传输方式不变。

> `address`: address

修改 DNS 服务器地址。当不指定时，保持来源中指定的地址不变。

> `port`: number

修改 DNS 服务器端口。当不指定时，保持来源中指定的端口不变。

> `nonIPQuery`: string

控制非 IP 查询（非 A 和 AAAA），`"drop"` 丢弃; `"skip"` 不由内置 DNS 服务器处理，将转发给目标; `"reject"` 返回一个 DNS reject 响应，直接显式拒绝请求，相比 `"drop"` 可以避免应用程序消耗过长时间等待 DNS 响应到超时。

默认值为 `"drop"`。

> `blockTypes`: array

为一个 int 数组，屏蔽数组中的查询类型，如 `"blockTypes": [65,28]` 表示屏蔽 type 65(HTTPS) 和 28(AAAA)

由于 `nonIPQuery` 默认 drop 所有非 A 和 AAAA 查询, 所以需要将其设置为 skip 本选项才能进一步发挥作用。当然也可以不修改，单纯用来屏蔽 A 或者 AAAA 来屏蔽 IPv4/IPv6 查询，但非常不推荐那么做，建议在内置 DNS 的 `queryStrategy` 对相关内容进行设置。

注意：当只使用 `blockTypes` 屏蔽 A 或 AAAA 时， 如果 `nonIPQuery` 设置为了 `reject` 那么屏蔽方式也会是返回 DNS reject 而不是丢弃。

提示：现代浏览器会发送 type 65(HTTPS) 查询，如果目标网站启用了 ECH 你将无法通过嗅探域名来分流，屏蔽 65 和浏览器的 DoH 后可解决问题。但这又会使得原本被 ECH 保护隐私的网站降低私密程度，因为 ISP 现在又有能力嗅探到你的访问意图。

## DNS 配置实例 <Badge text="WIP" type="warning"/>
