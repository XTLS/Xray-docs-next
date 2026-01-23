# VMess

[VMess](../../development/protocols/vmess.md) is an encrypted transport protocol, commonly acting as a bridge between the Xray client and server.

::: danger
VMess depends on system time. Please ensure that the system UTC time of the device running Xray is within 120 seconds of the actual time, regardless of the time zone. On Linux systems, you can install the `ntp` service to automatically synchronize system time.
:::

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com"
    }
  ],
  "default": {
    "level": 0
  }
}
```

> `clients`: \[ [ClientObject](#clientobject) \]

An array representing a group of users accepted by the server.

Each item is a [ClientObject](#clientobject).

When this configuration is used for dynamic ports, Xray will automatically create users.

> `default`: [DefaultObject](#defaultobject)

Optional. Default configuration for clients. Only valid when used in conjunction with `detour`.

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com"
}
```

> `id`: string

User ID for VMess. It can be any string less than 30 bytes, or a valid UUID.

::: tip
A custom string and its mapped UUID are equivalent. This means you can identify the same user in the configuration file by writing the ID in either way:

- Write `"id": "我爱🍉老师1314"`,
- Or write `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the UUID mapping of `我爱🍉老师1314`)
  :::

The mapping standard is described in [VLESS UUID Mapping Standard: Mapping Custom Strings to UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID mapped from a custom string.

> You can also use the command `xray uuid` to generate a random UUID.

> `level`: number

User level. The connection will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.

> `email`: string

User email address, used to distinguish traffic from different users.

### DefaultObject

```json
{
  "level": 0
}
```

> `level`: number

User level. The connection will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.
