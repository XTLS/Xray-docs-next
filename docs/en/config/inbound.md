# Inbound Proxy

Inbound connections are used to receive incoming data. For available protocols, please refer to [Inbound Protocols](./inbounds/).

## InboundObject

`InboundObject` corresponds to a child element of the `inbounds` item in the configuration file.

```json
{
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "port": 1080,
      "protocol": "protocol_name",
      "settings": {},
      "streamSettings": {},
      "tag": "identifier",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ]
}
```

> `listen`: address

The listening address, which can be an IP address or a Unix domain socket. The default value is `"0.0.0.0"`, which means listening on all network interfaces.

You can specify an IP address available on the system.

`"::"` is equivalent to `"0.0.0.0"`; both will listen on IPv6 and IPv4 simultaneously. However, if you only want to listen on IPv6, you can set `v6only` in `sockopt` to true. If you only want to listen on IPv4, you can use commands like `ip a` to view the specific IP on the network card (usually the machine's public IP address or a private network address like 10.x.x.x) and listen on that. Of course, you can do the same for IPv6.

Note that because UDP is not connection-oriented, if the inbound is based on UDP and there are multiple IP addresses on the network card, and the external connection is to a non-preferred address on the card, Xray might incorrectly use the preferred address as the source address for the reply instead of the target of the external connection, causing the connection to fail.
The solution is not to listen on `0.0.0.0` but to listen on the specific IP address on the network card.

Supports Unix domain sockets in absolute path format, such as `"/dev/shm/domain.socket"`. You can add `@` at the beginning to represent [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html), and `@@` for abstract with padding.

When filling in a Unix domain socket, `port` and `allocate` will be ignored. The protocol can currently be VLESS, VMess, or Trojan, and applies only to TCP-based underlying transports, such as `tcp`, `websocket`, `grpc`. UDP-based transports like `mkcp` are not supported.

When filling in a Unix domain socket, you can use the format `"/dev/shm/domain.socket,0666"`, i.e., adding a comma and access permission indicators after the socket, to specify the access permissions of the socket. This can be used to solve socket permission issues that occur by default.

> `port`: number | "env:variable" | string

Port. Accepted formats are as follows:

- Integer value: The actual port number.
- Environment variable: Starts with `"env:"`, followed by the name of an environment variable, such as `"env:PORT"`. Xray will parse this environment variable as a string.
- String: Can be a numeric string, such as `"1234"`; or a numerical range, such as `"5-10"` indicating ports 5 to 10 (6 ports in total). Commas can be used for segmentation, such as `11,13,15-17` indicating port 11, port 13, and ports 15 to 17 (5 ports in total).

When only one port is specified, Xray will listen for inbound connections on this port. When a port range is specified, Xray will listen on all ports within the range.

Note that listening on a port is a relatively expensive operation. Listening on a port range that is too large may cause a significant increase in resource usage or even cause Xray to fail to work properly. Generally speaking, problems may begin to appear when the number of listening ports approaches four digits. If you need to use a very large range, please consider using iptables for redirection instead of setting it here.

> `protocol`: "dokodemo-door" | "http" | "shadowsocks" | "socks" | "vless" | "vmess" | "trojan" | "wireguard"

Connection protocol name. See the list of available [Inbound Protocols](./inbounds/) on the left.

> `settings`: InboundConfigurationObject

Specific configuration content, which varies by protocol. See `InboundConfigurationObject` in each protocol section for details.

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

Underlying transport method (transport) is the way the current Xray node connects with other nodes.

> `tag`: string
> The identifier of this inbound connection, used to locate this connection in other configurations.

::: danger
When it is not empty, its value must be **unique** among all `tag`s.
:::

> `sniffing`: [SniffingObject](#sniffingobject)

Traffic sniffing is mainly used for transparent proxies and similar purposes. A typical flow is as follows:

1. If a device accesses the internet and visits abc.com, the device first queries DNS to get the IP of abc.com as 1.2.3.4, and then the device initiates a connection to 1.2.3.4.
2. If sniffing is not configured, the connection request received by Xray is for 1.2.3.4, which cannot be used for routing traffic based on domain rules.
3. When `enabled` in sniffing is set to `true`, Xray will sniff the domain name, i.e., abc.com, from the traffic data when processing this connection.
4. Xray will reset 1.2.3.4 to abc.com. The routing can then divert traffic according to the domain rules.

Because it becomes a connection requesting abc.com, more things can be done. Besides routing domain rule diversion, it can also re-perform DNS resolution and other tasks.

When `enabled` in sniffing is set to `true`, it can also sniff Bittorrent type traffic. Then you can configure the "protocol" item in routing to set rules for handling unencrypted BT traffic. For example, the server side can be used to intercept unencrypted BT traffic, or the client side can fixedly forward BT traffic to a certain VPS, etc.

Note: Newer browsers may use ECH to encrypt the Client Hello. In this case, Xray can only see the domain in the Outer Hello. You may need to consider hijacking DNS or manually disabling ECH in the browser configuration.

### SniffingObject

```json
{
  "enabled": true,
  "destOverride": ["http", "tls", "fakedns"],
  "metadataOnly": false,
  "domainsExcluded": [],
  "routeOnly": false
}
```

> `enabled`: true | false

Whether to enable traffic sniffing.

> `destOverride`: \["http" | "tls" | "quic" | "fakedns"\]

When the traffic is of the specified type, reset the destination of the current connection based on the destination address contained within it.

::: tip
Xray will only sniff the domains of protocols in `destOverride` for routing purposes. If you only want to sniff for routing but do not want to reset the destination address (e.g., resetting the destination address when using the Tor browser will cause connection failure), please add the corresponding protocol here and enable `routeOnly`.
:::

> `metadataOnly`: true | false

When enabled, only the connection metadata will be used to sniff the destination address. At this time, sniffers other than `fakedns` will not be activated.

If disabled (using more than just metadata to infer the destination address), the client must send data first before the proxy server actually establishes a connection. This behavior is incompatible with protocols where the server must initiate the first message, such as the SMTP protocol.

> `domainsExcluded`: [string] <Badge text="WIP" type="warning"/>

A list of domains. If the result of traffic sniffing is in this list, the destination address will **not** be reset.

Supports direct domains (exact match), or strings starting with `regexp:` followed by a regular expression.

::: tip
Filling in some domains may solve issues with iOS push notifications, Mijia smart devices, and voice chat in certain games (Rainbow Six).<br>
If you need to troubleshoot the cause of certain problems, you can test by disabling `"sniffing"` or enabling `"routeOnly"`.
:::

```json
"domainsExcluded": [
    "courier.push.apple.com", // iOS push notifications
    "Mijia Cloud", // Mijia smart devices
    "dlg.io.mi.com"
]
```

::: warning
Currently, `domainsExcluded` does not support the domain matching methods used in routing. This option may change in the future and cross-version compatibility is not guaranteed.
:::

> `routeOnly`: true | false

Use the sniffed domain only for routing; the proxy destination address remains the IP. The default value is `false`.

This item requires `destOverride` to be enabled to work.

::: tip
When it is guaranteed that **the proxied connection can obtain correct DNS resolution**, using `routeOnly` while enabling `destOverride`, and setting the routing matching strategy `domainStrategy` to `AsIs`, allows for domain and IP traffic splitting without DNS resolution throughout the process. In this case, the IP used when matching IP rules is the original IP of the domain name.
:::
