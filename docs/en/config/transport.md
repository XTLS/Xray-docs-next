# Transport Configuration

Transport configuration controls how the current Xray instance communicates with its peer. That peer may be another Xray node, or it may simply be any ordinary public network target.

It covers the part below the proxy protocol itself, including transport methods, transport security, and additional low-level behavior.

These three categories belong to different layers and can usually be combined:

- Transport methods specify how the data stream is carried, such as RAW, WebSocket, gRPC, Hysteria, and others.
- Transport security specifies the protection mechanism used during transport, such as TLS or REALITY.
- Additional configuration supplements low-level network behavior and final traffic obfuscation.

Some transport settings directly affect how a connection is established with the remote side. For settings that require negotiation, both sides usually need compatible configurations. For example, if one side uses WebSocket, the other side must also use WebSocket, otherwise the connection cannot be established.

For direct outbounds such as [Freedom](./outbounds/freedom.md), the peer is usually any ordinary public network target, such as Amazon's website or WeChat's servers. In that case, transport configuration does not need to negotiate with the other side, and generally cannot do so either. Instead, it is used to control how the local connection is sent. In that scenario, only `sockopt` is available.

## StreamSettingsObject

`StreamSettingsObject` corresponds to the `streamSettings` item in [`InboundObject`](./inbound.md) or [`OutboundObject`](./outbound.md). Each inbound or outbound can be configured with its own transport settings.

```json
{
  // outbound example; also applies to inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        // [!code focus:16]
        // Transport methods
        "network": "raw",
        "rawSettings": {},
        "xhttpSettings": {},
        "kcpSettings": {},
        "grpcSettings": {},
        "wsSettings": {},
        "httpupgradeSettings": {},
        "hysteriaSettings": {},
        // Transport security
        "security": "none",
        "realitySettings": {},
        "tlsSettings": {},
        // Additional configuration
        "finalmask": {},
        "sockopt": {}
      }
    }
  ]
}
```

> `network`: "raw" | "xhttp" | "mkcp" | "grpc" | "websocket" | "httpupgrade" | "hysteria"

Transport method used by the data stream. The default value is `raw`.

> `rawSettings`: [RawObject](./transports/raw.md)

RAW configuration for the data stream. Only valid when `network` is `raw`.

> `xhttpSettings`: [XHTTPObject](./transports/xhttp.md)

XHTTP configuration for the data stream. Only valid when `network` is `xhttp`.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

mKCP configuration for the data stream. Only valid when `network` is `mkcp`.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

gRPC configuration for the data stream. Only valid when `network` is `grpc`.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

WebSocket configuration for the data stream. Only valid when `network` is `websocket`.

> `httpupgradeSettings`: [HTTPUpgradeObject](./transports/httpupgrade.md)

HTTPUpgrade configuration for the data stream. Only valid when `network` is `httpupgrade`.

> `hysteriaSettings`: [HysteriaObject](./transports/hysteria.md)

Hysteria configuration for the data stream. Only valid when `network` is `hysteria`.

---

> `security`: "none" | "reality" | "tls"

Whether to enable transport security. Supported options are:

- `"none"` means disabled (default).
- `"reality"` means using REALITY.
- `"tls"` means using [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).

> `realitySettings`: [RealityObject](./transports/reality.md)

REALITY configuration. REALITY is a modified form of TLS that uses the appearance and handshake characteristics of a target site as camouflage.

Only valid when `security` is `reality`.
It can only be used together with the `RAW`, `XHTTP`, and `gRPC` transport methods.

::: tip
REALITY is currently one of the most secure transport-security schemes, and from the outside its traffic looks consistent with ordinary web traffic. Enabling REALITY together with a suitable XTLS Vision flow-control mode can also deliver performance gains of several times or even more than ten times.
:::

> `tlsSettings`: [TLSObject](./transports/tls.md)

TLS configuration. TLS is provided by Go. In normal cases the negotiation result is TLS 1.3. DTLS is not supported.

Only valid when `security` is `tls`.
It supports use with the `RAW`, `XHTTP`, `mKCP`, `gRPC`, `WebSocket`, `HTTPUpgrade`, and `Hysteria` transport methods.

---

> `finalmask`: [FinalMaskObject](./transports/finalmask.md)

FinalMask configuration, used for the final stage of traffic obfuscation.

> `sockopt`: [SockoptObject](./transports/sockopt.md)

Configuration related to low-level network behavior.
