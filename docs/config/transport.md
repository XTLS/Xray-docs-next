# 传输方式（uTLS、REALITY）

传输方式（transport）是当前 Xray 节点和其它节点对接的方式。

传输方式指定了稳定的数据传输的方式。通常来说，一个网络连接的两端需要有对称的传输方式。比如一端用了 WebSocket，那么另一个端也必须使用 WebSocket，否则无法建立连接。

## StreamSettingsObject

`StreamSettingsObject` 对应入站或出站中的 `streamSettings` 项。每一个入站或出站都可以分别配置不同的传输配置，都可以设置 `streamSettings` 来进行一些传输的配置。

```json
{
  "network": "raw",
  "security": "none",
  "tlsSettings": {},
  "realitySettings": {},
  "rawSettings": {},
  "xhttpSettings": {},
  "kcpSettings": {},
  "grpcSettings": {},
  "wsSettings": {},
  "httpupgradeSettings": {},
  "sockopt": {
    "mark": 0,
    "tcpMaxSeg": 1440,
    "tcpFastOpen": false,
    "tproxy": "off",
    "domainStrategy": "AsIs",
    "happyEyeballs": {},
    "dialerProxy": "",
    "acceptProxyProtocol": false,
    "tcpKeepAliveInterval": 0,
    "tcpKeepAliveIdle": 300,
    "tcpUserTimeout": 10000,
    "tcpCongestion": "bbr",
    "interface": "wg0",
    "v6only": false,
    "tcpWindowClamp": 600,
    "tcpMptcp": false
  }
}
```

> `network`: "raw" | "xhttp" | "kcp" | "grpc" | "ws" | "httpupgrade"

连接的数据流所使用的传输方式类型，默认值为 `"raw"`。

::: tip
v24.9.30 版本后，为了更贴近实际行为，TCP 传输方式已更名为 RAW。为了兼容性，`"network": "raw"` 和 `"network": "tcp"`，`rawSettings` 和 `tcpSettings` 互为别名。
:::

> `security`: "none" | "tls" | "reality"

是否启用传输层加密，支持的选项有

- `"none"` 表示不加密（默认值）
- `"tls"` 表示使用 [TLS](https://zh.wikipedia.org/wiki/%E5%82%B3%E8%BC%B8%E5%B1%A4%E5%AE%89%E5%85%A8%E6%80%A7%E5%8D%94%E5%AE%9A)。
- `"reality"` 表示使用 REALITY。

> `tlsSettings`: [TLSObject](#tlsobject)

TLS 配置。TLS 由 Golang 提供，通常情况下 TLS 协商的结果为使用 TLS 1.3，不支持 DTLS。

> `realitySettings`: [RealityObject](#realityobject)

Reality 配置。Reality 是 Xray 的原创黑科技。 Reality 比 TLS 的安全性更高, 配置方式也和 TLS 一致.

::: tip
Reality 是目前最安全的传输加密方案, 且外部看来流量类型和正常上网具有一致性。 启用 Reality 并且配置合适的 XTLS Vision 流控模式, 可以
达到数倍甚至十几倍的性能提升。
:::

> `rawSettings`: [RawObject](./transports/raw.md)

当前连接的 RAW 配置，仅当此连接使用 RAW 时有效。

> `xhttpSettings`: [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113)

当前连接的 XHTTP 配置，仅当此连接使用 XHTTP 时有效。

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

当前连接的 mKCP 配置，仅当此连接使用 mKCP 时有效。

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

当前连接的 gRPC 配置，仅当此连接使用 gRPC 时有效。

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

当前连接的 WebSocket 配置，仅当此连接使用 WebSocket 时有效。

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

当前连接的 HTTPUpgrade 配置，仅当此连接使用 HTTPUpgrade 时有效。

> `sockopt`: [SockoptObject](#sockoptobject)

透明代理相关的具体配置。

### TLSObject

```json
{
  "serverName": "xray.com",
  "verifyPeerCertInNames": [],
  "rejectUnknownSni": false,
  "allowInsecure": false,
  "alpn": ["h2", "http/1.1"],
  "minVersion": "1.2",
  "maxVersion": "1.3",
  "cipherSuites": "此处填写你需要的加密套件名称,每个套件名称之间用:进行分隔",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertificateChainSha256": [""],
  "curvePreferences": [""],
  "masterKeyLog": "",
  "echServerKeys": "",
  "echConfigList": "",
  "echForceQuery": "",
  "echSockopt": {}
}
```

> `serverName`: string

指定服务器端证书的域名，在连接由 IP 建立时有用。

当留空时，自动使用address中的值（如果是域名），该值同时用于校验服务端证书是否有效。

::: tip
如上所述，因为该值同时用于校验服务端证书是否有效，如果出于特殊目的将其修改为与服务端证书域名不一致的需要需要开启 `allowInsecure` 否则会导致证书认证失败。出于安全考虑我们不推荐长期使用这种方法，如果想要安全地伪造SNI，请考虑使用REALITY。

特别地，当客户端设置其为IP地址时，xray不会发送SNI，同样的要使用此功能也必须同时开启 `allowInsecure`
:::

> `verifyPeerCertInNames`: \[ string \]

仅客户端，用于校验证书使用的 SNI 列表(只需要证书中有一个 SAN 在该列表中即可), 将会覆盖本用于校验的 `serverName`, 用于域前置等特殊目的。 相较于之前的修改 `serverName` 并开启 `allowInsecure` 更加安全，因为其仍会执行证书签名验证。

特殊值 `"FromMitM"`, 这会使其额外加入来自 dokodemo-door 入站解密的 TLS 中包含的 SNI.

> `rejectUnknownSni`: bool

当值为 `true` 时，服务端接收到的 SNI 与证书域名不匹配即拒绝 TLS 握手，默认为 false。

> `alpn`: \[ string \]

一个字符串数组，指定了 TLS 握手时指定的 ALPN 数值。默认值为 `["h2", "http/1.1"]`。

特殊值：`["FromMitM"]` (有且仅有这一个元素时) 会使出站 TLS 使用来自 dokodemo-door 入站解密的 TLS 连接使用的 alpn.

> `minVersion`: string

minVersion 为可接受的最小 TLS 版本。

> `maxVersion`: string

maxVersion 为可接受的最大 TLS 版本。

> `cipherSuites`: string

CipherSuites 用于配置受支持的密码套件列表, 每个套件名称之间用:进行分隔.

你可以在 [这里](https://golang.org/src/crypto/tls/cipher_suites.go#L500)或 [这里](https://golang.org/src/crypto/tls/cipher_suites.go#L44)
找到 golang 加密套件的名词和说明

::: danger
以上两项配置为非必要选项，正常情况下不影响安全性 在未配置的情况下 golang 根据设备自动选择. 若不熟悉, 请勿配置此选项, 填写不当引起的问题自行负责
:::

> `allowInsecure`: true | false

是否允许不安全连接（仅用于客户端）。默认值为 `false`。

当值为 `true` 时，Xray 不会检查远端主机所提供的 TLS 证书的有效性。

::: danger
出于安全性考虑，这个选项不应该在实际场景中选择 true，否则可能遭受中间人攻击。
:::

> `disableSystemRoot`: true | false

是否禁用操作系统自带的 CA 证书。默认值为 `false`。

当值为 `true` 时，Xray 只会使用 `certificates` 中指定的证书进行 TLS 握手。当值为 `false` 时，Xray 只会使用操作系统自带的 CA 证书进行 TLS 握手。

> `enableSessionResumption`: true | false

是否启用会话恢复，默认禁用，只有服务端和客户端都启用时候才会尝试协商会话恢复。

如果协商成功将可以不在握手过程中传输证书。稍微节省一点点握手时间（几乎可以忽略不计）

注意，这不是 TLS 0RTT, gotls 尚未支持此功能，这不会减少 TLS 握手的 RTT.

> `fingerprint` : string

此参数用于配置指定 `TLS Client Hello` 的指纹。当其值为空时，表示不启用此功能。启用后，Xray 将通过 uTLS 库 **模拟** `TLS` 指纹，或随机生成。支持三种配置方式：

1. 常见浏览器最新版本的 TLS 指纹 包括

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

2. 在 xray 启动时自动生成一个指纹

- `"random"`: 在较新版本的浏览器里随机抽取一个
- `"randomized"`: 完全随机生成一个独一无二的指纹 (100% 支持 TLS 1.3 使用 X25519)

3. 使用 uTLS 原生指纹变量名 例如`"HelloRandomizedNoALPN"` `"HelloChrome_106_Shuffle"`。完整名单见 [uTLS 库](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434)

::: tip
此功能仅 **模拟** `TLS Client Hello` 的指纹，行为、其他指纹与 Golang 相同。如果你希望更加完整地模拟浏览器 `TLS`
指纹与行为，可以使用 [Browser Dialer](./transports/websocket.md#browser-dialer)。
:::

::: tip
当使用此功能时，TLS 的部分影响TLS指纹的选项将被 utls 库覆盖不再生效，列如ALPN。
会被传递的参数有
`"serverName" "allowInsecure" "disableSystemRoot" "pinnedPeerCertificateChainSha256" "masterKeyLog"`
:::

> `pinnedPeerCertificateChainSha256`: \[string\]

用于指定远程服务器的证书链 SHA256 散列值，使用标准编码格式。仅有当服务器端证书链散列值符合设置项中之一时才能成功建立 TLS 连接。

注意：只有验证证书有效后，核心才会进行此检查，比如如果自签证书并在此指定，核心在验证证书失败后会直接断开连接而不会进行这个检查，如有类似需求可以考虑开启 `allowInsecure` 跳过签名验证然后便可以正常工作

在连接因为此配置失败时，会展示远程服务器证书散列值。

::: danger
不建议使用这种方式获得证书链散列值，因为在这种情况下将没有机会验证此时服务器提供的证书是否为真实证书，进而不保证获得的证书散列值为期望的散列值。
:::

::: tip
如果需要获得证书的散列值，应在命令行中运行 `xray tls certChainHash --cert <cert.pem>` 来获取，`<cert.pem>` 应替换为实际证书文件路径。
:::

> `certificates`: \[ [CertificateObject](#certificateobject) \]

证书列表，其中每一项表示一个证书（建议 fullchain）。

::: tip
如果要在 ssllibs 或者 myssl 获得 A/A+ 等级的评价,
请参考 [这里](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `curvePreferences`: \[ string \]

一个字符串数组，指定 TLS 握手执行ECDHE时偏好的曲线。支持的曲线列表如下（大小写不敏感）

```
CurveP256
CurveP384
CurveP521
X25519
x25519Kyber768Draft00
```

比如设置为 `"curvePreferences":["x25519Kyber768Draft00"]` 可以启用实验性的后量子算法。由于还是草案阶段该字段随时可能变化。

> `masterKeyLog` : string

(Pre)-Master-Secret log 文件路径，可用于Wireshark等软件解密Xray发送的TLS连接。

> `echServerKeys` : string

仅服务端参数，用于服务端启用 Encrypted Client Hello.

使用 `xray tls ech --serverName example.com` 生成可用的 ECH Server Key 和对应的 Config, 其中 example.com 是在 SNI 被加密用用于暴露在外部的 SNI, 可以随便填。Server Key 包含了 ECHConfig, 如果你不慎弄丢了客户端用的 Config 可以使用 `xray tls ech -i "你的 server key"` 重新获得。你可以把它发布到 DNS 的 HTTPS 记录中，格式参考[这里](https://dns.google/query?name=encryptedsni.com&rr_type=HTTPS) 或者 RFC 9460

注意服务端配置 ECH 后仍然接受正常的非 ECH 连接。

> `echConfigList` : string

仅客户端参数，配置 ECHConfig, 不为空则代表客户端启用 Encrypted Client Hello. 支持两种格式

第一种直接 固定 ECHConfig, 如 `"AF7+DQBaAAAgACA51i3Ssu4wUMV4FNCc8iRX5J+YC4Bhigz9sacl2lCfSQAkAAEAAQABAAIAAQADAAIAAQACAAIAAgADAAMAAQADAAIAAwADAAtleGFtcGxlLmNvbQAA"`

第二种从 DNS 服务器查询，比方说使用 CDN 时可以通过 HTTPS 记录动态获取其配置的 ECHConfig, 如果获取到有效 ECH Config, Xray 会遵守服务器下发的 TTL，查询目标会是配置的 SNI, 或者配置的服务器域名(如果 SNI 为空且目标为一个域名)

基础格式为 `"udp://1.1.1.1"` 表示从 UDP DNS 1.1.1.1 查询，也可以使用 `"https://1.1.1.1/dns-query"`(或者 `h2c://`) 这样的格式，代表使用 DOH(h2c) 进行查询(实际使用请替换成当地可用的服务器). 上述三种均支持修改端口号，如 `udp://1.1.1.1:53`，没写会按照协议默认 53/443.

特别地，可以使用指定的域名用于查询 ECHConfig, 格式为 `"example.com+https://1.1.1.1/dns-query"` 这样 Xray 会强制使用 example.com 的 DNS 记录中的 ECHConfig 用于连接，如果你想从 DNS 获取 ECHConfig 但又不想暴露自己在查询这个域名的 HTTPS 记录或者在这个域名下发布 HTTPS 记录时有一些用。

> `echForceQuery` : string

控制使用 DNS 查询 ECH Config 时的策略，可选 `none`(默认) `half` `full`

`none`: 查询一次，如果没能获取有效 ECH Config 五分钟后才会继续查询。如果查询失败**不会使用 ECH**.

`half`: 查询一次，失败后每次请求都会尝试查询。如果查询失败**不会使用 ECH**。如果查询成功得到响应但是不包含 ECH Config 也**不会使用 ECH**，并且五分钟内不会再次查询。

`full`: 查询一次，强制要求得到了有效 ECH Config 才会成功连接，否则连接会失败。确定要使用 ECH 推荐此选项，前两种模拟 fallback 行为确保可用性但是可能会导致明文 SNI 被发送。

无论查询成功与否，只有第一次连接才会阻塞等待查询响应结果，后续更新不会阻塞连接。

> `echSockopt` : [SockoptObject](#sockoptobject)

调整使用 DNS 查询 ECH 记录时使用的连接的底层 socket 选项。

### RealityObject

```json
{
  "show": false,
  "target": "example.com:443",
  "xver": 0,
  "serverNames": ["example.com", "www.example.com"],
  "privateKey": "",
  "minClientVer": "",
  "maxClientVer": "",
  "maxTimeDiff": 0,
  "shortIds": ["", "0123456789abcdef"],
  "mldsa65Seed": "",
  "limitFallbackUpload": {
    "afterBytes": 0,
    "bytesPerSec": 0,
    "burstBytesPerSec": 0
  },
  "limitFallbackDownload": {
    "afterBytes": 0,
    "bytesPerSec": 0,
    "burstBytesPerSec": 0
  },
  "fingerprint": "chrome",
  "serverName": "",
  "password": "",
  "shortId": "",
  "mldsa65Verify": "",
  "spiderX": ""
}
```

::: tip
更多信息请参考 [REALITY 项目](https://github.com/XTLS/REALITY).
:::

::: tip
Reality 只是修改了TLS，客户端的实现只需要轻度修改完全随机的 session id 和自定义证书验证即可，理论上与大多数 TLS 组合完全兼容。

但这并不适用于 QUIC, 因为 Reality 需要修改的 session id 字段在几乎所有 TCP TLS 的实现上出于兼容目的全部是随机数，但是在 QUIC TLS 上该字段为 0 长度，没有修改的空间。
:::

> `show` : true | false

当值为 `true` 时，输出调试信息。

::: tip
以下为**入站**（**服务端**）配置。
:::

> `target` : string

必填，格式同 VLESS `fallbacks` 的 [dest](./features/fallback.md#fallbackobject)。

旧称 dest, 当前版本两个字段互为alias

如果 target 支持后量子密钥交换算法 X25519MLKEM768, 那么 reality 客户端也会自动使用该后量子算法进行密钥协商。具体是否支持可以使用 `xray tls ping cloudflare.com` (网址更改为dest, 可以带端口号) 检查。

::: warning
为了伪装的效果考虑，Xray对于鉴权失败（非合法reality请求）的流量，会**直接转发**至 target.
如果 target 网站的 IP 地址特殊（如使用了 CloudFlare CDN 的网站） 则相当于你的服务器充当了 CloudFlare 的端口转发，可能造成被扫描后偷跑流量的情况。

为了杜绝这种情况，可以考虑前置 Nginx 等方法过滤掉不符合要求的 SNI。
或者也可以考虑配置 `limitFallbackUpload` 和 `limitFallbackDownload`，限制其速率。
:::

> `xver` : number

选填，格式同 VLESS `fallbacks` 的 [xver](./features/fallback.md#fallbackobject)

> `serverNames` : \[string\]

必填，客户端可用的 `serverName` 列表，暂不支持 \* 通配符。

一般与target保持一致即可，实际的可选值为服务器所接受的任何SNI（依据 target 本身的配置有所不同），一个参考是所返回证书的 [SAN](https://zh.wikipedia.org/wiki/%E4%B8%BB%E9%A2%98%E5%A4%87%E7%94%A8%E5%90%8D%E7%A7%B0).

其中可包含空值 `""` 代表接受没有SNI的连接。

> `privateKey` : string

必填，执行 `./xray x25519` 生成。

> `minClientVer` : string

选填，客户端 Xray 最低版本，格式为 `x.y.z`。

> `maxClientVer` : string

选填，客户端 Xray 最高版本，格式为 `x.y.z`。

> `maxTimeDiff` : number

选填，允许的最大时间差，单位为毫秒。

> `shortIds` : \[string\]

必填，客户端可用的 `shortId` 列表，可用于区分不同的客户端。

格式要求见 `shortId`

若包含空值，客户端 `shortId` 可为空。

> `mldsa65Seed` : string

仅服务端，为发送给 Reality 客户端的证书添加额外的后量子签名所使用的私钥，使用 ML-DSA-65 (如果存在可以破解 x25519 的量子计算机，password 泄露可能导致连接可以被 mitm, 该功能可以防止未来的这种攻击)

使用 `xray mldsa65` 生成使用的公私钥对，服务端配置私钥后只会在证书扩展中添加，不影响旧版客户端或没启用该功能的客户端。

注意，配置该功能后 target 所返回的证书长度**必须**大于 3500, 因为后量子签名会导致 Reality 返回的临时证书变大，为了防止产生特征 target 返回的证书也要很大。 可以使用 `xray tls ping example.com` 进行查看检查。同时为了完美的后量子安全，target 也需要支持后量子密钥交换 X25519MLKEM768, 支持情况一样可以通过前面的命令查看。

> `limitFallbackUpload`/`limitFallbackDownload`

::: warning
警告：对于 REALITY 最佳实践始终是偷同 ASN 的证书，那么你大概率用不到此功能；只有当你迫不得已偷了 Cloudflare 这种免费 CDN 的证书时，为避免你服务器成为别人加速节点时可考虑开启此功能。

回落限速是一种特征，不建议启用，如果您是面板/一键脚本开发者，务必让这些参数随机化。
:::

::: tip
`limitFallbackUpload` 和 `limitFallbackDownload` 为选填，可对未通过验证的回落连接限速，`bytesPerSec` 默认为 0 即不启用。

原理：针对每个未通过验证的回落连接，当传输了 afterBytes 字节后开启限速算法。
限速采用令牌桶算法，桶的容量是 burstBytesPerSec，每传输一个字节用掉一个令牌，初始 burstBytesPerSec 是满的。
每秒以 bytesPerSec 个令牌填充桶，直到容量满。

举例：`afterBytes=10485760`, `burstBytesPerSec=5242880`, `bytesPerSec=1048576` 代表传输 15MB 后开始限速为 1MB/s，如果暂停传输，5 秒后能突发到 5MB/s，然后又恢复到 1MB/s。

建议：过大的 `afterBytes` 和 `burstBytesPerSec` 将起不到限速效果，过小的 `bytesPerSec` 和 `burstBytesPerSec` 则十分容易被探测。
应结合被偷网站的资源大小合理设置参数，如果不允许突发，可以把 `burstBytesPerSec` 设为 0。
:::

> `afterBytes` : number

选填，对回落的 REALITY 连接限速，限制传输指定字节后开始限速，默认为 0。

> `bytesPerSec` : number

选填，对回落的 REALITY 连接限速，限制基准速率（字节/秒），默认为 0 即不启用限速功能。

> `burstBytesPerSec` : number

选填，对回落的 REALITY 连接限速，限制突发速率（字节/秒），大于 `bytesPerSec` 时生效。

::: tip
以下为**出站**（**客户端**）配置。
:::

> `serverName` : string

服务端 serverNames 之一。

当服务端 `serverNames` 中包含空值时，与 TLS 类似可以在客户端使用 `"serverName": "0.0.0.0"` 发起无SNI的连接。与TLS不同，REALITY使用这个功能并不需要开启也没有允许不安全选项。当使用此功能时请确保target在接受无SNI的连接时会返回默认证书。

> `fingerprint` : string

必填，同 [TLSObject](#tlsobject)。

> `shortId` : string

服务端 shortIds 之一。

长度为 8 个字节，即 16 个 0~f 的数字字母，可以小于16个，核心将会自动在后面补0, 但位数必须是**偶数** (因为一个字节有2位16进制数)

如 `aa1234` 会被自动补全为 `aa12340000000000`, 但是`aaa1234` 则会导致错误。

0也是偶数，所以若服务端的 `shordIDs` 包含空值 `""` ，客户端也可为空。

> `password` : string

必填，服务端私钥对应的公钥。使用 `./xray x25519 -i "服务器私钥"` 生成。旧称 publicKey, 为防止误解更名(这个东西地位上确实是 x25519 公钥但是在 Reality 的设计中是客户端持有，不能公开)

> `mldsa65Verify`

可选，mldsa65 签名验证使用的公钥，非空时使用该公钥检查服务端返回的证书，详情见 `"mldsa65Seed"` 的描述。

> `spiderX` : string

爬虫初始路径与参数，建议每个客户端不同。

#### CertificateObject

```json
{
  "ocspStapling": 0,
  "oneTimeLoading": false,
  "usage": "encipherment",
  "buildChain": false,
  "certificateFile": "/path/to/certificate.crt",
  "keyFile": "/path/to/key.key",
  "certificate": [
    "--BEGIN CERTIFICATE--",
    "MIICwDCCAaigAwIBAgIRAO16JMdESAuHidFYJAR/7kAwDQYJKoZIhvcNAQELBQAw",
    "ADAeFw0xODA0MTAxMzU1MTdaFw0xODA0MTAxNTU1MTdaMAAwggEiMA0GCSqGSIb3",
    "DQEBAQUAA4IBDwAwggEKAoIBAQCs2PX0fFSCjOemmdm9UbOvcLctF94Ox4BpSfJ+",
    "3lJHwZbvnOFuo56WhQJWrclKoImp/c9veL1J4Bbtam3sW3APkZVEK9UxRQ57HQuw",
    "OzhV0FD20/0YELou85TwnkTw5l9GVCXT02NG+pGlYsFrxesUHpojdl8tIcn113M5",
    "pypgDPVmPeeORRf7nseMC6GhvXYM4txJPyenohwegl8DZ6OE5FkSVR5wFQtAhbON",
    "OAkIVVmw002K2J6pitPuJGOka9PxcCVWhko/W+JCGapcC7O74palwBUuXE1iH+Jp",
    "noPjGp4qE2ognW3WH/sgQ+rvo20eXb9Um1steaYY8xlxgBsXAgMBAAGjNTAzMA4G",
    "A1UdDwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDATAMBgNVHRMBAf8EAjAA",
    "MA0GCSqGSIb3DQEBCwUAA4IBAQBUd9sGKYemzwPnxtw/vzkV8Q32NILEMlPVqeJU",
    "7UxVgIODBV6A1b3tOUoktuhmgSSaQxjhYbFAVTD+LUglMUCxNbj56luBRlLLQWo+",
    "9BUhC/ow393tLmqKcB59qNcwbZER6XT5POYwcaKM75QVqhCJVHJNb1zSEE7Co7iO",
    "6wIan3lFyjBfYlBEz5vyRWQNIwKfdh5cK1yAu13xGENwmtlSTHiwbjBLXfk+0A/8",
    "r/2s+sCYUkGZHhj8xY7bJ1zg0FRalP5LrqY+r6BckT1QPDIQKYy615j1LpOtwZe/",
    "d4q7MD/dkzRDsch7t2cIjM/PYeMuzh87admSyL6hdtK0Nm/Q",
    "--END CERTIFICATE--"
  ],
  "key": [
    "--BEGIN RSA PRIVATE KEY--",
    "MIIEowIBAAKCAQEArNj19HxUgoznppnZvVGzr3C3LRfeDseAaUnyft5SR8GW75zh",
    "bqOeloUCVq3JSqCJqf3Pb3i9SeAW7Wpt7FtwD5GVRCvVMUUOex0LsDs4VdBQ9tP9",
    "GBC6LvOU8J5E8OZfRlQl09NjRvqRpWLBa8XrFB6aI3ZfLSHJ9ddzOacqYAz1Zj3n",
    "jkUX+57HjAuhob12DOLcST8np6IcHoJfA2ejhORZElUecBULQIWzjTgJCFVZsNNN",
    "itieqYrT7iRjpGvT8XAlVoZKP1viQhmqXAuzu+KWpcAVLlxNYh/iaZ6D4xqeKhNq",
    "IJ1t1h/7IEPq76NtHl2/VJtbLXmmGPMZcYAbFwIDAQABAoIBAFCgG4phfGIxK9Uw",
    "qrp+o9xQLYGhQnmOYb27OpwnRCYojSlT+mvLcqwvevnHsr9WxyA+PkZ3AYS2PLue",
    "C4xW0pzQgdn8wENtPOX8lHkuBocw1rNsCwDwvIguIuliSjI8o3CAy+xVDFgNhWap",
    "/CMzfQYziB7GlnrM6hH838iiy0dlv4I/HKk+3/YlSYQEvnFokTf7HxbDDmznkJTM",
    "aPKZ5qbnV+4AcQfcLYJ8QE0ViJ8dVZ7RLwIf7+SG0b0bqloti4+oQXqGtiESUwEW",
    "/Wzi7oyCbFJoPsFWp1P5+wD7jAGpAd9lPIwPahdr1wl6VwIx9W0XYjoZn71AEaw4",
    "bK4xUXECgYEA3g2o9WqyrhYSax3pGEdvV2qN0VQhw7Xe+jyy98CELOO2DNbB9QNJ",
    "8cSSU/PjkxQlgbOJc8DEprdMldN5xI/srlsbQWCj72wXxXnVnh991bI2clwt7oYi",
    "pcGZwzCrJyFL+QaZmYzLxkxYl1tCiiuqLm+EkjxCWKTX/kKEFb6rtnMCgYEAx0WR",
    "L8Uue3lXxhXRdBS5QRTBNklkSxtU+2yyXRpvFa7Qam+GghJs5RKfJ9lTvjfM/PxG",
    "3vhuBliWQOKQbm1ZGLbgGBM505EOP7DikUmH/kzKxIeRo4l64mioKdDwK/4CZtS7",
    "az0Lq3eS6bq11qL4mEdE6Gn/Y+sqB83GHZYju80CgYABFm4KbbBcW+1RKv9WSBtK",
    "gVIagV/89moWLa/uuLmtApyEqZSfn5mAHqdc0+f8c2/Pl9KHh50u99zfKv8AsHfH",
    "TtjuVAvZg10GcZdTQ/I41ruficYL0gpfZ3haVWWxNl+J47di4iapXPxeGWtVA+u8",
    "eH1cvgDRMFWCgE7nUFzE8wKBgGndUomfZtdgGrp4ouLZk6W4ogD2MpsYNSixkXyW",
    "64cIbV7uSvZVVZbJMtaXxb6bpIKOgBQ6xTEH5SMpenPAEgJoPVts816rhHdfwK5Q",
    "8zetklegckYAZtFbqmM0xjOI6bu5rqwFLWr1xo33jF0wDYPQ8RHMJkruB1FIB8V2",
    "GxvNAoGBAM4g2z8NTPMqX+8IBGkGgqmcYuRQxd3cs7LOSEjF9hPy1it2ZFe/yUKq",
    "ePa2E8osffK5LBkFzhyQb0WrGC9ijM9E6rv10gyuNjlwXdFJcdqVamxwPUBtxRJR",
    "cYTY2HRkJXDdtT0Bkc3josE6UUDvwMpO0CfAETQPto1tjNEDhQhT",
    "--END RSA PRIVATE KEY--"
  ]
}
```

服务端证书，每隔 3600 秒(即一小时)将进行热重载。

> `ocspStapling`: number

OCSP 装订更新间隔，单位为秒，默认值为 0. 任意非 0 值将启用 OCSP 装订且覆盖默认的 3600 秒证书热重载时间(重载的同时执行 OCSP 装订)。

> `oneTimeLoading`: true | false

仅加载一次，默认 false. 值为 `true` 时将关闭证书热重载功能与 OCSP 装订功能。

> `usage`: "encipherment" | "verify" | "issue"

证书用途，默认值为 `"encipherment"`。

- `"encipherment"`：证书用于 TLS 认证和加密。
- `"verify"`：证书用于验证远端 TLS 的证书。当使用此项时，当前证书必须为 CA 证书。
- `"issue"`：证书用于签发其它证书。当使用此项时，当前证书必须为 CA 证书。

::: tip TIP 1
在 Windows 平台上可以将自签名的 CA 证书安装到系统中，即可验证远端 TLS 的证书。
:::

::: tip TIP 2
当有新的客户端请求时，假设所指定的 `serverName` 为 `"xray.com"`，Xray 会先从证书列表中寻找可用于 `"xray.com"` 的证书，如果没有找到，则使用任一 `usage`
为 `"issue"` 的证书签发一个适用于 `"xray.com"` 的证书，有效期为一小时。并将新的证书加入证书列表，以供后续使用。
:::

::: tip TIP 3
当 `certificateFile` 和 `certificate` 同时指定时，Xray 优先使用 `certificateFile`。`keyFile` 和 `key` 也一样。
:::

::: tip TIP 4
当 `usage` 为 `"verify"` 时，`keyFile` 和 `key` 可均为空。
:::

::: tip TIP 5
使用 `xray tls cert` 可以生成自签名的 CA 证书。
:::

::: tip TIP 6
如已经拥有一个域名, 可以使用工具便捷的获取免费第三方证书,如[acme.sh](https://github.com/acmesh-official/acme.sh)
:::

> `buildChain`: true | false

仅当证书用途为 `issue` 时生效，若值为 `true` ，签发证书时将CA证书嵌入证书链。

::: tip TIP 1
不应该将根证书嵌入证书链。该选项只适合在签名CA证书为中间证书时启用。
:::

> `certificateFile`: string

证书文件路径，如使用 OpenSSL 生成，后缀名为 .crt。

> `certificate`: \[ string \]

一个字符串数组，表示证书内容，格式如样例所示。`certificate` 和 `certificateFile` 二者选一。

> `keyFile`: string

密钥文件路径，如使用 OpenSSL 生成，后缀名为 .key。目前暂不支持需要密码的 key 文件。

> `key`: \[ string \]

一个字符串数组，表示密钥内容，格式如样例如示。`key` 和 `keyFile` 二者选一。

### SockoptObject

```json
{
  "mark": 0,
  "tcpMaxSeg": 1440,
  "tcpFastOpen": false,
  "tproxy": "off",
  "domainStrategy": "AsIs",
  "happyEyeballs": {},
  "dialerProxy": "",
  "acceptProxyProtocol": false,
  "tcpKeepAliveInterval": 0,
  "tcpKeepAliveIdle": 300,
  "tcpUserTimeout": 10000,
  "tcpcongestion": "bbr",
  "interface": "wg0",
  "V6Only": false,
  "tcpWindowClamp": 600
  "tcpMptcp": false,
  "addressPortStrategy": "",
  "customSockopt": []
}
```

> `mark`: number

一个整数。当其值非零时，在 outbound 连接上以此数值标记 SO_MARK。

- 仅适用于 Linux 系统。
- 需要 CAP_NET_ADMIN 权限。

> `tcpMaxSeg`: number

用于设置 TCP 数据包的最大传输单元。

> `tcpFastOpen`: true | false | number

是否启用 [TCP Fast Open](https://zh.wikipedia.org/wiki/TCP%E5%BF%AB%E9%80%9F%E6%89%93%E5%BC%80)。

当其值为 `true` 或`正整数`时，启用 TFO；当其值为 `false` 或`负数`时，强制关闭 TFO；当此项不存在或为 `0` 时，使用系统默认设置。 可用于 inbound/outbound。

- 仅在以下版本（或更新版本）的操作系统中可用:
  - Linux 3.16：需要通过内核参数 `net.ipv4.tcp_fastopen` 进行设定，此参数是一个 bitmap，`0x1` 代表客户端允许启用，`0x2` 代表服务器允许启用；默认值为 `0x1`，如果服务器要启用
    TFO，请把此内核参数值设为 `0x3`。
  - ~~Windows 10 (1607)~~（实现不正确）
  - Mac OS 10.11 / iOS 9（需要测试）
  - FreeBSD 10.3 (Server) / 12.0 (Client)：需要把内核参数 `net.inet.tcp.fastopen.server_enabled`
    以及 `net.inet.tcp.fastopen.client_enabled` 设为 `1`。（需要测试）

- 对于 Inbound，此处所设定的`正整数`代表 [待处理的 TFO 连接请求数上限](https://tools.ietf.org/html/rfc7413#section-5.1) ，**注意并非所有操作系统都支持在此设定**：
  - Linux / FreeBSD：此处的设定的`正整数`值代表上限，可接受的最大值为 2147483647，为 `true` 时将取 `256`；注意在 Linux，`net.core.somaxconn`
    会限制此值的上限，如果超过了 `somaxconn`，请同时提高 `somaxconn`。
  - Mac OS：此处为 `true` 或`正整数`时，仅代表启用 TFO，上限需要通过内核参数 `net.inet.tcp.fastopen_backlog` 单独设定。
  - Windows：此处为 `true` 或`正整数`时，仅代表启用 TFO。

- 对于 Outbound，设定为 `true` 或`正整数`在任何操作系统都仅表示启用 TFO。

> `tproxy`: "redirect" | "tproxy" | "off"

是否开启透明代理（仅适用于 Linux）。

- `"redirect"`：使用 Redirect 模式的透明代理。支持所有基于 IPv4/6 的 TCP 连接。
- `"tproxy"`：使用 TProxy 模式的透明代理。支持所有基于 IPv4/6 的 TCP 和 UDP 连接。
- `"off"`：关闭透明代理。

透明代理需要 Root 或 `CAP_NET_ADMIN` 权限。

::: danger
当 [Dokodemo-door](./inbounds/tunnel.md) 中指定了 `followRedirect`为`true`，且 Sockopt 设置中的`tproxy` 为空时，Sockopt
设置中的`tproxy` 的值会被设为 `"redirect"`。
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

在之前的版本中，当 Xray 尝试使用域名建立系统连接时，域名的解析由系统完成，不受 Xray
控制。这导致了在 [非标准 Linux 环境中无法解析域名](https://github.com/v2ray/v2ray-core/issues/1909) 等问题。为此，Xray 1.3.1 为 Sockopt 引入了 Freedom
中的 domainStrategy，解决了此问题。

默认值 `"AsIs"`。

当目标地址为域名时，配置相应的值，Outbound 连接远端服务器的行为模式如下：

- 当使用 `"AsIs"` 时，Xray 将直接使用 go 自带的 Dial 发起连接，优先级固定为 RFC6724 的默认值(不会遵守 gai.conf 等配置) (人话：IPv6 优先)。
- 当填写其他值时，将使用 Xray-core [内置 DNS 服务器](dns.md) 服务器进行解析。若不存在DNSObject，则使用系统DNS。若有多个符合条件的IP地址时，核心会随机选择一个IP作为目标IP。
- `"IPv4"` 代表尝试仅使用IPv4进行连接，`"IPv4v6"` 代表尝试使用IPv4或IPv6连接，但对于双栈域名，使用IPv4。（v4v6调换后同理，不再赘述）
- 当在内置DNS设置了 `"queryStrategy"` 后，实际行为将会与这个选项取并，只有都被包含的IP类型才会被解析，如 `"queryStrategy": "UseIPv4"` `"domainStrategy": "UseIP"`，实际上等同于 `"domainStrategy": "UseIPv4"`。
- 当使用 `"Use"` 开头的选项时，若解析结果不符合要求（如，域名只有IPv4解析结果但使用了UseIPv6），则会回落回AsIs。
- 当使用 `"Force"` 开头的选项时，若解析结果不符合要求，则该连接会无法建立。

::: tip TIP
当使用 `"UseIP"`、`"ForceIP"` 模式时，并且 [出站连接配置](outbound.md#outboundobject) 中指定了 `sendThrough` 时，核心会根据 `sendThrough` 的值自动判断所需的 IP 类型，IPv4 或 IPv6。若手动指定了单种IP类型（如UseIPv4），但与 `sendThrough` 指定的本地地址不匹配，将会导致连接失败。
:::

::: danger

启用了此功能后，不当的配置可能会导致死循环。

一句话版本：连接到服务器，需要等待 DNS 查询结果；完成 DNS 查询，需要连接到服务器。

> Tony: 先有鸡还是先有蛋?

详细解释：

1. 触发条件：代理服务器（proxy.com）。内置 DNS 服务器，非 Local 模式。
2. Xray 尝试向 proxy.com 建立 TCP 连接 **前** ，通过内置 DNS 服务器查询 proxy.com。
3. 内置 DNS 服务器向 dns.com 建立连接，并发送查询，以获取 proxy.com 的 IP。
4. **不当的** 的路由规则，导致 proxy.com 代理了步骤 3 中发出的查询。
5. Xray 尝试向 proxy.com 建立另一个 TCP 连接。
6. 在建立连接前，通过内置 DNS 服务器查询 proxy.com。
7. 内置 DNS 服务器复用步骤 3 中的连接，发出查询。
8. 问题出现。步骤 3 中连接的建立，需要等待步骤 7 中的查询结果；步骤 7 完成查询，需要等待步骤 3 中的连接完全建立。
9. Good Game！

解决方案：

- 改内置 DNS 服务器的分流。
- 用 Hosts。
- ~~如果你还是不知道解决方案，就别用这个功能了。~~

因此，**不建议** 经验不足的用户擅自使用此功能。
:::

> `dialerProxy`: ""

一个出站代理的标识。当值不为空时，将使用指定的 outbound 发出连接。 此选项可用于支持底层传输方式的链式转发。

::: danger
此选项与 ProxySettingsObject.Tag 不兼容
:::

> `acceptProxyProtocol`: true | false

仅用于 inbound，指示是否接收 PROXY protocol。

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) 专用于传递请求的真实来源 IP 和端口，**若你不了解它，请先忽略该项**。

常见的反代软件（如 HAProxy、Nginx）都可以配置发送它，VLESS fallbacks xver 也可以发送它。

填写 `true` 时，最底层 TCP 连接建立后，请求方必须先发送 PROXY protocol v1 或 v2，否则连接会被关闭。

> `tcpKeepAliveIdle`: number

TCP 空闲时间阈值，单位为秒。当 TCP 连接空闲时间达到这个阈值时，将开始发送 Keep-Alive 探测包。

对于出站, xray 使用 Chrome 的默认值 idle 与 interval 均为 45s, 该选项与 `tcpKeepAliveInterval` 任意一个设置为负数将禁用该默认 keepalive, 正数则会覆盖该默认值。

对于入站, Keep-Alive 默认禁用，该选项与 `tcpKeepAliveInterval` 任意一个非零时启用，如果只设置二者之一那么另一个将跟随操作系统设置。

> `tcpKeepAliveInterval`: number

TCP 进入 Keep-Alive 状态后发送 Keep-Alive 数据包间的时间间隔，单位为秒。其他行为见上。

> `tcpUserTimeout`: number

单位为毫秒。详细介绍：https://github.com/grpc/proposal/blob/master/A18-tcp-user-timeout.md

> `tcpcongestion`: ""

TCP 拥塞控制算法。仅支持 Linux。
不配置此项表示使用系统默认值。

::: tip 常见的算法

- bbr（推荐）
- cubic
- reno

:::

::: tip
执行命令 `sysctl net.ipv4.tcp_congestion_control` 获取系统默认值。
:::

> `interface`: ""

指定绑定出口网卡名称，支持 linux / iOS / Mac OS / Windows。

> `V6Only`: true | false

填写 `true` 时，监听 `::` 地址仅接受 IPv6 连接。仅支持 Linux。

> `tcpWindowClamp`: number

绑定通告的 windows 大小为该值。内核会在它与 SOCK_MIN_RCVBUF/2 之间选一个最大值。

> `tcpMptcp`: true | false

默认值 `false`，填写 `true` 时，启用 [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP)，仅客户端参数，因为 golang 在 1.24+ 版本已默认在监听时启用 MPTCP.
当前仅支持Linux，需要Linux Kernel 5.6及以上。

> `tcpNoDelay`: true | false

该选项已被删除，因为 golang 默认启用 TCP no delay。 相反地，如果想要禁用，请通过使用 customSockopt 禁用。

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

使用 SRV 记录或 TXT 记录指定出站使用的目标地址/端口，默认 `none` 即关闭

查询直接通过系统DNS而不是Xray的内置DNS, 尝试去查询的域名将会是出站中的域名。如果查询失败请求会按原地址和端口发出

`Srv` 开头代表查询 SRV 记录(标准格式), `Txt` 开头代表查询 TXT 记录(格式形如 `127.0.0.1:80`)

`PortOnly` 仅重置端口 `AddressOnly` 仅重置地址 `PortAndAddress` 则重置地址和端口

该选项生效在 sockopt 里的 domainStrategy 解析之前，地址重置后仍会按 domainStrategy 的规则进行解析(如果有), 但是在 Freedom 的 domainStrategy 之后，如果在其中设置了解析为 IP 则本选项无法生效。

PS: 如果有正常上网的域名流量被 AsIs 的 freedom 出站送过来，那么在此设置后会尝试解析并重置地址和端口，比如核心会尝试查询 google.com 的 SRV 记录并按记录重置目标。

> `customSockopt`: []

一个数组，用于高级用户指定需要的任何 sockopt, 理论上上述所有与连接有关的设置均可以在此等价设置, 自然也可以设置存在但是核心未添加的其他选项。目前支持 Linux Winows Darwin 操作系统。下方示例等价于核心中的 `"tcpcongestion": "bbr"`

使用前请确保你了解 Socket 编程。

```json
"customSockopt": [
  {
    "system": "linux",
    "type": "str",
    "level":"6",
    "opt": "13",
    "value": "bbr"
  }
]
```

> `system`: ""

可选，指定生效的系统，如果运行的系统不匹配则跳过该 sockopt. 目前可选 `linux` `windows` `darwin` (全部小写). 若留空则直接执行

> `type`: ""

必填，设置的类型，目前可选int或str.

> `level`: ""

可选，协议级别，用于指定生效范围，默认为6, 即TCP.

> `opt`: ""

操作的选项名称，使用十进制(此处示例为 TCP_CONGESTION 的值 定义为 0xd 转换为10进制即为13)

> `value`: ""

要设置的选项值，此处示例为设置为bbr.

当 type 指定为 int 时需要使用十进制数字。

> `happyEyeballs`: map

RFC-8305 实现的 happyEyeballs 仅适用于 TCP, 当目标为域名时对它们竞速并选择第一个成功的返回，当 `domainStrategy` 被设置为 `UseIP`/`ForceIP` (包括它们的v4/v6/v4v6版本，但这会使可用的IP列表被缩减到仅剩v4或v6，不推荐这么用)

::: warning
使用这个功能时不要使用 `Freedom` 出站的 `domainStrategy`, 这会导致 `Sockopt` 只能看到被替换完毕的 IP.
:::

```json
"happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4,
}
```

> `tryDelayMs`: number

每个竞速请求发起时间的间隔，单位毫秒，默认为0(代表禁用该功能)，推荐值为 250.

> `prioritizeIPv6`: bool

排序 IP 时首个 IP 的类型，默认为 false (即 IPv4 会被排在第一个)

> `interleave`: number

RFC-8305 中的 "First Address Family count", 默认值为 1. 它定义了对不同IP版本进行排序时的交错行为。

比如等待 dial 的 IP 队列会被排序为 46464646 (设置为1) 44664466 (设置为2) (6 代表 IPv6 地址, 4 代表 IPv4 地址).

> `maxConcurrentTry`: number

最大并发数量，用于防止解析出的IP过多且均未成功时候核心也对这些IP产生大量连接。默认为4, 设置为0代表禁用 happyEyeballs.
