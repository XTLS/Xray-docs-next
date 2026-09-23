# MASQUE

Client implementation of IETF MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)): it sets up an IP tunnel through a proxy server over HTTP/3, and works with any server that follows the standard.

Like the WireGuard outbound, Xray runs a userspace network stack locally, which turns TCP and UDP traffic into IP packets from the address assigned by the server and sends them into the tunnel. All connections of one outbound share a single tunnel. The tunnel is set up by the first connection, and set up again by the next connection after it breaks.

The HTTP/3 request and authentication are configured in the transport item [masqueSettings](../transports/masque.md), and QUIC parameters in [FinalMask.quicParams](../transports/finalmask.md#quicparams).

::: tip
The MASQUE outbound only works with the `masque` transport, and requires `tls`.
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

> `port`: int

MASQUE server port, required.

> `remoteDNS`: \[ string \]

DNS servers used inside the tunnel when the destination is a domain name; they must be IP addresses. Only servers of the address families assigned by the server are used.

Defaults to `["1.1.1.1", "1.0.0.1", "2606:4700:4700::1111", "2606:4700:4700::1001"]`. To resolve domain names locally, use `targetStrategy` of the outbound.
