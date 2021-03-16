# gRPC

基于 gRPC 的传输方式。

它基于 HTTP/2 协议，理论上可以通过其它支持 HTTP/2 的服务器（如 Nginx）进行中转。

gRPC（HTTP/2）内置多路复用，不建议使用 gRPC 与 HTTP/2 时启用 mux.cool。

::: tip
如果您使用 Caddy 或 Nginx 等反向代理，请务必使用 HTTP/2 或 h2c 连接到 Xray。
:::

::: warning
⚠️ 如果你正在使用回落，请注意下列事项：
- 请确认 (x)tlsSettings.alpn 中包含 h2，否则 gRPC（HTTP/2）无法完成 TLS 握手。
- gRPC 无法通过进行 Path 分流，建议使用 SNI 分流。
:::

## GRPCObject

`GRPCObject` 对应传输配置的 `grpcSettings` 项。

```json
{
  "serviceName": "name",
  "multiMode": false
}
```

> `serviceName`: string 

一个字符串，指定服务路径，相当于 HTTP/2 与 WebSocket 中的 Path。

客户端会使用此名称进行通信，服务器会验证服务名称是否匹配。

> `multiMode`: bool <Badge text="BETA" type="warning"/>

一个布尔值。表示是否启用 `multiMode`。

这是一个 **实验性** 选项，可能不会被长期保留，也不保证跨版本兼容。此模式在 **测试环境中** 能够带来约 20% 的性能提升，实际效果因传输速率不同而不同。