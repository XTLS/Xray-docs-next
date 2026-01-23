# Socks

Standard Socks protocol implementation, compatible with [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol), [Socks 4a](https://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4A.protocol), Socks 5, and **HTTP**.

::: danger
**The Socks protocol does not encrypt transmission and is not suitable for transmission over the public internet.**
:::

A more meaningful usage of `Socks` inbound is to listen within a LAN or on the local machine to provide local services for other programs.

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

Authentication method for the Socks protocol. Supports `"noauth"` (anonymous) and `"password"` (user/password).

When using password, HTTP requests sent to this inbound will also require the same account and password.

Default value is `"noauth"`.

> `accounts`: \[ [AccountObject](#accountobject) \]

An array where each element is a user account.

This option is only valid when `auth` is set to `password`.

Default value is empty.

> `udp`: true | false

Whether to enable UDP protocol support.

Default value is `false`.

> `ip`: address

When UDP is enabled, Xray needs to know the IP address of the local machine.

"The IP address of the local machine" means the IP that the client can use to find the server when initiating a UDP connection. By default, it is the local IP address when the server accepts the TCP connection. It should work normally in most cases, but when passing through systems behind NAT, it may cause malfunctions, requiring this parameter to be modified to the correct public IP.

Warning: If your machine has multiple IP addresses, you will be affected by the issue regarding UDP listening on 0.0.0.0 mentioned in [Inbound Listening](../inbound.md#inboundobject).

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
