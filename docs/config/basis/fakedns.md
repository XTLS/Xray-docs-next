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

> `ipPool`: CIDR 

FakeDNS 将使用此选项指定的 IP 块分配地址。

> `poolSize`: int

指定 FakeDNS 储存的 域名-IP 映射的最大数目。当映射数超过此值后，会按照 LRU 规则淘汰映射。默认为 65535。

### 如何使用？

FakeDNS 本质上是一个 [DNS 服务器](./dns.md#serverobject)，能够与任意 DNS 规则配合使用。

::: tip
只有将 DNS 查询路由到 FakeDNS，才能使其发挥作用。
:::

另外，你需要在入站中开启 `Sniffing` ，并使用 `fakedns` 目标地址重置。

::: warning
如果 FakeIP 没有被正确的还原为域名，将无法连接到服务器。
:::
