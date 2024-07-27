# SplitHTTP

<Badge text="v1.8.16+" type="warning"/>

Uses HTTP chunked-transfer encoding for download, and multiple HTTP requests for upload.

Can be deployed on CDNs that do not support WebSocket. However, **the CDN must
support HTTP chunked transfer encoding in a streaming fashion**, no response
buffering.

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

## HTTP versions

*Added in 1.8.21: HTTP/3 support*

SplitHTTP supports `http/1.1`, `h2` and `h3` ALPN values. If the value is not
set, `h2` (prior-knowledge) is assumed when TLS is enabled, and `http/1.1`
without TLS. If the value is set to `h3`, the client will attempt to connect as
HTTP/3, so UDP instead of TCP.

The server listens to HTTP/1.1 and h2 by default, but if `h3` ALPN is set on
the server, it will listen as HTTP/3.

Please note that nginx, Caddy and all CDN will almost certainly translate
client requests to a different HTTP version for forwarding, and so the server
may have to be configured with a different ALPN value than the client. If you
use a CDN, it is very unlikely that `h3` is a correct value for the server,
even if the client speaks `h3`.

## Troubleshooting

* If a connection hangs, the CDN may not support streaming downloads. You can
  use `curl -Nv https://example.com/abcdef` to initiate a download and see for
  yourself (see protocol details).

  If you do not see `200 OK` and a response body of `ok`, then the CDN is
  buffering the response body. Please ensure that all HTTP middleboxes along
  the path between client and server observe `X-Accel-Buffering: no` from their
  origin server. If your chain is `xray -> nginx -> CDN -> xray`, nginx may
  strip this response header and you have to re-add it.

## Browser Dialer

<Badge text="v1.8.17+" type="warning"/>

If uTLS is not enough, SplitHTTP's TLS can be handled by a browser using [Browser Dialer](../features/browser_dialer.md)

## Protocol details

See [#3412](https://github.com/XTLS/Xray-core/pull/3412) and
[#3462](https://github.com/XTLS/Xray-core/pull/3462) for extensive discussion
and revision of the protocol. Here is a summary, and the minimum needed to be
compatible:

1. `GET /<UUID>` opens the download. The server immediately responds with `200
   OK`, and immediately sends the string `ok`
   (arbitrary length, such as `ooook`) to force HTTP middleboxes into flushing
   headers.

   The server will send the `X-Accel-Buffering: no` and `Content-Type:
   text/event-stream` headers to force CDN into not buffering the response
   body. In HTTP/1.1 it may also send `Transfer-Encoding: chunked`.

2. Client uploads using `POST /<UUID>/<seq>`. `seq` starts at `0` and can be
   used like TCP seq number, and multiple "packets" may be sent concurrently.
   The server has to reassemble the "packets" live. The sequence number never
   resets for simplicity reasons.

   The client may open upload and download in any order, either one starts a
   session. However, eventually `GET` needs to be opened (current deadline is
   hardcoded to 30 seconds) If not, the session will be terminated.

3. The `GET` request is kept open until the tunneled connection has to be
   terminated. Either server or client can close.

   How this actually works depends on the HTTP version. For example, in
   HTTP/1.1 it is only possible to disrupt chunked-transfer by closing the TCP
   connection, in other versions the stream is closed or aborted.

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
