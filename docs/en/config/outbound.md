# Outbound Proxy

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

Special value `srcip`: If this value is used, the request will be sent using the source IP address of the inbound connection.

For example, if the machine has a full IPv4 range `11.4.5.0/24` and listens on `0.0.0.0` (all IPv4 and IPv6 on the network interface), if a client connects to the local machine via `11.4.5.14`, the outbound request will also be sent via `11.4.5.14`. If the client connects via `11.4.5.10`, the outbound request will be sent via `11.4.5.10`. This also applies to cases where the machine has a full range/multiple IPv6 addresses.

As mentioned in the inbound introduction, because of the connectionless nature of UDP, Xray cannot know the original destination IP where the request entered the core (for example, in the same QUIC connection, it might even change), so this feature cannot take effect for UDP.

> `protocol`: "blackhole" | "dns" | "freedom" | "http" | "loopback" | "shadowsocks" | "socks" | "trojan" | "vless" | "vmess" | "hysteria" | "wireguard" | "masque"

The connection protocol name. For the list of optional protocols, see [Outbound Protocols](./outbounds/) on the left.

> `settings`: OutboundConfigurationObject

Specific configuration content, which varies by protocol. See `OutboundConfigurationObject` in each protocol for details.
<span id="muxobject"></span>
<span id="multiplex"></span>

For VLESS and VMess, see [Multiplex settings](./outbounds/vless.md#multiplex).

> `tag`: string

The identifier for this outbound connection, used to locate this connection in other configurations.

::: danger
When not empty, its value must be **unique** among all `tag`s.
:::

> `streamSettings`: [StreamSettingsObject](./transport.md)

Transport configuration for this outbound.

> `targetStrategy`: "AsIs" | "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4" | "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

Applies to outbounds other than Freedom. Controls whether the target domain name in a proxied request is resolved locally to an IP and which resolution strategy is used.

The default value is `AsIs`, which sends the target domain name unchanged to the remote server. The strategies have essentially the same meanings as `domainStrategy` in [Sockopt](./transports/sockopt.md#sockoptobject).

::: tip
This controls **proxied requests**. If the address of the outbound proxy server is a domain name, and you need to select a resolution strategy for the domain name itself, you should configure `domainStrategy` in [Sockopt](./transports/sockopt.md#sockoptobject).

Freedom's domain resolution strategy should also be configured through `sockopt.domainStrategy`.
:::
