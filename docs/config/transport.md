# 传输配置

传输配置用于配置当前 Xray 如何与对端通信。这里的对端既可能是另一端 Xray 节点，也可能是任意普通公网目标。

它配置的是代理协议之外的数据传输部分，如承载方式、安全机制及附加行为。

这三类配置分属不同层次，在一定范围内可以相互组合：

- 传输方式用于指定数据流的承载形式，如 RAW、WebSocket、gRPC 或 Hysteria 等。
- 传输安全用于指定传输过程中使用的安全机制，如 TLS 或 REALITY。
- 附加配置用于补充控制底层网络行为，以及对流量进行最终伪装。

其中一部分传输配置会直接影响与远端建立通信的方式。对于这类需要协商的配置，通信两端通常要使用兼容的设置。比如一端使用 WebSocket，另一端也必须使用 WebSocket，否则无法建立通信。

对于 [Freedom](./outbounds/freedom.md) 这类直接出站，对端通常是任意普通公网目标（如亚马逊官网、微信的服务器等）。此时传输配置不需要（也基本不能）与另一端协商，而是用于控制本地发出连接时的行为，此时只有 `sockopt` 可用。

## StreamSettingsObject

`StreamSettingsObject` 对应 [`InboundObject`](./inbound.md) 或 [`OutboundObject`](./outbound.md) 中的 `streamSettings` 项。每一个入站或出站都可以分别配置不同的传输配置。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      // [!code focus:18]
      "streamSettings": {
        // 传输方式
        "method": "raw",
        "rawSettings": {},
        "xhttpSettings": {},
        "kcpSettings": {},
        "grpcSettings": {},
        "wsSettings": {},
        "httpupgradeSettings": {},
        "hysteriaSettings": {},
        // 传输安全
        "security": "none",
        "realitySettings": {},
        "tlsSettings": {},
        // 附加配置
        "finalmask": {},
        "sockopt": {}
      }
    }
  ]
}
```

### 传输方式

> `method`: "raw" | "xhttp" | "mkcp" | "grpc" | "websocket" | "httpupgrade" | "hysteria"

数据流所使用的传输方式类型，默认值为 `raw`。

> `rawSettings`: [RawObject](./transports/raw.md)

数据流的 RAW 配置，仅当 `method` 为 `raw` 时有效。

> `xhttpSettings`: [XHTTPObject](./transports/xhttp.md)

数据流的 XHTTP 配置，仅当 `method` 为 `xhttp` 时有效。

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

数据流的 mKCP 配置，仅当 `method` 为 `mkcp` 时有效。

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

数据流的 gRPC 配置，仅当 `method` 为 `grpc` 时有效。

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

数据流的 WebSocket 配置，仅当 `method` 为 `websocket` 时有效。

> `httpupgradeSettings`: [HTTPUpgradeObject](./transports/httpupgrade.md)

数据流的 HTTPUpgrade 配置，仅当 `method` 为 `httpupgrade` 时有效。

> `hysteriaSettings`: [HysteriaObject](./transports/hysteria.md)

数据流的 Hysteria 配置，仅当 `method` 为 `hysteria` 时有效。

### 传输安全

> `security`: "none" | "reality" | "tls"

是否启用传输安全，支持的选项有：

- `"none"` 表示不启用（默认值）
- `"reality"` 表示使用 REALITY。
- `"tls"` 表示使用 [TLS](https://zh.wikipedia.org/wiki/%E5%82%B3%E8%BC%B8%E5%B1%A4%E5%AE%89%E5%85%A8%E6%80%A7%E5%8D%94%E5%AE%9A)。

> `realitySettings`: [RealityObject](./transports/reality.md)

REALITY 配置。REALITY 是对 TLS 的一种修改，通过借用目标站点的 TLS 外观与握手特征来完成伪装。

仅当 `security` 为 `reality` 时有效。
仅支持与 `RAW`、`XHTTP`、`gRPC` 三种传输方式组合使用。

::: tip
REALITY 是目前最安全的传输安全方案之一, 且外部看来流量类型和正常上网具有一致性。<br>
启用 REALITY 并且配置合适的 XTLS Vision 流控模式, 可以达到数倍甚至十几倍的性能提升。
:::

> `tlsSettings`: [TLSObject](./transports/tls.md)

TLS 配置。TLS 由 Golang 提供，通常情况下 TLS 协商的结果为使用 TLS 1.3，不支持 DTLS。

仅当 `security` 为 `tls` 时有效。
支持与 `RAW`、`XHTTP`、`mKCP`、`gRPC`、`WebSocket`、`HTTPUpgrade`、`Hysteria` 传输方式组合使用。

### 附加配置

> `finalmask`: [FinalMaskObject](./transports/finalmask.md)

FinalMask 配置，用于对流量进行最终的伪装。

> `sockopt`: [SockoptObject](./transports/sockopt.md)

底层网络行为相关配置。

## 传输组合速查表

出入站都可以通过 `streamSettings` 配置传输方式与传输安全。实际配置时，代理协议、传输方式和传输安全需要彼此兼容。

### 出入站协议与传输方式

此表对应 `protocol + streamSettings.method`。

|                                                                       | `raw`  | `xhttp` | `grpc` | `websocket` | `httpupgrade` | `mkcp` | `hysteria` |
| --------------------------------------------------------------------- | ------ | ------- | ------ | ----------- | ------------- | ------ | ---------- |
| `http`                                                                | 支持   | 支持    | 支持   | 支持        | 支持          | 支持   | 支持       |
| `socks` <sup><a href="#protocol-transport-note-1">[1]</a></sup>       | 受限   | 受限    | 受限   | 受限        | 受限          | 受限   | 受限       |
| `shadowsocks` <sup><a href="#protocol-transport-note-1">[1]</a></sup> | 受限   | 受限    | 受限   | 受限        | 受限          | 受限   | 受限       |
| `vmess`                                                               | 支持   | 支持    | 支持   | 支持        | 支持          | 支持   | 支持       |
| `vless`                                                               | 支持   | 支持    | 支持   | 支持        | 支持          | 支持   | 支持       |
| `trojan`                                                              | 支持   | 支持    | 支持   | 支持        | 支持          | 支持   | 支持       |
| `hysteria`                                                            | 不适用 | 不适用  | 不适用 | 不适用      | 不适用        | 不适用 | 支持       |
| `wireguard`                                                           | 不适用 | 不适用  | 不适用 | 不适用      | 不适用        | 不适用 | 不适用     |

<small id="protocol-transport-note-1">[1] Socks 和 Shadowsocks 未启用 [XUDP](./outbound.md#muxobject) 时，UDP 流量会改走协议原生的 UDP 路径，从而绕过已配置的传输方式；TCP 流量不受此限制。</small><br>

### 传输方式与传输安全

此表对应 `streamSettings.method + streamSettings.security`。

|               | `none` | `tls` | `reality` |
| ------------- | ------ | ----- | --------- |
| `raw`         | 支持   | 支持  | 支持      |
| `xhttp`       | 支持   | 支持  | 支持      |
| `grpc`        | 支持   | 支持  | 支持      |
| `websocket`   | 支持   | 支持  | 不支持    |
| `httpupgrade` | 支持   | 支持  | 不支持    |
| `mkcp`        | 支持   | 支持  | 不支持    |
| `hysteria`    | 不支持 | 必须  | 不支持    |

### 出入站协议与传输安全

此表对应 `protocol + streamSettings.security`。

|               | `none`                                                      | `tls`                                                       | `reality`                                                   | 协议层安全机制                                                            |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `http`        | 支持                                                        | 支持                                                        | 支持                                                        | 无                                                                        |
| `socks`       | 支持                                                        | 受限 <sup><a href="#protocol-security-note-1">[1]</a></sup> | 受限 <sup><a href="#protocol-security-note-1">[1]</a></sup> | 无                                                                        |
| `shadowsocks` | 支持                                                        | 受限 <sup><a href="#protocol-security-note-1">[1]</a></sup> | 受限 <sup><a href="#protocol-security-note-1">[1]</a></sup> | 载荷加密与完整性 <sup><a href="#protocol-security-note-2">[2]</a></sup>   |
| `vmess`       | 支持                                                        | 支持                                                        | 支持                                                        | 握手认证与载荷加密 <sup><a href="#protocol-security-note-2">[2]</a></sup> |
| `vless`       | 受限 <sup><a href="#protocol-security-note-3">[3]</a></sup> | 支持                                                        | 支持                                                        | 可选的 Encryption <sup><a href="#protocol-security-note-4">[4]</a></sup>  |
| `trojan`      | 受限 <sup><a href="#protocol-security-note-3">[3]</a></sup> | 支持                                                        | 支持                                                        | 仅有身份认证                                                              |
| `hysteria`    | 不支持                                                      | 必须                                                        | 不支持                                                      | 无（依赖 TLS）                                                            |
| `wireguard`   | 不适用                                                      | 不适用                                                      | 不适用                                                      | 加密隧道 <sup><a href="#protocol-security-note-2">[2]</a></sup>           |

<small id="protocol-security-note-1">[1] Socks 和 Shadowsocks 未启用 [XUDP](./outbound.md#muxobject) 时，UDP 流量会改走协议原生的 UDP 路径，从而绕过已配置的 TLS 或 REALITY；TCP 流量不受此限制。</small><br>
<small id="protocol-security-note-2">[2] Shadowsocks 和 VMess 能保护载荷，但缺少 TLS 1.3 式的前向保密，流量外观也可被分类。WireGuard 的密码学足够强，但固定的 UDP 特征容易被识别和封锁。三者都不具备 TLS/REALITY 提供的正常 HTTPS 外观，因此不适合直接用于过墙。</small><br>
<small id="protocol-security-note-3">[3] 当 `streamSettings.security` 为 `none` 时，VLESS（未启用 Encryption）和 Trojan 仅允许连接私网地址。</small><br>
<small id="protocol-security-note-4">[4] VLESS Encryption 是可选的，默认关闭（`encryption: "none"`）。启用后，即使 `streamSettings.security` 为 `none` 也可以连接公网地址；它能保护 VLESS 载荷，但不能提供 TLS/REALITY 的正常 HTTPS 外观，因此不适合直接用于过墙。</small>
