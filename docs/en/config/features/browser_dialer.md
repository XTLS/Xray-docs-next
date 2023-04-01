# Browser Dialer

<Badge text="BETA" type="warning"/> <Badge text="v1.4.1+" type="warning"/>

## Background

Based on [an idea from 2020](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994), a concise `WSS Browser Dialer` has been implemented using native `JS`, achieving true browser TLS fingerprints and behavioral characteristics.
However, `WSS` still has significant issues with `ALPN`, so the next step is to forward `HTTP/2` and `QUIC` through the browser."

## Xray & JS

A very simple and clever communication mechanism has been created：

- Xray listens on address port `A` as an `HTTP` service, and the browser accesses `A` to load the `JS` in the webpage.
- The `JS` actively establishes a WebSocket connection to `A`. After a successful connection, Xray sends the connection to the channel.
- When a connection needs to be established, Xray receives an available connection from the channel and sends the target URL and optional early data.
- Once the `JS` successfully connects to the target, it informs Xray and continues to use this conn to bi-directionally forward data. Connection closing behavior is synchronized.
- After the connection is used, it will be closed, but the JS ensures that there is always a new idle connection available."

## Early data

According to the browser's needs, the early data mechanism has been adjusted as follows:

- The server response header will contain the requested `Sec-WebSocket-Protocol`, which also initially obfuscates the length characteristic of the WSS handshake response.
- The encoding used for early data for browsers is `base64.RawURLEncoding` instead of `StdEncoding`, and the server has made it compatible.
- In addition, due to [Xray-core#375](https://github.com/XTLS/Xray-core/pull/375) recommendations for `?ed=2048`, this PR also increased server `MaxHeaderBytes` by 4096. ~~(Although it seems like it would work without modification.)~~

## Configuration <Badge text="v1.4.1" type="warning"/>

This is an exploratory process, and the configuration method used when both sides are Xray-core v1.4.1 is as follows:

- Prepare a usable WSS configuration, making sure to fill in the domain name for the address. If you need to specify an IP address, configure DNS or system hosts.
- If browser traffic will also pass through Xray-core, be sure to set this domain name as a direct connection, otherwise it will cause traffic looping.
- Set the environment variable to specify the address port to listen on, such as `XRAY_BROWSER_DIALER = 127.0.0.1:8080`.
- First run Xray-core, then use any browser to access the specified address port, and you can also check `Console` and Network with `F12`.
- The browser will limit the number of WebSocket connections, so it is recommended to enable `Mux.Cool`.
