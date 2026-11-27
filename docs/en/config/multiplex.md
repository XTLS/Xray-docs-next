# Multiplex

Multiplex carries several independent streams over one connection between an Xray client and a proxy server. A pool is a group of connections to the same server that the client reuses. Multiplex limits apply to the number of concurrent streams on each connection. The pool opens additional connections as needed.

## Where Multiplex is configured

### Outbound connection

Multiplex pools are configured in a [VLESS](./outbounds/vless.md) or [VMess](./outbounds/vmess.md) outbound. This setting is unavailable for other outbound protocols, including SOCKS, HTTP, Shadowsocks and Trojan.

In a chain of servers, Multiplex is configured separately for each hop, in the outbound of the node that connects to the next server.

### Inbound connection

A [VLESS](./inbounds/vless.md) or [VMess](./inbounds/vmess.md) inbound automatically recognizes Multiplex. Xray routes each accepted stream.

## Complete Multiplex configuration

The `multiplex` object belongs inside the outbound's `settings`. Its full JSON path is `outbounds[].settings.multiplex`. It has three optional fields — `concurrency`, `xudpConcurrency` and `xudpProxyUDP443`.

Multiplex behavior depends on the selected transport. The outbound transport is selected by `method` in `streamSettings`. [How the transport affects Multiplex](#how-the-transport-affects-multiplex)

In this VLESS over RAW configuration with TLS, TCP uses the shared pool and UDP uses a separate pool. Packets addressed to UDP port 443 are rejected.

> [!TIP]
>
> ```json {7-11}
> {
>   "outbounds": [
>     {
>       "tag": "vless-mux",
>       "protocol": "vless",
>       "settings": {
>         "multiplex": {
>           "concurrency": 8,
>           "xudpConcurrency": 16,
>           "xudpProxyUDP443": "reject"
>         },
>         "address": "proxy.example.com",
>         "port": 443,
>         "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
>         "encryption": "none"
>       },
>       "streamSettings": {
>         "method": "raw",
>         "security": "tls"
>       }
>     }
>   ]
> }
> ```

### Multiplex fields

<span id="concurrency"></span>

**`concurrency`**

Integer. The maximum number of concurrent streams on each connection in the shared pool. This pool carries TCP and also carries UDP when the separate UDP pool is disabled.

<span id="xudpconcurrency"></span>

**`xudpConcurrency`**

Integer. The maximum number of concurrent UDP streams on each connection in the separate UDP pool.

<span id="accepted-values-for-concurrency-and-xudpconcurrency"></span>

**Accepted values for `concurrency` and `xudpConcurrency`**

In JSON, both fields accept integers from `0` through `32767`. A negative number, a number greater than `32767`, a fraction or a string causes a configuration loading error. The effect of zero and positive values depends on the [transport](#how-the-transport-affects-multiplex).

<span id="xudpproxyudp443"></span>

**`xudpProxyUDP443`**

String. Controls UDP packets addressed to **destination port 443** when traffic uses either the shared pool or the separate UDP pool.

- Omitted, `""` or `"reject"` — reject the packets. This is the default.
- `"allow"` — carry the packets through the selected pool using XUDP.
- `"skip"` — send the packets outside the pool according to the protocol's rules. For XDrive, use `"reject"` or `"allow"`. [UDP handling on XDrive](#allowing-udp-port-443)
- Any other string, such as `"ALLOW"`, causes a configuration loading error.

<span id="multiplex-on-different-transports"></span>

## How the transport affects Multiplex

### RAW, gRPC, WebSocket, HTTPUpgrade, mKCP and Hysteria

For these transports, set `streamSettings.method` to `"raw"`, `"grpc"`, `"websocket"`, `"httpupgrade"`, `"mkcp"` or `"hysteria"`, respectively. The transport's own parameters and security settings are described in the [transport reference](./transport.md).

<span id="shared-pool-rules"></span>

- `concurrency` omitted or `0` — the shared pool is disabled and TCP is carried outside Multiplex.
- `xudpConcurrency` omitted or `0` — the separate UDP pool is disabled. UDP uses the shared pool when it is enabled.
- Both fields omitted or `0` — both pools are disabled. An omitted or empty `multiplex` object has the same effect.
- From `1` through `1024` — the corresponding pool is enabled. The value limits concurrent streams on each connection.
- From `1025` through `32767` — the pool is enabled, with a concurrent-stream limit of 1024 per connection.

Each connection serves up to 1024 streams over its lifetime, including completed streams. The pool then assigns new streams to other connections.

<span id="short-configuration-forms"></span>
<span id="configuration-variants"></span>

The following pool configurations apply to VMess and VLESS without Vision. Each fragment belongs inside the outbound's `settings`. A complete outbound configuration using RAW is provided [above](#complete-multiplex-configuration).

<span id="separate-connections-for-tcp-and-udp"></span>

**Separate connections for TCP and UDP**

Here the shared pool carries TCP with a limit of 8, while the separate pool carries UDP with a limit of 16. UDP packets addressed to port 443 use the default `"reject"` action.

> [!TIP]
>
> ```json {2-5}
> {
>   "multiplex": {
>     "concurrency": 8,
>     "xudpConcurrency": 16
>   }
> }
> ```

<span id="shared-connections-for-tcp-and-udp"></span>

**Shared connections for TCP and UDP**

TCP and UDP use the shared pool and share its limit of 8 concurrent streams per connection.

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "concurrency": 8
>   }
> }
> ```

<span id="only-udp-through-multiplex"></span>

**Only UDP through Multiplex**

The UDP pool accepts up to 16 concurrent streams per connection. UDP packets addressed to port 443 are rejected. TCP is carried outside the pool.

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "xudpConcurrency": 16
>   }
> }
> ```

<span id="tcp-and-udp-without-multiplex-pools"></span>

**TCP and UDP without Multiplex pools**

To explicitly leave both pools disabled, place an empty `multiplex` object inside `settings`.

> [!TIP]
>
> ```json {2}
> {
>   "multiplex": {}
> }
> ```

<span id="udp-port-443-outside-the-shared-pool"></span>

**UDP port 443 outside the shared pool**

The `"skip"` value sends UDP packets addressed to port 443 outside the pool. Other UDP packets use the shared pool.

> [!TIP]
>
> ```json {2-5}
> {
>   "multiplex": {
>     "concurrency": 8,
>     "xudpProxyUDP443": "skip"
>   }
> }
> ```

### XHTTP

For XHTTP, set `"method": "xhttp"` in `streamSettings`. Transport parameters belong in `streamSettings.xhttpSettings`.

For VLESS and VMess over XHTTP, the [shared rules for enabling pools and setting their limits](#shared-pool-rules) apply. XHTTP uses XMUX to reuse HTTP connections, including when Multiplex pools are disabled.

When `settings.multiplex.concurrency` is positive for VLESS, Xray prints a warning and continues startup. This warning is absent when VLESS uses only the separate UDP pool, and when Multiplex is configured for VMess.

```text
ATTENTION: Using VLESS Multiplex over XHTTP XMUX
```

The following fragment adds a shared pool and XHTTP settings to one entry in `outbounds`. Set the path `/proxy` on both the client and the server.

> [!TIP]
>
> ```json {4-6,9-12}
> {
>   "protocol": "vless",
>   "settings": {
>     "multiplex": {
>       "concurrency": 8
>     }
>   },
>   "streamSettings": {
>     "method": "xhttp",
>     "xhttpSettings": {
>       "path": "/proxy"
>     }
>   }
> }
> ```

[XHTTP settings](./transports/xhttp.md#multiplex)

### XDrive

XDrive works with VLESS with encryption enabled. Vision is unavailable for this transport. [XDrive requirements](./transport.md#xdrivesettings)

Select the transport with `"xdrive"` in `streamSettings.method`. Storage settings belong in `streamSettings.xdriveSettings`, and pool settings belong in `settings.multiplex`.

For VLESS without Reverse, omitting `multiplex` or leaving it empty enables the shared pool with a limit of **128 concurrent streams** per connection. TCP and UDP use this pool.

<span id="concurrency-and-xudpconcurrency-limits"></span>

**`concurrency` and `xudpConcurrency` limits**

- **Omitted or `0`.** XDrive sets `concurrency` to `128`. For `xudpConcurrency`, the separate UDP pool stays disabled and UDP uses the shared pool.
- **From `1` through `127`.** XDrive applies `128` to the pool whose value was specified.
- **From `128` through `32767`.** XDrive applies the specified value. The maximum is **32,767 simultaneously active streams** per connection.

If only a positive `xudpConcurrency` is specified, Xray enables both the separate UDP pool and a shared pool with a limit of 128.

A Multiplex connection over XDrive accepts up to **65,535 streams** over its lifetime, including completed streams. Each stream receives a new identifier. Once the identifiers are exhausted, subsequent streams are assigned to another connection. The number of simultaneously active streams is still determined by the pool limit.

**UDP port 443 handling**

The automatic XDrive pool rejects UDP port 443. To allow this traffic, set a positive `concurrency` or `xudpConcurrency` and set `xudpProxyUDP443` to `"allow"`. [Configuration with `"allow"`](#allowing-udp-port-443)

<span id="automatic-shared-pool"></span>

**Automatic shared pool**

Add this fragment to a VLESS outbound with encryption configured. It selects XDrive with a local directory. Replace `/path/to/xdrive` with the path to the directory used by the client and server. For an automatic pool, omit `settings.multiplex`.

> [!TIP]
>
> ```json {2-8}
> {
>   "streamSettings": {
>     "method": "xdrive",
>     "xdriveSettings": {
>       "service": "local",
>       "remoteFolder": "/path/to/xdrive"
>     }
>   }
> }
> ```

<span id="shared-pool-for-tcp-and-udp"></span>

**Shared pool for TCP and UDP**

Set `settings.multiplex.concurrency` in the outbound. With a value of 256, TCP and UDP share this limit on each connection in the shared pool.

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "concurrency": 256
>   }
> }
> ```

<span id="separate-udp-pool"></span>

**Separate UDP pool**

Set both limits in `settings.multiplex`. In this configuration, TCP uses the shared pool with a limit of 256, while UDP uses a separate pool with a limit of 128.

> [!TIP]
>
> ```json {2-5}
> {
>   "multiplex": {
>     "concurrency": 256,
>     "xudpConcurrency": 128
>   }
> }
> ```

<span id="allowing-udp-port-443"></span>

**Allowing UDP port 443**

The following `settings` fragment carries UDP packets addressed to port 443 through the shared pool.

> [!TIP]
>
> ```json {2-5}
> {
>   "multiplex": {
>     "concurrency": 128,
>     "xudpProxyUDP443": "allow"
>   }
> }
> ```

<span id="reverse-over-xdrive"></span>

**Reverse over XDrive**

VLESS Reverse opens its own Multiplex connection. It requires no `settings.multiplex` configuration. To select XDrive, use the same transport and storage settings as in the [automatic-pool configuration](#automatic-shared-pool). [VLESS Reverse configuration](/en/document/level-2/vless_reverse.md)

<span id="vless-specific-behavior"></span>
<span id="vision"></span>

## Multiplex with Vision

Vision is selected by setting `settings.flow` to `"xtls-rprx-vision"`. For this account type, the VLESS server accepts only UDP through Multiplex. Set the separate UDP pool in `settings.multiplex.xudpConcurrency`. To allow port 443 through it, set `xudpProxyUDP443` to `"allow"`. The block below is a fragment of the VLESS outbound's `settings`.

> [!TIP]
>
> ```json {3-6}
> {
>   "flow": "xtls-rprx-vision",
>   "multiplex": {
>     "xudpConcurrency": 16,
>     "xudpProxyUDP443": "allow"
>   }
> }
> ```

TCP uses Vision outside the Multiplex pool. UDP, including packets addressed to port 443, uses a separate pool with a limit of 16 streams per connection.

## Migrating an old configuration

In the old format, `mux` belonged directly to the outbound, next to `protocol`. The following enabled the shared pool with its default settings.

**Before — outbound fragment.**

> [!CAUTION]
>
> ```json {3-5}
> {
>   "protocol": "vless",
>   "mux": {
>     "enabled": true
>   }
> }
> ```

In the new format, the `multiplex` object belongs inside `settings` of the same outbound. The server address and credentials also belong in `settings`.

**After — outbound fragment.**

> [!TIP]
>
> ```json {4-6}
> {
>   "protocol": "vless",
>   "settings": {
>     "multiplex": {
>       "concurrency": 8
>     }
>   }
> }
> ```

When the old `mux` key is present, Xray prints a warning to the console while loading the configuration and ignores this key. When both keys are present, the settings in `settings.multiplex` apply.

In the old format, a negative `xudpConcurrency` excluded UDP from the shared pool. In the new format, a negative value causes a configuration loading error. Zero disables only the separate UDP pool. UDP can still use the shared pool when it is enabled.

<span id="multiplex-api"></span>

## Configuration through the API

Multiplex parameters can be passed to a running Xray instance when adding a VLESS or VMess outbound. Use the `AddOutbound` method of [HandlerService](./api.md#handlerservice). There is no separate Multiplex service or API command to change the limits of an existing pool.

**Command line.** Save the [VLESS outbound configuration](#complete-multiplex-configuration) as `outbound.json`. The running Xray instance must have `HandlerService` enabled to add the outbound.

In this example, the API listens on `127.0.0.1:8080`. The first command adds the outbound. The second lists outbounds, which should include the `vless-mux` tag.

```sh
xray api ado --server=127.0.0.1:8080 outbound.json
xray api lso --server=127.0.0.1:8080
```

**Direct gRPC call.** Pass the protocol configuration (`xray.proxy.vless.outbound.Config` or `xray.proxy.vmess.outbound.Config`) in `AddOutboundRequest.outbound.proxy_settings`. Both messages have a `multiplex` field of type `xray.proxy.vless.Multiplex`. `SenderConfig.multiplex_settings` is reserved. To carry client traffic over XDrive with a direct gRPC call, set `multiplex` explicitly, for example with `concurrency: 128`. Automatic addition of the XDrive pool takes place when JSON is loaded, including through `xray api ado`.

## Checking pool operation

Set the client's [log level to `info`](./log.md) and send a request through the configured outbound. Use a TCP request for the shared pool and a UDP request for the separate UDP pool.

When the `proxy/vless/multiplex` component accepts a stream into a pool, it writes a log message containing the destination address. Look for the following text.

```text
dispatching request to
```

This entry confirms that the pool accepted the stream. Also check that the application received the expected response. [Multiplex frame format](../development/protocols/muxcool.md)
