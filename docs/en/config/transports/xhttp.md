# XHTTP

XHTTP is a transport that carries proxy protocol data inside ordinary HTTP requests and responses: from the outside it looks like `GET` and `POST` requests to a web server, with Chrome browser headers by default.

It works over HTTP/1.1, HTTP/2 and HTTP/3, supports TLS and REALITY, and can pass through CDNs and reverse proxies. Upload (data from client to server) and download (data from server to client) can travel in different HTTP requests and even over different routes. The transfer method is set by the mode:

- `packet-up` — download goes in one long-lived `GET`, upload in a series of short `POST` requests with packet numbers;
- `stream-up` — download goes in one long-lived `GET`, upload in one long-lived streaming `POST`;
- `stream-one` — both directions go in a single `POST` and its response.

For more on how it works, see [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113).

::: tip
The client picks the HTTP version in advance from `security` and `alpn` in `tlsSettings`; the result of ALPN negotiation is not checked:

- TLS without `alpn` — HTTP/2. The same applies to `["h2"]` and to any list with more than one value, such as `["h2", "http/1.1"]` or `["h3", "h2"]`;
- TLS with `"alpn": ["h3"]` — HTTP/3 (QUIC). A server whose `alpn` is exactly `["h3"]` listens on UDP only, so accepting HTTP/2 and HTTP/3 at the same time requires two inbounds on the same port. QUIC parameters are set in [quicParams](./finalmask.md#quicparams);
- TLS with `"alpn": ["http/1.1"]` — HTTP/1.1, but only if the server also advertises only `http/1.1` or the client sets `"fingerprint": "unsafe"`: the default uTLS fingerprint always offers `h2` and `http/1.1` in the ClientHello, the server picks `h2`, and the client speaks HTTP/1.1;
- REALITY — always HTTP/2;
- no security — HTTP/1.1; a server without security accepts HTTP/1.1 and h2c on the same port.

:::

::: tip
If you use a reverse proxy such as Caddy or Nginx, or a CDN, keep the following in mind:

- The Xray inbound behind the proxy is configured without `security` and listens on a local address or a unix socket; the proxy terminates TLS.
- `stream-up` and `stream-one` require the proxy to forward requests to Xray over HTTP/2 without TLS (h2c): `grpc_pass` in Nginx, `reverse_proxy h2c://…` in Caddy. With `proxy_pass` and `reverse_proxy http://…` (HTTP/1.1) only `packet-up` works.
- The download response must not be buffered or cached. The server marks it with the headers `X-Accel-Buffering: no`, `Cache-Control: no-store` and `Content-Type: text/event-stream`.
- The request body size limit must be at least the client's `scMaxEachPostBytes`, and the header size limit must fit the padding (up to 1000 characters by default).
- Route requests by `path` prefix without stripping the rest of the path, and keep the `Referer` header: by default it carries the padding.
- Upload and download of one session must reach the same inbound of the same Xray process.
- The client IP address can be passed in the `X-Forwarded-For` header together with [`trustedXForwardedFor`](./sockopt.md#sockoptobject), or via PROXY protocol.
- Cloudflare closes the connection if the origin sends no data for about 100 seconds, so do not disable [`scStreamUpServerSecs`](#xhttpobject) behind a CDN.

:::

::: warning

- Do not enable Mux.Cool (`mux` on the outbound) together with XHTTP: the XHTTP server allows only UDP (XUDP) inside Mux, and any TCP connection tears down the whole Mux connection. UDP over VLESS is already carried by XUDP anyway.
- `flow: "xtls-rprx-vision"` over XHTTP works only together with VLESS [`encryption`](../outbounds/vless.md#outboundconfigurationobject).
- Unknown keys in `xhttpSettings` are ignored without any error or warning: a typo in a parameter name simply disables it.

:::

## XHTTPObject

`XHTTPObject` corresponds to the `xhttpSettings` field in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // outbound example, the same applies to inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "method": "xhttp",
        // [!field focus]
        "xhttpSettings": {
          // Basic
          "host": "",
          "path": "/",
          "mode": "auto",
          "headers": {},
          "extra": {}, // if the key is present (even {}), all fields except host, path and mode are taken only from it
          // Padding
          "xPaddingBytes": "100-1000",
          "xPaddingObfsMode": false,
          "xPaddingPlacement": "queryInHeader",
          "xPaddingKey": "x_padding",
          "xPaddingHeader": "X-Padding",
          "xPaddingMethod": "repeat-x",
          // Upload data
          "uplinkHTTPMethod": "POST",
          "uplinkDataPlacement": "auto",
          "uplinkDataKey": "X-Data",
          "uplinkChunkSize": 0,
          // sessionID and seq
          "sessionIDPlacement": "path",
          "sessionIDKey": "",
          "sessionIDTable": "",
          "sessionIDLength": 0,
          "seqPlacement": "path",
          "seqKey": "",
          // Camouflage headers
          "noGRPCHeader": false,
          "noSSEHeader": false,
          // Limits and timings
          "scMaxEachPostBytes": 1000000,
          "scMinPostsIntervalMs": 30,
          "scMaxBufferedPosts": 30,
          "scStreamUpServerSecs": "20-80",
          "serverMaxHeaderBytes": 8192,
          "h2Params": {},
          // Connections and download route
          "xmux": {
            "maxConcurrency": 0,
            "maxConnections": 3,
            "cMaxReuseTimes": 0,
            "hMaxRequestTimes": "600-900",
            "hMaxReusableSecs": "1800-3000",
            "hKeepAlivePeriod": 0
          },
          "downloadSettings": {}
        }
      }
    }
  ]
}
```

The same object is set on both the client and the server. Each field is labeled with who reads it and where it applies:

- **Side** — `client` or `server`: on the other side the field has no effect; `both sides (must match)` — the values on the client and server must be identical; `both sides (different roles)` — each side uses the field in its own way; other notes in parentheses say how the values on the two sides must relate.
- **Modes** — the `mode` values in which the field applies; in other modes it is ignored.

Default values are the same on both sides. Set at least an empty object `"xhttpSettings": {}`: without it, string defaults are not filled in and the default [XMUX](#xmuxobject) limits do not apply.

Fields that accept a range have the type [Int32Range](../../development/intro/guide.md#int32range): a number (`30`), a string with a number (`"30"`), or a string of the form `"from-to"` (`"100-1000"`). The random value is picked from the range excluding the upper bound: `"100-1000"` yields values from 100 to 999. `0` or an absent field means the default value, so zero cannot be set explicitly. Negative values are allowed only where stated.

In the request examples, `…` stands for omitted headers, `XXXX…` for padding, and `<sessionID>` for the session identifier. Go sends header names in canonical form (`x-custom` → `X-Custom`, `MyHeader` → `Myheader`; lowercase in HTTP/2 and HTTP/3), while cookie and query parameter names are sent as written.

> `host`: string

**Side:** both sides (different roles) · **Modes:** all

The host for the `Host` header (the `:authority` pseudo-header in HTTP/2 and HTTP/3). Client priority: `host` > `serverName` > `address`. This parameter does not affect SNI. The name also ends up in the default padding URL:

```http
GET /yourpath/<sessionID> HTTP/1.1
Host: example.com
Referer: https://example.com/yourpath/?x_padding=XXXX…
```

A server with `host` set accepts only requests with the same `Host` (case-insensitive, port ignored) and responds `404` to the rest. If the field is empty, there is no check. Behind a reverse proxy, `host` is usually not set on the server.

> `path`: string

**Side:** both sides (must match) · **Modes:** all

The path of HTTP requests; the default is `"/"`. The server accepts a request if its path starts with `path`, and responds `404` to the rest.

By default, `sessionID` and the packet number `seq` are appended as segments after `path`: `/yourpath/<sessionID>/<seq>`. The client appends the query part (`"/yourpath?ed=2048"`) to every request, but not to the URL in `Referer`; the server does not check it:

```http
GET /yourpath/<sessionID>?ed=2048 HTTP/1.1
POST /yourpath/<sessionID>/0?ed=2048 HTTP/1.1
…
Referer: https://example.com/yourpath/?x_padding=XXXX…
```

> `mode`: "auto" | "packet-up" | "stream-up" | "stream-one"

**Side:** both sides (different roles) · **Modes:** all

The transfer mode: the client chooses it, the server restricts which ones are allowed. The default is `"auto"`.

- `"auto"` — not visible on the wire; the client chooses the mode on every connection: `packet-up`; with REALITY — `stream-one`; with REALITY and `downloadSettings` set — `stream-up`. The HTTP version does not affect the choice; only REALITY on the main connection counts. A server with `"auto"` accepts all modes.
- `"packet-up"` — download in one long-lived `GET /yourpath/<sessionID>`, upload in a series of `POST /yourpath/<sessionID>/0`, `…/1`, `…/2` with `Content-Length`; the server reassembles packets by number even if they arrive out of order. Best compatibility with CDNs and proxies.
- `"stream-up"` — download in one long-lived `GET /yourpath/<sessionID>`, upload in one long-lived `POST /yourpath/<sessionID>` without a number, whose body is streamed (`Transfer-Encoding: chunked`, `Content-Type: application/grpc`).
- `"stream-one"` — a single `POST /yourpath/` without `sessionID`, with the same `Transfer-Encoding: chunked` and `Content-Type: application/grpc`: upload goes in the request body, download in the response body. Incompatible with `downloadSettings`.

A specific value on the server acts as a filter: `"packet-up"` accepts only `packet-up`, `"stream-up"` accepts `stream-up` and `stream-one`, `"stream-one"` accepts only `stream-one`. Other upload requests get `400`, but the download `GET` is accepted with any `mode`, so a mode mismatch usually looks like a hang. **It is recommended to leave `"auto"` on the server**: a client `"auto"` without REALITY means `packet-up`, and a server with `"stream-up"` or `"stream-one"` will not accept such a client.

> `headers`: map \{string: string\}

**Side:** client · **Modes:** all

Additional HTTP request headers. By default the client sends the Chrome browser header set (`User-Agent`, `Accept`, `Sec-CH-UA`, `Sec-Fetch-*` and others), and the headers set here are added to it.

The `User-Agent` value selects the camouflage profile: `chrome`, `firefox`, `safari`, `edge`, `curl`, `golang`. Any other value is sent as is and disables browser camouflage. Xray computes the version numbers in the profiles from the current date.

::: details What it looks like

```http
# chrome (default): full browser header set
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
Sec-CH-UA: "Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"
# firefox: no Sec-CH-UA*
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:154.0) Gecko/20100101 Firefox/154.0
# safari: no Sec-CH-UA* and no DNT
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Safari/605.1.15
# edge: Chrome header set
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36Edg/150.0.0.0
Sec-CH-UA: "Not;A=Brand";v="8", "Chromium";v="150", "Microsoft Edge";v="150"
# curl, golang and any other value: User-Agent only, no Accept, Sec-Fetch-* or other browser headers
User-Agent: curl/8.21.0
User-Agent: Go-http-client/1.1
User-Agent: MyAgent/1.0
```

:::

Must not contain `Host`. Headers that Xray writes itself (`Referer`, `X-Padding`, the `Content-Type` of streaming upload, headers named by `sessionIDKey`, `seqKey` and `uplinkDataKey`) overwrite the ones set here; a `Cookie` value is appended to Xray's cookies.

> `extra`: object

**Side:** both sides (configuration level) · **Modes:** all

All other XHTTP parameters in one object. Needed to pass the full configuration in a share link or in clients that expose only the `host`, `path`, `mode` and `extra` fields. Not visible on the wire: requests are the same as if the fields were set at the top level.

```json
{
  "path": "/yourpath",
  "mode": "packet-up",
  "extra": { "xPaddingBytes": "200-800", "scMaxEachPostBytes": 500000 }
}
```

::: warning
`extra` replaces rather than supplements. If the `extra` key is present (even as `{}`), only `host`, `path` and `mode` are taken from the top level, and all other fields, including `xmux` and `downloadSettings`, are silently dropped. `host`, `path` and `mode` inside `extra` have no effect.
:::

> `xPaddingBytes`: number | string

**Side:** both sides (client within server) · **Modes:** all

Padding length. Padding is a random-length string that the client adds to every request and the server to every response to hide the exact sizes of HTTP messages. Padding does not encrypt anything. Type: [Int32Range](../../development/intro/guide.md#int32range); the default is `"100-1000"`.

Padding cannot be disabled: `0` means the default value, and a range with a zero or negative bound causes the error `xPaddingBytes cannot be disabled`.

The server checks the padding length of every request against its own range, inclusive, and responds `400` on a mismatch. **The client range must lie within the server range.** Long padding enlarges headers, so take `serverMaxHeaderBytes` and proxy limits into account.

> `xPaddingObfsMode`: true | false

**Side:** both sides (must match) · **Modes:** all

Enables configurable padding placement. The default is `false`.

- `false` — request `Referer: https://example.com/yourpath/?x_padding=XXXX…`, response `X-Padding: XXXX…`. The client uses none of `xPaddingPlacement`, `xPaddingKey`, `xPaddingHeader` or `xPaddingMethod`: names are fixed and padding is always made of `X` characters. The server looks for the `x_padding` parameter in `Referer`, or in the request query if there is no `Referer`, and of the padding keys it uses only `xPaddingMethod` — to count the length.
- `true` — the location, name and form of padding are set by `xPaddingPlacement`, `xPaddingKey`, `xPaddingHeader` and `xPaddingMethod`; by default, request `X-Padding: https://example.com/yourpath/?x_padding=XXXX…`, response `X-Padding: ?x_padding=XXXX…`.

> `xPaddingPlacement`: "queryInHeader" | "header" | "cookie" | "query"

**Side:** both sides (must match) · **Modes:** all

Padding location. The default is `"queryInHeader"`. Used only with `xPaddingObfsMode: true`.

- `"queryInHeader"` — the `xPaddingHeader` header, whose value is a URL with the `xPaddingKey` parameter: request `X-Padding: https://example.com/yourpath/?x_padding=XXXX…`, response `X-Padding: ?x_padding=XXXX…`. Both keys are used.
- `"header"` — the entire value of the `xPaddingHeader` header: `X-Padding: XXXX…` in both request and response. Only `xPaddingHeader` is used.
- `"cookie"` — request `Cookie: x_padding=XXXX…`, response `Set-Cookie: x_padding=XXXX…; Path=/` and `Access-Control-Allow-Credentials: true`. Only `xPaddingKey` is used.
- `"query"` — a request parameter `GET /yourpath/<sessionID>?x_padding=XXXX…`; the response has no padding. Only `xPaddingKey` is used.

The server looks for padding regardless of its own `xPaddingPlacement`: first the `xPaddingKey` cookie, then the `xPaddingHeader` header, then the `xPaddingKey` query parameter. If the server has `"header"`, the header value is taken as a whole; otherwise the `xPaddingKey` parameter is extracted from it. That is why a client with `"header"` works only with a server with `"header"`. The server places response padding according to its own value. **It is recommended to set the same value on both sides.**

> `xPaddingKey`: string

**Side:** both sides (must match) · **Modes:** all

The name of the cookie or query parameter carrying the padding. The default is `"x_padding"`; case is preserved and matters. For example, `"pad"` gives `X-Padding: https://example.com/yourpath/?pad=XXXX…`, `Cookie: pad=XXXX…` or `GET /yourpath/<sessionID>?pad=XXXX…`.

Used with `xPaddingObfsMode: true` and `xPaddingPlacement` set to `"queryInHeader"`, `"cookie"` or `"query"`. Not used at all with `"header"`, nor with `xPaddingObfsMode: false`: the parameter name in `Referer` is always `x_padding`.

> `xPaddingHeader`: string

**Side:** both sides (must match) · **Modes:** all

The name of the header carrying the padding. The default is `"X-Padding"`; case does not matter. For example, `"X-Pad"` gives `X-Pad: XXXX…` with `"header"` and `X-Pad: https://example.com/yourpath/?x_padding=XXXX…` with `"queryInHeader"`.

Used with `xPaddingObfsMode: true` and `xPaddingPlacement` set to `"header"` or `"queryInHeader"`. With `"cookie"` and `"query"` the client does not use it, but a server that finds no cookie still checks this header, so the name must not clash with other request headers. Not used with `xPaddingObfsMode: false`: request padding goes in `Referer`, response padding in `X-Padding`. Disallowed names are listed below in the "Name collisions" warning.

> `xPaddingMethod`: "repeat-x" | "tokenish"

**Side:** both sides (must match) · **Modes:** all

The form of the padding and how its length is counted. The default is `"repeat-x"`.

- `"repeat-x"` — a string of `X` characters: `X-Padding: XXXXXXXXXXXXXXXX…`; the length is counted in characters.
- `"tokenish"` — a random string of letters and digits: `X-Padding: 88h5gtMuRLAitDiF…`; the length is counted after HPACK header compression (to within ±2 bytes), so in characters it is about a quarter longer.

The client applies the method only with `xPaddingObfsMode: true`, while the server always applies it to check the length. A client with `"tokenish"` and a server with `"repeat-x"` using the same range get `400` either occasionally or always, so set `"tokenish"` on both sides or raise the upper bound of the server's `xPaddingBytes` by a factor of at least 1.26.

> `uplinkHTTPMethod`: string

**Side:** client · **Modes:** all (`GET` — packet-up only)

The HTTP method of upload requests. The default is `"POST"`. Download always uses `GET`. The value is converted to uppercase (`"put"` → `PUT`); the server neither configures nor checks the method.

- `"POST"` — `POST /yourpath/<sessionID>/0`; works in all modes.
- `"PUT"`, `"PATCH"`, `"DELETE"` — `PUT /yourpath/<sessionID>/0` and so on, with the same body as `POST`; work in all modes.
- `"OPTIONS"` — `OPTIONS /yourpath/<sessionID>/0` with a body; works in all modes but requires server version v26.10.31 or later. The server tells it apart from a browser CORS preflight request by the `Access-Control-Request-Method` header: a preflight contains it, and the server responds `200` to it without treating it as upload; Xray upload requests do not contain this header. An older server treats any `OPTIONS` as a preflight, and the connection does not work.
- `"GET"` — only with an explicit `mode: "packet-up"`; otherwise the configuration fails to load (`uplinkHTTPMethod can be GET only in packet-up mode`). Packets differ from download only by the number in the path: `GET /yourpath/<sessionID>` and `GET /yourpath/<sessionID>/0` with a body.
- Any other name, such as `"FOO"`, is sent as is (`FOO /yourpath/<sessionID>/0`) and works in all modes: the server treats any request with a method other than `GET` as upload, and a `GET` only if it contains a packet number. A name with a space or other invalid characters is not checked at load time, but no connection is ever established.

Do not use `HEAD`: its response has no body, so `stream-one` does not work with it, and `stream-up` breaks over HTTP/1.1 and HTTP/2; in `packet-up` it works only over a direct connection, without CDNs and proxies.

CDNs and reverse proxies may reject non-standard methods, `OPTIONS` and `DELETE` with a body, and `GET` with a body. Through intermediaries, `POST` is the most reliable, followed by `PUT` and `PATCH`.

> `uplinkDataPlacement`: "auto" | "body" | "header" | "cookie"

**Side:** both sides (must match) · **Modes:** packet-up

Upload data location. The default is `"auto"`. In headers and cookies, the data `hello` is sent as base64url: `aGVsbG8`.

- `"auto"` — the client sends data in the body, as with `"body"`. The server looks for it in `<uplinkDataKey>-N` headers, then in `<uplinkDataKey>_N` cookies, then in the body, so it also accepts a client with `"header"`.
- `"body"` — the request body: `Content-Length: 5` and `hello`.
- `"header"` — headers `X-Data-0: aGVsbG8`, `X-Data-1: …`; the body is empty (`Content-Length: 0`).
- `"cookie"` — `Cookie: x_data_0=aGVsbG8; x_data_1=…`; the body is empty; the server responds with `Access-Control-Allow-Credentials: true`.

`"header"` and `"cookie"` require an explicit `mode: "packet-up"` on both sides; otherwise the configuration fails to load. In `stream-up` and `stream-one` data always goes in the body. `uplinkDataKey` and `uplinkChunkSize` are used only with `"header"` and `"cookie"`; a server with `"auto"` uses `uplinkDataKey` for lookup.

::: warning
A placement mismatch causes no error: the server accepts an empty packet, responds `200`, and the connection hangs. A client with `"cookie"` works with an `"auto"` server only if `uplinkDataKey` is the same on both sides.

With `"header"` and `"cookie"`, the whole packet — up to `scMaxEachPostBytes` (1 MB by default) — goes into headers, which exceeds `serverMaxHeaderBytes` and proxy limits. Lower `scMaxEachPostBytes`, for example to `4000`, or raise the limits.
:::

> `uplinkDataKey`: string

**Side:** both sides (must match) · **Modes:** packet-up

The prefix of the names of headers or cookies carrying upload data; a chunk number is appended to it: `-0`, `-1`… for headers and `_0`, `_1`… for cookies. The default is `"X-Data"` with `"auto"` and `"header"`, and `"x_data"` with `"cookie"`. For example, `"d"` gives `D-0: aGVsbG8` or `Cookie: d_0=aGVsbG8`, and `"UpData"` gives headers `Updata-0`, `Updata-1`…

The client uses the key only with `uplinkDataPlacement` set to `"header"` or `"cookie"`; the server also uses it with `"auto"`. Not used with `"body"`. For cookies, case matters: with mismatched case the data is silently lost.

> `uplinkChunkSize`: number | string

**Side:** client · **Modes:** packet-up

The maximum length of a single header or cookie carrying data, in base64url characters. The packet is split into chunks, each with a length picked at random from the range ([Int32Range](../../development/intro/guide.md#int32range)). The default is `"3000-4000"` with `"header"` and `"2048-3072"` with `"cookie"`; values below `64` are raised to `64`. Used only with `uplinkDataPlacement` set to `"header"` or `"cookie"`. The size of the whole packet is set by `scMaxEachPostBytes`.

```http
# "uplinkChunkSize": 64, a 200-byte packet = 267 base64url characters
X-Data-0: YWJjZGVmZ2hpamFiY2RlZmdoaWphYmNkZWZnaGlqYWJjZGVmZ2hpamFiY2RlZmdo
…
X-Data-4: Y2RlZmdoaWo
```

With `"cookie"`, the chunks go in a single header: `Cookie: x_data_0=YWJj…; x_data_1=aWph…; …; x_data_4=Y2RlZmdoaWo`.

In `packet-up` and `stream-up` modes, the client adds the session identifier `sessionID` to every request, and in `packet-up` upload requests also the packet number `seq`. The server determines the request type by the presence of these values, so their placements and names must match on the server and the client. A mismatch causes no configuration error: the connection breaks or hangs.

> `sessionIDPlacement`: "path" | "query" | "header" | "cookie"

**Side:** both sides (must match) · **Modes:** packet-up, stream-up

Location of `sessionID` in the request. The default is `"path"`. `stream-one` has no `sessionID`.

- `"path"` — a path segment `GET /yourpath/<sessionID>`; `sessionIDKey` is not used.
- `"query"` — a parameter `GET /yourpath/?x_session=<sessionID>`.
- `"header"` — a header `X-Session: <sessionID>`.
- `"cookie"` — `Cookie: x_session=<sessionID>`; the server responds with `Access-Control-Allow-Credentials: true`.

If neither `sessionID` nor `seq` is placed in the path, no trailing `/` is added to `path`: `GET /yourpath`.

> `sessionIDKey`: string

**Side:** both sides (must match) · **Modes:** packet-up, stream-up

The name of the query parameter, header or cookie carrying `sessionID`. The default is `"x_session"` for `"query"` and `"cookie"`, and `"X-Session"` for `"header"`. For example, `"sid"` gives `?sid=<sessionID>`, `Sid: <sessionID>` or `Cookie: sid=<sessionID>`; `"SessionIDKey"` in a header is sent as `Sessionidkey`. Header names are compared case-insensitively, cookie and query parameter names case-sensitively.

Used only with `sessionIDPlacement` set to `"query"`, `"header"` or `"cookie"`; not used with `"path"`.

> `sessionIDTable`: string

**Side:** client · **Modes:** packet-up, stream-up

The character set of `sessionID`. If the field is empty (the default), `sessionID` is a UUID: `GET /yourpath/8b34f2dc-0d63-4d35-8137-fb52e3778337`.

The value is the name of a built-in set (case matters) or a custom string of ASCII characters. Set only together with `sessionIDLength`: the number of possible identifiers must be at least 2³¹, otherwise the error `sessionIDTable or sessionIDLength is too small` occurs. Minimum lengths: `number` — 10; `hex`, `HEX` — 8; `alphabet`, `ALPHABET` — 7; `Alphabet`, `base36`, `BASE36`, `Base62` — 6. For example, `"hex"` with length `8` gives `GET /yourpath/fafd048b`, `"Base62"` with length `6` gives `GET /yourpath/Z6kP9i`, and the custom table `"abc123"` with length `12` gives `GET /yourpath/3ab1c2b3a1cc`. A custom table must not contain `/` when placed in the path, or `;`, `"`, `\` when placed in a cookie.

> `sessionIDLength`: number | string

**Side:** client · **Modes:** packet-up, stream-up

The length of `sessionID` in characters ([Int32Range](../../development/intro/guide.md#int32range)), picked for each proxy connection. Used only together with `sessionIDTable`; without it `sessionID` stays a UUID.

> `seqPlacement`: "path" | "query" | "header" | "cookie"

**Side:** both sides (must match) · **Modes:** packet-up

Location of the packet number `seq` in upload requests. The default is `"path"`. `stream-up`, `stream-one` and the download `GET` have no packet number.

- `"path"` — a path segment after `sessionID`: `POST /yourpath/<sessionID>/0`; `seqKey` is not used.
- `"query"` — a parameter `POST /yourpath/<sessionID>?x_seq=0`.
- `"header"` — a header `X-Seq: 0`.
- `"cookie"` — `Cookie: x_seq=0`.

> `seqKey`: string

**Side:** both sides (must match) · **Modes:** packet-up

The name of the query parameter, header or cookie carrying the packet number. The default is `"x_seq"` for `"query"` and `"cookie"`, and `"X-Seq"` for `"header"`. For example, `"n"` gives `?n=0`, `N: 0` or `Cookie: n=0`. Case rules are the same as for `sessionIDKey`.

Used only with `seqPlacement` set to `"query"`, `"header"` or `"cookie"`; not used with `"path"`.

::: details What it looks like when sessionID and seq share a location

```http
# "path" (default)
GET /yourpath/8b34f2dc-0d63-4d35-8137-fb52e3778337 HTTP/1.1
POST /yourpath/8b34f2dc-0d63-4d35-8137-fb52e3778337/0 HTTP/1.1

# "query": parameters are sorted by name
GET /yourpath?x_session=<sessionID> HTTP/1.1
POST /yourpath?x_seq=0&x_session=<sessionID> HTTP/1.1

# "header"
POST /yourpath HTTP/1.1
X-Seq: 0
X-Session: <sessionID>

# "cookie"
POST /yourpath HTTP/1.1
Cookie: x_session=<sessionID>; x_seq=0
```

:::

::: warning Name collisions
Xray does not check for name conflicts between service fields. If two fields write a header, query parameter or cookie with the same name, one value overwrites the other, and requests get `400`, connections break or hang. Avoid:

- identical `xPaddingHeader`, `sessionIDKey` and `seqKey` when placed in headers, and identical `xPaddingKey`, `sessionIDKey` and `seqKey` when placed in cookies or query;
- overlap with upload data names: headers `X-Data-0`, `X-Data-1`… and cookies `x_data_0`…; with `uplinkDataPlacement: "auto"` the server reads `X-Data-N` from any packet;
- `Host` and `Content-Length` as names, `Content-Type` without `noGRPCHeader: true`, and `Referer` as `sessionIDKey` with `xPaddingObfsMode: false`;
- `x_session` and `x_seq` parameters (or your own `sessionIDKey` and `seqKey`) in the query part of `path`, and a header or cookie named `sessionIDKey` in `headers`.

:::

> `noGRPCHeader`: true | false

**Side:** client · **Modes:** stream-up, stream-one

Disables the `Content-Type: application/grpc` header in streaming upload: with it the request looks like gRPC, and CDNs are more willing to stream it over HTTP/2. The default is `false`.

- `false` — the `stream-up` upload (`POST /yourpath/<sessionID>`) and the `stream-one` request (`POST /yourpath/`) are sent with `Transfer-Encoding: chunked` and `Content-Type: application/grpc`.
- `true` — the same requests without `Content-Type`.

In `packet-up` and in the download `GET` this header is absent regardless of the value.

> `noSSEHeader`: true | false

**Side:** server · **Modes:** all

Disables the `Content-Type: text/event-stream` header in the download response: to the `GET` in `packet-up` and `stream-up`, and to the `stream-one` request. The header hints to intermediaries not to buffer the response. The default is `false`.

- `false` — `HTTP/1.1 200 OK` with `Cache-Control: no-store`, `Content-Type: text/event-stream`, `X-Accel-Buffering: no`.
- `true` — the same response without `Content-Type`.

Enable it if a CDN or proxy mishandles SSE responses.

> `scMaxEachPostBytes`: number | string

**Side:** both sides (client ≤ server) · **Modes:** packet-up

The maximum size of data in a single upload request, in bytes ([Int32Range](../../development/intro/guide.md#int32range)); visible in the packet's `Content-Length`. The default is `1000000`. The client picks a value from the range once per proxy connection; the server uses the upper bound.

**The server value must be at least the client value**: the server responds `413 Request Entity Too Large` to a larger packet, and the connection breaks.

> `scMinPostsIntervalMs`: number | string

**Side:** client · **Modes:** packet-up

The minimum pause between upload requests of one proxy connection, in milliseconds ([Int32Range](../../development/intro/guide.md#int32range)); picked at random for each request. The default is `30`. While the client waits, new data accumulates and goes out in the next packet. The value `-1` disables the pause.

> `scMaxBufferedPosts`: number

**Side:** server · **Modes:** packet-up

How many packets of one session the server keeps queued while waiting for a missing `seq` number. The default is `30`. When the queue overflows, the server drops the connection. Only a positive integer is allowed; ranges are not supported.

> `scStreamUpServerSecs`: number | string

**Side:** server · **Modes:** stream-up

The interval in seconds ([Int32Range](../../development/intro/guide.md#int32range)) at which the server writes `XXXX…` filler blocks into the response to the upload request, so that a CDN does not close a response that carries no data for a long time. The default is `"20-80"`. The first block is sent immediately, block length is taken from `xPaddingBytes`, and the client discards them.

The value `-1` disables the blocks: then the server sends nothing in the response until the upload finishes, not even headers. Blocks are sent only if the request has a `Referer` (with `xPaddingObfsMode: false`) or the server accepted padding in `xPaddingObfsMode: true` mode.

> `serverMaxHeaderBytes`: number

**Side:** server · **Modes:** all

The maximum total size of request headers in bytes; the server responds `431` to a request with larger headers. The default is `8192`. Applies to HTTP/1.1 and HTTP/2 (TCP listener), not to HTTP/3. Headers include padding, `sessionID`, cookies, and upload data with `uplinkDataPlacement` set to `"header"` or `"cookie"`.

> `h2Params`: object

**Side:** server · **Modes:** all

Fine-tuning of HTTP/2 (including h2c) on the TCP listener; has no effect on HTTP/1.1 and HTTP/3. Keys are field names of the Go [`HTTP2Config`](https://pkg.go.dev/net/http#HTTP2Config) struct, such as `MaxConcurrentStreams` or `MaxReadFrameSize`; durations are given in nanoseconds. Go defaults are used by default. The contents are not validated when the configuration loads: an error in them shows up as the inbound failing to start.

> `xmux`: [XmuxObject](#xmuxobject)

**Side:** client · **Modes:** all

Rules for distributing HTTP requests across connections.

> `downloadSettings`: [StreamSettingsObject](../transport.md#streamsettingsobject)

**Side:** client · **Modes:** packet-up, stream-up

A separate route for download, see [downloadSettings](#downloadsettings).

### XmuxObject

XMUX determines how many HTTP connections the client keeps and when to replace them. In HTTP/2 and HTTP/3, requests of many proxy connections travel as streams inside a single TCP or QUIC connection, and XMUX decides which of them to open a request in. XMUX has no protocol of its own, is unrelated to Mux.Cool, and the server does not read these parameters. In HTTP/1.1 the limits apply to HTTP clients rather than TCP connections; Browser Dialer does not use XMUX.

```json
{
  "maxConcurrency": "16-32",
  "cMaxReuseTimes": "64-128",
  "hMaxRequestTimes": "600-900",
  "hMaxReusableSecs": "1800-3000",
  "hKeepAlivePeriod": 0
}
```

If `xmux` is not set or all its fields are `0`, the defaults apply: `maxConnections: 3`, `hMaxRequestTimes: "600-900"`, `hMaxReusableSecs: "1800-3000"`. **If at least one field is set, the defaults are not applied**, and unset fields become `0` — unlimited. All fields except `hKeepAlivePeriod` have the type [Int32Range](../../development/intro/guide.md#int32range).

> `maxConcurrency`: number | string

**Side:** client · **Modes:** all

How many proxy connections run simultaneously through one connection; when all connections are full, a new one is created. The default is `0`, unlimited. `1` gives each proxy connection its own connection. Cannot be set together with `maxConnections`.

> `maxConnections`: number | string

**Side:** client · **Modes:** all

How many connections to keep: while there are fewer, each new proxy connection gets a new connection; after that, proxy connections are distributed randomly among the open ones. The default is `3` if `xmux` is not set. Cannot be set together with `maxConcurrency`.

> `cMaxReuseTimes`: number | string

**Side:** client · **Modes:** all

How many times one connection can be handed out to new proxy connections; after that, new ones are not assigned to it, while existing ones keep working. The default is `0`, unlimited.

> `hMaxRequestTimes`: number | string

**Side:** client · **Modes:** all

How many HTTP requests can go through one connection: `stream-one` uses 1 request, `stream-up` uses 2, `packet-up` uses 1 plus the number of `POST` requests. The default is `"600-900"`. The count is approximate, so leave headroom below the proxy limit: Nginx allows 1000 requests per connection by default.

> `hMaxReusableSecs`: number | string

**Side:** client · **Modes:** all

How many seconds after creation a connection stops receiving new proxy connections. The default is `"1800-3000"`. Behind Nginx keep the value below 3600: by default Nginx does not keep a connection longer than an hour.

> `hKeepAlivePeriod`: number

**Side:** client · **Modes:** all

The connection health-check interval in seconds when nothing arrives on it: PING in HTTP/2, keep-alive in QUIC. The default is `0`, meaning 45 seconds for HTTP/2 and 10 seconds for HTTP/3; a negative value disables the check. Ranges are not supported. For HTTP/3, `keepAlivePeriod` in [quicParams](./finalmask.md#quicparams) takes precedence; for HTTP/1.1 the parameter is not used.

### downloadSettings

`downloadSettings` sends download (the `GET` request) over a separate route: to a different address and port, with its own security, HTTP version and XMUX pool. Upload still goes through the main `streamSettings`. For example, upload can go through a CDN while download is received directly over HTTP/3 or via REALITY.

The value is a [StreamSettingsObject](../transport.md#streamsettingsobject) with additional `address` and `port` fields. Only the mode and the `sessionID` value are taken from the main configuration; `host`, `path`, `headers`, padding, `sessionID` placement, `xmux`, `security` and `alpn` are set inside `downloadSettings`. The main connection's `sockopt` replaces its own if it has `penetrate: true` set.

```json
{
  "downloadSettings": {
    "address": "down.example.net",
    "port": 443,
    "method": "xhttp",
    "security": "tls",
    "tlsSettings": { "serverName": "down.example.net", "alpn": ["h3"] },
    "xhttpSettings": {
      "host": "down.example.net",
      "path": "/yourpath",
      "xmux": { "maxConcurrency": 1 }
    }
  }
}
```

- Incompatible with `mode: "stream-one"`: such a configuration fails to load.
- `address`, `port` and `"method": "xhttp"` are required. Their absence is not detected when the configuration loads: the error occurs on the first connection.
- `path`, `host` (if set on the server), padding and `sessionID` placement in the `GET` request must suit the server, so always set `path`. Upload and download paths may differ only if both start with the server's `path` and `sessionID` and `seq` are not placed in the path.
- The server knows nothing about `downloadSettings` and pairs the halves by `sessionID`, so upload and download must reach the same inbound of the same Xray process.
- If the main `xhttpSettings` uses `extra`, `downloadSettings` must be placed inside `extra`.
- For upload, `"maxConnections": 1` in `xmux` is recommended; for download, `"maxConcurrency": 1`.

## Browser Dialer

When [Browser Dialer](../features/browser_dialer.md#xhttp) is used, XHTTP requests are made by the browser: it determines TLS, ALPN and the HTTP version, and `fingerprint`, `alpn`, `xmux`, `sockopt` and `finalmask` have no effect. Only `packet-up` mode is supported: `"auto"` turns into `packet-up`, while `stream-up` and `stream-one` fail with an error. With REALITY, Browser Dialer is not used.
