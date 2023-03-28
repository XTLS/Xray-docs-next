# gRPC

An modified transport protocol based on gRPC.

gRPC is based on the HTTP/2 protocol and can theoretically be relayed by other servers that support HTTP/2, such as Nginx.

gRPC and HTTP/2 has built-in multiplexing, so it is not recommended to enable `mux.cool` when using gRPC or HTTP/2.

::: warning ⚠⚠⚠

- gRPC doesn't support specifying the Host. Please enter the **correct domain name** in the outbound proxy address, or fill in `ServerName` in `(x)tlsSettings`, otherwise connection cannot be established.
- gRPC doesn't support fallback to other services.
- gRPC services are at risk of being actively probed. It is recommended to use reverse proxy tools such as Caddy or Nginx to perform path-based routing.
  :::

::: tip
If you are using a reverse proxy such as Caddy or Nginx, please note the following:

- Make sure that the reverse proxy server has enabled HTTP/2.
- Use HTTP/2 or h2c (Caddy), grpc_pass (Nginx) to connect to Xray.
- The path for regular mode is `/${serviceName}/Tun`, and for Multi mode it is `/${serviceName}/TunMulti`.
- If you need to receive the client IP address, you can use the `X-Real-IP` header sent by Caddy / Nginx to pass the client IP.
  :::

::: tip
If you are using fallback, please note the following:

- Fallback to gRPC is not recommended, as there is a risk of being actively probed.
- Please make sure that `h2` is the first priority in `(x)tlsSettings.alpn`, otherwise gRPC (HTTP/2) may not be able to complete TLS handshake.
- gRPC cannot perform path-based routing by Xray.
  :::

## GRPCObject

`GRPCObject` corresponds to the `grpcSettings` item.

```json
{
  "serviceName": "name",
  "multiMode": false,
  "idle_timeout": 60,
  "health_check_timeout": 20,
  "permit_without_stream": false,
  "initial_windows_size": 0
}
```

> `serviceName`: string

A string that specifies the service name, similar to the `path` in HTTP/2.

The client will use this name for communication, and the server will verify whether the service name matches.

> `multiMode`: true | false <Badge text="BETA" type="warning"/>

`true` enables `multiMode`, with a default value of `false`.

This is an **experimental** option that may not be retained for the long term, and cross-version compatibility is not guaranteed. This mode can bring about a performance improvement of around 20% in **test environments**, but actual effects may vary depending on the transmission rate.

::: tip
**Only need to be configured** in `outbound` **(client)**.
:::

> `idle_timeout`: number

The health check is performed when no data transmission occurs for a certain period of time, measured in seconds. If this value is set to less than `10`, `10` will be used as the minimum value.

::: tip
If you are not using reverse proxy tools such as Caddy or Nginx (**which is usually the case**), if this value is set to less than `60`, the server may send "unexpected h2 GOAWAY" frames to close existing connections.
:::

By default, the health check is **not enabled**.

::: tip
**Only need to be configured** in `outbound` **(client)**.
:::

::: tip
Enabling health checks may help solve some "connection drop" issues.
:::

> `health_check_timeout`: number

The timeout for the health check, measured in seconds. If the health check is not completed within this time period, it is considered to have failed.
The default value is `20`

::: tip
**Only need to be configured** in `outbound` **(client)**.
:::

> `permit_without_stream`: true | false

`true` allows health checks to be performed when there are no sub-connections. The default value is `false`.

::: tip
**Only need to be configured** in `outbound` **(client)**.
:::

> `initial_windows_size`: number

The initial window size of the h2 stream. When the value is less than or equal to `0`, this feature does not take effect. When the value is greater than `65535`, the Dynamic Window mechanism will be disabled. The default value is `0`, which means it is not effective.

::: tip
**Only need to be configured** in `outbound` **(client)**.
:::

::: tip
When using Cloudflare CDN, set the value to `35536` or higher to disable the Dynamic Window mechanism and prevent Cloudflare CDN from sending "unexpected h2 GOAWAY" frames to close existing connections.
:::
