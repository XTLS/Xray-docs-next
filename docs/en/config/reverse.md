# Reverse Proxy

A reverse proxy forwards traffic from a server to a client, which is known as reverse traffic forwarding.

Here's how a reverse proxy generally works:

- Suppose there is a web server in host A, which does not have a public IP address and cannot be accessed directly on the Internet. There is another host B that can be accessed via the public network. Now we need to use B as the entry point to forward traffic from B to A.
- Configure Xray in host A as a `bridge`, and also configure Xray in B as a `portal`.
- `Bridge` will actively establish a connection to `portal`, and the destination address of this connection can be set by itself. `Portal` will receive two types of connections: one is the connection sent by `bridge`, and the other is the connection sent by public network users. `Portal` will automatically merge the two types of connections. So `bridge` can receive public network traffic.
- After receiving the public network traffic, `bridge` will forward it unchanged to the web server in host A. Of course, this step requires the cooperation of routing.
- `Bridge` will dynamically load balance according to the size of the traffic.

::: tip
Reverse proxy has Mux enabled by default, so please do not enable Mux again on the outbound it uses.
:::

::: warning
The reverse proxy function is still in the testing phase and may have some issues.
:::

## ReverseObject

`ReverseObject` corresponds to the `reverse` field in the configuration file.

```json
{
  "reverse": {
    "bridges": [
      {
        "tag": "bridge",
        "domain": "test.xray.com"
      }
    ],
    "portals": [
      {
        "tag": "portal",
        "domain": "test.xray.com"
      }
    ]
  }
}
```

> `bridges`: \[[BridgeObject](#bridgeobject)\]

An array in which each item represents a `bridge`. The configuration of each `bridge` is a [BridgeObject](#bridgeobject).

> `portals`: [[PortalObject](#portalobject)]

An array in which each item represents a `portal`. The configuration of each `portal` is a [PortalObject](#bridgeobject).

### BridgeObject

```json
{
  "tag": "bridge",
  "domain": "test.xray.com"
}
```

> `tag`: string

All connections initiated by `bridge` will have this tag. It can be used to identify the connections in [routing configuration](./routing.md).

> `domain`: string

Specifies a domain name that will be used by `bridge` to send connections to `portal`. This domain name is only used for communication between `bridge` and `portal`, and does not need to actually exist.

### PortalObject

```json
{
  "tag": "portal",
  "domain": "test.xray.com"
}
```

> `tag`: string

The identifier for the `portal`. Use `outboundTag` in [routing configuration](./routing.md) to forward traffic to this `portal`.

> `domain`: string

A domain name. When the `portal` receives traffic, if the destination domain of the traffic is this domain, the `portal` assumes that the current connection is a communication connection sent by the `bridge`. Other traffic will be considered as traffic that needs to be forwarded. The work of the `portal` is to identify and splice these two types of connections.

::: tip
An Xray can act as a `bridge`, a `portal`, or both at the same time, depending on the needs of different scenarios.
:::

## Complete Configuration Example

:::
tip During operation, it is recommended to enable `bridge` first, then enable `portal`.
:::

### Bridge Configuration

A `bridge` usually requires two outbounds, one for connecting to the `portal`, and the other for sending actual traffic. That is, you need to use routing to distinguish between the two types of traffic.

Reverse proxy configuration:

```json
{
  "bridges": [
    {
      "tag": "bridge",
      "domain": "test.xray.com"
    }
  ]
}
```

outbound:

```json
{
  "tag": "out",
  "protocol": "freedom",
  "settings": {
    "redirect": "127.0.0.1:80" // Forward all traffic to web server
  }
}
```

```json
{
  "protocol": "vmess",
  "settings": {
    "vnext": [
      {
        "address": "portal's IP address",
        "port": 1024,
        "users": [
          {
            "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
          }
        ]
      }
    ]
  },
  "tag": "interconn"
}
```

Routing Configuration:

```json
{
  "rules": [
    {
      "type": "field",
      "inboundTag": ["bridge"],
      "domain": ["full:test.xray.com"],
      "outboundTag": "interconn"
    },
    {
      "type": "field",
      "inboundTag": ["bridge"],
      "outboundTag": "out"
    }
  ]
}
```

### Portal Configuration

`portal` usually requires two inbounds, one for receiving connections from `bridge`, and the other for receiving actual traffic. You also need to distinguish between these two types of traffic using routing.

Reverse proxy configuration:

```json
{
  "portals": [
    {
      "tag": "portal",
      "domain": "test.xray.com" // Must be the same as the bridge's configuration
    }
  ]
}
```

inbound:

```json
{
  "tag": "external",
  "port": 80,
  "protocol": "dokodemo-door",
  "settings": {
    "address": "127.0.0.1",
    "port": 80,
    "network": "tcp"
  }
}
```

```json
{
  "port": 1024,
  "tag": "interconn",
  "protocol": "vmess",
  "settings": {
    "clients": [
      {
        "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
      }
    ]
  }
}
```

Routing Configuration:

```json
{
  "rules": [
    {
      "type": "field",
      "inboundTag": ["external"],
      "outboundTag": "portal"
    },
    {
      "type": "field",
      "inboundTag": ["interconn"],
      "outboundTag": "portal"
    }
  ]
}
```
