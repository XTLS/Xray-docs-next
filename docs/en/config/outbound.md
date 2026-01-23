# Outbound Proxy (Mux, XUDP)

Outbound connections are used to send data. For available protocols, please see [Outbound Protocols](./outbounds/).

## OutboundObject

`OutboundObject` corresponds to a sub-element of the `outbounds` item in the configuration file.

::: tip
The first element in the list serves as the primary outbound. When a routing match does not exist or fails, traffic is sent via the primary outbound.
:::

```json
{
  "outbounds": [
    {
      "sendThrough": "0.0.0.0",
      "protocol": "protocol_name",
      "settings": {},
      "tag": "identifier",
      "streamSettings": {},
      "proxySettings": {
        "tag": "another-outbound-tag",
        "transportLayer": false
      },
      "mux": {},
      "targetStrategy": "AsIs"
    }
  ]
}
```

> `sendThrough`: address

The IP address used to send data. This is effective when the host has multiple IP addresses. The default value is `"0.0.0.0"`.

You can enter an IPv6 CIDR block (e.g., `114:514:1919:810::/64`), and Xray will use a random IP address from the address block to initiate external connections.
You need to correctly configure the network access method, routing table, and kernel parameters to allow Xray to bind to any IP within the address block.

For networks using NDP access, it is not recommended to set a subnet smaller than `/120`. Otherwise, it may cause issues such as NDP flooding, leading to the router's neighbor cache becoming full.

Special value `origin`: If this value is used, the request will be sent using the IP address of the local machine that received the connection.

For example, if the machine has a full IPv4 range `11.4.5.0/24` and listens on `0.0.0.0` (all IPv4 and IPv6 on the network interface), if a client connects to the local machine via `11.4.5.14`, the outbound request will also be sent via `11.4.5.14`. If the client connects via `11.4.5.10`, the outbound request will be sent via `11.4.5.10`. This also applies to cases where the machine has a full range/multiple IPv6 addresses.

As mentioned in the inbound introduction, because of the connectionless nature of UDP, Xray cannot know the original destination IP where the request entered the core (for example, in the same QUIC connection, it might even change), so this feature cannot take effect for UDP.

> `protocol`: "blackhole" | "dns" | "freedom" | "http" | "loopback" | "shadowsocks" | "socks" | "trojan" | "vless" | "vmess" | "wireguard"

The connection protocol name. For the list of optional protocols, see [Outbound Protocols](./outbounds/) on the left.

> `settings`: OutboundConfigurationObject

Specific configuration content, which varies by protocol. See `OutboundConfigurationObject` in each protocol for details.

> `tag`: string

The identifier for this outbound connection, used to locate this connection in other configurations.

::: danger
When not empty, its value must be **unique** among all `tag`s.
:::

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

The underlying transport method is the way the current Xray node connects with other nodes.

> `proxySettings`: [ProxySettingsObject](#proxysettingsobject)

Outbound proxy configuration.

> `mux`: [MuxObject](#muxobject)

Specific configuration related to Mux.

> `targetStrategy`: "AsIs" | "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4" | "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

If this outbound attempts to send a domain request, this controls whether it is resolved/how it is resolved to an IP before sending.

The default value is `AsIs`, meaning it is sent to the remote server as is. All parameter meanings are roughly equivalent to `domainStrategy` in [sockopt](./transport.md#sockoptobject).

::: tip
This controls **proxied requests**. If the address of the outbound proxy server is a domain name, and you need to select a resolution strategy for the domain name itself, you should configure `domainStrategy` in [sockopt](./transport.md#sockoptobject).
:::

### ProxySettingsObject

```json
{
  "tag": "another-outbound-tag",
  "transportLayer": false
}
```

> `tag`: string

When the identifier of another outbound is specified, data sent by this outbound will be forwarded to the specified outbound for transmission.

::: danger
This option conflicts with [SockOpt.dialerProxy](./transport.md#sockoptobject). Choose one as needed.

By default, this forwarding method **does not go through** the underlying transport method (REALITY/XHTTP/gRPC...), meaning the `streamSettings` of this outbound will not take effect.<br>
If you need forwarding that supports underlying transport methods, please use `SockOpt.dialerProxy` instead or set `transportLayer` to `true`.
:::

> `transportLayer`: true | false

`true` converts this setting to `SockOpt.dialerProxy` to support forwarding via underlying transport methods. The default is `false`, meaning no conversion.

### MuxObject

The Mux function distributes data from multiple TCP connections over a single TCP connection. For implementation details, see [Mux.Cool](../development/protocols/muxcool.md). Mux is designed to reduce TCP handshake latency, not to increase connection throughput. Using Mux for watching videos, downloading, or speed testing usually has a negative effect. Mux only needs to be enabled on the client side; the server side adapts automatically. The second use of Mux is to distribute multiple UDP connections, i.e., XUDP.

`MuxObject` corresponds to the `mux` item in `OutboundObject`.

```json
{
  "enabled": true,
  "concurrency": 8,
  "xudpConcurrency": 16,
  "xudpProxyUDP443": "reject"
}
```

> `enabled`: true | false

Whether to enable Mux for forwarding requests. Default is `false`.

> `concurrency`: number

Maximum concurrent connections. Minimum `1`, maximum `128`. If omitted or set to `0`, it equals `8`. Values greater than `128` are treated as 128, because once a connection reaches the maximum reuse count of 128, it will no longer be assigned any new sub-connections.

This value represents the maximum number of sub-connections carried on a single TCP connection. For example, if `concurrency=8` is set, when the client issues 8 TCP requests, Xray will only issue one actual TCP connection, and all 8 requests from the client are transmitted over this TCP connection.

When the maximum sub-connection capacity of all Mux connections is fully occupied, the core will initiate new connections to carry sub-connections. If a large number of sub-connections are concurrent in a short time and subsequently decrease, the internal scheduler of the core will tend to distribute requests to 2 connections alternately and leave other connections idle, waiting for all their sub-connections to end naturally before closing them to save resources. If the total number of sub-connections continues to be lower than `concurrency` for a long time, after one of the connections reaches the maximum reuse count, the core will revert to a single connection state.

::: tip
When set to a negative number, such as `-1`, the Mux module is not used to carry TCP traffic.
:::

> `xudpConcurrency`: number

Use a new XUDP aggregation tunnel (i.e., another Mux connection) to proxy UDP traffic. Fill in the maximum number of concurrent sub-UoT. Minimum `1`, maximum `1024`.
If omitted or set to `0`, it will follow the same path as TCP traffic, which is the traditional behavior.

::: tip
When set to a negative number, such as `-1`, the Mux module is not used to carry UDP traffic. The proxy protocol's original UDP transmission method will be used. For example, `Shadowsocks` will use native UDP, and `VLESS` will use UoT.
:::

> `xudpProxyUDP443`: string

Controls how Mux handles proxied UDP/443 (QUIC) traffic:

- Default `reject`: Rejects traffic (browsers typically fall back to TCP HTTP2 automatically).
- `allow`: Allows traffic to go through the Mux connection.
- `skip`: Does not use the Mux module to carry UDP 443 traffic. The proxy protocol's original UDP transmission method will be used. For example, `Shadowsocks` will use native UDP, and `VLESS` will use UoT.
