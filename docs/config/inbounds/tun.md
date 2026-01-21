# TUN

创建一个 TUN 接口，发往此接口的流量将由 Xray 处理。目前仅支持 Windows 与 Linux.

## InboundConfigurationObject

```json
{
  "name": "xray0",
  "MTU": 1500,
  "UserLevel": 0
}
```

> `name`: string

创建的 TUN 接口名。默认 `"xray0"`

> `MTU`: number

接口的 MTU 默认值 `1500`

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值. 如不指定, 默认为 0。

## 使用提示

目前 Xray 不会自动修改系统路由表，需要手动配置路由将数据导向创建的 TUN 接口，否则它只是个接口。

如果只想代理某一个或一些进程，Xray 路由系统中的进程名路由会十分有用。

::: warning
注意可能的流量回环的问题，设置路由后可能将 Xray 发出的请求发回 Xray 造成回环！
使用`sockopt` 中的 `interface` 绑定实际的物理网络接口来避免此问题。`ipconfig` (Windows) `ip a` (Linux) 将有助于找到你需要的接口名。
或者使用出站的 `sendThrough` 它直接在 OutboundObject 中可用，没有 sockOpt.interface 那么深的嵌套层级，这里需要使用的是网卡上的 IP，比如 192.168.1.2 （如你所见它的缺点是不能自动支持双栈，请按你出站的实际使用的 IP 选择）。
:::
