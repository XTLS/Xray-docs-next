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
      // [!field focus]
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
Use transport security such as [TLS](../transports/tls.md) with Trojan. `streamSettings.security: "none"` is allowed only for a private address on a trusted network.
:::

Trojan outbounds carry traffic without Multiplex pools. [Multiplex](./vless.md#multiplex) is supported by VLESS and VMess outbounds.

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
