# FakeDNS

FakeDNS 通过伪造 DNS 以获取目标域名，能够降低 DNS 查询时的延迟、配合透明代理获取目标域名。

::: warning
FakeDNS 有可能会污染本地 DNS，导致 Xray 关闭后“无法访问网络”。
:::

## FakeDNSObject

`FakeDNSObject` 对应配置文件的 `fakedns` 项。

```json
{
  "ipPool": "198.18.0.0/16",
  "poolSize": 65535
}
```

`FakeDnsObject` 亦可配置为一个包含多个 FakeIP Pool 的数组。当收到 DNS 查询请求时，FakeDNS 会返回一组同时由多个 FakeIP Pool 得到的一组 FakeIP。

```json
[
  {
    "ipPool": "198.18.0.0/15",
    "poolSize": 65535
  },
  {
    "ipPool": "fc00::/18",
    "poolSize": 65535
  }
]
```

> `ipPool`: CIDR

FakeDNS 将使用此选项指定的 IP 块分配地址。

> `poolSize`: int

指定 FakeDNS 储存的 域名-IP 映射的最大数目。当映射数超过此值后，会按照 LRU 规则淘汰映射。默认为 65535。

::: warning
`poolSize` 必须小于或等于 `ipPool` 对应的地址总数。
:::

::: tip
若配置文件中 `dns` 项设置了 `fakedns` 但配置文件没有设置 `FakeDnsObject`，Xray 会根据 DNS 组件的 `queryStrategy` 来初始化 `FakeDnsObject`。

`queryStrategy` 为 `UseIP` 时，初始化的 FakeIP Pool 相当于

```json
[
  {
    "ipPool": "198.18.0.0/15",
    "poolSize": 32768
  },
  {
    "ipPool": "fc00::/18",
    "poolSize": 32768
  }
]
```

`queryStrategy` 为 `UseIPv4` 时，初始化的 FakeIP Pool 相当于

```json
{
  "ipPool": "198.18.0.0/15",
  "poolSize": 65535
}
```

`queryStrategy` 为 `UseIPv6` 时，初始化的 FakeIP Pool 相当于

```json
{
  "ipPool": "fc00::/18",
  "poolSize": 65535
}
```

:::

### 如何使用？

FakeDNS 本质上是一个 [DNS 服务器](./dns.md#serverobject)，能够与任意 DNS 规则配合使用。

只有将 DNS 查询路由到 FakeDNS，才能使其发挥作用。

```json
{
  "dns": {
    "servers": [
      "fakedns", // fakedns 排在首位
      "8.8.8.8"
    ]
  },
  "outbounds": [
    {
      "protocol": "dns",
      "tag": "dns-out"
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "inboundTag": ["dns-in"], // 劫持来自 DNS 查询入口的 DNS 流量，或劫持来自透明代理入站的 DNS 流量。
        "port": 53,
        "outboundTag": "dns-out"
      }
    ]
  }
}
```

当外部 DNS 请求进入 FakeDNS 组件时，它会返回位于自己 `ipPool` 内的 IP 地址作为域名的虚构解析结果，并记录该域名与虚构解析结果之间的映射关系。

另外，你需要在**客户端**接收需代理流量的入站中开启 `Sniffing`，并使用 `fakedns` 目标地址重置。

```json
"sniffing": {
  "enabled": true,
  "destOverride": ["fakedns"], // 使用 "fakedns"，或与其它 sniffer 搭配使用，或直接使用 "fakedns+others"
  "metadataOnly": false        // 此项为 true 时 destOverride 仅可使用 fakedns
},
```

::: warning
如果 FakeIP 没有被正确的还原为域名，将无法连接到服务器。
:::

### 与其它类型 DNS 搭配使用

#### 与 DNS 分流共存

使用 DNS 分流时，为了使 `fakedns` 拥有高优先级，需要对其增加与其他类型 DNS 相同的 `domains`。

```json
{
  "servers": [
    {
      "address": "fakedns",
      "domains": [
        // 与下方分流所用的内容一致
        "geosite:cn",
        "domain:example.com"
      ]
    },
    {
      "address": "1.2.3.4",
      "domains": ["geosite:cn"],
      "expectIPs": ["geoip:cn"]
    },
    {
      "address": "1.1.1.1",
      "domains": ["domain:example.com"]
    },
    "8.8.8.8"
  ]
}
```

#### FakeDNS 黑名单

如不希望某些域名使用 FakeDNS，则可在其它类型的 DNS 配置中添加 `domains` 配置，使指定域名在匹配时其它 DNS 服务器拥有比 FakeDNS 更高的优先级，进而实现 FakeDNS 的黑名单机制。

```json
{
  "servers": [
    "fakedns",
    {
      "address": "1.2.3.4",
      "domains": ["domain:do-not-use-fakedns.com"]
    }
  ]
}
```

#### FakeDNS 白名单

如希望仅某些域名使用 FakeDNS，则可在 `fakedns` 增加 `domains` 配置，使指定域名在匹配时 `fakedns` 拥有比其它 DNS 服务器更高的优先级，进而实现 FakeDNS 的白名单机制。

```json
{
  "servers": [
    "1.2.3.4",
    {
      "address": "fakedns",
      "domains": ["domain:only-this-use-fakedns.com"]
    }
  ]
}
```
