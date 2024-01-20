# Trojan

The [Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol.

::: danger
Trojan is designed to work with correctly configured encrypted TLS tunnels.
:::

## InboundConfigurationObject

```json
{
  "clients": [
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
```

> `clients`: \[ [ClientObject](#clientobject) \]

An array representing a group of users approved by the server.

Each item in the array is a user [ClientObject](#clientobject).

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

An array that contains a series of powerful fallback configurations (optional). The specific configuration for `fallbacks` can be found in the [FallbackObject](../features/fallback.md#fallbacks-configuration) documentation.

::: tip
Xray's Trojan has full support for fallbacks, and the configuration is identical. The conditions triggering fallback are similar to VLESS: first packet length < 58 or the 57th byte is not `\r` (because Trojan does not have a protocol version) or authentication failure.
:::

### ClientObject

```json
{
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

> `password`: string

Required. Any string.

> `email`: string

Email address. Optional. Used to identify the user.

::: danger
If there are multiple `ClientObject`s, please make sure that the email addresses are not duplicated.
:::

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.
