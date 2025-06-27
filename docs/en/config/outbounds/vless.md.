# VLESS

::: danger
Currently, VLESS does not have built-in encryption, please use it on a reliable channel, such as TLS.
:::

VLESS is a stateless lightweight transport protocol, which is divided into inbound and outbound parts, and can be used as a bridge between Xray clients and servers.

Unlike [VMess](./vmess.md), VLESS does not rely on system time, and the authentication method is also UUID.

## OutboundConfigurationObject

```json
{
  "vnext": [
    {
      "address": "example.com",
      "port": 443,
      "users": [
        {
          "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
          "encryption": "none",
          "flow": "xtls-rprx-vision",
          "level": 0
        }
      ]
    }
  ]
}
```

> `vnext`: \[ [ServerObject](#serverobject) \]

An array, representing the VLESS server list, containing a set of configurations pointing to the server, each of which is a server configuration.

### ServerObject

```json
{
  "address": "example.com",
  "port": 443,
  "users": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "encryption": "none",
      "flow": "xtls-rprx-vision",
      "level": 0
    }
  ]
}
```

> `address`: address

Server address, pointing to the server, supporting domain names, IPv4, and IPv6.

> `port`: number

Server port, usually the same as the port listened by the server.

> `users`: \[ [UserObject](#userobject) \]

Array, a list of users recognized by the server, each of which is a user configuration.

### UserObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "encryption": "none",
  "flow": "xtls-rprx-vision",
  "level": 0
}
```

> `id`: string

The user ID of VLESS, which can be any string less than 30 bytes, or a valid UUID.
Custom strings and their mapped UUIDs are equivalent, which means you can write an id in the configuration file to identify the same user, i.e.

- Write `"id": "I love 🍉 teacher 1314"`,
- Or write `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (this UUID is the UUID mapping of `I love 🍉 teacher 1314`)

The mapping standard is in [VLESS UUID mapping standard: mapping custom strings to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158)

You can use the command `xray uuid -i "custom string"` to generate the UUID mapped by the custom string, or use the command `xray uuid` to generate a random UUID.

> `encryption`: "none"

Need to fill in `"none"`, cannot be left empty.

This requirement is to remind users that there is no encryption and to prevent users from filling in the wrong attribute name or location, causing exposure when encryption methods come out in the future.

If the value of encryption is not set correctly, an error message will be received when using Xray or -test.

> `flow`: string

Flow control mode, used to select the XTLS algorithm.

Currently, there are the following flow control modes available in the outbound protocol:

- No `flow` or empty string: Use regular TLS proxy.
- `xtls-rprx-vision`: using the new XTLS mode includes inner handshake random padding supports uTLS client fingerprint simulation
- `xtls-rprx-vision-udp443`: same as `xtls-rprx-vision`, but allows UDP traffic with a destination of port 443

Additionally, XTLS currently only supports TCP+TLS/Reality.

<!-- prettier-ignore -->
::: tip About xtls-rprx-*-udp443 flow control mode

When using Xray-core's XTLS, traffic to UDP port 443 is blocked by default (generally for QUIC), so the application will use TLS instead of QUIC, and XTLS will take effect. In fact, QUIC itself is not suitable for proxying because it has its own TCP functionality. When it is transmitted as UDP traffic through the VLESS protocol, the underlying protocol is TCP, which is equivalent to two layers of TCP.

If you do not need to block it, please fill in `xtls-rprx-*-udp443` on the client side and do not change the server side.
:::

::: tip About Splice mode
Splice is a function provided by the Linux Kernel. The system kernel directly forwards TCP without going through Xray's memory, greatly reducing the number of data copies and CPU context switches.

The usage restrictions of Splice mode are:

- Linux environment
- Inbound protocols are `Dokodemo door`, `Socks`, `HTTP`, etc., pure TCP connections, or other inbound protocols that use XTLS
- Outbound protocol is VLESS + XTLS
- It is worth noting that when using the mKCP protocol, Splice will not be used (yes, although there is no error, it is not used at all)

In addition, when using Splice, the speed display will lag behind, which is a feature, not a bug.

Using Vision mode will automatically enable Splice if the above conditions are met.
:::

> `level`: number

User level, the connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of level corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, the default is 0.
