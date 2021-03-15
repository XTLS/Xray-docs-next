---
date: "2021-3-14T00:00:00.000Z"
description: Project X 的文档.
title: gRPC
weight: 7
---

基于 gRPC 的传输方式。

它基于 HTTP/2 协议，可以通过其它的 HTTP 服务器（如 Nginx）进行中转。

## GRPCObject

---

`GRPCObject` 对应传输配置的 `grpcSettings` 项。

```json
{
  "serviceName": "name"
}
```

> `serviceName`: string 

一个字符串，指定服务路径，相当于 HTTP/2 与 WebSocket 中的 Path。

客户端会使用此名称进行通信，服务器会验证服务名称是否匹配。

