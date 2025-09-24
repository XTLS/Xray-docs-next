# Freedom

Freedom is an outbound protocol that can be used to send (normal) TCP or UDP data to any network.

## OutboundConfigurationObject

```json
{
  "targetStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0,
  "fragment": {
    "packets": "tlshello",
    "length": "100-200",
    "interval": "10-20", // ms
    "maxSplit": "300-400"
  },
  "noises": [
    {
      "type": "base64",
      "packet": "7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
      "delay": "10-16",
      "applyTo": "ip"
    },
    {
      "type": "rand",
      "packet": "10-20",
      "delay": "10-16",
      "applyTo": "ipv4"
    },
    {
      "type": "str",
      "packet": "hiGFW",
      "delay": "10-16",
      "applyTo": "ipv6"
    }
  ],
  "proxyProtocol": 0
}
```

> `targetStrategy`: "AsIs"
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

When the destination address is a domain name, configure the corresponding value for Freedom's behavior:

- `"AsIs"`: Freedom resolves the domain name using the system DNS server and connects to it.
- `"UseIP"`, `"UseIPv4"`, and `"UseIPv6"`: Xray resolves the domain name using the built-in [DNS server](../dns.md) and connects to it. The default value is `"AsIs"`.
- "IPv4" means that you are trying to connect using only IPv4, "IPv4v6" means that you are trying to connect using either IPv4 or IPv6, but for dual-stack domain names, IPv4 is used. (The same applies to the v4v6 switch, so I won't go into details.)
- When using "Use"the option beginning with , if the resolution result does not meet the requirements (for example, the domain name only has IPv4 resolution results but UseIPv6 is used), it will fall back to AsIs.
- When using "Force"an option beginning with , if the parsing result does not meet the requirements, the connection cannot be established.

::: warning
if we have multiple IPs and using `UseIP` or `ForceIP` only a random IP will replace the domain, for using `happyEyeballs` we should use `sockopt domainStrategy` instead.
:::

::: tip TIP 1
When using the `"UseIP"` mode and the `sendThrough` field is specified in the [outbound connection configuration](../outbound.md#outboundobject), Freedom will automatically determine the required IP type, IPv4 or IPv6, based on the value of `sendThrough`.
:::

::: tip TIP 2
When using the `"UseIPv4"` or `"UseIPv6"` mode, Freedom will only use the corresponding IPv4 or IPv6 address. If `sendThrough` specifies a mismatched local address, the connection will fail.
:::

::: tip TIP 3
When using the `"UseIP"` or `ForceIP` mode, and when network is UDP, Freedom tries to select the same IP-type as original-target-ip-type(before sniffing), to prevent MTU problems, and prevent detection by GFW.
:::

> `redirect`: address_port

Freedom will force all data to be sent to the specified address (instead of the address specified in the inbound).

It is a string value, for example: `"127.0.0.1:80"`, `":1234"`.

When the address is not specified, such as `":443"`, Freedom will not modify the original destination address. When the port is `0`, such as `"xray.com:0"`, Freedom will not modify the original port.

> `userLevel`: number

User level. The connection will use the corresponding [local policy](../policy.md#levelpolicyobject) for this user level.

The value of `userLevel` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `fragment`: map

A key-value map used to control TCP fragmentation，under some circumstances it can cheat the censor system, like bypass a SNI blacklist.

`"packets"`：support two different methods. "1-3" is for segmentation at TCP layer, applying to the beginning 1 to 3 data writes by the client. "tlshello" is for TLS client hello packet fragmentation.

`"length"`: length to make the cut

`"interval"`: time between fragments（ms）

`"maxSplit"`: the maximum number of split fragments per packet, for example if we have a packet with 100-bytes size, and we set length to "1", and set maxSplit to "50", we send 49 1-bytes-packet with one 51-bytes-packet.

::: warning
⚠️ "noise":{} is deptecated,only "noises":[{}] is supported in 24.9.16 and later
:::

> `noises`: [ noiseObject ]

A Array used to control UDP noise，under some circumstances it can bypass some udp based protocol restrictions.
xray will loop through this array and send each noise packet one by one

`"type"`：Three types are supported. "rand" generates a random byte , "str" uses a user input string, "base64" uses a user input base64 encoded string

`"packet"`：If type is set to "rand" this field will take a range "50-100" or a single value "50"

if type is set to "str" this field will take a string

if type is set to "base64" this field will take a base64 encoded string

`"delay"`：delay before sending real data (ms). can be a string range like "10-20" or a single integer

If not specified, the default value is 0.

`"applyTo"`: three mode are supported: "ipv4"/"ipv6"/"ip", if not specified, the default value is "ip".

if "ipv4", noise is sent only when remote address(after resolving domain to ip) is IPv4.

if "ipv6", noise is sent only when remote address(after resolving domain to ip) is IPv6.

if "ip", noise is always sent.

> `proxyProtocol`: number

The value of `proxyProtocol` represents the PROXY Protocol version. default value is `0`.
