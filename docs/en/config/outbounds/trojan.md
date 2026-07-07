# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol.

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "trojan",
      // [!code focus:7]
      "settings": {
        "address": "127.0.0.1",
        "port": 1234,
        "password": "password",
        "email": "love@xray.com",
        "level": 0
      }
    }
  ]
}
```

::: warning
Trojan must be used with transport-security [TLS](https://xtls.github.io/config/transports/tls.html); using `streamSettings.security: "none"` is only allowed when the peer is a private address (such as a private IP address or private domain name) and the link itself is trusted. In public environments, Mux is also required; otherwise, once the inner payload is itself TLS, it becomes TiT and can be easily detected ([PoC](https://github.com/XTLS/Trojan-killer)).
:::

> `address`: address

Server address. Supports IPv4, IPv6, and domain names. Required.

> `port`: number

Server port. Usually the same as the port the server is listening on.

> `password`: string

Password. Required, any string.

> `email`: string

Email address. Optional, used to identify the user.

> `level`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.
