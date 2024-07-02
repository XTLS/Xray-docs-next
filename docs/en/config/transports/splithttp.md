# SplitHTTP

Uses HTTP chunked-transfer encoding for download, and multiple HTTP requests for upload.

Can be deployed on CDNs that do not support WebSocket, but there is still one requirement:

**The CDN must support HTTP chunked transfer encoding in a streaming fashion**,
no response buffering. The transport will send the `X-Accel-Buffering: no`
response header, but only some CDNs respect this. If the connection hangs, most
likely this part does not work.

This transport serves the same purpose as Meek (support non-WS CDN). It has the
above streaming requirement to the CDN so that download can be much faster than
(v2fly) Meek, close to WebSocket performance. The upload is also optimized, but
still much more limited than WebSocket.

Like WebSocket transport, SplitHTTP parses the `X-Forwarded-For` header for logging.

## SplitHttpObject

The `SplitHttpObject` corresponds to the `splithttpSettings` section under transport configurations.

```json
{
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  },
  "maxUploadSize": 1000000,
  "maxConcurrentUploads": 10
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

> `maxUploadSize`

The largest possible chunk to upload. Defaults to 1 MB. This should be less
than the max request body size your CDN allows. Decrease this if the client
prints HTTP 413 errors. Increase this to improve upload bandwidth.

> `maxConcurrentUploads`

The number of concurrent uploads to run. Defaults to 10. Connections are reused
wherever possible, but you may want to lower this value if the connection is
unstable, or if the server is using too much memory.

The value on the client must not be higher than on the server. Otherwise,
connectivity issues will occur.

## Protocol details

See [#3412](https://github.com/XTLS/Xray-core/pull/3412) and
[#3462](https://github.com/XTLS/Xray-core/pull/3462) for extensive discussion
and revision of the protocol. Here is a summary, and the minimum needed to be
compatible:

1. `GET /<UUID>` opens the download. The server immediately responds
   with `200 OK` and `Transfer-Encoding: chunked`, and immediately sends a
   two-byte payload to force HTTP middleboxes into flushing headers.

2. Client uploads using `POST /<UUID>/<seq>`. `seq` starts at `0` and can be
   used like TCP seq number, and multiple "packets" may be sent concurrently.
   The server has to reassemble the "packets" live. The sequence number never
   resets for simplicity reasons.

   The client may open upload and download in any order, either one starts a
   session. However, eventually `GET` needs to be opened (current deadline is
   hardcoded to 30 seconds) If not, the session will be terminated.

3. The `GET` request is kept open until the tunneled connection has to be
   terminated. Either server or client can close. How this actually works
   depends on the HTTP version.

Recommendations:

* Do not assume any custom headers are transferred correctly by the CDN. This
  transport is built for CDN who do not support WebSocket, these CDN tend to
  not be very modern (or good).

* It should be assumed there is no streaming upload within a HTTP request, so
  the size of a packet should be chosen to optimize between latency,
  throughput, and any size limits imposed by the CDN (just like TCP, nagle's
  algorithm and MTU...)

* HTTP/1.1 and h2 should be supported by server and client, and it should be
  expected that the CDN will translate arbitrarily between versions. A HTTP/1.1
  server may indirectly end up talking to a h2 client, and vice versa.

  The SplitHTTP client in Xray does not support HTTP/1.1 over TLS. If TLS is
  enabled, h2 prior knowledge is assumed. The supported combinations are
  therefore HTTP/1.1 without TLS, and h2 with TLS.

  The SplitHTTP server in Xray supports all common combinations as expected:
  HTTP/1.1 with or without TLS, and h2 with TLS.
