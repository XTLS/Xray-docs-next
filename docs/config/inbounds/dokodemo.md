# Dokodemo-Door

Dokodemo door（任意门）可以监听一个本地端口，并把所有进入此端口的数据发送至指定服务器的一个端口，从而达到端口映射的效果。

## InboundConfigurationObject

```json
{
  "address": "8.8.8.8",
  "port": 53,
  "network": "tcp",
  "timeout": 0,
  "followRedirect": false,
  "userLevel": 0
}
```

> `address`: address

将流量转发到此地址。可以是一个 IP 地址，形如 `"1.2.3.4"`，或者一个域名，形如 `"xray.com"`。字符串类型。

当 `followRedirect`（见下文）为 `true` 时，`address` 可为空。

> `port`: number

将流量转发到目标地址的指定端口，范围 \[1, 65535\]，数值类型。必填参数。

> `network`: "tcp" | "udp" | "tcp,udp"

可接收的网络协议类型。比如当指定为 `"tcp"` 时，仅会接收 TCP 流量。默认值为 `"tcp"`。

> `timeout`: number

连接空闲的时间限制。单位为秒。默认值为 `300`。处理一个连接时，如果在 `timeout` 时间内，没有任何数据被传输，则中断该连接。

> `followRedirect`: true | false

当值为 `true` 时，dokodemo-door 会识别出由 iptables 转发而来的数据，并转发到相应的目标地址。

可参考 [传输配置](../transport.md#sockoptobject) 中的 `tproxy` 设置。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值. 如不指定, 默认为 0。

## 透明代理配置样例

此部分请参考[透明代理（TProxy）配置教程](../../document/level-2/tproxy)。
