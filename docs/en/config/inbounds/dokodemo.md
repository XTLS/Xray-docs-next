# Dokodemo-Door

Dokodemo door (Anywhere Door) can listen to a local port and forward all incoming data on this port to a specified server's port, achieving the effect of port mapping.

## InboundConfigurationObject

```json
{
  "address": "8.8.8.8",
  "port": 53,
  "network": "tcp",
  "timeout": 0,
  "followRedirect": false,
  "userLevel": 0
}
```

> `address`: address

The address to forward the traffic to. It can be an IP address like `"1.2.3.4"` or a domain name like `"xray.com"`. It is a string type.

When `followRedirect` (see below) is set to `true`, `address` can be empty.

> `port`: number

The specified port on the destination address to forward the traffic to. It should be in the range 1,655351,65535. It is a numeric value and is a required parameter.

> `network`: "tcp" | "udp" | "tcp,udp"

The supported network protocol type. For example, when specified as `"tcp"`, it will only receive TCP traffic. The default value is `"tcp"`.

> `timeout`: number

The idle timeout in seconds. The default value is `300`. When handling a connection, if no data is transmitted within the timeout period, the connection will be terminated.

> `followRedirect`: true | false

When set to `true`, dokodemo-door will recognize data forwarded by iptables and forward it to the corresponding destination address.

Refer to the `tproxy` setting in the [Transport Configuration](../transport.md#sockoptobject) for more information.

> `userLevel`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `userLevel` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

## Transparent Proxy Configuration Example

Please refer to the [Transparent Proxy (TProxy) Configuration Tutorial](../../document/level-2/tproxy) for this section.
