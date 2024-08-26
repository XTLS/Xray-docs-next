# Outbound Proxies

Outbound connections are used for sending data and can use any of the available protocols listed in [outbound protocols](./outbounds/).

## OutboundObject

The `OutboundObject` corresponds to a sub-element of the `outbounds` item in the configuration file.

::: tip
The first element in the list serves as the main outbound. When there is no match or no successful match for the routing, the traffic is sent out by the main outbound.
:::

```json
{
  "outbounds": [
    {
      "sendThrough": "0.0.0.0",
      "protocol": "protocol name",
      "settings": {},
      "tag": "identifier",
      "streamSettings": {},
      "proxySettings": {
        "tag": "another-outbound-tag"
      },
      "mux": {}
    }
  ]
}
```

> `sendThrough`: address

The IP address used to send data. It is effective when the host has multiple IP addresses, and the default value is `"0.0.0.0"`.

It is allowed to fill in the IPv6 CIDR block (such as `114:514:1919:810::/64`),
and Xray will use the random IP address in the address block to initiate
external connections. Network access, routing tables, and kernel parameters
need to be configured correctly to allow Xray to bind to any IP within the
address block.

For networks that use ndp to access, it is not recommended to set a subnet
smaller than `/120`, otherwise it may cause NDP flood and a series of problems
such as the router neighbor cache being filled up.

> `protocol`: string

The name of the connection protocol. For a list of optional protocols, see
Outbound Proxy in the left sidebar.

> `settings`: OutboundConfigurationObject

The specific configuration content varies depending on the protocol. See `OutboundConfigurationObject` in each protocol for details.

> `tag`: string

The identifier of this outbound connection, used to locate this connection in other configurations.

::: danger
When it is not empty, its value must be **unique** among all `tag`s.
:::

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

The underlying transport method is the way the current Xray connects with other nodes.

> `proxySettings`: [ProxySettingsObject](#proxysettingsobject)

The outbound proxy configuration. When the outbound proxy takes effect, the
`streamSettings` of this outbound will not work.

> `mux`: [MuxObject](#muxobject)

Specific configuration related to Mux.

### ProxySettingsObject

```json
{
  "tag": "another-outbound-tag"
}
```

> `tag`: string

When specifying the identifier of another outbound, data emitted by this outbound will be forwarded to the specified outbound.

::: danger
This forwarding method does **not go through** the underlying transport. If you need to use forwarding that supports the underlying transport, please use [SockOpt.dialerProxy](./transport.md#sockoptobject).
:::

::: danger
This option is incompatible with SockOpt.dialerProxy.
:::

::: tip
Compatible with v2fly/v2ray-core's configuration [transportLayer](https://www.v2fly.org/config/outbounds.html#proxysettingsobject).
:::

### MuxObject

The Mux feature distributes the data of multiple TCP connections on a single TCP connection. For implementation details, see [Mux.Cool](../../development/protocols/muxcool). Mux is designed to reduce the latency of TCP handshake, not to increase the throughput of connections. Using Mux for watching videos, downloading, or speed testing usually has negative effects. Mux only needs to be enabled on the client side, and the server side automatically adapts. Mux has an additional function: to run multiple UDP connections, i.e. XUDP.

`MuxObject` corresponds to the `mux` item in `OutboundObject`.

```json
{
  "enabled": false,
  "concurrency": 8
}
```

> `enabled`: true | false

Whether to enable Mux forwarding requests, default is `false`.

> `concurrency`: number

Maximum concurrent connections. Minimum value is `1`, maximum value is `1024`.
If this parameter is omitted or equal to `0`, the value will be `8`.

This value represents the maximum number of Mux connections that can be carried on a TCP connection. For example, when `concurrency=8` is set, if the client sends 8 TCP requests, Xray will only send one actual TCP connection, and all 8 requests from the client will be transmitted through this TCP connection.

::: tip
When filling in a negative number, such as `-1`, the mux module is not loaded.
:::

> `xudpConcurrency`: number

Use a new XUDP aggregate tunnel (that is, another Mux connection) to proxy UDP
traffic and fill in the maximum number of concurrent sub-UoTs. minimum value
`1`, the maximum value `1024`. If this parameter is omitted or equal to `0`,
UDP traffic will use the same path as TCP traffic.

::: tip
When filling in negative numbers, such as `-1`, UDP will not be transmitted via
Mux. The original UDP transmission method of the proxy protocol will be used.
For example, Shadowsocks will use native UDP, VLESS will use UoT.
:::

> `xudpProxyUDP443`: string

Control how Mux handles proxied UDP/443 (QUIC) traffic:

- Default `reject`: Deny traffic (generaly, browsers will fall back to to TCP HTTP/2)
- `allow`: Allow connections.
- `skip`: The Mux module is not used to carry UDP 443 traffic. The original UDP
  transmission method of the proxy protocol will be used. For example,
  Shadowsocks will use native UDP, VLESS will use UoT.
