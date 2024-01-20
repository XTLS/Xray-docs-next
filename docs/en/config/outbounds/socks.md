# Socks

The Socks protocol is a standard protocol implementation that is compatible with [Socks 5](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol).

::: danger
The Socks protocol does not provide encryption for transmission and is not suitable for transmitting data over public networks.
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "127.0.0.1",
      "port": 1234,
      "users": [
        {
          "user": "test user",
          "pass": "test pass",
          "level": 0
        }
      ]
    }
  ]
}
```

> `servers`: \[ [ServerObject](#serverobject) \]

An array representing a list of Socks servers, where each item is a server configuration.

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "users": [
    {
      "user": "test user",
      "pass": "test pass",
      "level": 0
    }
  ]
}
```

> `address`: address

The server address. Required.

::: tip
Only connections to Socks 5 servers are supported.
:::

> `port`: number

The server port. Required.

> `users`: \[ [UserObject](#userobject) \]

An array representing a list of users. Each item in the array is a user configuration.

When the list is not empty, the Socks client will authenticate using the user information. If not specified, no authentication is performed.

The default value is an empty array.

#### UserObject

```json
{
  "user": "test user",
  "pass": "test pass",
  "level": 0
}
```

> `user`: string

The username. Required.

> `pass`: string

The password. Required.

> `level`: number

The user level. Connections will use the corresponding [local policy](../policy.md#levelpolicyobject) associated with this user level.

The `level` value corresponds to the `level` value in the [policy](../policy.md#policyobject). If not specified, the default value is 0.
