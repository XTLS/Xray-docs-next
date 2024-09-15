# Dokodemo-Door

Dokodemo door (Anywhere Door) can listen to a local port and forward all incoming data on this port to a specified server's port, achieving the effect of port mapping.

## InboundConfigurationObject

```json
{
  "address": "8.8.8.8",
  "port": 53,
  "network": "tcp",
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

> `followRedirect`: true | false

When set to `true`, dokodemo-door will recognize data forwarded by iptables and forward it to the corresponding destination address.

Refer to the `tproxy` setting in the [Transport Configuration](../transport.md#sockoptobject) for more information.

> `userLevel`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `userLevel` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

## Usage

Dokodemo-door can be used as Transparent proxy (in the next section) and can be used to mapping a port.

Some services does not support proxy likes SOCKS5, but using Tun or Tproxy could be too complicated. If these services only communicate with only one port (like iperf, Minecraft server, Wireguard endpoint, etc.), dokodemo-door can be used.

Below is an example config (if the default outbound is an effective proxy):

```json
{
  "listen": "127.0.0.1",
  "port": 25565,
  "protocol": "dokodemo-door",
  "settings": {
    "address": "mc.hypixel.net",
    "port": 25565,
    "network": "tcp",
    "followRedirect": false,
    "userLevel": 0
  },
  "tag": "mc"
}
```

The core will listen at `127.0.0.1:25565`, and the traffic coming in through this inbound will be send to `mc.hypixel.net:25565` (a Minecraft server) through the default outbound. Then you can connect the Minecraft client to the Hypixel server through the proxy by set the game server to `127.0.0.1:25565` in the Minecraft client.

## Transparent Proxy Configuration Example

Please refer to the [Transparent Proxy (TProxy) Configuration Tutorial](../../document/level-2/tproxy) for this section.
