# VLESS

::: danger
Currently, VLESS does not provide built-in encryption. Please use it with a reliable channel, such as TLS.
:::

VLESS is a stateless lightweight transport protocol that consists of inbound and outbound parts. It can serve as a bridge between Xray clients and servers.

Unlike [VMess](./vmess.md), VLESS does not rely on system time. The authentication method is still UUID-based.

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com",
      "flow": "xtls-rprx-vision"
    }
  ],
  "decryption": "none",
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

> `decryption`: "none"

Currently, you need to specify `"none"`. It cannot be left empty. If the `decryption` value is not set correctly, you will receive an error message when using Xray or `-test`.

Note that `decryption` is at the same level as `clients`. The placement of `decryption` is different from the `encryption` in the vmess protocol because if there is a layer of agreed encryption, the server needs to decrypt it first to know which user it belongs to.

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

An array that contains a series of powerful fallback configurations (optional). The specific configuration for `fallbacks` can be found in the [FallbackObject](../features/fallback.md#fallbacks-configuration) documentation.

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com",
  "flow": "xtls-rprx-vision"
}
```

> `id`: string

The user ID for VLESS. It can be any string less than 30 bytes or a valid UUID. Custom strings and their corresponding UUIDs are equivalent, which means you can use either of the following in the configuration file to identify the same user:

- `"id": "我爱🍉老师1314"`
- `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the mapping of the string "我爱 🍉 老师 1314")

The mapping standard is described in the [VLESS UUID Mapping Standard: Mapping a Custom String to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID corresponding to a custom string.

> You can also use the command `xray uuid` to generate a random UUID.

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `email`: string

User email address used to differentiate traffic from different users (reflected in logs and statistics).

> `flow`: string

Flow control mode used to select the XTLS algorithm.

Currently, the following flow control modes are available for inbound protocols:

- No `flow` or empty string: Use regular TLS proxy.
- `xtls-rprx-vision`: Use the new XTLS mode, including inner-handshake random padding.



Additionally, XTLS currently only supports TCP+TLS/Reality. 
