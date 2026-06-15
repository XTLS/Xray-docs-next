# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol.

::: danger
Trojan is designed to work over correctly configured encrypted TLS tunnels.
:::

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

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users accepted by the server.

Each item is a [UserObject](#userobject).

::: tip
Before [`v26.5.9`](https://github.com/XTLS/Xray-core/commit/c42deab55cc0dcc73eca5487206446fb76c5f79e), this field was called `clients`
:::

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
