# MASQUE

A MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)) server. It can be connected to by the MASQUE [outbound](../outbounds/masque.md) and by other clients that follow this standard and use HTTP Basic authentication.

Every tunnel must pass HTTP Basic authentication, and 401 is returned on failure. The server assigns addresses to each tunnel from `address` and, for the assigned address families, advertises routes covering the entire address space. TCP and UDP inside the tunnel are restored into ordinary connections by the server's user-space network stack and then handed over to routing; the source address at this point is the client's address inside the tunnel. Packets sent to other tunnel addresses are forwarded directly without going through routing.

The HTTP version to listen on is determined by `alpn` in `tlsSettings`, and `path` is set in the transport configuration item [masqueSettings](../transports/masque.md).

::: tip
The MASQUE inbound can only be used with the `masque` transport method and must use `tls`.
:::

## InboundConfigurationObject

`InboundConfigurationObject` corresponds to the `settings` item in [`InboundObject`](../inbound.md).

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "masque",
      // [!field focus]
      "settings": {
        "users": [
          {
            "email": "love@xray.com",
            "pass": "password",
            "level": 0
          }
        ],
        "address": ["10.0.0.1/24", "fd00::1/64"],
        "mtu": 1280
      }
    }
  ]
}
```

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users approved by the server. It can also be written as `clients`. When there are no users, all connections are rejected.

When a user is removed via the API, the tunnels that user is currently using are closed immediately.

> `address`: \[ string \]

Address ranges assigned to the tunnels, required. At most one IPv4 prefix and one IPv6 prefix (prefix length at most 30 for IPv4 and 126 for IPv6).

The address in the prefix is the server's own address, and the remaining addresses are assigned to the tunnels in order (excluding the network and broadcast addresses for IPv4) and reclaimed after a tunnel disconnects. When the addresses of one address family run out, new tunnels only get an address from the other address family; when both run out, 503 is returned.

> `mtu`: number

The MTU of the tunnel, in the range 1280 to 65535. The default is 1280.

### UserObject

```json
{
  "email": "love@xray.com",
  "pass": "password",
  "level": 0
}
```

> `email`: string

Username, required. It cannot contain `:` and must be unique (case-insensitive). Corresponds to `user` in the outbound's `masqueSettings`.

> `pass`: string

Password, required. Corresponds to `pass` in the outbound's `masqueSettings`.

> `level`: number

User level. The MASQUE inbound only uses the user traffic statistics settings in the [local policy](../policy.md#levelpolicyobject) of this level.
