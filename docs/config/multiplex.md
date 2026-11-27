# Multiplex

Multiplex 可以在 Xray 客户端与代理服务器之间的一条连接上传输多个独立的数据流。连接池是一组可重复使用的服务器连接。Multiplex 的限制控制每条连接上的并发流数量，连接池会根据需要建立更多连接。

## 配置位置

### 出站连接

Multiplex 连接池在 [VLESS](./outbounds/vless.md) 或 [VMess](./outbounds/vmess.md) 出站中配置。其他出站协议，包括 SOCKS、HTTP、Shadowsocks 和 Trojan，均不支持此设置。

在多级代理链中，每一段连接的 Multiplex 都由连接下一台服务器的节点在其出站中配置。

<span id="inbound"></span>

### 入站连接

[VLESS](./inbounds/vless.md) 和 [VMess](./inbounds/vmess.md) 入站会自动识别 Multiplex。Xray 会分别路由收到的每个数据流。

<span id="full-configuration"></span>

## Multiplex 完整配置

`multiplex` 对象位于出站的 `settings` 内，完整 JSON 路径为 `outbounds[].settings.multiplex`。它包含三个可选字段：`concurrency`、`xudpConcurrency` 和 `xudpProxyUDP443`。

Multiplex 的行为取决于所选传输方式。出站传输方式由 `streamSettings` 对象中的 `method` 字段指定。参见[传输方式对 Multiplex 的影响](#transport-behavior)。

以下为使用 RAW 和 TLS 的 VLESS 出站配置。公共连接池承载 TCP，独立连接池承载 UDP，并拒绝目标端口为 UDP 443 的数据包。

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

<span id="fields"></span>

### Multiplex 字段

<span id="concurrency"></span>

**`concurrency`**

整数。指定公共连接池中每条连接的最大并发流数量。公共连接池承载 TCP；未启用独立 UDP 连接池时，也承载 UDP。

<span id="xudpconcurrency"></span>

**`xudpConcurrency`**

整数。指定独立 UDP 连接池中每条连接的最大并发 UDP 流数量。

<span id="limits"></span>

**`concurrency` 和 `xudpConcurrency` 的取值范围**

JSON 中两个字段均接受 `0` 到 `32767` 的整数，包含两端。负数、大于 `32767` 的数、小数或字符串会导致配置加载失败。零和正数的具体行为取决于[传输方式](#transport-behavior)。

<span id="xudpproxyudp443"></span>

**`xudpProxyUDP443`**

字符串。当流量使用公共连接池或独立 UDP 连接池时，指定如何处理**目标端口为 443** 的 UDP 数据包。

- 省略、`""` 或 `"reject"`：拒绝数据包。这是默认行为。
- `"allow"`：通过所选连接池使用 XUDP 传输数据包。
- `"skip"`：绕过连接池，按照代理协议自身的规则传输。XDrive 请使用 `"reject"` 或 `"allow"`。参见 [XDrive 的 UDP 规则](#udp443)。
- 其他字符串，例如 `"ALLOW"`，会导致配置加载失败。

<span id="transports"></span>

<span id="transport-behavior"></span>

## 传输方式对 Multiplex 的影响

### RAW、gRPC、WebSocket、HTTPUpgrade、mKCP 和 Hysteria

这些传输方式分别对应 `streamSettings.method` 的 `"raw"`、`"grpc"`、`"websocket"`、`"httpupgrade"`、`"mkcp"` 和 `"hysteria"`。传输方式本身的参数和安全设置参见[传输配置](./transport.md)。

<span id="pool-rules"></span>

- 省略 `concurrency` 或设为 `0`：关闭公共连接池，TCP 不经过 Multiplex 连接池。
- 省略 `xudpConcurrency` 或设为 `0`：关闭独立 UDP 连接池。如果公共连接池已启用，UDP 使用公共连接池。
- 两个字段均省略或为 `0`：关闭两个连接池。省略 `multiplex` 或将其设为空对象也具有相同效果。
- `1` 到 `1024`，包含两端：启用对应连接池，数值指定每条连接的最大并发流数量。
- `1025` 到 `32767`，包含两端：启用连接池，每条连接的最大并发流数量仍为 1024。

每条连接在整个生命周期内最多承载 1024 个流，已结束的流也计入总数。之后连接池将新流分配给其他连接。

<span id="configuration-variants"></span>
<span id="variants"></span>

以下连接池配置适用于 VMess 和未使用 Vision 的 VLESS。每个片段均写在出站的 `settings` 内。完整 RAW 出站配置见[上文](#full-configuration)。

<span id="separate-connections"></span>

**TCP 和 UDP 使用独立连接**

此配置中，公共连接池承载 TCP，每条连接最多 8 个并发流；独立连接池承载 UDP，每条连接最多 16 个并发流。UDP 443 使用默认的 `"reject"` 规则。

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

<span id="shared-connections"></span>

**TCP 和 UDP 共用连接**

TCP 和 UDP 使用公共连接池，共享每条连接最多 8 个并发流的限制。

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "concurrency": 8
>   }
> }
> ```

<span id="udp-only"></span>

**仅对 UDP 使用 Multiplex**

UDP 连接池的每条连接最多承载 16 个并发流，拒绝 UDP 443 数据包。TCP 不经过连接池。

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "xudpConcurrency": 16
>   }
> }
> ```

<span id="disabled-pools"></span>

**TCP 和 UDP 均不使用 Multiplex 连接池**

在 `settings` 内使用空的 `multiplex` 对象，可以显式关闭两个连接池。

> [!TIP]
>
> ```json {2}
> {
>   "multiplex": {}
> }
> ```

<span id="skip-udp443"></span>

**UDP 443 绕过公共连接池**

`"skip"` 使 UDP 443 绕过连接池。其他 UDP 数据包仍使用公共连接池。

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

XHTTP 在 `streamSettings` 中使用 `"method": "xhttp"`，传输参数写在 `streamSettings.xhttpSettings` 中。

VLESS 和 VMess 使用 XHTTP 时，遵循[通用连接池启用规则与限制](#pool-rules)。XHTTP 通过 XMUX 重用 HTTP 连接，即使 Multiplex 连接池关闭，XMUX 仍然生效。

VLESS 的 `settings.multiplex.concurrency` 为正数时，Xray 在加载配置时输出以下警告并继续启动。VLESS 仅启用独立 UDP 连接池时，以及 VMess 配置 Multiplex 时，不会输出此警告。

```text
ATTENTION: Using VLESS Multiplex over XHTTP XMUX
```

以下片段为一条 `outbounds` 记录添加公共连接池和 XHTTP 设置。客户端和服务器的路径均设为 `/proxy`。

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

[XHTTP 配置](./transports/xhttp.md#multiplex)

### XDrive

XDrive 支持启用 VLESS 加密的 VLESS，不能使用 Vision。参见 [XDrive 的要求](./transport.md#xdrivesettings)。

通过 `streamSettings.method` 的 `"xdrive"` 选择传输方式。存储参数位于 `streamSettings.xdriveSettings`，连接池参数位于 `settings.multiplex`。

对于未使用 Reverse 的 VLESS，省略 `multiplex` 或将其设为空对象会自动启用公共连接池，每条连接最多承载 **128 个并发流**。TCP 和 UDP 共用此连接池。

<span id="xdrive-limits"></span>

**`concurrency` 和 `xudpConcurrency` 的限制**

- **省略或设为 `0`。** XDrive 将 `concurrency` 设为 `128`。`xudpConcurrency` 保持关闭独立 UDP 连接池，UDP 使用公共连接池。
- **`1` 到 `127`，包含两端。** XDrive 将对应连接池的值提高到 `128`。
- **`128` 到 `32767`，包含两端。** XDrive 使用指定值，每条连接最多 **32767 个并发流**。

仅设置正数 `xudpConcurrency` 时，Xray 会同时启用独立 UDP 连接池和限制为 128 的公共连接池。

一条基于 XDrive 的 Multiplex 连接在整个生命周期内最多接受 **65535 个流**，包括已结束的流。每个流获得一个新标识符；标识符耗尽后，新流分配到其他连接。并发流数量仍受连接池限制。

**UDP 443 规则**

XDrive 自动启用的连接池拒绝 UDP 443。要允许传输，请将 `concurrency` 或 `xudpConcurrency` 设为正数，并将 `xudpProxyUDP443` 设为 `"allow"`。参见 [`"allow"` 配置](#udp443)。

<span id="automatic-pool"></span>

**自动启用公共连接池**

将此片段加入已配置 VLESS 加密的出站，选择使用本地目录的 XDrive。将 `/path/to/xdrive` 替换为客户端和服务器共同使用的目录路径。省略 `settings.multiplex` 即使用自动连接池。

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

<span id="shared-pool"></span>

**TCP 和 UDP 使用公共连接池**

在出站的 `settings.multiplex.concurrency` 中设置公共连接池限制。值为 256 时，TCP 和 UDP 共享公共连接池中每条连接的此限制。

> [!TIP]
>
> ```json {2-4}
> {
>   "multiplex": {
>     "concurrency": 256
>   }
> }
> ```

<span id="udp-pool"></span>

**独立 UDP 连接池**

在 `settings.multiplex` 中指定两个限制。以下配置中，TCP 使用限制为 256 的公共连接池，UDP 使用限制为 128 的独立连接池。

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

<span id="udp443"></span>

**允许 UDP 443**

以下为通过公共连接池传输 UDP 443 的 `settings` 片段。

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

<span id="xdrive-reverse"></span>

**基于 XDrive 的 Reverse**

VLESS Reverse 会建立自己的 Multiplex 连接，无需为其配置 `settings.multiplex`。选择 XDrive 时，使用与[自动连接池配置](#automatic-pool)相同的传输及存储设置。参见 [VLESS Reverse 配置](/document/level-2/vless_reverse.md)。

<span id="vless-details"></span>
<span id="vision"></span>

## Multiplex 与 Vision

Vision 通过 `settings.flow` 的 `"xtls-rprx-vision"` 启用。对此类用户，VLESS 服务器通过 Multiplex 仅接受 UDP。独立 UDP 连接池由 `settings.multiplex.xudpConcurrency` 配置，`xudpProxyUDP443` 设为 `"allow"` 可允许其传输 UDP 443。以下为出站的 `settings` 片段。

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

TCP 通过 Vision 传输，不使用 Multiplex 连接池。UDP（包括 UDP 443）使用独立连接池，每条连接最多 16 个并发流。

## 从旧配置迁移

旧格式的 `mux` 位于出站中，与 `protocol` 同级。以下为使用默认参数启用公共连接池的旧写法。

**旧写法——出站配置片段。**

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

新格式的 `multiplex` 位于同一出站的 `settings` 内。服务器地址和用户信息也保留在 `settings` 中。

**新写法——出站配置片段。**

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

配置中存在旧键 `mux` 时，Xray 在加载时向控制台输出警告并忽略该键。两个键同时存在时，使用 `settings.multiplex` 中的参数。

旧格式中，负数 `xudpConcurrency` 将 UDP 排除在公共连接池之外。新格式的负数会导致配置加载失败。`0` 只关闭独立 UDP 连接池，公共连接池启用时 UDP 仍可使用公共连接池。

<span id="multiplex-api"></span>

## 通过 API 配置

向正在运行的 Xray 添加 VLESS 或 VMess 出站时，可以同时传入 Multiplex 参数。使用 [HandlerService](./api.md#handlerservice) 的 `AddOutbound` 方法。API 没有独立的 Multiplex 服务，也没有修改现有连接池限制的命令。

**命令行。** 将[完整 VLESS 出站配置](#full-configuration)保存为 `outbound.json`。目标 Xray 实例需要启用 `HandlerService`。

以下 API 监听 `127.0.0.1:8080`。第一条命令添加出站，第二条列出出站，结果应包含标签 `vless-mux`。

```sh
xray api ado --server=127.0.0.1:8080 outbound.json
xray api lso --server=127.0.0.1:8080
```

**直接调用 gRPC。** 在 `AddOutboundRequest.outbound.proxy_settings` 中传入协议配置（`xray.proxy.vless.outbound.Config` 或 `xray.proxy.vmess.outbound.Config`）。两者均包含类型为 `xray.proxy.vless.Multiplex` 的 `multiplex` 字段。`SenderConfig.multiplex_settings` 为保留字段。直接调用 gRPC 时，如需通过 XDrive 传输客户端流量，应显式设置 `multiplex`，例如 `concurrency: 128`。XDrive 自动添加连接池的处理在加载 JSON 时执行，包括通过 `xray api ado` 加载。

## 检查连接池是否工作

在客户端设置 [`info` 日志级别](./log.md)，然后通过已配置的出站发送请求。公共连接池可用 TCP 请求检查，独立 UDP 连接池需要使用 UDP 请求。

`proxy/vless/multiplex` 组件接收流进入连接池时，会记录目标地址。可在日志中查找以下文本。

```text
dispatching request to
```

此记录表明流已进入连接池。还应确认应用程序收到预期响应。参见 [Multiplex 帧格式](../development/protocols/muxcool.md)。
