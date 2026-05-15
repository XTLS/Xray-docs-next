# TLS

TLS 是常见的传输层加密方式。

可用于为传输层提供加密、证书校验与客户端指纹等相关配置。

支持与 `RAW`、`XHTTP`、`mKCP`、`gRPC`、`WebSocket`、`HTTPUpgrade`、`Hysteria` 传输方式组合使用。

## TLSObject

`TLSObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `tlsSettings` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "security": "tls",
        "tlsSettings": {
          // [!code focus:18]
          "serverName": "xray.com",
          "verifyPeerCertByName": "",
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
          "pinnedPeerCertSha256": "",
          "curvePreferences": [""],
          "masterKeyLog": "",
          "echServerKeys": "",
          "echConfigList": "",
          "echSockopt": {}
        }
      }
    }
  ]
}
```

> `serverName`: string

服务器名称，服务器端证书的 SAN 中需要包含该值，可以是域名或者 IP 地址。当为域名时将在 Client Hello 中的 SNI 扩展中发送，IP 地址则不会发送 SNI 扩展（SNI 扩展不允许包含 IP 地址）。如果填入 IPv6 要使用 `[]` 包裹

当留空时，自动使用 address 中的值（如果是域名）。

特殊值 `"FromMitM"`, 这会使其使用入来自 dokodemo-door 入站解密的 TLS 中包含的 SNI.

> `verifyPeerCertByName`: string

仅客户端，用于校验证书使用的 SNI，可以用 `,` 分割多个域名(只需要证书中有一个 SAN 在该列表中即可), 将会覆盖本用于校验的 `serverName`, 用于域前置等特殊目的。

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
~~出于安全性考虑，这个选项不应该在实际场景中选择 true，否则可能遭受中间人攻击。~~

该选项已被弃用，使用 `pinnedPeerCertSha256` 手动指定需要的证书。
:::

> `disableSystemRoot`: true | false

是否禁用操作系统自带的 CA 证书。默认值为 `false`。

当值为 `true` 时，Xray 只会使用 `certificates` 中指定的证书进行 TLS 握手。当值为 `false` 时，Xray 只会使用操作系统自带的 CA 证书进行 TLS 握手。

> `enableSessionResumption`: true | false

是否启用会话恢复，默认禁用，只有服务端和客户端都启用时候才会尝试协商会话恢复。

如果协商成功将可以不在握手过程中传输证书。稍微节省一点点握手时间（几乎可以忽略不计）

注意，这不是 TLS 0RTT, gotls 尚未支持此功能，这不会减少 TLS 握手的 RTT.

> `fingerprint` : string

此参数用于配置指定 `TLS Client Hello` 的指纹。默认值为 `chrome` 要恢复为原生 go TLS, 请设置为 `unsafe`. 启用后，Xray 将通过 uTLS 库 **模拟** `TLS` 指纹，或随机生成。支持三种配置方式：

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
指纹与行为，可以使用 [Browser Dialer](./websocket.md#browser-dialer)。
:::

::: tip
当使用此功能时，TLS 的部分影响TLS指纹的选项将被 utls 库覆盖不再生效。
会被传递的参数有：`"serverName" "disableSystemRoot" "pinnedPeerCertSha256" "masterKeyLog"`

针对 ALPN 则有特殊行为。

默认强制使用最常见的 `h2,http/1.1` 作为 ALPN。对于 WebSocket 和 HttpUpgrade 传输则默认使用 `http/1.1`, 否则协商到 `h2` 会导致无法连接，但允许手动设置到 `h2,http/1.1`，如果确信服务器支持使用这个 ALPN 完成握手。

如果 ECH 启用，则 outer 无论如何都会显示为 `h2,http/1.1`，而 inner 如果是 WebSocket 或 HttpUpgrade 则会强制置 `http/1.1` 以便完成握手，其他协议则会尊重用户配置的 ALPN。
:::

> `pinnedPeerCertSha256`: string

用于指定远程服务器的证书 SHA256 散列值，使用 hex 且大小写不敏感。如 `e8e2d387fdbffeb38e9c9065cf30a97ee23c0e3d32ee6f78ffae40966befccc9`，可以使用 `,` 连接更多的散列值，匹配到任何一个即通过验证。

该编码与 Chrome 证书查看器 SHA-256 证书指纹，以及 crt.sh 的 Certificate Fingerprints SHA-256 格式均相同。可以使用 `xray tls hash --cert <cert.pem>` 进行计算，也可以使用 `openssl x509 -noout -fingerprint -sha256 -in cert.pem` （兼容它生成的带冒号的格式）， `xray tls ping` 同样会输出远程证书的 SHA256 散列值。

该验证将覆盖默认的证书校验，分两种情况：

- 1.当核心找到匹配的散列值为叶子证书，验证直接通过。
- 2.当核心找到匹配的值为 CA 证书（可以是根证书也可以是中级证书），将使用 `serverName` 里的值验证叶子证书上的签名是否来自该 CA 授权。

> `certificates`: \[ [CertificateObject](#certificateobject) \]

证书列表，其中每一项表示一个证书（建议 fullchain）。

::: tip
如果要在 ssllibs 或者 myssl 获得 A/A+ 等级的评价,
请参考 [这里](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `curvePreferences`: \[ string \]

一个字符串数组，指定 TLS 握手执行ECDHE时支持的曲线。支持的曲线列表如下（大小写不敏感）.

```
CurveP256
CurveP384
CurveP521
X25519
X25519MLKEM768
SecP256r1MLKEM768*
SecP384r1MLKEM1024*
```

\*: 未被 utls 支持

默认值截止至 go1.26 为包含上述全部曲线。调整顺序并不会使客户端或者服务器偏好使用哪种曲线，实际曲线将由密钥交换机制自行协商。

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

> `echSockopt` : [SockoptObject](./sockopt.md#sockoptobject)

调整使用 DNS 查询 ECH 记录时使用的连接的底层 socket 选项。

### CertificateObject

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
