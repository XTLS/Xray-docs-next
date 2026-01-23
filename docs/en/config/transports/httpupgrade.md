# HTTPUpgrade

A protocol that implements HTTP 1.1 upgrade requests and responses similar to WebSocket. This allows it to be reverse-proxied by CDNs or Nginx just like WebSocket, but without the need to implement other parts of the WebSocket protocol, resulting in higher efficiency.
Its design is not recommended for standalone use; instead, it is intended to work with security protocols like TLS.

::: danger
**It is recommended to switch to [XHTTP](https://github.com/XTLS/Xray-core/discussions/4113) to avoid significant traffic fingerprints such as HTTPUpgrade's "ALPN is http/1.1".**
:::

## HttpUpgradeObject

`HttpUpgradeObject` corresponds to the `httpupgradeSettings` item in transport configuration.

```json
{
  "acceptProxyProtocol": false,
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  }
}
```

> `acceptProxyProtocol`: true | false

Only used for inbound; indicates whether to accept PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is dedicated to passing the real source IP and port of the request. **If you don't know what it is, please ignore this item for now.**

Common reverse proxy software (such as HAProxy, Nginx) can be configured to send it. VLESS fallbacks xver can also send it.

When set to `true`, after the underlying TCP connection is established, the requester must send PROXY protocol v1 or v2 first; otherwise, the connection will be closed.

> `path`: string

The HTTP path used by HTTPUpgrade. Default value is `"/"`.

If the client path contains the `ed` parameter (e.g., `/mypath?ed=2560`), `Early Data` will be enabled to reduce latency. The value represents the threshold for the first packet length. If the first packet length exceeds this value, `Early Data` will not be enabled. The recommended value is 2560.

> `host`: string

The host sent in the HTTP request of HTTPUpgrade. Default value is empty. If the server-side value is empty, the host value sent by the client is not verified.

When this value is specified on the server, or specified in `headers`, it will verify whether it is consistent with the host requested by the client.

Priority of the host sent by the client: `host` > `headers` > `address`

> `headers`: map \{string: string\}

Client-only. Custom HTTP headers. A key-value pair, where each key represents the name of an HTTP header, and the corresponding value is a string.

Default value is empty.
