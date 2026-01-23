# HTTP

HTTP protocol.

::: danger
**The HTTP protocol does not encrypt traffic and is not suitable for transmission over the public internet. Using it exposes you to the risk of becoming a zombie for attacks.**
:::

A more meaningful usage of `http` inbound is to listen within a LAN or on the local machine to provide local services for other programs.

::: tip TIP 1
`http proxy` can only proxy the TCP protocol; UDP-based protocols are not supported.
:::

::: tip TIP 2
Use the following environment variables in Linux to enable a global HTTP proxy for the current session (supported by many software, but not all).

- `export http_proxy=http://127.0.0.1:8080/` (Address must be changed to your configured HTTP inbound proxy address)
- `export https_proxy=$http_proxy`
  :::

## InboundConfigurationObject

```json
{
  "accounts": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ],
  "allowTransparent": false,
  "userLevel": 0
}
```

> `accounts`: \[[AccountObject](#accountobject)\]

An array where each element is a user account. Default value is empty.

When `accounts` is not empty, the HTTP proxy will perform Basic Authentication on inbound connections.

> `allowTransparent`: true | false

When set to `true`, all HTTP requests will be forwarded, not just proxy requests.

::: tip
If configured improperly, enabling this option can cause infinite loops.
:::

> `userLevel`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, the default is 0.

### AccountObject

```json
{
  "user": "my-username",
  "pass": "my-password"
}
```

> `user`: string

Username, string type. Required.

> `pass`: string

Password, string type. Required.
