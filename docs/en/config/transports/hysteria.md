# Hysteria

Xray implementation of the underlying QUIC transport for Hysteria2, typically used with hysteria [outbound](../outbounds/hysteria.md) and hysteria [inbound](../inbounds/hysteria.md), and is compatible with the official implementation in this case.

## HysteriaObject

`HysteriaObject` corresponds to the `hysteriaSettings` item in the transport configuration.

```json
{
  "version": 2,
  "auth": "password",
  "udpIdleTimeout": 60,
  "masquerade": {
    "type": "",

    "dir": "",

    "url": "",
    "rewriteHost": false,
    "insecure": false,

    "content": "",
    "headers": {
      "key": "value"
    },
    "statusCode": 0
  }
}
```

> `version`: number

Hysteria version, must be 2.

> `auth`: string

Hysteria authentication password. Must be consistent between the server and the client.

When used with `hysteria inbound`, it will be overridden by `clients` (if it exists).

> `udpIdleTimeout`: number

Unit: seconds, default 60.

Idle wait time for a single `quic native udp` connection. If this time is too long, it may not be strictly adhered to and may be terminated by the policy first.

> `masquerade`: [MasqObject](#MasqObject)

HTTP/3 page masquerading.

### MasqObject

```json
{
  "type": "",

  "dir": "",

  "url": "",
  "rewriteHost": false,
  "insecure": false,

  "content": "",
  "headers": {
    "key": "value"
  },
  "statusCode": 0
}
```

> `type`: "file" | "proxy" | "string"

If left blank, the default 404 page will be displayed.

> `dir`: string

Configuration items when type is file.

> `url`: string

Configuration items when type is proxy.

> `rewriteHost`: false | true

Configuration items when type is proxy.

> `insecure`: false | true

Configuration items when type is proxy.

> `content`: string

Configuration items when type is string.

> `headers`: map{ string, string }

Configuration items when type is string.

> `statusCode`: int

Configuration items when type is string.
