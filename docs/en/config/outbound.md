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

> `protocol`: string

The name of the connection protocol. The optional protocol types can be found in [outbound protocols](./outbounds/).

> `settings`: OutboundConfigurationObject

The specific configuration content varies depending on the protocol. See `OutboundConfigurationObject` in each protocol for details.

> `tag`: string

The identifier of this outbound connection, used to locate this connection in other configurations.

::: danger
When it is not empty, its value must be **unique** among all `tag`s.
:::

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

The underlying transport method is the way the current Xray node and other nodes are docked.

> `proxySettings`: [ProxySettingsObject](#proxysettingsobject)

The outbound proxy configuration. When the outbound proxy takes effect, the `streamSettings` of this outbound will not work.

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

Maximum concurrent connections. Minimum value is `1`, maximum value is `1024`, default is `8`.

This value represents the maximum number of Mux connections that can be carried on a TCP connection. For example, when `concurrency=8` is set, if the client sends 8 TCP requests, Xray will only send one actual TCP connection, and all 8 requests from the client will be transmitted through this TCP connection.

::: tip
When filling in a negative number, such as `-1`, the mux module is not loaded.
:::
