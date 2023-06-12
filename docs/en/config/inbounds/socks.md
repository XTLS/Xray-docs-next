# SOCKS

The standard SOCKS protocol implementation is compatible with [SOCKS 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol), SOCKS 4a, and [SOCKS 5](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol).

::: danger
The SOCKS protocol does not provide encryption for transport and is not suitable for transmitting data over public networks.
:::

The use of `SOCKS` inbound is more meaningful in a local area network or local environment, where it can be used to listen for incoming connections and provide local services to other programs.

## InboundConfigurationObject

```json
{
  "auth": "noauth",
  "accounts": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ],
  "udp": false,
  "ip": "127.0.0.1",
  "userLevel": 0
}
```

> `auth`: "noauth" | "password"

The authentication method for the SOCKS protocol, supporting `"noauth"` for anonymous mode and `"password"` for username/password authentication.

The default value is `"noauth"`.

> `accounts`: \[ [AccountObject](#accountobject) \]

An array where each element represents a user account.

This option is only valid when `auth` is set to `"password"`.

The default value is an empty array.

> `udp`: true | false

Whether to enable UDP protocol support.

The default value is `false`.

> `ip`: address

When UDP is enabled, Xray needs to know the local IP address.

The default value is `"127.0.0.1"`.

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

The username as a string. Required.

> `pass`: string

The password as a string. Required.
