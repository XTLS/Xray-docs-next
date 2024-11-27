# Freedom（fragment、noises）

Freedom 是一个出站协议，可以用来向任意网络发送（正常的） TCP 或 UDP 数据。

## OutboundConfigurationObject

```json
{
  "domainStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0,
  "fragment": {
    "packets": "tlshello",
    "length": "100-200",
    "interval": "10-20" // 单位ms
  },
  "noises":[
  {
    "type":"base64",
    "packet":"7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
    "delay":"10-16"
  }
],
  "proxyProtocol": 0
}
```

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

默认值 `"AsIs"`。

当目标地址为域名时，配置相应的值，Freedom 的行为模式如下：

- 当使用 `"AsIs"` 时，Xray 将直接使用 go 自带的 Dial 发起连接，优先级固定为 RFC6724 的默认值(不会遵守 gai.conf 等配置) (人话：IPv6 优先)。出于一些原因，UDP连接如果使用域名会无视系统设置优先IPv4。
- 当填写其他值时，将使用 Xray-core [内置 DNS 服务器](../dns.md) 服务器进行解析。若不存在DNSObject，则使用系统DNS。若有多个符合条件的IP地址时，核心会随机选择一个IP作为目标IP。
- `"IPv4"` 代表尝试仅使用 IPv4 进行连接，`"IPv4v6"` 代表尝试使用 IPv4 或 IPv6 连接，但对于双栈域名，使用 IPv4。（v4v6调换后同理，不再赘述）
- 当在内置DNS设置了 `"queryStrategy"` 后，实际行为将会与这个选项取并，只有都被包含的IP类型才会被解析，如 `"queryStrategy": "UseIPv4"` `"domainStrategy": "UseIP"`，实际上等同于 `"domainStrategy": "UseIPv4"`。
- 当使用 `"Use"` 开头的选项时，若解析结果不符合要求（如，域名只有IPv4解析结果但使用了UseIPv6），则会回落回AsIs。
- 当使用 `"Force"` 开头的选项时，若解析结果不符合要求，则该连接会无法建立。

::: tip TIP 1
当使用 `"UseIP"`、`"ForceIP"` 模式时，并且 [出站连接配置](../outbound.md#outboundobject) 中指定了 `sendThrough` 时，Freedom 会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。若手动指定了单种IP类型（如UseIPv4），但与 `sendThrough` 指定的本地地址不匹配，将会导致连接失败。
:::

> `redirect`: address_port

Freedom 会强制将所有数据发送到指定地址（而不是 inbound 指定的地址）。

其值为一个字符串，样例：`"127.0.0.1:80"`，`":1234"`。

当地址不指定时，如 `":443"`，Freedom 不会修改原先的目标地址。
当端口为 `0` 时，如 `"xray.com: 0"`，Freedom 不会修改原先的端口。

> `userLevel`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

userLevel 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `fragment`: map

一些键值对配置项，用于控制发出的 TCP 分片，在某些情况下可以欺骗审查系统，比如绕过 SNI 黑名单。

`"length"`和`"interval"` 均为 [Int32Range](../../development/intro/guide.md#int32range) 类型

`"packets"`：支持两种分片方式 "1-3" 是 TCP 的流切片，应用于客户端第 1 至第 3 次写数据。"tlshello" 是 TLS 握手包切片。

`"length"`：分片包长 (byte)

`"interval"`：分片间隔（ms）

当其为 0 且设置 `"packets": "tlshello"` 时，被分片的 Client Hello 将会在一个TCP包中发送（如果其原始大小未超过MSS或MTU导致被系统自动分片）

> `noises`: array

UDP noise, 用于在发出UDP连接前发出一些随机数据作为“噪声”，出现该结构体则视为启用，可能可以欺骗嗅探器，也可能破坏正常连接。Use at your own risk. 出于这个原因，它会绕过53端口因为这会破坏 DNS

为一个数组，可以定义多个要发出的噪声数据包，数组中单个元素定义如下

`"type"`: 噪声数据包类型，目前支持`"rand"`(随机数据), `"str"`(用户自定义字符串), `"base64"`(base64编码过的自定义二进制数据)

`"packet"`: 基于前面的 `type` 要发送的数据包内容

- 当 `type` 为 rand 时，这里指定随机数据的长度 可以是固定值 `"100"` 或者浮动值 `"50-150"`
- 当 `type` 为 str 时，这里指定要发送的字符串
- 当 `type` 为 base64 时，这里指定base64过的二进制数据
  
`"delay"`: 延迟，单位毫秒。发送该噪声包后核心会等待该时间后再发送下一个噪声包或真实数据，默认不等待，为 [Int32Range](../../development/intro/guide.md#int32range) 类型

> `proxyProtocol`: number

PROXY protocol 通常配合 `redirect` 重定向到开启了 PROXY protocol 协议的 Nginx 或其他后端服务中。如果后端服务不支持 PROXY protocol 协议，连接将会被断开。

proxyProtocol 的值为 PROXY protocol 版本号，可选 `1` 或 `2`，如不指定，默认为 `0` 不启用。
