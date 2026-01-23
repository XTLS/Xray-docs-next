# Browser Dialer

## Background

Through uTLS, Xray can simulate the TLS handshake fingerprints of mainstream browsers (see the `fingerprint` option in TLS for details). However, it still cannot guarantee that the simulated browser behavior is perfectly consistent with a real browser at all times.

In response to this, the [Browser Dialer](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994) was created. Users open a page at `localhost:8080` in their own browser. This page uses native JS to act as Xray's network stack, establishing TLS and HTTP connections with the proxy server.

This method concisely implements real browser TLS fingerprints and behavioral characteristics, providing maximum anti-detection and anti-blocking capabilities.

However, the current Browser Dialer has the following drawbacks:

- Users need to manually open the browser.
- Connections initiated by the browser must be direct. Users using `tun` need to pay special attention to avoid creating infinite routing loops.
- The browser can only initiate HTTP connections, so currently, only [WebSocket](../transports/websocket.md) and [XHTTP](https://github.com/XTLS/Xray-core/discussions/4113) transport methods are supported.
- When the browser connects from the `localhost:8080` page to the proxy server, [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) needs to be considered.
- Since data is processed via JS, there will be some performance overhead.
- Custom SNI or Host cannot be used; that is, `SNI == host == address`. Custom HTTP headers and other `tlsSettings` items will be ignored.

## Configuration Method

1. Prepare a WebSocket or XHTTP configuration. Note that the `address` must be a domain name. If you need to specify an IP, please configure DNS or the system `hosts` file.
2. Start Xray using the environment variable `XRAY_BROWSER_DIALER=127.0.0.1:8080`.
   - On Windows: `set XRAY_BROWSER_DIALER=127.0.0.1:8080`
   - On Linux: `XRAY_BROWSER_DIALER=127.0.0.1:8080 ./xray -c config.json`
3. Ensure the browser connects directly (or configure the routing so that the server address is sent directly via `freedom`). Open the page `localhost:8080`. You can also use `F12` to check `Console` and `Network`.
4. Browsers limit the number of outbound connections, so it is recommended to enable `Mux.Cool`.

## Internal Communication Mechanism

- Xray listens on the address/port `http://127.0.0.1:8080` as an HTTP server. The browser visits this address and loads the JS in the webpage.
- The JS actively establishes a WebSocket connection to `http://127.0.0.1:8080`. Upon success, Xray sends the connection to a channel.
- When a connection needs to be established, Xray retrieves an available connection from the channel and sends the target URL and optional early data.
- After the JS successfully connects to the target, it notifies Xray and continues to use this connection to forward data in full-duplex mode. Connection closure is synchronized.
- The connection is closed after use, but the JS ensures that new idle connections are always available.

## WebSocket

<Badge text="v1.4.1+" type="warning"/>

Based on browser requirements, the following adjustments were made to the early data mechanism:

- The server response header will carry the requested `Sec-WebSocket-Protocol`, which preliminarily obfuscates the length characteristics of the WSS handshake response.
- The early data encoding used for browsers is `base64.RawURLEncoding` instead of `StdEncoding`. The server has made compatibility adjustments.
- Additionally, due to [Xray-core#375](https://github.com/XTLS/Xray-core/pull/375) recommending `?ed=2048`, this PR also expanded a `MaxHeaderBytes` limit on the server side to 4096. ~~ (Although it seems fine without changing it) ~~

## XHTTP

<Badge text="v1.8.19+" type="warning"/>

[XHTTP](https://github.com/XTLS/Xray-core/discussions/4113) itself supports QUIC. If you want to use the browser's own QUIC network stack, Chrome users can configure it in `chrome://flags`. Other browsers also have relevant options.

In principle, `tlsSettings` items will be ignored, and the HTTP version used will be determined entirely by the browser.
