# Browser Dialer

<Badge text="BETA" type="warning"/> <Badge text="v1.4.1+" type="warning"/>

## Background

基于 [一年前的想法](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994) ，利用原生 JS 实现了简洁的 WSS Browser Dialer，达到了真实浏览器的 TLS 指纹、行为特征。

不过 WSS 仍存在 ALPN 明显的问题，所以下一步是浏览器转发 `HTTP/2`,`QUIC`。

## Xray & JS

创造了一个非常简单、巧妙的通信机制：

- Xray 监听地址端口 A，作为 HTTP 服务，浏览器访问 A，加载网页中的 JS。
- JS 主动向 A 建立 WebSocket 连接，成功后，Xray 将连接发给 channel。
- 需要建立连接时，Xray 从 channel 接收一个可用的连接，并发送目标 URL 和可选的 early data。
- JS 成功连接到目标后告知 Xray，并继续用这个 conn 全双工双向转发数据，连接关闭行为同步。
- 连接使用后就会被关闭，但 JS 会确保始终有新空闲连接可用。

## Early data

根据浏览器的需求，对 early data 机制进行了如下调整：

- 服务端响应头会带有请求的 `Sec-WebSocket-Protocol`，这也初步混淆了 WSS 握手响应的长度特征。
- 用于浏览器的 early data 编码是 `base64.RawURLEncoding` 而不是 `StdEncoding`，服务端做了兼容。
- 此外，由于 [Xray-core#375](https://github.com/XTLS/Xray-core/pull/375) 推荐 `?ed=2048`，这个 PR 顺便将服务端一处 `MaxHeaderBytes` 扩至了 4096。 ~~（虽然好像不改也没问题）~~

## Configuration <Badge text="v1.4.1" type="warning"/>

这是一个探索的过程，目前两边都是 Xray-core v1.4.1 时的配置方式：

- 准备一份可用的 WSS 配置，注意 address 必须填域名，若需要指定 IP，请配置 DNS 或系统 hosts。
- 若浏览器的流量也会经过 Xray-core，务必将这个域名设为直连，否则会造成流量回环。
- 设置环境变量指定要监听的地址端口，比如 `XRAY_BROWSER_DIALER = 127.0.0.1:8080`。
- 先运行 Xray-core，再用任意浏览器访问上面指定的地址端口，还可以 `F12` 看 `Console` 和 `Network`。
- 浏览器会限制 WebSocket 连接数，所以建议开启 `Mux.Cool`。
