# Trojan

[Trojan](https://trojan-gfw.github.io/trojan/protocol) protocol.

::: danger
Trojan is designed to work over a correctly configured encrypted TLS tunnel.
:::

## OutboundConfigurationObject

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

Server address. Supports IPv4, IPv6, and domain names. Required.

> `port`: number

Server port. Usually the same as the port the server is listening on.

> `password`: string

Password. Required, any string.

> `email`: string

Email address. Optional, used to identify the user.

> `level`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.
