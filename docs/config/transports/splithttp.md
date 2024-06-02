# SplitHTTP

::: tip
Help me I don't know chinese.
:::

Uses HTTP chunked-transfer encoding for download, and multiple HTTP requests for upload.

Can be deployed on CDNs that do not support WebSocket, but there are still some requirements:

- The CDN must support HTTP chunked transfer encoding in a streaming fashion,
  no response buffering. The transport will send the `X-Accel-Buffering: no`
  response header, but only some CDNs respect this.

  If the connection hangs, most likely this part does not work.

- The CDN must disable caching, or caching should include the query string in cache key.

Download performance should be similar to WebSocket, but upload is limited.

Like WebSocket transport, SplitHTTP parses the `X-Forwarded-For` header for logging.

## SplitHttpObject

The `SplitHttpObject` corresponds to the `splithttpSettings` section under transport configurations.

```json
{
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  }
}
```

> `path`: string

HTTP path used by the connection. Defaults to `"/"`.

> `host`: string

HTTP Host sent by the connection. Empty by default. If this value is empty on the server, the host header sent by clients will not be validated.

If the `Host` header has been defined on the server in any way, the server will validate if the `Host` header matches.

The current priority of the `Host` header sent by clients: `host` > `headers` > `address`

> `headers`: map \{string: string\}

Customized HTTP headers defined in key-value pairs. Defaults to empty.

## Known issues

ALPN negotiation is currently not correctly implemented. HTTPS connections
always assume HTTP/2 prior knowledge.
