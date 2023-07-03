# VMess

[VMess](../../development/protocols/vmess.md) is an encrypted transport protocol that is commonly used as a bridge between Xray clients and servers.

::: danger
VMess relies on system time. Please ensure that the system UTC time used by Xray is within 120 seconds of the actual time, regardless of time zone. On Linux systems, you can install the `ntp` service to automatically synchronize the system time.
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
  },
  "detour": {
    "to": "tag_to_detour"
  }
}
```

> `clients`: \[ [ClientObject](#clientobject) \]

An array representing a group of users approved by the server.

Each item in the array is a user [ClientObject](#clientobject).

When this configuration is used for dynamic ports, Xray will automatically create users.

> `detour`: [DetourObject](#detourobject)

Indicates that another server should be used for the corresponding outbound protocol.

> `default`: [DefaultObject](#defaultobject)

Optional. The default configuration for clients. Only effective when used with `detour`.

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com"
}
```

> `id`: string

The user ID for VMess. It can be any string less than 30 bytes or a valid UUID.

::: tip
Custom strings and their corresponding UUIDs are equivalent, which means you can use either of the following in the configuration file to identify the same user:

- `"id": "我爱🍉老师1314"`
- `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the mapping of the string "我爱 🍉 老师 1314")

The mapping standard is described in the [VLESS UUID Mapping Standard: Mapping a Custom String to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID corresponding to a custom string.

You can also use the command `xray uuid` to generate a random UUID. :::

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `email`: string

The user's email address, used to differentiate traffic from different users.

### DetourObject

```json
{
  "to": "tag_to_detour"
}
```

> `to`: string

The `tag` of an inbound that specifies the inbound using the VMess protocol.

### DefaultObject

```json
{
  "level": 0
}
```

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.
