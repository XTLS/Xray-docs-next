# DNS Hook

核心在内置 DNS 查询中调用 `dns.script` 中的全局函数 `HandleDNSQuery`。配置接入和完整示例见[DNS 脚本指南](../guide/dns.md)。

## API 索引

| 分类 | 成员                                     | 说明          |
| ---- | ---------------------------------------- | ------------- |
| Hook | [`HandleDNSQuery(...)`](#handlednsquery) | 处理 DNS 查询 |

## Hook 接口

### HandleDNSQuery(...)

```lua
function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return ips, ttl, err
end
```

处理一次 DNS 查询，返回 IP slice、TTL 或错误。

#### 参数

核心始终传入全部四个参数，均非 `nil`。

| 参数     | 类型      | 说明                         |
| -------- | --------- | ---------------------------- |
| `domain` | `string`  | 待查询域名，非空且已转为小写 |
| `ipv4`   | `boolean` | 是否允许查询 IPv4 地址       |
| `ipv6`   | `boolean` | 是否允许查询 IPv6 地址       |
| `fake`   | `boolean` | 本次查询是否允许 FakeDNS     |

`ipv4`、`ipv6` 已受全局 [`queryStrategy`](../../../config/dns.md#dnsobject) 限制，至少一个为 `true`。向上游查询时通常原样传递这三个 boolean 参数。

#### 返回值

| 返回值 | 类型                                                | 说明                                                            |
| ------ | --------------------------------------------------- | --------------------------------------------------------------- |
| `ips`  | [`[]net.IP`](./data-types.md#net-ip-1) 或 `nil`     | 查询结果，必须是 slice，不接受 Lua 数组                         |
| `ttl`  | `number` 或 `nil`                                   | TTL（秒）；`err == nil` 时必须为 `0 .. 4294967295` 范围内的整数 |
| `err`  | [`error`](./data-types.md#error)、`string` 或 `nil` | 仅 `nil` 表示无错误                                             |

#### 行为约定

核心依次校验 `err`、`ttl`、`ips`，遇到错误即停止；`err` 非 `nil` 时忽略其余两项。无错误时，即使 IP 结果为空，也必须提供合法 TTL。

返回空响应可写 `return nil, 0, nil`；错误应放在第三个位置，例如 `return nil, nil, "查询失败"`。

| 脚本结果                                             | 核心处理               |
| ---------------------------------------------------- | ---------------------- |
| 校验通过且 `ips` 非空                                | 本次查询成功           |
| `err == nil`、TTL 合法，但 `ips` 为 `nil` 或空 slice | 本次查询失败（空响应） |
| 返回错误、返回值类型错误或执行异常                   | 本次查询失败           |

#### 示例

可以直接转发 [`serverObj:Query`](./module-dns.md#query) 的三个返回值：

```lua
local dns = require("xray.dns")
local serverObj = dns.Servers[1]

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return serverObj:Query(domain, ipv4, ipv6, fake)
end
```
