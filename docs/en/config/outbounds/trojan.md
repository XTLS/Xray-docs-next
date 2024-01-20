# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol

::: danger
Trojan is designed to work with correctly configured encrypted TLS tunnels.
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "127.0.0.1",
      "port": 1234,
      "password": "password",
      "email": "love@xray.com",
      "level": 0
    }
  ]
}
```

> `servers`: \[ [ServerObject](#serverobject) \]

An array representing a list of servers, where each item is a [ServerObject](#serverobject).

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

> `address`: address

The server address, which can be an IPv4, IPv6, or domain name. Required.

> `port`: number

The server port, usually the same port that the server is listening on.

> `password`: string

The password for authentication. Required. It can be any string.

> `email`: string

The email address, optional, used to identify the user.

> `level`: number

The user level. Connections will use the corresponding [local policy](../policy.md#levelpolicyobject) associated with this user level.

The `level` value corresponds to the `level` value in the [policy](../policy.md#policyobject). If not specified, the default value is 0.
