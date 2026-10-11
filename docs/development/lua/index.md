# Lua 脚本

Lua 脚本为 Xray 提供灵活的扩展方式，可用于实现自定义功能，与核心交互。

## 入门

先阅读[运行环境与脚本加载](./environment.md)，了解 Lua 支持范围、模块加载方式和脚本文件定位规则。

## 编写指南

根据需要实现的功能选择指南，从最小示例开始，逐步编写自己的脚本：

| 指南                           | 作用                | 内容                                     |
| ------------------------------ | ------------------- | ---------------------------------------- |
| [路由脚本](./guide/routing.md) | 自定义路由规则      | 出站选择、负载均衡、主动解析后按 IP 分流 |
| [DNS 脚本](./guide/dns.md)     | 自定义 DNS 查询规则 | 上游选择、查询回退、结果过滤             |

当前的路由和 DNS 脚本都使用池化实例。编写脚本时，请结合[池化生命周期](./guide/lifecycle.md#池化生命周期)理解顶层初始化和状态保留。

## 参考

### Hook

Hook 是脚本中供核心在特定时机调用的 Lua 函数。脚本入口决定可用的 Hook 及其调用约定，一个入口可以对应多个 Hook。具体需要实现哪些 Hook，以相应入口的说明为准。

目前支持的入口和 Hook 如下，参数、返回值和失败行为见各 Hook 的参考页：

| 脚本入口         | Hook                                       |
| ---------------- | ------------------------------------------ |
| `routing.script` | [HandleRoute](./reference/hook-routing.md) |
| `dns.script`     | [HandleDNSQuery](./reference/hook-dns.md)  |

### 数据类型

除 Lua 自带的数据类型外，Xray Lua 还使用 `net.IP`、Go slice 和 `error` 等类型，其在 Lua 中的表示与操作方式见[数据类型](./reference/data-types.md)。

### 模块 API

按功能查阅模块 API：

| 模块                                          | 用途                 |
| --------------------------------------------- | -------------------- |
| [xray.router](./reference/module-router.md)   | 策略路由             |
| [xray.dns](./reference/module-dns.md)         | 域名解析             |
| [xray.geodata](./reference/module-geodata.md) | 域名和 IP 匹配、过滤 |
| [xray.log](./reference/module-log.md)         | 输出日志             |
