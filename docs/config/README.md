---
title: 配置文件
lang: zh-CN
---

> **这个章节将告诉您所有的 Xray 配置细节，掌握这些内容，在您手中 Xray 将发挥更大威力。**

## 概述

Xray 的配置文件为 json 格式, 客户端和服务端的配置格式没有区别, 只是实际的配置内容不一样。  
形式如下:

```json
{
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

## 基础配置模块

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

并发连接观测。探测出站代理的连接状态。
