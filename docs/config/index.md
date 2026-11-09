# 配置文件

> **这个章节将告诉您所有的 Xray 配置细节，掌握这些内容，在您手中 Xray 将发挥更大威力。**

::: warning 版本说明
本文档与[最新版本](https://github.com/XTLS/Xray-core/releases)同步（可能是 pre-release）；而一键脚本大多安装 GitHub 标记为 `Latest` 的版本，它有时不是最新版本，因此部分字段可能无效或行为与文档描述不一致。
:::

## 概述

Xray 的配置文件为 json 格式, 客户端和服务端的配置格式没有区别, 只是实际的配置内容不一样。
形式如下:

```json
{
  "env": {},
  "log": {},
  "api": {},
  "dns": {},
  "routing": {},
  "policy": {},
  "inbounds": [],
  "outbounds": [],
  "stats": {},
  "fakedns": {},
  "metrics": {},
  "observatory": {},
  "burstObservatory": {},
  "geodata": {},
  "version": {}
}
```

::: warning
如果你刚接触 Xray, 您可以先点击查看[快速入门中的配置运行](../document/install.md), 学习最基本的配置方式, 然后查看本章节内容以掌握所有 Xray 的配置方式。
:::

:::: tip 让 AI 更可靠地协助你配置 Xray
::: details 点击查看可复制的提示词
无论你是想让 AI 直接生成配置，还是想咨询具体配置问题，<br/>
都建议你**在对话一开始就先把下面这段话发给 AI**：

```markdown
请帮助我编写、检查或理解 Xray-core 配置，回答简洁，优先解决我的实际问题。

以下是 Xray-core 官方全量文档，包含多个章节的完整正文。请查阅其中与问题相关的章节，核实配置字段、取值和使用限制：
https://xtls.github.io/llms-full.txt
必要时可拉取 https://github.com/XTLS/Xray-core.git 源代码，核实实现细节。

- 官方文档始终只对应 Xray-core 最新发布版本（包括 pre-release），不会标注自身对应的版本号。默认按最新版本回答，并提醒我这一点，不要将其等同于 GitHub 标记的 `Latest`；若我指定旧版本，请另行核实兼容性，无法确认时明确说明。
- 只有缺少会影响配置正确性的关键信息时才集中提问，其余必要假设请明确说明。
- 不要编造字段、默认值或兼容性结论，也不要直接套用 V2Ray 或旧版 Xray 的配置。无法确认的内容请标明，并为关键结论附上对应的官方文档链接或章节。
- 生成配置时，提供满足需求的最小完整示例，默认使用 JSON 语法并添加少量 `//` 中文注释；如果我要求 TOML 或 YAML，则使用对应格式。
- 用清晰的占位符标出需要替换的地址、UUID、密钥和证书路径等信息，并简要说明关键设置及验证方法。未实际运行验证时，请明确说明。
```

:::
::::

## 基础配置模块

> env: [EnvObject](./env.md)

环境变量，供修改 Xray 的一些底层配置。

> log: [LogObject](./log.md)

日志配置，控制 Xray 输出日志的方式.

> api: [ApiObject](./api.md)

提供了一些 API 接口供远程调用。

> dns: [DnsObject](./dns.md)

内置的 DNS 服务器. 如果没有配置此项，则使用系统的 DNS 设置。

> routing: [RoutingObject](./routing.md)

路由功能。可以设置规则分流数据从不同的 outbound 发出.

> policy: [PolicyObject](./policy.md)

本地策略，可以设置不同的用户等级和对应的策略设置。

> inbounds: \[ [InboundObject](./inbound.md) \]

一个数组，每个元素是一个入站连接配置。

> outbounds: \[ [OutboundObject](./outbound.md) \]

一个数组，每个元素是一个出站连接配置。

> stats: [StatsObject](./stats.md)

用于配置流量数据的统计。

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS 配置。可配合透明代理使用，以获取实际域名。

> metrics: [metricsObject](./metrics.md)

metrics 配置。更直接（希望更好）的统计导出方式。

> observatory: [ObservatoryObject](./observatory.md#observatoryobject)

后台连接观测。探测出站代理的连接状态。

> burstObservatory: [BurstObservatoryObject](./observatory.md#burstobservatoryobject)

突发连接观测。探测出站代理的连接状态。

> geodata: [GeodataObject](./geodata.md)

地理数据文件自动更新与热重载。

> version

可选，控制该 config 可以运行的版本，当分享 config 时防止在不期望的客户端版本意外运行，运行时客户端将会检查当前版本是否匹配该要求。

```json
{
  "version": {
    "min": "25.8.3",
    "max": ""
  }
}
```

`min` 与 `max` 均为可选，不设置或留空代表不设限。不需要是实际存在的版本，只要符合 Xray 版本号 x.y.z 的语法即可。

25.8.3 是 Xray 添加该功能的版本，设置低于这个的版本没有任何意义 (旧版本不会检查)
