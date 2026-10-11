# 运行环境与脚本加载

## Lua 环境

当前使用 GopherLua，支持 Lua 5.1 语法、Lua 5.2 的 `goto` 语句，以及独有的 [`channel`](https://github.com/yuin/gopher-lua#lua-api)。

Xray 根据配置文件加载 Lua 脚本。配置的位置决定脚本用于什么功能，不同位置加载的脚本可用的 Hook 也不同。各入口可用的 Hook 及其调用约定见 [Hook 参考](./index.md#hook)。

## 模块加载

API 模块按功能组织，通过 `require` 加载：

```lua
local geodata = require("xray.geodata")
local log = require("xray.log")
```

模块列表见[模块 API](./index.md#模块-api)，各函数的用法见对应 API 参考。

加载 Lua 模块、创建对象等顶层初始化的执行时机，见[实例与生命周期](./guide/lifecycle.md)。

## 脚本文件路径

配置文件中的 `script` 字段用于指定 Lua 脚本文件的路径。空字符串或未配置表示不启用脚本；绝对路径直接定位文件。

相对路径按以下顺序查找；路径不存在时继续，存在但不是普通文件时立即报错：

1. 环境变量 `XRAY_LOCATION_CONFDIR` 指定的目录；
2. 环境变量 `XRAY_LOCATION_CONFIG` 指定的目录；
3. Xray 进程的当前工作目录；
4. Xray 可执行文件所在目录。

这些目录的设置见[环境变量](../../config/env.md)。相对路径不会自动以配置文件所在目录为基准。

例如，将脚本路径设为 `routing.lua` 后，Xray 会按上述顺序查找文件。Windows 绝对路径可以写成 `C:/Xray/routing.lua`；使用反斜杠时，请按所用配置格式的要求进行转义。
