# 配置文件

> **这个章节将告诉您所有的 Xray 配置细节，掌握这些内容，在您手中 Xray 将发挥更大威力。**

## 概述

Xray 的配置文件为 json 格式, 客户端和服务端的配置格式没有区别, 只是实际的配置内容不一样。
形式如下:

```json
{
  "vsersion": {},
  "log": {},
  "api": {},
  "dns": {},
  "routing": {},
  "policy": {},
  "inbounds": [],
  "outbounds": [],
  "transport": {},
  "stats": {},
  "reverse": {},
  "fakedns": {},
  "metrics": {},
  "observatory": {},
  "burstObservatory": {}
}
```

::: warning
如果你刚接触 Xray, 您可以先点击查看[快速入门中的配置运行](../document/install.md), 学习最基本的配置方式, 然后查看本章节内容以掌握所有 Xray 的配置方式。
:::

::: details 点击展开：学会如何让 AI 直接写出正确的配置文件
建议复制以下内容发送给 AI，能显著提高生成的配置可用性：

````text
[https://xtls.github.io/llms-full.txt](https://xtls.github.io/llms-full.txt) 此链接是 Xray-core 的官方全量文档。

【角色设定】
你是一位精通网络协议和 Xray-core 配置的专家。

【任务要求】
1. 知识库：请读取并深入理解该链接内容，将其作为你解答问题和编写配置的唯一依据。
2. 严禁幻觉：绝对不要编造文档中不存在的字段。如果文档没写，请直接告诉我“文档未提及”。
3. 格式默认：虽然 Xray 支持多种格式，但请默认输出标准 JSON 格式的配置（除非我明确要求 YAML 或 TOML），并添加关键中文注释。
4. 异常处理：如果你无法访问该链接，请明确告知我，并请提示我手动下载该文档并上传给你。
:::




## 基础配置模块

> version

可选，控制该 config 可以运行的版本，当分享 config 时防止在不期望的客户端版本意外运行，运行时客户端将会检查当前版本是否匹配该要求。

```json
"version": {
    "min": "25.8.3",
    "max": ""
}
````

`min` 与 `max` 均为可选，不设置或留空代表不设限。不需要是实际存在的版本，只要符合 Xray 版本号 x.y.z 的语法即可。

25.8.3 是 Xray 添加该功能的版本，设置低于这个的版本没有任何意义(旧版本不会检查)

> log:[LogObject](./log.md)

日志配置，控制 Xray 输出日志的方式.

> api:[ApiObject](./api.md)

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

> transport: [TransportObject](./transport.md)

用于配置 Xray 其它服务器建立和使用网络连接的方式。

> stats: [StatsObject](./stats.md)

用于配置流量数据的统计。

> reverse: [ReverseObject](./reverse.md)

反向代理。可以把服务器端的流量向客户端转发，即逆向流量转发。

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS 配置。可配合透明代理使用，以获取实际域名。

> metrics: [metricsObject](./metrics.md)

metrics 配置。更直接（希望更好）的统计导出方式。

> observatory: [ObservatoryObject](./observatory.md#observatoryobject)

后台连接观测。探测出站代理的连接状态。

> burstObservatory: [BurstObservatoryObject](./observatory.md#burstobservatoryobject)

突发连接观测。探测出站代理的连接状态。
