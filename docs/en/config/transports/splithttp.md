# XHTTP (SplitHTTP)

<Badge text="v1.8.16+" type="warning"/>

Uses HTTP chunked-transfer encoding for download, and multiple HTTP requests for upload.

Can be deployed on CDNs that do not support WebSocket. However, **the CDN must
support HTTP chunked transfer encoding in a streaming fashion**, no response
buffering.

This transport serves the same purpose as Meek (support non-WS CDN). It has the
above streaming requirement to the CDN so that download can be much faster than
(v2fly) Meek, close to WebSocket performance. The upload is also optimized, but
still much more limited than WebSocket.

Like WebSocket transport, XHTTP parses the `X-Forwarded-For` header for logging.

## XHttpObject

The `XHttpObject` corresponds to the `xhttpSettings` section under transport configurations.

```json
{
  "path": "/",
  "host": "xray.com",
  "headers": {
    "key": "value"
  },
  "scMaxEachPostBytes": 1000000,
  "scMaxConcurrentPosts": 100,
  "scMinPostsIntervalMs": 30,
  "noSSEHeader": false,
  "xPaddingBytes": "100-1000",
  "xmux": {
    "maxConcurrency": 0,
    "maxConnections": 0,
    "cMaxReuseTimes": 0,
    "cMaxLifetimeMs": 0
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

> `scMaxEachPostBytes`: int | string

The maximum size of upload chunks, in bytes. Defaults to 1MB.

The size set by the client must be lower than this value, otherwise when the
POST request is sent larger than the value set by the server, the request will
be rejected.

This value should be smaller than the maximum request body allowed by the CDN
or other HTTP reverse proxy, otherwise an HTTP 413 error will be thrown.

It can also be in the form of a string `"1000000-2000000"`. The core will
randomly select a value within the range each time to reduce fingerprints.

> `scMaxConcurrentPosts`: int | string

The number of concurrent uploads to run. Defaults to 100 on the client, and
200 on the server.

The value on the client must not be higher than on the server. Otherwise,
connectivity issues will occur. In practice, the upload concurrency is also
limited by `minUploadIntervalMs`, so the actual concurrency on the client side
will be much lower.

It can also be in the form of a string `"100-200"`, and the core will randomly
select a value within the range each time to reduce fingerprints.

> `scMinPostsIntervalMs`: int | string

(Client-only) How much time to pass between upload requests at a minimum.
Defaults to `30` (milliseconds).

It can also be in the form of a string `"10-50"`, and the core will randomly
select a value within the range each time to reduce fingerprints.

> `noSSEHeader`

(Server-only) Do not send the `Content-Type: text/event-stream` response
header. Defaults to false (the header will be sent)

> `xPaddingBytes`

*Added in 1.8.24*

Control the padding of requests and responses. Defaults to `"100-1000"`,
meaning that each GET and POST will be padded with a random amount of bytes in
that range.

A value of `-1` disables padding entirely.

You can lower this to save bandwidth or increase it to improve censorship
resistance. Too much padding may cause the CDN to reject traffic.

> `xmux`: [XmuxObject](#xmuxobject)

## XmuxObject

<Badge text="v24.9.19+" type="warning"/>

Allows users to control the multiplexing behavior in h2 and h3. If not set, the default behavior is to multiplex all requests to one TCP/QUIC connection.

```json
{
  "maxConcurrency": 0,
  "maxConnections": 0,
  "cMaxReuseTimes": 0,
  "cMaxLifetimeMs": 0
}
```

Since the default is unlimited reuse, `xmux` actually limits this. It's not recommended to enable `mux.cool` at the same time.

Terminology: *Streams* will reuse physical connections, as in, one connection can hold many streams. In other places, streams are called sub-connections, they are the same thing.

> `maxConcurrency`: int | string

Default 0 = infinite. The maximum number of streams reused in each connection. After the number of streams in the connection reaches this value, the core will create more connections to accommodate more streams, similar to the concurrency of mux.cool. Mutually exclusive with `maxConnections`.

> `maxConnections`: int | string

Default 0 = infinite. The maximum number of connections to open. Every stream will open a new connection until this value is reached, only then connections will be reused. Mutually exclusive with `maxConcurrency`.

> `cMaxReuseTimes`: int | string

Default 0 = infinite. A connection can be reused at most several times. When this value is reached, the core will not allocate streams to the connection. It will be disconnected after the last internal stream is closed.

> `cMaxLifetimeMs`: int | string

Default 0 = infinite. How long can a connection "survive" at most? When the connection is open for more than this value, the core will not redistribute streams to the connection, and it will be disconnected after the last internal stream is closed.

## HTTP versions

*Added in 1.8.21: HTTP/3 support*

XHTTP supports `http/1.1`, `h2` and `h3` ALPN values. If the value is not
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

If uTLS is not enough, XHTTP's TLS can be handled by a browser using [Browser Dialer](../features/browser_dialer.md)

## Protocol details

See [#3412](https://github.com/XTLS/Xray-core/pull/3412) and
[#3462](https://github.com/XTLS/Xray-core/pull/3462) for extensive discussion
and revision of the protocol. Here is a summary, and the minimum needed to be
compatible:

1. `GET /<UUID>` opens the download. The server immediately responds with `200
   OK`, and immediately sends the string `ok`
   (arbitrary length, such as `ooook`) to force HTTP middleboxes into flushing
   headers.

   The server will send these headers:

    * `X-Accel-Buffering: no` to prevent response buffering in nginx and CDN
    * `Content-Type: text/event-stream` to prevent response buffering in some
      CDN, can be disabled with `noSSEHeader`
    * `Transfer-Encoding: chunked` in HTTP/1.1 only
    * `Cache-Control: no-store` to disable any potential response caching.

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
