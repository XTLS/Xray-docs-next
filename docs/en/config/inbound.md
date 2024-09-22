# Inbound Proxy

Inbound connections are used to receive incoming data and the available protocols are listed in [inbound protocols](./inbounds/).

## InboundObject

The `InboundObject` corresponds to a subelement of the `inbounds` item in the configuration file.

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
      },
      "allocate": {
        "strategy": "always",
        "refresh": 5,
        "concurrency": 3
      }
    }
  ]
}
```

> `listen`: address

The listening address, either an IP address or a Unix domain socket. The default value is `"0.0.0.0"`, which means accepting connections on all network interfaces.

An available system IP address can be specified.

Unix domain socket can also be specified by providing the absolute path in the form of `"/dev/shm/domain.socket"`. The `@` symbol can be added at the beginning to represent [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html), and `@@` represents padded abstract.

When Unix domain socket is specified, `port` and `allocate` will be ignored. The protocol currently supports VLESS, VMess, and Trojan. The transport methods available are TCP, WebSocket, HTTP/2, and gRPC.

When specifying a Unix domain socket, you can add a comma and an access permission indicator after the socket, such as `"/dev/shm/domain.socket,0666"`, to specify the access permission of the socket. This can be used to solve the socket access permission issue that occurs by default.

> `port`: number | "env:variable" | string

Port. The accepted formats are:

- Integer: the actual port number.
- Environment variable: starts with `"env:"`, followed by the name of an environment variable, such as `"env:PORT"`. Xray will parse this environment variable as a string.
- String: can be a numeric string, such as `"1234"`, or a range of port numbers, such as `"5-10"` which represents ports 5 through 10, a total of 6 ports. You can use commas to separate multiple ranges, such as `11,13,15-17`, which represents ports 11, 13, and 15 through 17, a total of 5 ports.

When only one port is specified, Xray listens for inbound connections on that port. When a range of ports is specified, it depends on the `allocate` setting.

> `protocol`: "dokodemo-door" | "http" | "shadowsocks" | "socks" | "vless" | "vmess" | "trojan" | "wireguard"

The connection protocol name. The optional protocol types are listed in [inbound protocols](./inbounds/).

> `settings`: InboundConfigurationObject

The specific configuration content depends on the protocol. See `InboundConfigurationObject` in each protocol for details.

> `streamSettings`: [StreamSettingsObject](./transport.md#streamsettingsobject)

The underlying transport method is how the current Xray node interfaces with other nodes.

> `tag`: string
>
> The identifier of this inbound connection, used to locate this connection in other configurations.

::: danger
When it is not empty, its value must be **unique** among all `tag`s.
:::

> `sniffing`: [SniffingObject](#sniffingobject)

Traffic sniffing is mainly used in transparent proxies, for example:

1. If a device wants to access `abc.com` while connected to the internet, it will first query the IP address of `abc.com` via DNS and get `1.2.3.4`. Then the device will initiate a connection to `1.2.3.4`.
2. If sniffing is not set up, Xray will receive a connection request for `1.2.3.4`, which cannot be used for routing based on domain rules.
3. When `enable` in `sniffing` is set to `true`, Xray will sniff the domain name, `abc.com`, from the traffic data when processing the traffic of this connection.
4. Xray will reset `1.2.3.4` to `abc.com`. Routing can then be based on domain rules.

Since the connection is now to `abc.com`, more can be done, such as routing based on domain rules, and even re-resolving the DNS.

When `enable` in `sniffing` is set to `true`, it can also sniff out bittorrent traffic and then configure the "protocol" item in routing rules to handle bittorrent traffic, such as intercepting bittorrent traffic on the server or forwarding bittorrent traffic to a VPS on the client side.

> `allocate`: [AllocateObject](#allocateobject)

Specifies the specific settings for port allocation when multiple ports are set up.

### SniffingObject

```json
{
  "enabled": true,
  "destOverride": ["http", "tls", "quic", "fakedns", "fakedns+others"],
  "metadataOnly": false,
  "domainsExcluded": [],
  "routeOnly": false
}
```

> `enabled`: true | false

Whether to enable traffic sniffing.

> `destOverride`: ["http" | "tls" | "quic" | "fakedns" | "fakedns+others" ]

When the traffic is of a specified type, reset the destination of the current connection to the target address included in the list.

`["fakedns+others"]` is equivalent to `["http", "tls", "quic", "fakedns"]`, and when the IP address is in the FakeIP range but no domain records are hit, `http`, `tls`, and `quic` will be used for matching. This option is only effective when `metadataOnly` is set to `false`.

> `metadataOnly`: true | false

When enabled, only use the connection's metadata to sniff the target address. In this case, sniffer other than `fakedns` (including `fakedns+others`) cannot be activated.

If metadata-only is disabled, the client must send data before the proxy server actually establishes the connection. This behavior is incompatible with protocols that require the server to initiate the first message, such as the SMTP protocol.

> `domainsExcluded`: [string] <Badge text="WIP" type="warning"/>

A list of domain names. If the traffic sniffing result matches a domain name in this list, the target address will **not** be reset.

::: warning
Currently, `domainsExcluded` does not support domain name matching in the routing sense. This option may change in the future and cross-version compatibility is not guaranteed.
:::

> `routeOnly`: true | false

Use the sniffed domain name for routing only, and keep the target address as the IP address. The default value is `false`.

This option requires `destOverride` to be enabled.

::: tip
When it is possible to ensure that **the proxied connection can obtain correct DNS resolution**, by using `routeOnly` and enabling `destOverride`, and setting the routing matching strategy `domainStrategy` to `AsIs`, it is possible to achieve domain and IP separation without DNS resolution throughout the process. The IP used when encountering an IP rule match is the original IP of the domain.
:::

### AllocateObject

```json
{
  "strategy": "always",
  "refresh": 5,
  "concurrency": 3
}
```

> `strategy`: "always" | "random"

The port allocation strategy.

- `"always"` means all specified ports in `port` will be allocated, and Xray will listen on these ports.
- `"random"` means ports will be randomly selected from the `port` range every `refresh` minutes, and `concurrency` ports will be listened on.

> `refresh`: number

The interval for refreshing randomly allocated ports in minutes. The minimum value is `2`, and it is recommended to set to `5`. This property is only effective when `strategy` is set to `"random"`.

> `concurrency`: number

The number of randomly allocated ports. The minimum value is `1`, and the maximum value is one-third of the `port` range. It is recommended to set to `3`.
