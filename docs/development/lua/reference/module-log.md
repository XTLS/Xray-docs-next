# xray.log

将日志写入 Xray 的日志系统。

```lua
local log = require("xray.log")
```

## API 索引

| 分类 | 成员                               | 说明              |
| ---- | ---------------------------------- | ----------------- |
| 函数 | [`log.Debug(...)`](#log-debug)     | 记录 debug 日志   |
| 函数 | [`log.Info(...)`](#log-info)       | 记录 info 日志    |
| 函数 | [`log.Warning(...)`](#log-warning) | 记录 warning 日志 |
| 函数 | [`log.Error(...)`](#log-error)     | 记录 error 日志   |

## 函数

### log.Debug

```lua
log.Debug(...)
```

记录 `debug` 级别的日志。

**参数**

| 参数  | 类型        | 说明 / 要求                          |
| ----- | ----------- | ------------------------------------ |
| `...` | 任意 Lua 值 | 可选，任意数量的日志内容，按顺序拼接 |

**返回值**

无返回值。

**参数转换**

参数接受不传参数、`nil`、`""`、`{}` 和空 slice，按顺序转为文本并拼接，不自动插入空格或分隔符。

- [`error`](./data-types.md#error) 优先转为错误消息。
- 其他具有函数类型 `__tostring` 的值使用该转换；转换抛出的异常向调用者传播。
- 其余值使用默认字符串表示。`nil` 转为 `"nil"`，空字符串不增加正文；table 和 slice 不会展开为元素列表。

**输出条件**

日志以调用脚本的文件名为前缀，是否输出取决于 [`log.loglevel`](../../../config/log.md#logobject)。例如设置为 `warning` 时，`Debug` 和 `Info` 不输出，也不会调用参数的 `__tostring` 转换。

四个函数均没有 `err` 返回值。将调用赋给变量时，该变量为 `nil`，不能据此判断日志是否成功输出。

**示例**

```lua
log.Info("查询域名：", domain)
log.Warning("上游查询失败：", err)
```

### log.Info

同上。

### log.Warning

同上。

### log.Error

同上。
