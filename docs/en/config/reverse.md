# Reverse Proxy

A reverse proxy can forward traffic from the server side to the client side, effectively performing reverse traffic forwarding.

::: tip
This reverse proxy is a general-purpose reverse proxy (it does not limit the proxy protocol type). The configuration is more complex. Do not confuse it with the VLESS simplified reverse configuration (refer to the relevant sections in the VLESS inbound/outbound documentation).
:::

Its underlying protocol is Mux.cool, but the direction is reversed: the server initiates requests to the client.

The general working principle of the reverse proxy is as follows:

- Assume there is a web server on Host A. This host does not have a public IP and cannot be accessed directly from the public internet. There is another Host B, which is accessible from the public internet. We need to use B as the entry point to forward traffic from B to A.
  - Configure Xray on Host B to receive external requests; this is called the `portal`.
  - Configure Xray on Host A to bridge the forwarding from B to the web server; this is called the `bridge`.

- `bridge`
  - The `bridge` actively establishes a connection to the `portal` to register a reverse tunnel. The destination address (domain) of this connection can be defined by the user.
  - After receiving public traffic forwarded by the `portal`, the `bridge` sends it intact to the web server on Host A. Naturally, this step requires configuration in the routing module.
  - Upon receiving a response, the `bridge` returns the response intact to the `portal`.

- `portal`
  - If the `portal` receives a request and the domain matches, it indicates response data sent by the `bridge`. This connection will be used to establish the reverse tunnel.
  - If the `portal` receives a request and the domain does *not* match, it indicates a connection from a public user. This connection data will be forwarded to the bridge.

- The `bridge` performs dynamic load balancing based on traffic volume.

::: tip
As mentioned above, the reverse proxy has [Mux](../development/protocols/muxcool.md) enabled by default. Please do not enable Mux again on the outbounds used by it.
:::

::: warning
The reverse proxy function is currently in the testing stage and may have some issues.
:::

## ReverseObject

`ReverseObject` corresponds to the `reverse` item in the configuration file.

```json
{
  "reverse": {
    "bridges": [
      {
        "tag": "bridge",
        "domain": "reverse-proxy.xray.internal"
      }
    ],
    "portals": [
      {
        "tag": "portal",
        "domain": "reverse-proxy.xray.internal"
      }
    ]
  }
}
```

> `bridges`: \[[BridgeObject](#bridgeobject)\]

An array, where each item represents a `bridge`. The configuration for each `bridge` is a [BridgeObject](#bridgeobject).

> `portals`: \[[PortalObject](#portalobject)\]

An array, where each item represents a `portal`. The configuration for each `portal` is a [PortalObject](#bridgeobject).

### BridgeObject

```json
{
  "tag": "bridge",
  "domain": "reverse-proxy.xray.internal"
}
```

> `tag`: string

All connections initiated by the `bridge` will carry this tag. It can be identified using `inboundTag` in the [Routing Configuration](./routing.md).

> `domain`: string

Specifies a domain name. Connections established by the `bridge` to the `portal` will be sent using this domain.
This domain is used solely for communication between the `bridge` and the `portal` and does not need to exist in reality.

### PortalObject

```json
{
  "tag": "portal",
  "domain": "reverse-proxy.xray.internal"
}
```

> `tag`: string

The identifier for the `portal`. Use `outboundTag` in the [Routing Configuration](./routing.md) to forward traffic to this `portal`.

> `domain`: string

A domain name. When the `portal` receives traffic, if the target domain of the traffic matches this domain, the `portal` considers the current connection to be a communication connection sent by the `bridge`. Other traffic will be treated as traffic that needs to be forwarded. The job of the `portal` is to identify these two types of connections and perform the corresponding forwarding.

::: tip
A single Xray instance can act as a `bridge`, a `portal`, or both simultaneously to suit different scenario requirements.
:::

## Complete Configuration Example

::: tip
During operation, it is recommended to enable the `bridge` first, and then enable the `portal`.
:::

### Bridge Configuration

The `bridge` usually requires two outbounds: one for connecting to the `portal` and another for sending actual traffic. This means you need to use routing to distinguish between the two types of traffic.

Reverse Proxy Configuration:

```json
"reverse": {
  "bridges": [
    {
      "tag": "bridge",
      "domain": "reverse-proxy.xray.internal"
    }
  ]
}
```

Outbounds:

```json
{
  // Forward to web server
  "tag": "out",
  "protocol": "freedom",
  "settings": {
    "redirect": "127.0.0.1:80"
  }
}
```

```json
{
  // Connect to portal
  "protocol": "vmess",
  "settings": {
    "vnext": [
      {
        "address": "IP Address of Portal",
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
      // Requests initiated by the bridge with the configured domain indicate an attempt
      // to establish a reverse tunnel to the portal.
      // Therefore, route to interconn (connect to portal).
      "inboundTag": ["bridge"],
      "domain": ["full:reverse-proxy.xray.internal"],
      "outboundTag": "interconn"
    },
    {
      // Traffic coming from the portal will also exit from the bridge, but without the domain above.
      // Therefore, route to out (forward to the web server).
      "inboundTag": ["bridge"],
      "outboundTag": "out"
    }
  ]
}
```

### Portal Configuration

The `portal` usually requires two inbounds: one to receive connections from the `bridge` and another to receive actual traffic. You also need to use routing to distinguish between the two types of traffic.

Reverse Proxy Configuration:

```json
"reverse": {
  "portals": [
    {
      "tag": "portal",
      "domain": "reverse-proxy.xray.internal" // Must be the same as the bridge configuration
    }
  ]
}
```

Inbounds:

```json
{
  // Directly receive requests from the public internet
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
  // Receive requests from the bridge attempting to establish a reverse tunnel
  "tag": "interconn",
  "port": 1024,
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
      // If the inbound is external, it indicates a request from the public internet.
      // Route to portal, which will eventually forward to the bridge.
      "inboundTag": ["external"],
      "outboundTag": "portal"
    },
    {
      // If the inbound is interconn, it indicates a request from the bridge to establish a reverse tunnel.
      // Route to portal, which will eventually forward to the corresponding public client.
      // Note: The request entering here will carry the domain configured earlier,
      // so the portal can distinguish between the two types of requests routed to it.
      "inboundTag": ["interconn"],
      "outboundTag": "portal"
    }
  ]
}
```
