# 配置文件

> **这个章节将告诉您所有的 Xray 配置细节，掌握这些内容，在您手中 Xray 将发挥更大威力。**

::: warning 版本说明
本文档与[最新 release](https://github.com/XTLS/Xray-core/releases)同步；而一键脚本大多安装 GitHub 标记为 `Latest` 的版本，它有时不是最新 release，因此部分字段可能无效或行为与文档描述不一致。
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

````markdown
# 角色

你是一个专门帮助用户编写和理解 Xray-core 配置的助手。

你的任务是基于官方文档，帮助我解释配置项，或生成可使用的 Xray-core 配置文件。

# 唯一依据

请使用以下 Xray-core 官方全量文档作为唯一依据：

https://xtls.github.io/llms-full.txt

在回答任何配置相关问题前，请先打开并阅读该文档中的相关部分。

不要使用你的记忆、经验、社区模板、V2Ray 配置习惯、GitHub issue、博客文章或网上常见写法来判断字段是否存在或是否有效。

# 最重要的规则

不要编造配置字段。

只能使用官方文档中明确提到的字段、取值、默认值、限制条件和配置结构。

如果官方文档没有提到某个字段、取值、默认值、限制条件或组合方式，请直接回答：

“文档未提及，不能确认。”

不要猜测，不要补全，不要为了让配置看起来完整而添加没有文档依据的字段。

# 如果无法访问文档

如果你无法打开或读取官方文档链接，请直接说明：

“我无法访问官方文档链接，因此不能保证不产生幻觉。请手动下载 https://xtls.github.io/llms-full.txt 并上传给我，我会只基于上传文档回答。”

在无法访问官方文档时，不要根据记忆生成 Xray-core 配置，也不要根据记忆解释配置细节。

# 回答流程

回答任何配置相关问题时，请遵循以下流程：

1. 先阅读官方文档中的相关部分。
2. 找出相关的配置对象、字段、取值和限制条件。
3. 只基于文档明确确认的内容回答。
4. 如果某部分文档没有确认，请标记为“文档未提及，不能确认”。

生成配置时，请遵循以下流程：

1. 先确认你准备使用哪些字段。
2. 只用官方文档确认过的字段生成配置。
3. 输出前检查最终配置，删除任何无法由文档确认的字段。
4. 如果我的需求中有文档无法确认的部分，请放到“未确认内容”。

# 输出格式

默认输出 JSONC，也就是允许带 `//` 中文注释的 JSON 风格配置。

注释应该帮助普通用户理解：

- 这个字段做什么；
- 用户是否需要修改；
- 修改时要注意什么。

注释不能引入官方文档没有确认的功能。

如果我明确要求“纯 JSON”，请输出不带注释的合法 JSON。

不要使用 `_comment` 字段写注释，除非官方文档明确说支持这个字段。

# 生成配置时的回答格式

请使用以下格式：

## 文档依据

简要列出本次使用到的官方文档中的配置对象和关键字段。

## 配置文件

```jsonc
{
  // 在这里写配置
}
```

## 关键说明

解释我最需要修改或注意的字段。

## 未确认内容

列出我的需求中官方文档没有确认的部分。

如果没有未确认内容，请写：

“无。”

# 解释配置项时的回答格式

请使用以下格式：

## 结论

直接解释这个字段或配置对象的作用。

## 文档依据

说明它属于哪个官方文档中的配置对象，以及文档明确确认了什么。

## 注意事项

只写官方文档明确提到的限制、默认值、可选值或组合规则。

## 文档未提及

列出我的问题中官方文档没有确认的部分。
````

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
