# 路由 Hook

核心在选择出站时调用 `routing.script` 中的全局函数 `HandleRoute`。配置接入和完整示例见[路由脚本指南](../guide/routing.md)。

## API 索引

| 分类 | 成员                                    | 说明                 |
| ---- | --------------------------------------- | -------------------- |
| Hook | [`HandleRoute(...)`](#handleroute)      | 为请求选择出站       |
| 对象 | [`routing.Context`](#routing-context)   | 当前请求的路由上下文 |
| 方法 | [`ctx:GetSourceIPs()`](#getsourceips)   | 取得来源 IP          |
| 方法 | [`ctx:GetTargetIPs()`](#gettargetips)   | 取得目标 IP          |
| 方法 | [`ctx:GetLocalIPs()`](#getlocalips)     | 取得本地 IP          |
| 方法 | [`ctx:GetAttributes()`](#getattributes) | 取得请求属性         |

## Hook 接口

### HandleRoute(...)

```lua
function HandleRoute(ctx, inboundTag, sourcePort, targetPort,
    localPort, targetDomain, network, protocol, user,
    vlessRoute, skipDNSResolve)
    return outboundTag, ruleTag, err
end
```

为当前请求选择出站，并可返回规则名称或错误。

#### 参数

核心始终按上述顺序传入全部 11 个参数，均非 `nil`。函数定义可省略不使用的末尾形参，这不会改变核心传入的值。

| 参数             | 类型                                  | 说明                                                                   | 空值与缺省值                                           |
| ---------------- | ------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `ctx`            | [`routing.Context`](#routing-context) | 当前请求上下文                                                         | 始终是有效的 `userdata`                                |
| `inboundTag`     | `string`                              | 入站标识                                                               | 入站未设置 tag 或没有入站信息时为 `""`                 |
| `sourcePort`     | `number`                              | 来源端口，`0 .. 65535`                                                 | 没有有效来源地址时为 `0`                               |
| `targetPort`     | `number`                              | 目标端口，`0 .. 65535`                                                 | 没有有效目标地址时为 `0`                               |
| `localPort`      | `number`                              | 入站连接的本地端口，`0 .. 65535`                                       | 没有有效本地地址时为 `0`                               |
| `targetDomain`   | `string`                              | 优先取生效的嗅探域名，否则取连接目标中的域名，统一转为小写             | 目标为 IP 且无生效的嗅探域名，或缺少目标信息时为 `""`  |
| `network`        | `number`                              | 网络类型，与 [`router.NetworkTCP`](./module-router.md#常量) 等常量比较 | 没有出站信息或网络类型未知时为 `NetworkUnknown`（`0`） |
| `protocol`       | `string`                              | 嗅探得到的协议                                                         | 没有嗅探协议信息时为 `""`                              |
| `user`           | `string`                              | 用户 email                                                             | 没有入站、用户信息或未设置 email 时为 `""`             |
| `vlessRoute`     | `number`                              | VLESS UUID 第 7、8 字节组成的路由值，`0 .. 65535`                      | 没有该信息时为 `0`，值本身也可能为 0                   |
| `skipDNSResolve` | `boolean`                             | 为 `true` 时必须跳过 DNS 查询，避免回环                                | 没有该标记或附加请求信息时为 `false`                   |

#### 返回值

| 返回值        | 类型                                                | 说明                                          |
| ------------- | --------------------------------------------------- | --------------------------------------------- |
| `outboundTag` | `string` 或 `nil`                                   | 出站标识；`nil` 或 `""` 表示未选中            |
| `ruleTag`     | `string` 或 `nil`                                   | 可选的规则名称；`nil`、省略或 `""` 表示无名称 |
| `err`         | [`error`](./data-types.md#error)、`string` 或 `nil` | 仅 `nil` 表示无错误                           |

#### 行为约定

核心依次校验 `err`、`outboundTag`、`ruleTag`，遇到错误即停止；`err` 非 `nil` 时忽略前两项，未选中出站时忽略 `ruleTag`。

成功时可省略末尾的 `ruleTag` 和 `err`，例如 `return "direct"`。错误必须放在第三个位置，例如 `return nil, nil, "路由失败"`；`return nil, "路由失败"` 不会报告错误。

| 脚本结果                           | 核心处理                           |
| ---------------------------------- | ---------------------------------- |
| 校验通过且 `outboundTag` 非空      | 使用对应出站，标识不存在则关闭连接 |
| 未选中出站                         | 使用默认出站                       |
| 返回错误、返回值类型错误或执行异常 | 记录错误并尝试默认出站             |

默认出站是配置中的第一个出站；没有可用默认出站时关闭连接。若要阻断流量应显式返回已配置的 [`blackhole`](../../../config/outbounds/blackhole.md) 出站 tag 而不是利用此特性返回不存在的标识。

## 关联对象

### routing.Context

`routing.Context` 表示当前请求的路由上下文，在 `HandleRoute` 中通过参数 `ctx` 访问。

| 属性        | 说明                                           |
| ----------- | ---------------------------------------------- |
| Go 底层类型 | `features/routing` 中的 `routing.Context` 接口 |
| Lua 表现    | `userdata`                                     |
| 取得方式    | 核心传入的 `HandleRoute` 第一个参数            |

下列方法均无额外参数。IP 及 slice 操作统一见[数据类型](./data-types.md)。

#### GetSourceIPs

```lua
local ips = ctx:GetSourceIPs()
```

取得请求的来源 IP。

**参数**

无额外参数。

**返回值**

| 返回值 | 类型                                            | 说明               |
| ------ | ----------------------------------------------- | ------------------ |
| `ips`  | [`[]net.IP`](./data-types.md#net-ip-1) 或 `nil` | 对应地址的 IP 列表 |

**行为约定**

没有入站、来源地址无效或来源地址不是 IP 时返回 `nil`。

#### GetTargetIPs

```lua
local ips = ctx:GetTargetIPs()
```

取得请求的目标 IP。

**参数**

无额外参数。

**返回值**

| 返回值 | 类型                                            | 说明               |
| ------ | ----------------------------------------------- | ------------------ |
| `ips`  | [`[]net.IP`](./data-types.md#net-ip-1) 或 `nil` | 对应地址的 IP 列表 |

**行为约定**

没有出站、目标地址无效或目标地址是域名时返回 `nil`。

#### GetLocalIPs

```lua
local ips = ctx:GetLocalIPs()
```

取得入站连接的本地 IP。

**参数**

无额外参数。

**返回值**

| 返回值 | 类型                                            | 说明               |
| ------ | ----------------------------------------------- | ------------------ |
| `ips`  | [`[]net.IP`](./data-types.md#net-ip-1) 或 `nil` | 对应地址的 IP 列表 |

**行为约定**

没有入站、本地地址无效或本地地址不是 IP 时返回 `nil`。

#### GetAttributes

```lua
local attributes = ctx:GetAttributes()
```

取得当前请求的属性。

**参数**

无额外参数。

**返回值**

| 返回值       | 类型                | 说明                            |
| ------------ | ------------------- | ------------------------------- |
| `attributes` | `map[string]string` | 始终返回 `userdata`，不为 `nil` |

**行为约定**

使用 `attributes[key]` 读取属性，`key` 必须为字符串。已存在的键返回字符串（可能为 `""`），不存在的键返回 `nil`。

属性的含义和用途见路由配置中的 [`attrs`](../../../config/routing.md#ruleobject) 字段。

**示例**

```lua
local attributes = ctx:GetAttributes()
if attributes[":method"] == "GET" then
    return "direct", "lua-get"
end
```
