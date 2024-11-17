# Browser Dialer

<Badge text="BETA" type="warning"/> <Badge text="v1.4.1+" type="warning"/>

## Background

Xray generally uses uTLS to mimic the behavior of popular browsers, and it can be controlled through the `fingerprint` setting. However, the fingerprints produced by uTLS are an imperfect replica of the real thing, and because uTLS is a popular library, they may be targeted themselves.

So [the idea of browser dialer](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994) is that Xray uses a real browser to establish TLS connections. The way this works is that Xray hosts a small website on `localhost:8080`, the user opens this website in a browser of their choice, and JavaScript on that page will act as Xray's networking stack (HTTP client, TLS client).

The TLS fingerprinting behavior is perfect this way, and so it may be possible to revive servers that open fine as websites in the browser, but do not connect using any proxying software.

However, there are many drawbacks:

* The user has to launch a browser next to the Xray client just for opening the proxy connection.
* The browser dialer must not be tunneled through the proxy itself, otherwise there is a loop. TUN users should be cautious.
* The browser can only speak standard HTTP, which means that only [WebSocket](../../transports/websocket.md) and [XHTTP](../../transports/splithttp.md) are supported
* [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) needs to be considered when making requests from one website (`localhost:8080`) to another (`proxy.example.com:443`)
* The browser tunnels your traffic using JavaScript, so there is a significant performance penalty (or, battery drain)
* The configuration to be used with browser dialer cannot use custom SNI or host headers. `SNI == host == address`. Custom HTTP headers and `tlsSettings` are ignored entirely.

## Configuration

1. Prepare a usable WebSocket or XHTTP configuration. Be aware of the above restrictions.
2. Launch Xray with `XRAY_BROWSER_DIALER=127.0.0.1:8080`. On Windows, this can be done as `set XRAY_BROWSER_DIALER=...` and then launching the core from the console, on Linux the core can be launched as `XRAY_BROWSER_DIALER=127.0.0.1:8080 ./xray -c config.json`.
3. Open a browser that is not tunneled through the proxy, or modify the config's routing such that the Xray server's domain goes to `freedom` directly from the client. Browse to `localhost:8080`, and open the developer console with `F12` to monitor for errors.
4. For better performance and to bypass arbitrary connection limits enforced by the browser, it is recommended to enable `Mux.Cool`.

## Inner workings

- Xray listens on `http://127.0.0.1:8080`, and the browser accesses `http://127.0.0.1:8080` to load the `JS` in the webpage.
- The `JS` actively establishes a WebSocket connection to `http://127.0.0.1:8080`. Xray will use this connection to send instructions, but for now it goes into a connection pool (implemented as Go channel).
- When a connection needs to be established, Xray receives an available connection from the pool and sends the protocol name, target URL and optional early data.
- Once the `JS` successfully connects to the target, it informs Xray and continues to use this conn to bi-directionally forward data.
- After the connection to the server is closed, the connection to localhost is also closed, but the JS ensures that there is always at least one idle connection available.

## WebSocket

<Badge text="v1.4.1+" type="warning"/>

According to the browser's needs, the early data mechanism has been adjusted as follows:

- The server response header will contain the requested `Sec-WebSocket-Protocol`, which also initially obfuscates the length characteristic of the WSS handshake response.
- The encoding used for early data for browsers is `base64.RawURLEncoding` instead of `StdEncoding`, and the server has made it compatible.
- In addition, due to [Xray-core#375](https://github.com/XTLS/Xray-core/pull/375) recommendations for `?ed=2048`, this PR also increased server `MaxHeaderBytes` by 4096. ~~(Although it seems like it would work without modification.)~~

## XHTTP

<Badge text="v1.8.19+" type="warning"/>

XHTTP supports QUIC, but the browser's own QUIC stack may be used as well. In Chrome this can be done through `chrome://flags`, in other browsers it may already be enabled or need a different flag.

In general, `tlsSettings` are completely ignored when Browser Dialer is used. Xray does not have any control over which HTTP version the browser selects.
