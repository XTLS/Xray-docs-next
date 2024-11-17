# Browser Dialer

## 背景

通过 uTLS，Xray 可以模拟主流浏览器的 TLS 握手指纹（具体参见 TLS 中 `fingerprint` 选项）。但是仍然不能保证在任意时刻 uTLS 模拟浏览器行为完全一致。

对此 [浏览器转发（browser dialer）](https://github.com/v2ray/discussion/issues/754#issuecomment-647934994)应运而生。用户在自己的浏览器中打开一个页面至 `localhost:8080`，这个页面利用原生 JS 充当 Xray 的网络栈，与代理服务端建立 TLS，HTTP 连接。

这个方法简洁的实现了真实的浏览器的 TLS 指纹、行为特征。最大程度抗检测与抗封锁。

不过目前的浏览器转发有以下缺点：
* 用户需要手动开浏览器
* 浏览器发出的连接必须直连 使用 tun 的用户需要特别注意容易形成死循环
* 浏览器只能发出 HTTP 连接 所以目前仅支持 [WebSocket](../../transports/websocket.md) 与 [XHTTP](../../transports/splithttp.md) 传输方式
* 当浏览器从 `localhost:8080` 页面连接至代理服务端，需要考虑 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
* 因为中间经过 JS 处理数据，会有一些性能损耗
* 不能使用自定义 SNI 或者 Host，也就是说 `SNI == host == address`。自定义 HTTP 头以及其它 `tlsSettings` 项会被忽略

## 配置方法
1. 准备一份 WebSocket 或 XHTTP 配置，注意 address 必须填域名，若需要指定 IP，请配置 DNS 或系统 hosts
2. 使用环境变量启动 Xray `XRAY_BROWSER_DIALER=127.0.0.1:8080`。Windows 上命令为 `set XRAY_BROWSER_DIALER=127.0.0.1:8080` Linux 上命令为 `XRAY_BROWSER_DIALER=127.0.0.1:8080 ./xray -c config.json`
3. 确保浏览器直连（或者在路由中将服务端地址直接由 `freedom` 发出），打开页面 `localhost:8080`，还可以 `F12` 看 `Console` 和 `Network`
4. 浏览器会限制发出的连接数，所以建议开启 `Mux.Cool`

## 内部通信机制

- Xray 监听地址端口 `http://127.0.0.1:8080`，作为 HTTP 服务，浏览器访问地址，加载网页中的 JS。
- JS 主动向 `http://127.0.0.1:8080` 建立 WebSocket 连接，成功后，Xray 将连接发给 channel。
- 需要建立连接时，Xray 从 channel 接收一个可用的连接，并发送目标 URL 和可选的 early data。
- JS 成功连接到目标后告知 Xray，并继续用这个 conn 全双工双向转发数据，连接关闭行为同步。
- 连接使用后就会被关闭，但 JS 会确保始终有新空闲连接可用。

## WebSocket

<Badge text="v1.4.1+" type="warning"/>

根据浏览器的需求，对 early data 机制进行了如下调整：

- 服务端响应头会带有请求的 `Sec-WebSocket-Protocol`，这也初步混淆了 WSS 握手响应的长度特征。
- 用于浏览器的 early data 编码是 `base64.RawURLEncoding` 而不是 `StdEncoding`，服务端做了兼容。
- 此外，由于 [Xray-core#375](https://github.com/XTLS/Xray-core/pull/375) 推荐 `?ed=2048`，这个 PR 顺便将服务端一处 `MaxHeaderBytes` 扩至了 4096。 ~~（虽然好像不改也没问题）~~

## XHTTP

<Badge text="v1.8.19+" type="warning"/>

XHTTP 本身支持 QUIC，如果想使用浏览器自己的 QUIC 网络栈，Chrome 可以在 `chrome://flags` 中设定。其它浏览器也有相关选项。

原理上说 `tlsSettings` 项会被忽略，使用哪个 HTTP 版本将完全由浏览器决定。
