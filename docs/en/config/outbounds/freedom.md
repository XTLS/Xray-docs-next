# Freedom (fragment, noises)

Freedom is an outbound protocol used to send (normal) TCP or UDP data to any network.

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
  "proxyProtocol": 0
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
