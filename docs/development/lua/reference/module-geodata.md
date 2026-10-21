# xray.geodata

提供域名和 IP 的规则匹配功能。

```lua
local geodata = require("xray.geodata")
```

## API 索引

| 分类 | 成员                                                             | 说明                     |
| ---- | ---------------------------------------------------------------- | ------------------------ |
| 函数 | [`geodata.BuildDomainMatcher(...)`](#geodata-builddomainmatcher) | 创建 `DomainMatcher`     |
| 函数 | [`geodata.BuildIPMatcher(...)`](#geodata-buildipmatcher)         | 创建 `IPMatcher`         |
| 对象 | [`DomainMatcher`](#domainmatcher)                                | 域名匹配器               |
| 方法 | [`domainMatcherObj:MatchAny(domain)`](#matchany)                 | 判断域名是否命中任意规则 |
| 方法 | [`domainMatcherObj:Match(domain)`](#match)                       | 取得命中的域名规则编号   |
| 对象 | [`IPMatcher`](#ipmatcher)                                        | IP 匹配器                |
| 方法 | [`ipMatcherObj:Match(ip)`](#match-1)                             | 匹配单个 IP              |
| 方法 | [`ipMatcherObj:AnyMatch(ips)`](#anymatch)                        | 判断是否有 IP 命中       |
| 方法 | [`ipMatcherObj:Matches(ips)`](#matches)                          | 判断整个 IP 列表是否命中 |
| 方法 | [`ipMatcherObj:FilterIPs(ips)`](#filterips)                      | 分离命中和未命中的 IP    |
| 方法 | [`ipMatcherObj:SetReverse(reverse)`](#setreverse)                | 设置反选标记             |
| 方法 | [`ipMatcherObj:ToggleReverse()`](#togglereverse)                 | 切换反选标记             |

## 函数

### geodata.BuildDomainMatcher

```lua
local domainMatcherObj = geodata.BuildDomainMatcher(rule1, rule2, ...)
```

根据域名规则创建 [`DomainMatcher`](#domainmatcher)。

**参数**

| 参数                | 类型     | 说明 / 要求                      |
| ------------------- | -------- | -------------------------------- |
| `rule1, rule2, ...` | `string` | 必填，至少一条域名规则，逐个传入 |

**返回值**

| 返回值             | 类型                              | 说明           |
| ------------------ | --------------------------------- | -------------- |
| `domainMatcherObj` | [`DomainMatcher`](#domainmatcher) | 域名匹配器实例 |

**行为约定**

未传入规则、参数类型错误，或规则解析、资源加载、构建失败时，抛出 Lua 异常。

支持 `domain:`、`full:`、`keyword:`、`regexp:`、`dotless:`、`geosite:`、`ext:`（亦可写为 `ext-domain:` / `ext-site:`），格式见[路由域名规则](../../../config/routing.md#ruleobject)。GeoSite 文件从[资源目录](../../../config/env.md#资源文件路径)加载。

无前缀字符串默认使用 `domain:` 规则。

除正则表达式外，规则在构建时转为小写。

**示例**

```lua
local sitesObj = geodata.BuildDomainMatcher(
    "example.com", "full:other.example"
)
```

### geodata.BuildIPMatcher

```lua
local ipMatcherObj = geodata.BuildIPMatcher(rule1, rule2, ...)
```

根据 IP 规则创建 [`IPMatcher`](#ipmatcher)。

**参数**

| 参数                | 类型     | 说明 / 要求                      |
| ------------------- | -------- | -------------------------------- |
| `rule1, rule2, ...` | `string` | 必填，至少一条 IP 规则，逐个传入 |

**返回值**

| 返回值         | 类型                      | 说明          |
| -------------- | ------------------------- | ------------- |
| `ipMatcherObj` | [`IPMatcher`](#ipmatcher) | IP 匹配器实例 |

**行为约定**

未传入规则、参数类型错误、规则为空字符串，或规则解析、资源加载、构建失败时，抛出 Lua 异常。

支持 IP、CIDR、`geoip:`、`ext:`（亦可写为 `ext-ip:`）及 `!` 反选规则，组合方式见[路由 IP 规则](../../../config/routing.md#ruleobject)。GeoIP 文件从[资源目录](../../../config/env.md#资源文件路径)加载。

**示例**

```lua
local privateIPsObj = geodata.BuildIPMatcher(
    "10.0.0.0/8", "192.168.0.0/16", "fc00::/7"
)
```

## 对象

### DomainMatcher

| 属性        | 说明                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| Go 底层类型 | `geodata.DomainMatcher` 接口的实现                                        |
| Lua 表现    | `userdata`                                                                |
| 取得方式    | [`geodata.BuildDomainMatcher(...)`](#geodata-builddomainmatcher) 的返回值 |

**通用约定**

匹配方法接收一个域名字符串。`nil`、省略参数、类型或参数数量错误会抛出 Lua 异常。

输入域名不会自动转为小写，需由脚本按需处理。

#### MatchAny

```lua
local matched = domainMatcherObj:MatchAny(domain)
```

判断域名是否命中至少一条规则。

**参数**

| 参数     | 类型     | 说明 / 要求      |
| -------- | -------- | ---------------- |
| `domain` | `string` | 必填，待匹配域名 |

**返回值**

| 返回值    | 类型      | 说明                            |
| --------- | --------- | ------------------------------- |
| `matched` | `boolean` | 命中时为 `true`，否则为 `false` |

**示例**

```lua
local matched = sitesObj:MatchAny("www.example.com")
```

#### Match

```lua
local indices = domainMatcherObj:Match(domain)
```

取得域名命中的规则编号。

**参数**

| 参数     | 类型     | 说明 / 要求      |
| -------- | -------- | ---------------- |
| `domain` | `string` | 必填，待匹配域名 |

**返回值**

| 返回值    | 类型                                          | 说明                                                 |
| --------- | --------------------------------------------- | ---------------------------------------------------- |
| `indices` | [`[]uint32`](./data-types.md#uint32) 或 `nil` | 命中的规则编号；未命中时为 `nil` 或长度为 0 的 slice |

**行为约定**

规则编号从 **0** 开始，对应构建时传入的规则顺序。结果顺序不保证，可能包含重复编号；GeoSite 展开的条目沿用其所属规则的编号。

若将同一组规则保存在 Lua 数组中，可用 `rules[ruleNumber + 1]` 取得原规则。slice 的访问方式见[数据类型](./data-types.md#slice)。

**示例**

```lua
local indices = sitesObj:Match("www.example.com")
if indices ~= nil then
    for i = 1, #indices do
        local ruleNumber = indices[i]
    end
end
```

### IPMatcher

| 属性        | 说明                                                              |
| ----------- | ----------------------------------------------------------------- |
| Go 底层类型 | `geodata.IPMatcher` 接口的实现                                    |
| Lua 表现    | `userdata`                                                        |
| 取得方式    | [`geodata.BuildIPMatcher(...)`](#geodata-buildipmatcher) 的返回值 |

**通用约定**

匹配单个 IP 时使用 [`net.IP`](./data-types.md#net-ip)；匹配或筛选列表时，输入形式见 [IP 列表输入](./data-types.md#ip-列表输入)。IP 地址字符串不会自动解析为 `net.IP`。

匹配和筛选方法均接受显式的 `nil`。省略参数、类型或参数数量错误会抛出 Lua 异常。

#### Match

```lua
local matched = ipMatcherObj:Match(ip)
```

判断单个 IP 是否命中规则。

**参数**

| 参数 | 类型                                        | 说明 / 要求      |
| ---- | ------------------------------------------- | ---------------- |
| `ip` | [`net.IP`](./data-types.md#net-ip) 或 `nil` | 必填，须显式传入 |

**返回值**

| 返回值    | 类型      | 说明                                                |
| --------- | --------- | --------------------------------------------------- |
| `matched` | `boolean` | 有效 IP 命中时为 `true`；`nil` 或无效 IP 为 `false` |

**行为约定**

传入 `""` 或空 table `{}` 时，会被视为空 IP 并返回 `false`；字符串不会按 IP 地址文本解析。

#### AnyMatch

```lua
local matched = ipMatcherObj:AnyMatch(ips)
```

判断是否至少有一个有效 IP 命中规则。

**参数**

| 参数  | 类型                                       | 说明 / 要求                  |
| ----- | ------------------------------------------ | ---------------------------- |
| `ips` | [IP 列表输入](./data-types.md#ip-列表输入) | 必填，须显式传入，允许 `nil` |

**返回值**

| 返回值    | 类型      | 说明                                                               |
| --------- | --------- | ------------------------------------------------------------------ |
| `matched` | `boolean` | 至少一个有效 IP 命中时为 `true`；`nil`、空列表或未命中时为 `false` |

#### Matches

```lua
local matched = ipMatcherObj:Matches(ips)
```

判断整个 IP 列表是否命中规则。

**参数**

| 参数  | 类型                                       | 说明 / 要求                  |
| ----- | ------------------------------------------ | ---------------------------- |
| `ips` | [IP 列表输入](./data-types.md#ip-列表输入) | 必填，须显式传入，允许 `nil` |

**返回值**

| 返回值    | 类型      | 说明                                                                   |
| --------- | --------- | ---------------------------------------------------------------------- |
| `matched` | `boolean` | 整个列表满足匹配要求时为 `true`；`nil`、空列表或含无效 IP 时为 `false` |

**行为约定**

组合规则可能包含多个内部匹配器，必须有一个内部匹配器命中整个列表。

例如，用 `geodata.BuildIPMatcher("192.168.1.0/24", "geoip:cn")` 构建匹配器，输入列表同时包含 `192.168.1.1` 和 `223.5.5.5` 时，`Matches` 返回 `false`：前者命中 custom CIDR，后者命中 `geoip:cn`，但两类规则属于不同的内部匹配器，没有一个能命中整个列表。

只需判断是否有地址命中时，使用 [`AnyMatch`](#anymatch)。

#### FilterIPs

```lua
local matched, unmatched = ipMatcherObj:FilterIPs(ips)
```

将有效 IP 分为命中和未命中两组。

**参数**

| 参数  | 类型                                       | 说明 / 要求                  |
| ----- | ------------------------------------------ | ---------------------------- |
| `ips` | [IP 列表输入](./data-types.md#ip-列表输入) | 必填，须显式传入，允许 `nil` |

**返回值**

| 返回值      | 类型                                   | 说明                      |
| ----------- | -------------------------------------- | ------------------------- |
| `matched`   | [`[]net.IP`](./data-types.md#net-ip-1) | 命中的 IP，始终非 `nil`   |
| `unmatched` | [`[]net.IP`](./data-types.md#net-ip-1) | 未命中的 IP，始终非 `nil` |

**行为约定**

没有结果的一组为空 slice；传入 `nil`、空列表或全部无效 IP 时，两组均为空 slice。

无效 IP 会被丢弃，结果顺序不保证与输入相同。

#### SetReverse

```lua
ipMatcherObj:SetReverse(reverse)
```

设置各内部匹配器的反选标记。

**参数**

| 参数      | 类型      | 说明 / 要求                             |
| --------- | --------- | --------------------------------------- |
| `reverse` | `boolean` | 必填，`true` 开启反选，`false` 关闭反选 |

**返回值**

无返回值。

**行为约定**

`nil`、省略参数或类型错误会抛出 Lua 异常。此操作覆盖各内部匹配器原有的反选标记，包括规则中 `!` 指定的标记。反选只作用于原规则包含的地址族，且不会匹配无效 IP。

设置后的反选状态保存在当前匹配器对象中。如果后续 Hook 调用复用该对象，修改后的状态也会继续生效，见[池化实例内状态](../guide/lifecycle.md#池化实例内状态)。

**示例**

对 `10.0.0.0/8` 反选后，匹配该范围以外的有效 IPv4 地址：

```lua
local ipMatcherObj = geodata.BuildIPMatcher("10.0.0.0/8")
ipMatcherObj:SetReverse(true)
```

#### ToggleReverse

```lua
ipMatcherObj:ToggleReverse()
```

切换各内部匹配器的反选标记。

**参数**

无额外参数。

**返回值**

无返回值。

**行为约定**

组合规则中的各内部匹配器分别切换反选标记，结果不等同于对整个组合结果取逻辑反。
切换后的反选状态保存在当前匹配器对象中。如果后续 Hook 调用复用该对象，修改后的状态也会继续生效，见[池化实例内状态](../guide/lifecycle.md#池化实例内状态)。
