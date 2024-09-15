# HTTP

HTTP protocol.

::: warning
**The HTTP protocol does not provide encryption for transmission and is not suitable for transmission over public networks, as it can easily be used as a target for attacks.**
:::

The more meaningful use of `http` inbound is to listen in a local network or on the local machine to provide local services for other programs.

::: tip TIP 1
`http proxy` can only proxy the TCP protocol and cannot handle protocols based on UDP.
:::

::: tip TIP 2
In Linux, you can use the following environment variables to enable global HTTP proxy for the current session (many software support this setting, but some may not).

- `export http_proxy=http://127.0.0.1:8080/` (Change the address to the configured inbound HTTP proxy address)
- `export https_proxy=$http_proxy`
- :::

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

An array where each element represents a user account. The default value is an empty array.

When `accounts` is not empty, the HTTP proxy will perform Basic Authentication verification for inbound connections.

> `allowTransparent`: true | false

When set to `true`, it will forward all HTTP requests instead of just proxy requests.

::: tip
Enabling this option without proper configuration may cause an infinite loop.
:::

> `userLevel`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `userLevel` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

### AccountObject

```json
{
  "user": "my-username",
  "pass": "my-password"
}
```

> `user`: string

The username. It is a string and is required.

> `pass`: string

The password. It is a string and is required.
