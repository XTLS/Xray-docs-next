# Freedom (fragment, noises)

Freedom is an outbound protocol used to send (normal) TCP or UDP data to any network.

::: warning
This outbound's safety policy may block some targets by default. See `finalRules` below for details.
:::

## OutboundConfigurationObject

```json
{
  "domainStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0,
  "fragment": {
    "packets": "tlshello",
    "length": "100-200",
    "interval": "10-20" // Unit: ms
  },
  "noises": [
    {
      "type": "base64",
      "packet": "7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
      "delay": "10-16"
    }
  ],
  "proxyProtocol": 0,
  "finalRules": [
    {
      "action": "block",
      "network": "tcp",
      "port": "22,25,465,587"
    },
    {
      "action": "block",
      "ip": ["geoip:cn"]
    }
  ]
}
```

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

Default value `"AsIs"`.

The meanings of all parameters are roughly equivalent to `domainStrategy` in [sockopt](../transport.md#sockoptobject).

Only using `"AsIs"` here allows passing the domain name to the subsequent `sockopt` module. If set to non-`"AsIs"` here, causing the domain to be resolved to a specific IP, it will invalidate the subsequent `sockopt.domainStrategy` and its related `happyEyeballs`. (There is no negative impact if these two settings are not adjusted).

When sending UDP, Freedom ignores `domainStrategy` in `sockopt` for some reasons and forcibly prefers IPv4 by default.

> `redirect`: address_port

Freedom will forcibly send all data to the specified address (instead of the address specified by the inbound).

The value is a string, e.g., `"127.0.0.1:80"`, `":1234"`.

When the address is not specified, e.g., `":443"`, Freedom will not modify the original destination address.
When the port is `0`, e.g., `"xray.com:0"`, Freedom will not modify the original port.

> `userLevel`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.

> `fragment`: map

A set of key-value configuration items used to control outgoing TCP fragmentation. In some cases, it can deceive censorship systems, such as bypassing SNI blacklists.

`"length"` and `"interval"` are both [Int32Range](../../development/intro/guide.md#int32range) types.

`"packets"`: Supports two fragmentation modes. `"1-3"` is TCP stream slicing, applied to the 1st through 3rd data writes by the client. `"tlshello"` is TLS handshake packet slicing.

`"length"`: Fragment packet length (byte).

`"interval"`: Fragment interval (ms).

When `interval` is 0 and `"packets": "tlshello"` is set, the fragmented Client Hello will be sent in one TCP packet (provided its original size does not exceed MSS or MTU causing automatic system fragmentation).

> `noises`: array

UDP noise, used to send some random data as "noise" before sending a UDP connection. Presence of this structure implies enablement. It might deceive sniffers, or it might disrupt normal connections. _Use at your own risk._ For this reason, it bypasses port 53 because that breaks DNS.

It is an array where multiple noise packets to be sent can be defined. A single element in the array is defined as follows:

`"type"`: Noise packet type. Currently supports `"rand"` (random data), `"str"` (user-defined string), `"base64"` (base64 encoded custom binary data).

`"packet"`: The content of the packet to be sent based on the preceding `type`.

- When `type` is `rand`, this specifies the length of the random data. It can be a fixed value `"100"` or a floating range `"50-150"`.
- When `type` is `str`, this specifies the string to be sent.
- When `type` is `hex`, this specifies binary data in hex format.
- When `type` is `base64`, this specifies base64 encoded binary data.

`"delay"`: Delay in milliseconds. After sending this noise packet, the core will wait for this time before sending the next noise packet or real data. Defaults to no wait. It is an [Int32Range](../../development/intro/guide.md#int32range) type.

> `proxyProtocol`: number

PROXY protocol is usually used with `redirect` to redirect traffic to Nginx or other backend services that have the PROXY protocol enabled. If the backend service does not support PROXY protocol, the connection will be disconnected.

The value of `proxyProtocol` is the PROXY protocol version number. Options are `1` or `2`. If not specified, it defaults to `0` (disabled).

> `finalRules`: \[[FinalRuleObject](#finalruleobject)\]

Matches Freedom final outbound rules in order, and allows or blocks connection targets.

Compared with blocking in `routing`, `finalRules` applies at Freedom's final outbound stage: TCP is matched after the final IP is resolved and before dialing, and UDP is matched packet by packet on both send and receive, making it stricter and more thorough. Each rule match takes about 50-150 ns.

If no rule is matched, the built-in fallback rule is used: traffic from the VLESS reverse proxy blocks all targets by default; traffic from `VLESS`, `VMess`, `Trojan`, `Shadowsocks`, `Hysteria`, or `WireGuard` inbounds blocks private and reserved IP ranges by default; other traffic is allowed by default.

For the seven inbound types above, or when `finalRules` is explicitly configured: if Freedom `domainStrategy` is `AsIs` and the target is a domain, Freedom resolves the target to an IP before applying `finalRules`. At that point the target is no longer a domain, so the later `sockopt.domainStrategy` and its `happyEyeballs` no longer take effect.

To restore the previous behavior, configure exactly one `allow` rule in `finalRules` without any matching conditions.

### FinalRuleObject

```json
{
  "action": "block",
  "network": "tcp,udp",
  "port": "53,443",
  "ip": ["10.0.0.0/8", "2001:db8::/32"]
}
```

All matching conditions in a rule are combined with AND logic. If a condition is omitted, that condition is not restricted.

> `action`: "allow" | "block"

Defines the action to take when the rule matches.

- `allow`: Allows the target.
- `block`: Blocks the target.

> `network`: "tcp" | "udp" | "tcp,udp"

Matches the network type. The rule takes effect when the connection method matches. It can also be written as a string array, such as `["tcp", "udp"]`. If omitted, all networks are matched.

> `port`: number | string

Target port range. The syntax is the same as [`port` in routing rules](../routing.md#ruleobject). If omitted, all ports are matched.

> `ip`: \[string\]

An array where each item represents an IP range. The rule takes effect when an item matches the target IP. The syntax is the same as [`ip` in routing rules](../routing.md#ruleobject). If omitted, all IPs are matched.
