# xray.router

提供[路由脚本](../guide/routing.md)使用的常量和辅助接口。请求参数与上下文见[路由 Hook](./hook-routing.md)。

```lua
local router = require("xray.router")
```

## API 索引

| 分类 | 成员                                                       | 说明                   |
| ---- | ---------------------------------------------------------- | ---------------------- |
| 常量 | [`router.NetworkUnknown`](#常量)                           | 未知网络               |
| 常量 | [`router.NetworkTCP`](#常量)                               | TCP                    |
| 常量 | [`router.NetworkUDP`](#常量)                               | UDP                    |
| 常量 | [`router.NetworkUNIX`](#常量)                              | UNIX                   |
| 常量 | [`router.LocalOS`](#常量)                                  | 运行平台               |
| 函数 | [`router:PickOutbound(balancerTag)`](#router-pickoutbound) | 通过负载均衡器选择出站 |
| 函数 | [`router.FindProcess(ctx)`](#router-findprocess)           | 查找本地连接对应的进程 |

## 常量

| 名称                    | 类型     | 值 / 说明                                             |
| ----------------------- | -------- | ----------------------------------------------------- |
| `router.NetworkUnknown` | `number` | `0`，未知网络                                         |
| `router.NetworkTCP`     | `number` | `2`，TCP                                              |
| `router.NetworkUDP`     | `number` | `3`，UDP                                              |
| `router.NetworkUNIX`    | `number` | `4`，UNIX                                             |
| `router.LocalOS`        | `string` | 当前运行平台，例如 `"windows"`、`"linux"`、`"darwin"` |

可将[路由 Hook](./hook-routing.md#handleroute) 的 `network` 参数与网络常量比较：

```lua
if network == router.NetworkUDP then
    return "direct", "lua-udp"
end
```

## 函数

### router:PickOutbound

```lua
local outboundTag, err = router:PickOutbound(balancerTag)
```

通过指定的负载均衡器选择出站。

**参数**

| 参数          | 类型     | 说明 / 要求                                                                                               |
| ------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `balancerTag` | `string` | 要使用的负载均衡器的 `tag` 值，在 [`routing.balancers`](../../../config/routing.md#balancerobject) 中配置 |

**返回值**

| 返回值        | 类型                                      | 说明                         |
| ------------- | ----------------------------------------- | ---------------------------- |
| `outboundTag` | `string` 或 `nil`                         | 成功时为选中出站的非空 `tag` |
| `err`         | [`error`](./data-types.md#error) 或 `nil` | `nil` 表示成功               |

**行为约定**

必须显式传入字符串，否则抛出 Lua 异常。空字符串 `""` 会按空 `tag` 查找。

使用结果前应先检查 `err`。负载均衡器不存在时返回 `nil, err`；存在但未选出出站时返回 `"", err`。配置的 `fallbackTag` 生效时，返回该出站标识和 `nil`。

**示例**

下面使用 `tag` 为 `"proxy-pool"` 的负载均衡器，并按[路由 Hook 的返回值约定](./hook-routing.md#返回值)传递结果：

```lua
local outboundTag, err = router:PickOutbound("proxy-pool")
return outboundTag, "lua-balance", err
```

完整示例见[路由脚本指南](../guide/routing.md#与路由配置的关系)。

### router.FindProcess

```lua
local pid, name, path, err = router.FindProcess(ctx)
```

查找本机上与当前连接对应的进程。

**参数**

| 参数  | 类型                                                   | 说明 / 要求                        |
| ----- | ------------------------------------------------------ | ---------------------------------- |
| `ctx` | [`routing.Context`](./hook-routing.md#routing-context) | 当前请求的上下文，由路由 Hook 传入 |

**返回值**

| 返回值 | 类型                                      | 说明                            |
| ------ | ----------------------------------------- | ------------------------------- |
| `pid`  | `number`                                  | 进程 ID；未取得时通常为 `0`     |
| `name` | `string`                                  | 进程名称；未取得时为 `""`       |
| `path` | `string`                                  | 可执行文件路径；未取得时为 `""` |
| `err`  | [`error`](./data-types.md#error) 或 `nil` | `nil` 表示成功                  |

**行为约定**

须显式传入有效的路由上下文，否则抛出 Lua 异常。没有来源 IP、网络类型不是 TCP/UDP、查找失败或平台不支持时，返回错误。

`pid`、`name`、`path` 始终非 `nil`，但失败时可能保留部分信息，使用前应先检查 `err`。没有来源 IP 或网络类型不受支持时，返回 `0, "", "", err`；其他情况原样返回平台查找器的结果。

查询使用首个来源 IP 和来源端口；有目标 IP 时，同时传入首个目标 IP 和目标端口。具体匹配方式由平台查找器决定。

查找能力取决于运行平台和权限。Windows、Linux 和 macOS 提供内置实现；Android 需由运行环境注册查找器，成功时也可能没有名称或路径。iOS 和其他不支持的平台返回错误。

**示例**

```lua
local pid, name, path, err = router.FindProcess(ctx)
if err == nil and name == "curl" then
    return "direct", "lua-process"
end
```
