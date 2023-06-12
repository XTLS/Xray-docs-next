# HTTP

HTTP is a protocol that is used for communication over the internet. Please note that HTTP does not provide encryption for data transmission and is not suitable for transmitting sensitive information over public networks, as it can be easily targeted for attacks.

::: danger
**The HTTP protocol does not provide encryption for transmission, making it unsuitable for transmitting over public networks and more susceptible to being used as a compromised host for attacks.**
:::

::: tip
HTTP can only proxy TCP protocols, and cannot handle UDP-based protocols.
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "192.168.108.1",
      "port": 3128,
      "users": [
        {
          "user": "my-username",
          "pass": "my-password"
        }
      ]
    }
  ]
}
```

::: tip
Currently, in the HTTP outbound protocol, the `streamSettings` configuration with `security` and `tlsSettings` is effective.
:::

> `servers`: \[ [ServerObject](#serverobject) \]

A list of HTTP servers, where each item represents a server configuration. If multiple servers are configured, they will be used in a round-robin manner.

### ServerObject

```json
{
  "address": "192.168.108.1",
  "port": 3128,
  "users": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ]
}
```

> `address`: string

The address of the HTTP proxy server. Required.

> `port`: int

The port of the HTTP proxy server. Required.

> `user`: \[[AccountObject](#accountobject)\]

An array of user accounts. Default value is an empty array.

#### AccountObject

```json
{
  "user": "my-username",
  "pass": "my-password"
}
```

> `user`: string

The username. Required.

> `pass`: string

The password. Required.
