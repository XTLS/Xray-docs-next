# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol.

## InboundConfigurationObject

`InboundConfigurationObject` corresponds to the `settings` item in [`InboundObject`](../inbound.md).

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "trojan",
      // [!code focus:14]
      "settings": {
        "users": [
          {
            "password": "password",
            "email": "love@xray.com",
            "level": 0
          }
        ],
        "fallbacks": [
          {
            "dest": 80
          }
        ]
      }
    }
  ]
}
```

::: warning
Trojan must be used with transport-security [TLS](https://xtls.github.io/config/transports/tls.html); using `streamSettings.security: "none"` is only allowed when the peer is a private address (such as a private IP address or private domain name) and the link itself is trusted. In public environments, Mux is also required; otherwise, once the inner payload is itself TLS, it becomes TiT and can be easily detected ([PoC](https://github.com/XTLS/Trojan-killer)).
:::

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users accepted by the server.

Each item is a [UserObject](#userobject).

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

An array containing a series of powerful fallback configurations (optional).
For specific configuration of fallbacks, please click [FallbackObject](../features/fallback.md#fallbackobject).

::: tip
Xray's Trojan has complete support for fallbacks, and the configuration method is exactly the same as VLESS.
The conditions for triggering fallback are also similar to VLESS: the length of the first packet < 58, OR the 57th byte is not `\r` (because Trojan has no protocol version), OR authentication fails.
:::

### UserObject

```json
{
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

> `password`: string

Required, any string.

> `email`: string

Email address, optional, used to identify the user.

::: danger
If there are multiple UserObjects, please note that emails must not be duplicated.
:::

> `level`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.
