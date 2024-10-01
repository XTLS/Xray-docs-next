# HTTP

基于 HTTP/2 或 HTTP/3 的传输方式。

它完整按照 HTTP 标准实现，可以通过其它的 HTTP 服务器（如 Nginx）进行中转。

客户端必须开启 TLS 才可以正常使用这个传输方式。

HTTP/2和3 内置多路复用，不建议使用时启用 mux.cool。

::: tip
当前版本的 HTTP/2 的传输方式并不强制要求**入站**（**服务端**）有 TLS 配置.
这使得可以在特殊用途的分流部署环境中，由外部网关组件完成 TLS 层对话，Xray 作为后端应用，网关和 Xray 间使用明文HTTP进行通讯。
:::

::: tip
当alpn有且仅有 `h3` 时，该传输才会工作在h3模式。
:::

::: warning
- HTTP/2 和 HTTP/3 无法通过xray的回落 Path 进行分流，不建议使用回落分流。
  :::

## HttpObject

`HttpObject` 对应传输配置的 `httpSettings` 项。

```json
{
  "host": ["xray.com"],
  "path": "/random/path",
  "read_idle_timeout": 10,
  "health_check_timeout": 15,
  "method": "PUT",
  "headers": {
    "Header": ["value"]
  }
}
```

> `host`: \[string\]

一个字符串数组，每一个元素是一个域名。

客户端会随机从列表中选出一个域名进行通信，服务器会验证域名是否在列表中。

::: tip
若不写 `"httpSettings"` 或 `"host": []` 值留空时，会使用默认值 `"www.example.com"`，需要两端 `"host"` 值一致才能连接成功。`"host": [""]` 不是值留空。
:::

> `path`: string

HTTP 路径，由 `/` 开头, 客户端和服务器必须一致。

默认值为 `"/"`。

> `read_idle_timeout`: number

单位秒，当这段时间内没有接收到数据时，将会进行健康检查。

健康检查默认**不启用**。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

::: tip
可能会解决一些“断流”问题。
:::

> `health_check_timeout`: number

单位秒，健康检查的超时时间。如果在这段时间内没有完成健康检查，即认为健康检查失败。默认值为 `15`。

::: tip
**只需**在**出站**（**客户端**）配置。
:::

> `method`: string

HTTP 方法。默认值为 `"PUT"`。

设置时应参照[此处](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)列出值。

> `headers`: map{ string: \[string\] }

仅客户端，自定义 HTTP 头，一个键值对，每个键表示一个 HTTP 头名称，对应值为一个数组。
