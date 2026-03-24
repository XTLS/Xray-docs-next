# Hysteria

::: tip
The `hysteria protocol` itself has no authentication; `clients` only take effect when used with the `hysteria` transport layer.
:::

## InboundConfigurationObject

```json
{
  "version": 2,
  "clients": [
    {
      "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com"
    }
  ]
}
```

> `version`: number

Hysteria version, must be 2.

> `clients`: \[ [ClientObject](#clientobject) \]

An array representing a group of users approved by the server.

### ClientObject

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