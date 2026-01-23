# gRPC

A transport protocol based on gRPC.

It is based on the HTTP/2 protocol and, theoretically, can be relayed through other servers that support HTTP/2 (such as Nginx).
gRPC (HTTP/2) has built-in multiplexing. It is not recommended to enable mux.cool when using gRPC and HTTP/2.

::: danger
**It is recommended to switch to [XHTTP](https://github.com/XTLS/Xray-core/discussions/4113). Its advantages over gRPC are noted in the STREAM-UP/ONE section.**
:::

::: warning ⚠⚠⚠

- gRPC does not support specifying Host. Please fill in the **correct domain name** in the outbound proxy address, or fill in `ServerName` in `(x)tlsSettings`, otherwise the connection will fail.
- gRPC does not support falling back to other services.
- gRPC services are at risk of active probing. It is recommended to use reverse proxy tools such as Caddy or Nginx to split traffic via Path prefix.
  :::

::: tip
If you use reverse proxies like Caddy or Nginx, please note the following:

- Ensure the reverse proxy server has enabled HTTP/2.
- Use HTTP/2 or h2c (Caddy), grpc_pass (Nginx) to connect to Xray.
- The Path for normal mode is `/${serviceName}/Tun`, and for Multi mode is `/${serviceName}/TunMulti`.
- If you need to receive the client IP, you can pass the client IP by having Caddy / Nginx send the `X-Real-IP` header.
  :::

::: tip
If you are using fallback, please note the following:

- Falling back to gRPC is not recommended due to the risk of active probing.
- Please ensure `h2` is in the first position in (x)tlsSettings.alpn, otherwise gRPC (HTTP/2) may fail to complete the TLS handshake.
- gRPC cannot be split by Path.
  :::

## GRPCObject

`GRPCObject` corresponds to the `grpcSettings` item in the transport configuration.

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

A string. Can be used as Host to achieve some other purposes.

> `serviceName`: string

A string. Specifies the service name, **similar to** Path in HTTP/2.
The client uses this name for communication, and the server verifies if the service name matches.

::: tip
When `serviceName` starts with a slash, you can customize the path. It requires at least two slashes.<br>
For example, fill in `"serviceName": "/my/sample/path1|path2"` on the server side, and the client can fill in `"serviceName": "/my/sample/path1"` or `"/my/sample/path2"`.
:::

> `user_agent`: string

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

Set the User-Agent for gRPC. This may prevent some CDNs from blocking gRPC traffic.

> `multiMode`: true | false <Badge text="BETA" type="warning"/>

`true` enables `multiMode`. Default value: `false`.

This is an **experimental** option. It may not be kept long-term and cross-version compatibility is not guaranteed. This mode can bring about a 20% performance improvement in **test environments**, but actual results vary depending on transfer rates.

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

> `idle_timeout`: number

Unit: seconds. When there is no data transmission during this period, a health check will be performed. If this value is set below `10`, `10` will be used (the minimum value).

::: tip
If you are not using reverse proxy tools like Caddy or Nginx (**usually not**), and set this below `60`, the server might send unexpected h2 GOAWAY frames to close existing connections.
:::

Health checks are **disabled** by default.

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

::: tip
May resolve some "disconnection" issues.
:::

> `health_check_timeout`: number

Unit: seconds. The timeout for health checks. If the health check is not completed within this time, and there is still no data transmission, the health check is considered failed. Default value is `20`.

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

> `permit_without_stream`: true | false

`true` allows health checks when there are no sub-connections (streams). Default value is `false`.

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

> `initial_windows_size`: number

Initial window size for h2 Stream. When the value is less than or equal to `0`, this feature does not take effect. When the value is greater than `65535`, the Dynamic Window mechanism will be disabled. Default value is `0` (disabled).

::: tip
**Only** needs to be configured on **outbound** (**client**).
:::

::: tip
When going through Cloudflare CDN, you can set the value to `65536` or higher (disabling Dynamic Window) to prevent Cloudflare CDN from sending unexpected h2 GOAWAY frames to close existing connections.
:::
