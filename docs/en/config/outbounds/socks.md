# Socks

Standard Socks protocol implementation, compatible with Socks 5.

::: danger
**The Socks protocol does not encrypt transmission and is not suitable for transmission over the public internet.**
:::

## OutboundConfigurationObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "user": "test user",
  "pass": "test pass",
  "level": 0,
  "email": "love@xray.com"
}
```

> `address`: address

Server address. Required.

::: tip
Only connections to Socks 5 servers are supported.
:::

> `port`: number

Server port. Required.

> `user`: string

Username, string type. Required if the remote server requires authentication; otherwise, do not include this item.

> `pass`: string

Password, string type. Required if the remote server requires authentication; otherwise, do not include this item.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level. Optional if the remote server requires authentication; otherwise, do not include this item.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, the default is 0.

> `email`: string

Email address, used to identify the user. Optional if the remote server requires authentication; otherwise, do not include this item.
