# MASQUE

A MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)) client that establishes an IP tunnel on the server over HTTP/3 or HTTP/2. It can connect to the MASQUE [inbound](../inbounds/masque.md), Cloudflare WARP, and other servers that follow this standard and assign addresses to clients.

Similar to the WireGuard outbound, Xray runs a user-space network stack locally and, using the address assigned by the server, converts TCP and UDP traffic into IP packets and sends them into the tunnel. All connections of the same outbound share one tunnel; the tunnel is established on the first connection and, after it disconnects, is re-established on the next connection.

HTTP requests and authentication are configured in the transport configuration item [masqueSettings](../transports/masque.md), and the HTTP version is determined by `alpn` in `tlsSettings`. For connecting to WARP, see [Connecting to Warp via MASQUE](../../document/level-2/warp.md#connecting-to-warp-via-masque).

::: tip
The MASQUE outbound can only be used with the `masque` transport method, must use `tls`, and does not support Mux.
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "masque",
      // [!field focus]
      "settings": {
        "address": "example.com",
        "port": 443,
        "remoteDNS": ["1.1.1.1", "2606:4700:4700::1111"]
      }
    }
  ]
}
```

> `address`: string

MASQUE server address, required.

> `port`: number

MASQUE server port, required.

> `remoteDNS`: \[ string \]

DNS servers used inside the tunnel when the target is a domain name. They must be IP addresses. Servers in the same address family as the address assigned by the server are preferred; if none of them match, all of them are used.

The default is `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`. To resolve domain names locally, use the outbound's `targetStrategy`.
