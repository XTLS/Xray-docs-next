# Hysteria

::: tip
The `hysteria protocol` itself has no authentication; `users` only take effect when used with the `hysteria` transport layer.
:::

## InboundConfigurationObject

`InboundConfigurationObject` corresponds to the `settings` item in [`InboundObject`](../inbound.md).

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "hysteria",
      // [!code focus:10]
      "settings": {
        "version": 2,
        "users": [
          {
            "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
            "level": 0,
            "email": "love@xray.com"
          }
        ]
      }
    }
  ]
}
```

> `version`: number

Hysteria version, must be 2.

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users approved by the server.

::: tip
Before [`v26.5.9`](https://github.com/XTLS/Xray-core/commit/c42deab55cc0dcc73eca5487206446fb76c5f79e), this field was called `clients`
:::

### UserObject

```json
{
  "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com"
}
```

> `auth`: string

A string of any length.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the `level` value in [policy](../policy.md#policyobject). If not specified, the default is 0.

> `email`: string

User email, used to distinguish traffic from different users (reflected in logs and statistics).
