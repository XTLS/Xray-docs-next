# VMess

[VMess](../../development/protocols/vmess.md) is an encrypted transport protocol that is commonly used as a bridge between Xray clients and servers.

::: danger
VMess relies on system time. Please ensure that the system UTC time used by Xray is within 90 seconds of the actual time, regardless of time zone. On Linux systems, you can install the `ntp` service to automatically synchronize the system time.
:::

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "alterId": 0,
      "email": "love@xray.com"
    }
  ],
  "default": {
    "level": 0,
    "alterId": 0
  },
  "detour": {
    "to": "tag_to_detour"
  },
  "disableInsecureEncryption": false
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

> `disableInsecureEncryption`: true | false

Whether to disable the use of insecure encryption methods by clients. If set to true, the server will actively disconnect the connection when the client specifies the following encryption methods:

- `"none"`
- `"aes-128-cfb"`

The default value is `false`.

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "alterId": 4,
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

> `alterId`: number

To further prevent detection, a user can generate additional IDs in addition to the main ID. Here, you only need to specify the number of additional IDs. The recommended value is 0, which means enabling VMessAEAD. The maximum value is 65535. This value cannot exceed the value specified on the server side.

If not specified, the default value is 0.

::: tip
Setting the client's AlterID to 0 means enabling VMessAEAD. The server automatically adapts to both clients with VMessAEAD enabled and disabled. Clients can force disable VMessAEAD by setting the environment variable `Xray_VMESS_AEAD_DISABLED=true`.
:::

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
  "level": 0,
  "alterId": 0
}
```

> `level`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `level` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `alterId`: number

The default `alterId` for dynamic ports. The default value is 0.

## VMess MD5 Authentication Tainting Mechanism

To further combat possible detection and blocking, the server-side structure of each VMess authentication data includes a one-time writable taint status flag. The initial state is an untainted state. When the server detects replay attacks or the inbound connection encounters errors that result in incorrect verification data, the authentication data corresponding to that connection will be tainted.

Tainted authentication data cannot be used to establish a connection. When an attacker or client uses tainted authentication data to establish a connection, the server will output an error message containing `invalid user` and `ErrTainted`, and block the connection.

This mechanism has no impact on normal clients when the server is not subjected to replay attacks.

::: tip
Malicious programs that have the server UUID and other connection data may launch denial-of-service attacks against the server based on this mechanism. Services that are targeted by such attacks can disable the server's security protection against such attacks by modifying the `atomic.CompareAndSwapUint32(pair.taintedFuse, 0, 1)` statement in the `func (v *TimedUserValidator) BurnTaintFuse(userHash []byte) error` function in the `proxy/vmess/validator.go` file to `atomic.CompareAndSwapUint32(pair.taintedFuse, 0, 0)`. Clients using the VMessAEAD authentication mechanism are not affected by the VMess MD5 authentication tainting mechanism.
:::

## VMess MD5 Authentication Elimination Mechanism

The elimination mechanism for VMess MD5 authentication has been activated.

Starting from January 1, 2022, the server-side compatibility for MD5 authentication is disabled by default. Any client using MD5 authentication will be unable to connect to servers that have disabled VMess MD5 authentication.

::: tip
On the server side, you can disable the automatic disabling of MD5 authentication by setting the environment variable `xray.vmess.aead.forced=true`, or force enable compatibility with the MD5 authentication mechanism by setting `xray.vmess.aead.forced=false` (not affected by the automatic disabling mechanism in 2022).
:::

::: tip
If there is no need to support old clients, the `"alterID"` parameter should be removed from the server-side configuration.
:::
