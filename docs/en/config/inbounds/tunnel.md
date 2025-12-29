# Tunnel(Dokodemo-Door)

Tunnel, formerly known as dokodemo-door, listens on multiple local ports and forwards all incoming data through an outbound to a specified server port, achieving the effect of port mapping.

## InboundConfigurationObject

```json
{
  "address": "8.8.8.8",
  "port": 53,
  "portMap": {
    "5555": "1.1.1.1:7777",
    "5556": ":8888", // overrides port only
    "5557": "example.com:" // overrides address only
  },
  "network": "tcp",
  "followRedirect": false,
  "userLevel": 0
}
```

> `address`: address

The address to forward the traffic to. It can be an IP address like `"1.2.3.4"` or a domain name like `"xray.com"`. It is a string type, default `"localhost"`.

When `followRedirect` (see below) is set to `true`, `address` can be empty.

> `port`: number

The specified port on the destination address to forward the traffic to, range \[0, 65535\], numeric type. If not filled or set to 0, it defaults to the listening port.

> `portMap`: map[string]string

A map maps local ports and required remote addresses/ports (if the inbound listens on several ports). If a local port is not included, handles according to `address`/`port` setting.

> `network`: "tcp" | "udp" | "tcp,udp"

The supported network protocol type. For example, when specified as `"tcp"`, it will only receive TCP traffic. The default value is `"tcp"`.

> `followRedirect`: true | false

When set to `true`, dokodemo-door will recognize data forwarded by iptables and forward it to the corresponding destination address.

Refer to the `tproxy` setting in the [Transport Configuration](../transport.md#sockoptobject) for more information.

> `userLevel`: number

The user level that the connection will use to determine the corresponding [Local Policy](../policy.md#levelpolicyobject).

The value of `userLevel` corresponds to the value of `level` in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

## Usage

Dokodemo-door can be used as Transparent proxy (in the next section) and can be used to map a port.

Some services do not support proxy likes Socks5, but using Tun or Tproxy could be too complicated. If these services only communicate with a single IP address and port (example: iperf, Minecraft server, Wireguard endpoint), dokodemo-door can be used.

Below is an example config (if the default outbound is an effective proxy):

```json
{
  "listen": "127.0.0.1",
  "port": 25565,
  "protocol": "tunnel",
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
