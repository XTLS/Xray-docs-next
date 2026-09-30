# MASQUE

Server implementation of IETF MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), for the masque [outbound](../outbounds/masque.md) and any other client that follows the standard.

Like the WireGuard inbound, Xray runs a userspace network stack locally: each tunnel gets addresses from the prefixes in `address`, and the IP packets in the tunnel are turned back into TCP and UDP connections that go through routing. So sniffing, routing and per-user traffic statistics all work.

Clients authenticate with HTTP Basic authentication, with `email` as the username and `pass` as the password.

::: tip
The MASQUE inbound only works with the `masque` transport, and requires `tls`.

It only listens for HTTP/3 (UDP) by default. See the transport item [masqueSettings](../transports/masque.md) for how to enable HTTP/2 and for the request path.
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
        "address": ["10.14.0.1/24", "fd14::1/64"],
        "mtu": 1280
      },
      "streamSettings": {
        "method": "masque",
        "security": "tls",
        "tlsSettings": {
          "alpn": ["h3", "h2"],
          "certificates": [
            {
              "certificateFile": "/path/to/certificate.crt",
              "keyFile": "/path/to/key.key"
            }
          ]
        }
      }
    }
  ]
}
```

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users approved by the server.

When a user is removed through the API, the tunnels that user has set up are closed.

> `address`: \[ string \]

The addresses of the server inside the tunnel together with their prefixes, in CIDR notation, required. At most one IPv4 and one IPv6 entry.

Each tunnel gets one address from each prefix, and a request gets 503 when every prefix has run out. The address must be a host address in the prefix; it cannot be the network address or the IPv4 broadcast address.

> `mtu`: number

MTU of the userspace network stack. Defaults to 1280, and must be between 1280 and 65535.

::: tip
Clients of the same inbound can reach each other through their addresses inside the tunnel. These IP packets are forwarded by the server directly and do not go through routing.
:::

### UserObject

```json
{
  "email": "love@xray.com",
  "pass": "password",
  "level": 0
}
```

> `email`: string

User email, required. It is also the username of Basic authentication, and is used to distinguish traffic from different users (reflected in logs and statistics).

It is case-insensitive, must be unique, and must not contain `:`.

> `pass`: string

Password, required. A string of any length.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the `level` value in [policy](../policy.md#policyobject). If not specified, the default is 0.
