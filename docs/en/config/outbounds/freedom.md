# Freedom (fragment, noises)

Freedom is a direct outbound protocol and usually the final endpoint for traffic: it receives TCP or UDP traffic from upstream, connects directly to the final destination, and sends and receives data.

::: warning
This outbound has a default safety policy in server-side and reverse-proxy scenarios, which may block some targets. See `finalRules` below for how to allow them.
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "freedom",
      // [!field focus]
      "settings": {
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
    }
  ]
}
```

::: tip
Freedom's target domain resolution strategy is controlled by [sockopt.domainStrategy](../transports/sockopt.md#sockoptobject).
:::

> `redirect`: address_port

Freedom rewrites the connection's current destination address and port to those specified in `redirect`.

The value is a string, e.g., `"127.0.0.1:80"`, `":1234"`.

When the address is not specified, e.g., `":443"`, Freedom will not modify the original destination address.
When the port is `0`, e.g., `"xray.com:0"`, Freedom will not modify the original port.

> `userLevel`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.

> `fragment`: [FragmentObject](#fragmentobject)

A set of key-value configuration items used to control outgoing TCP fragmentation. In some cases, it can deceive censorship systems, such as bypassing SNI blacklists.

> `noises`: \[ [NoiseObject](#noiseobject) \]

UDP noise, used to send some random data as "noise" before sending a UDP connection. Presence of this structure implies enablement. It might deceive sniffers, or it might disrupt normal connections. _Use at your own risk._ For this reason, it bypasses port 53 because that breaks DNS.

An array that can define multiple noise packets to send. Each element is a [NoiseObject](#noiseobject).

> `proxyProtocol`: number

PROXY protocol is usually used with `redirect` to redirect traffic to Nginx or other backend services that have the PROXY protocol enabled. If the backend service does not support PROXY protocol, the connection will be disconnected.

The value of `proxyProtocol` is the PROXY protocol version number. Options are `1` or `2`. If not specified, it defaults to `0` (disabled).

> `finalRules`: \[ [FinalRuleObject](#finalruleobject) \]

Matches Freedom final outbound rules in order, and allows or blocks connection targets.

Compared with blocking in `routing`, `finalRules` applies at Freedom's final outbound stage, both before and after dialing. UDP is also checked packet by packet during send and receive, making enforcement stricter and more thorough. Each rule match takes about 50-150 ns, so performance is not a concern.

::: details When the target is a domain name
When the target is a domain name and rules need to be applied, Freedom resolves it according to `sockopt.domainStrategy` before dialing, then checks every returned IP against the rules in order. If any IP is blocked, the entire request is blocked.

After dialing succeeds, Freedom checks the actual remote IP of the connection against the rules again. Therefore, if resolution before dialing fails or the two resolutions return different results, TCP handshake packets may still be sent before the connection enters the blackhole state.

Each UDP packet addressed to a domain name also triggers domain resolution when sent. However, the per-packet check only matches the destination IP selected for that packet against the rules in order to decide whether to block it; it does not check every IP returned by resolution.
:::

::: tip
If `sockopt.dialerProxy` is configured for this outbound, Freedom is no longer the final outbound, so it does not apply `finalRules` or the default safety policy described below.
:::

::: warning
There is a default fallback safety policy for server-side and reverse-proxy scenarios:

If no explicit rule matches, the built-in fallback rule is used: traffic from the VLESS reverse proxy blocks all targets by default; traffic from `VLESS`, `VMess`, `Trojan`, `Shadowsocks`, `Hysteria`, or `WireGuard` inbounds blocks private and reserved IP ranges by default; other traffic is fully allowed by default.

If the server needs to allow clients to access some internal services, explicitly configure `allow` rules and limit them to the necessary `network`, `ip`, and `port` whenever possible.
:::

### FragmentObject

```json
{
  "packets": "tlshello",
  "length": "100-200",
  "interval": "10-20"
}
```

> `packets`: string

Supports two fragmentation modes. `"1-3"` is TCP stream slicing, applied to the 1st through 3rd data writes by the client. `"tlshello"` is TLS handshake packet slicing.

> `length`: [Int32Range](../../development/intro/guide.md#int32range)

Fragment packet length (bytes).

> `interval`: [Int32Range](../../development/intro/guide.md#int32range)

Fragment interval (ms).

When `interval` is 0 and `"packets": "tlshello"` is set, the fragmented Client Hello will be sent in one TCP packet (provided its original size does not exceed MSS or MTU causing automatic system fragmentation).

### NoiseObject

```json
{
  "type": "base64",
  "packet": "7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
  "delay": "10-16"
}
```

> `type`: string

Noise packet type. Currently supports `"rand"` (random data), `"str"` (user-defined string), and `"base64"` (base64-encoded custom binary data).

> `packet`: string

The content of the packet to be sent based on the preceding `type`.

- When `type` is `rand`, this specifies the length of the random data. It can be a fixed value `"100"` or a range `"50-150"`.
- When `type` is `str`, this specifies the string to be sent.
- When `type` is `hex`, this specifies binary data in hex format.
- When `type` is `base64`, this specifies base64-encoded binary data.

> `delay`: [Int32Range](../../development/intro/guide.md#int32range)

Delay in milliseconds. After sending this noise packet, the core waits for this duration before sending the next noise packet or real data. Defaults to no wait.

### FinalRuleObject

```json
{
  "action": "block",
  "network": "tcp,udp",
  "port": "53,443",
  "ip": ["10.0.0.0/8", "2001:db8::/32"],
  "blockDelay": "30-90"
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

> `blockDelay`: string

Sets how long the blackhole state lasts after a blocking rule matches.

When a rule's `action` is `block` and the target matches, Freedom puts the connection into a blackhole state and closes it after this duration expires. The unit is seconds. It can be written as a fixed value or a range, for example `30` or `30-90`. If omitted, it defaults to `30-90`, which means a random value within that range.
