# Tunnel (dokodemo-door)

Tunnel, formerly known as dokodemo-door (Arbitrary Door), can listen on multiple local ports and send all received data to a specific port on a specified server via an outbound, thereby achieving the effect of port mapping.

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

Forward traffic to this address. It can be an IP address, like `"1.2.3.4"`, or a domain name, like `"xray.com"`. String type, defaults to `"localhost"`.

> `port`: number

Forward traffic to the specified port of the target address. Range \[0, 65535\], numeric type. If omitted or 0, it defaults to the listening port.

> `portMap`: map[string]string

A map mapping local ports to required remote addresses/ports (if the inbound listens on multiple ports). If the local port is not included in this map, it is handled according to the `address`/`port` settings.

> `network`: "tcp" | "udp" | "tcp,udp"

Accepted network protocol types. For example, when specified as `"tcp"`, only TCP traffic will be received. Default value is `"tcp"`.

> `followRedirect`: true | false

When set to `true`, dokodemo-door will recognize data forwarded by iptables and forward it to the corresponding target address.

Please refer to the `tproxy` setting in [Transport Configuration](../transport.md#sockoptobject).

> `userLevel`: number

User level. Connections will use the [Local Policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, it defaults to 0.

## Usage

The "Arbitrary Door" has two main uses: one is for transparent proxy (see below), and the other is for mapping a port.

Sometimes some services do not support forward proxies like Socks5, and using Tun or Tproxy is overkill. If these services only communicate with a single IP and port (e.g., iperf, Minecraft server, Wireguard endpoint), you can use dokodemo-door.

For example, the following Config (assuming the default outbound is a valid proxy):

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

In this case, the core will listen on 127.0.0.1:25565 and forward it to mc.hypixel.net:25565 (a MC server) via the default outbound. Connecting the Minecraft client to 127.0.0.1:25565 is equivalent to connecting to the Hypixel server via a proxy.

## Transparent Proxy Configuration Example

For this section, please refer to [Transparent Proxy (TProxy) Configuration Tutorial](../../document/level-2/tproxy).
