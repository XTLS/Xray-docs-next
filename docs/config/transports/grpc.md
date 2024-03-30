# gRPC

基于 gRPC 的传输方式。

它基于 HTTP/2 协议，理论上可以通过其它支持 HTTP/2 的服务器（如 Nginx）进行中转。
gRPC（HTTP/2）内置多路复用，不建议使用 gRPC 与 HTTP/2 时启用 mux.cool。

::: warning ⚠⚠⚠

- gRPC 不支持指定 Host。请在出站代理地址中填写 **正确的域名** ，或在 `(x)tlsSettings` 中填写 `ServerName`，否则无法连接。
- gRPC 不支持回落到其他服务。
- gRPC 服务存在被主动探测的风险。建议使用 Caddy 或 Nginx 等反向代理工具，通过 Path 前置分流。
  :::

::: tip
如果您使用 Caddy 或 Nginx 等反向代理，请注意下列事项：

- 请确定反向代理服务器开启了 HTTP/2
- 请使用 HTTP/2 或 h2c (Caddy)，grpc_pass (Nginx) 连接到 Xray。
- 普通模式的 Path 为 `/${serviceName}/Tun`, Multi 模式为 `/${serviceName}/TunMulti`
- 如果需要接收客户端 IP，可以通过由 Caddy / Nginx 发送 `X-Real-IP` header 来传递客户端 IP。
  :::

::: tip
如果你正在使用回落，请注意下列事项：

- 不建议回落到 gRPC，存在被主动探测的风险。
- 请确认`h2` 位于 (x)tlsSettings.alpn 中的第一顺位，否则 gRPC（HTTP/2）可能无法完成 TLS 握手。
- gRPC 无法通过进行 Path 分流。
  :::

## GRPCObject

`GRPCObject` 对应传输配置的 `grpcSettings` 项。

```json
{
  "authority": "grpc.example.com",
  "serviceName": "name",
  "multiMode": false,
  "user_agent": "custom user agent",
  "idle_timeout": 60,
  "health_check_timeout": 20,
  "permit_without_stream": false,
  "initial_windows_size": 0
}
```

> `authority`: string

一个字符串，可以当 Host 来用，实现一些其它用途。

> `serviceName`: string

一个字符串，指定服务名称，**类似于** HTTP/2 中的 Path。
客户端会使用此名称进行通信，服务端会验证服务名称是否匹配。

::: tip
当 `serviceName` 起始为斜杠时可以自定义 path，至少要两个斜杠。<br>
例如在服务端填写 `"serviceName": "/my/sample/path1|path2"`，客户端可填写 `"serviceName": "/my/sample/path1"` 或 `"/my/sample/path2"`。
:::

> `user_agent`: string

::: tip
**只需**在**出站**（**客户端**）配置。
:::

设置 gRPC 的用户代理，可能能防止某些 CDN 阻止 gRPC 流量。

> `multiMode`: true | false <Badge text="BETA" type="warning"/>

`true` 启用 `multiMode`，默认值为： `false`。

这是一个 **实验性** 选项，可能不会被长期保留，也不保证跨版本兼容。此模式在 **测试环境中** 能够带来约 20% 的性能提升，实际效果因传输速率不同而不同。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

> `idle_timeout`: number

单位秒，当这段时间内没有数据传输时，将会进行健康检查。如果此值设置为 `10` 以下，将会使用 `10`，即最小值。

::: tip
如果没有使用 Caddy 或 Nginx 等反向代理工具（**通常不会**），设为 `60` 以下，服务端可能发送意外的 h2 GOAWAY 帧以关闭现有连接。
:::

健康检查默认**不启用**。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

::: tip
可能会解决一些“断流”问题。
:::

> `health_check_timeout`: number

单位秒，健康检查的超时时间。如果在这段时间内没有完成健康检查，且仍然没有数据传输时，即认为健康检查失败。默认值为 `20`。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

> `permit_without_stream`: true | false

`true` 允许在没有子连接时进行健康检查。默认值为 `false`。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

> `initial_windows_size`: number

h2 Stream 初始窗口大小。当值小于等于 `0` 时，此功能不生效。当值大于 `65535` 时，动态窗口机制（Dynamic Window）会被禁用。默认值为 `0`，即不生效。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

::: tip
通过 Cloudflare CDN 时，可将值设为 `65536` 及以上，即禁用动态窗口机制（Dynamic Window），可防止 Cloudflare CDN 发送意外的 h2 GOAWAY 帧以关闭现有连接。
:::
