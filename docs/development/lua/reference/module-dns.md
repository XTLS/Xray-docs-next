# xray.dns

提供 DNS 查询和上游服务器访问接口。

```lua
local dns = require("xray.dns")
```

## API 索引

| 分类 | 成员                                                  | 说明                     |
| ---- | ----------------------------------------------------- | ------------------------ |
| 函数 | [`dns.Query(domain, ipv4, ipv6, fake)`](#dns-query)   | 通过 Xray DNS 客户端查询 |
| 字段 | [`dns.Servers`](#dns-servers)                         | 上游服务器数组           |
| 对象 | [`serverObj`](#server)                                | 单个 DNS 上游服务器      |
| 字段 | [`serverObj.ID`](#id)                                 | 服务器标识               |
| 方法 | [`serverObj:Query(domain, ipv4, ipv6, fake)`](#query) | 直接查询指定上游         |

## 函数

### dns.Query

```lua
local ips, ttl, err = dns.Query(domain, ipv4, ipv6, fake)
```

通过 Xray 的 DNS 客户端查询域名。在 DNS Hook 中不可用，因为脚本接管的就是它。

**参数**

| 参数     | 类型      | 说明                 |
| -------- | --------- | -------------------- |
| `domain` | `string`  | 待查询域名           |
| `ipv4`   | `boolean` | 是否允许查询 IPv4    |
| `ipv6`   | `boolean` | 是否允许查询 IPv6    |
| `fake`   | `boolean` | 是否允许使用 FakeDNS |

**返回值**

| 返回值 | 类型                                            | 说明                                            |
| ------ | ----------------------------------------------- | ----------------------------------------------- |
| `ips`  | [`[]net.IP`](./data-types.md#net-ip-1) 或 `nil` | 查询结果                                        |
| `ttl`  | `number`                                        | TTL（秒），范围 `0 .. 4294967295`，始终非 `nil` |
| `err`  | [`error`](./data-types.md#error) 或 `nil`       | 查询错误，`nil` 表示无错误                      |

**行为约定**

四个参数均须显式传入且类型正确，否则抛出 Lua 异常。

查询遵循客户端的全局查询类型限制、Hosts 和上游配置；配置了 [DNS 脚本](../guide/dns.md)时，也会交由该脚本处理。未配置内置 DNS 时使用系统 DNS。

查询成功时返回非空 IP slice；查询失败或没有可用地址时返回 `nil, 0, err`。

**示例**

```lua
local ips, ttl, err = dns.Query("example.com", true, true, false)
if err == nil and ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```

## 字段

### dns.Servers

```lua
local servers = dns.Servers
```

| 名称          | 类型    | 说明                                                       |
| ------------- | ------- | ---------------------------------------------------------- |
| `dns.Servers` | `table` | [`serverObj`](#server) 数组，下标从 1 开始，顺序与配置相同 |

使用内置 DNS 时，列表包含配置的上游；未配置 DNS 或上游服务器时，列表仅包含 `localhost`（系统 DNS）。

可用 `ipairs` 遍历列表；下标超出范围时，`servers[i]` 为 `nil`。

**示例**

```lua
for _, serverObj in ipairs(dns.Servers) do
    local id = serverObj.ID
end
```

## 对象

### server

`serverObj` 表示一个 DNS 上游服务器，包含其标识和查询方法。

| 属性      | 说明                                     |
| --------- | ---------------------------------------- |
| Go 侧实现 | `app/dns` 中的 `luaDNSServer`            |
| Lua 表现  | `table`                                  |
| 取得方式  | [`dns.Servers`](#dns-servers) 的数组元素 |

#### ID

```lua
local id = serverObj.ID
```

| 名称           | 类型     | 说明                                                                                      |
| -------------- | -------- | ----------------------------------------------------------------------------------------- |
| `serverObj.ID` | `string` | 对应 [DNS 服务器配置](../../../config/dns.md#dnsserverobject)中的 `id` 字段，始终非 `nil` |

未填写 `id` 时为 `""`，包括用字符串形式配置的服务器；自动添加的系统 DNS 上游 ID 为 `"localhost"`。

需要通过 ID 区分服务器时，请自行配置唯一的值，核心不会检查是否重复。

#### Query

```lua
local ips, ttl, err = serverObj:Query(domain, ipv4, ipv6, fake)
```

查询 `serverObj` 对应的上游。

**参数与返回值**

参数要求和返回值类型与 [`dns.Query`](#dns-query) 相同。

**行为约定**

正常配置的上游成功时返回非空 IP slice、TTL 和 `nil`；查询失败、没有符合条件的地址，或 `fake == false` 却查询 FakeDNS 时返回 `nil, 0, err`。

直接查询该服务器，跳过全局 Hosts 和 DNS 脚本。服务器自身的 `queryStrategy`、缓存、`timeoutMs`、`clientIP`、`tag`，以及 `expectedIPs` / `unexpectedIPs` 和对应的 `actPrior` / `actUnprior` 仍然生效。

**示例**

在 DNS Hook 中直接返回首个上游的查询结果：

```lua
function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return dns.Servers[1]:Query(domain, ipv4, ipv6, fake)
end
```
