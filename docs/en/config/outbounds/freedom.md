# Freedom

Freedom is an outbound protocol that can be used to send (normal) TCP or UDP data to any network.

## OutboundConfigurationObject

```json
{
  "domainStrategy": "AsIs",
  "redirect": "127.0.0.1:3366",
  "userLevel": 0,
  "fragment": {
    "packets": "tlshello",
    "length": "100-200",
    "interval": "10-20" // ms
  },
  "noises":[
  {
    "type":"base64",
    "packet":"7nQBAAABAAAAAAAABnQtcmluZwZtc2VkZ2UDbmV0AAABAAE=",
    "delay":"10-16"
  },
  {
    "type":"rand",
    "packet":"10-20",
    "delay":"10-16"
  },
  {
    "type":"str",
    "packet":"hiGFW",
    "delay":"10-16"
  }
],
  "proxyProtocol": 0
}
```

> `domainStrategy`: "AsIs" | "UseIP" | "UseIPv4" | "UseIPv6"

When the destination address is a domain name, configure the corresponding value for Freedom's behavior:

- `"AsIs"`: Freedom resolves the domain name using the system DNS server and connects to it.
- `"UseIP"`, `"UseIPv4"`, and `"UseIPv6"`: Xray resolves the domain name using the built-in [DNS server](../dns.md) and connects to it. The default value is `"AsIs"`.

::: tip TIP 1
When using the `"UseIP"` mode and the `sendThrough` field is specified in the [outbound connection configuration](../outbound.md#outboundobject), Freedom will automatically determine the required IP type, IPv4 or IPv6, based on the value of `sendThrough`.
:::

::: tip TIP 2
When using the `"UseIPv4"` or `"UseIPv6"` mode, Freedom will only use the corresponding IPv4 or IPv6 address. If `sendThrough` specifies a mismatched local address, the connection will fail.
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

> `proxyProtocol`: number

The value of `proxyProtocol` represents the PROXY Protocol version. default value is `0`.
