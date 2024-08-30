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
  "noise": {
    "packet": "rand:5-10",
    "delay": "10-20" // ms
  },
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

> `noise`: map

A key-value map used to control UDP noise，under some circumstances it can bypass some udp based protocol restrictions.

`"packet"`：support two different methods."rand:min-max" generates random bytes with min and max length provided for noise."str:Customstring" will use user input string as noise.

`"delay"`：delay before sending real data (ms).If not specified, the default value is 0.

> `proxyProtocol`: number

The value of `proxyProtocol` represents the PROXY Protocol version. default value is `0`.
