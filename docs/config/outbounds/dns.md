# DNS

DNS 是一个出站协议，主要用于拦截和转发 DNS 查询。

此出站协议只能接收 DNS 流量（包含基于 UDP 和 TCP 协议的查询），其它类型的流量会导致错误。

在处理 DNS 查询时，此出站协议会将 IP 查询（即 A 和 AAAA）转发给内置的 [DNS 服务器](../dns.md)。其它类型的查询流量将被转发至它们原本的目标地址。

## OutboundConfigurationObject

```json
{
  "network": "tcp",
  "address": "1.1.1.1",
  "port": 53,
  "nonIPQuery": "drop"
}
```

> `network`: "tcp" | "udp"

修改 DNS 流量的传输层协议，可选的值有 `"tcp"` 和 `"udp"`。当不指定时，保持来源的传输方式不变。

> `address`: address

修改 DNS 服务器地址。当不指定时，保持来源中指定的地址不变。

> `port`: number

修改 DNS 服务器端口。当不指定时，保持来源中指定的端口不变。

> `nonIPQuery`: string

控制非 IP 查询（非 A 和 AAAA），`"drop"` 丢弃或者 `"skip"` 不由内置 DNS 服务器处理，将转发给目标。默认为 `"drop"`。

## DNS 配置实例 <Badge text="WIP" type="warning"/>
