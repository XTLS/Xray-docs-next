# 数据类型

本页汇总各模块共用的数据类型，说明它们在 Lua 中的表示和操作方式。模块独有的数据类型见各自页面。

## net.IP

| 属性        | 说明                      |
| ----------- | ------------------------- |
| Go 底层类型 | `net.IP`、`common/net.IP` |
| Lua 表现    | `userdata`                |

通常无需在 Lua 中逐个比较 `net.IP`，尤其应避免在热路径中这样做。需要匹配 IP 时，应优先使用 [`IPMatcher`](./module-geodata.md#ipmatcher)，它可以直接处理 API 返回的 `net.IP`。

如果确实需要直接操作 IP，请注意 `net.IP` 与 IP 地址字符串是不同的类型。可使用以下两个方法进行转换和比较：

### String

```lua
local text = ip:String()
```

将 IP 转为地址文本。

**参数**

无额外参数。

**返回值**

| 返回值 | 类型     | 说明                      |
| ------ | -------- | ------------------------- |
| `text` | `string` | IP 地址字符串，不为 `nil` |

### Equal

```lua
local equal = ip:Equal(otherIP)
```

比较两个 IP 是否相等。

**参数**

| 参数      | 类型                         | 说明                            |
| --------- | ---------------------------- | ------------------------------- |
| `otherIP` | [`net.IP`](#net-ip) 或 `nil` | 待比较的 IP，可以显式传入 `nil` |

**返回值**

| 返回值  | 类型      | 说明                                        |
| ------- | --------- | ------------------------------------------- |
| `equal` | `boolean` | 相等时为 `true`，否则为 `false`；不为 `nil` |

**行为约定**

有效 IP 与 `nil` 比较时返回 `false`。

**示例**

```lua
if ip ~= nil then
    local text = ip:String()
    local equal = ip:Equal(otherIP)
end
```

## slice

Go slice 在 Lua 中表示为 `userdata`，保留元素类型，下标从 **1** 开始。以下两种 slice 共用相同的长度、索引和遍历操作。

| 类型                    | Lua 表现   | 元素类型            |
| ----------------------- | ---------- | ------------------- |
| [`[]net.IP`](#net-ip-1) | `userdata` | [`net.IP`](#net-ip) |
| [`[]uint32`](#uint32)   | `userdata` | `number`            |

### []net.IP

提示：需要匹配或筛选 IP 列表时，应优先使用 [`IPMatcher`](./module-geodata.md#ipmatcher)，它可以直接处理 `[]net.IP`。

### []uint32

元素为 32 位无符号整数，取值范围为 `0 .. 4294967295`。

### #values

```lua
local count = #values
```

取得 slice 的元素数量。

**返回值**

| 返回值  | 类型     | 说明                      |
| ------- | -------- | ------------------------- |
| `count` | `number` | 非负整数；空 slice 为 `0` |

**行为约定**

API 返回的列表可能为 `nil`，也可能是长度为 0 的 slice。调用上述操作前，`values` 必须非 `nil`；仅检查 `if values then` 不能判断是否有元素。

### values[i]

```lua
local value = values[i]
```

读取 slice 中的一个元素。

**参数**

| 参数 | 类型     | 说明                                     |
| ---- | -------- | ---------------------------------------- |
| `i`  | `number` | 必填，必须是 `1 .. #values` 范围内的整数 |

**返回值**

| 返回值  | 类型                            | 说明                                     |
| ------- | ------------------------------- | ---------------------------------------- |
| `value` | [`net.IP`](#net-ip) 或 `number` | 分别对应 `[]net.IP` 和 `[]uint32` 的元素 |

**行为约定**

越界访问会抛出 Lua 异常，不会返回 `nil`。避免直接修改 API 返回的 slice。

**示例**

```lua
if ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```

### values()

```lua
for i, value in values() do
    -- 使用下标 i 和元素 value
end
```

取得 slice 迭代器，用于泛型 `for` 遍历，下标从 1 开始。

**参数**

无额外参数。

**返回值**

| 返回值 | 类型       | 说明                         |
| ------ | ---------- | ---------------------------- |
| 迭代器 | `function` | 逐项提供下标和元素，用法如上 |

**行为约定**

slice 不支持 `pairs` 或 `ipairs`，也可以通过数值 `for` 遍历。

**示例**

```lua
if ips ~= nil then
    for i = 1, #ips do
        local text = ips[i]:String()
    end

    for i, ip in ips() do
        local text = ip:String()
    end
end
```

## IP 列表输入

向 `IPMatcher` 传入 IP 列表时，可以使用以下形式：

| 输入形式                 | Lua 表现   | 说明                                              |
| ------------------------ | ---------- | ------------------------------------------------- |
| [`[]net.IP`](#net-ip-1)  | `userdata` | IP 列表，允许空 slice                             |
| [`net.IP`](#net-ip) 数组 | `table`    | 从 1 开始连续存放 IP，允许空数组 `{}`，不能有空洞 |
| `nil`                    | `nil`      | 须显式传入；各方法的结果见对应条目                |

IP 地址字符串不会被解析为 `net.IP`。空字符串 `""` 不是合法 IP 列表，传给 `AnyMatch`、`Matches` 或 `FilterIPs` 会抛出 Lua 异常。

## error

| 属性        | 说明                              |
| ----------- | --------------------------------- |
| Go 底层类型 | `error`                           |
| Lua 表现    | 错误为 `userdata`，无错误为 `nil` |

API 返回的 `err` 为 `nil` 时表示没有错误，否则为错误对象。错误对象可原样作为 Hook 的 `err` 返回值，将错误交给 Xray 核心处理。

**Hook 返回约定**

| 错误值          | 含义                                         |
| --------------- | -------------------------------------------- |
| `nil`           | 没有错误                                     |
| 错误 `userdata` | 保留原始错误                                 |
| `string`        | 脚本提供的错误消息，空字符串 `""` 仍表示错误 |

字符串错误仅适用于 Hook 返回。Xray API 自身返回错误或 `nil`。具体校验及失败行为见对应 Hook 的说明。

**输出错误消息**

Go 错误对象无法通过 `tostring(err)` 取得消息；需要输出时，直接将 `err` 传给 [`xray.log`](./module-log.md)。

```lua
local log = require("xray.log")
local ips, ttl, err = serverObj:Query(domain, ipv4, ipv6, fake)
if err ~= nil then
    log.Warning("DNS 查询失败：", err)
elseif ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```
