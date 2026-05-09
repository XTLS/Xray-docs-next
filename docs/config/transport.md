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
      "streamSettings": {
        // [!code focus:16]
        // 传输方式
        "network": "raw",
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

> `network`: "raw" | "xhttp" | "mkcp" | "grpc" | "websocket" | "httpupgrade" | "hysteria"

数据流所使用的传输方式类型，默认值为 `raw`。

> `rawSettings`: [RawObject](./transports/raw.md)

数据流的 RAW 配置，仅当 `network` 为 `raw` 时有效。

> `xhttpSettings`: [XHTTPObject](./transports/xhttp.md)

数据流的 XHTTP 配置，仅当 `network` 为 `xhttp` 时有效。

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

数据流的 mKCP 配置，仅当 `network` 为 `mkcp` 时有效。

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

数据流的 gRPC 配置，仅当 `network` 为 `grpc` 时有效。

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

数据流的 WebSocket 配置，仅当 `network` 为 `websocket` 时有效。

> `httpupgradeSettings`: [HTTPUpgradeObject](./transports/httpupgrade.md)

数据流的 HTTPUpgrade 配置，仅当 `network` 为 `httpupgrade` 时有效。

> `hysteriaSettings`: [HysteriaObject](./transports/hysteria.md)

数据流的 Hysteria 配置，仅当 `network` 为 `hysteria` 时有效。

---

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

---

> `finalmask`: [FinalMaskObject](./transports/finalmask.md)

FinalMask 配置，用于对流量进行最终的伪装。

> `sockopt`: [SockoptObject](./transports/sockopt.md)

底层网络行为相关配置。
