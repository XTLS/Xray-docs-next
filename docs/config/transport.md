# 传输方式

传输方式（transport）是当前 Xray 节点和其它节点对接的方式。

传输方式指定了稳定的数据传输的方式。通常来说，一个网络连接的两端需要有对称的传输方式。比如一端用了 WebSocket，那么另一个端也必须使用 WebSocket，否则无法建立连接。

传输方式（transport）配置有两部分: 
1. 全局配置（[TransportObject](#transportobject)）
2. 局部配置（[StreamSettingsObject](#streamsettingsobject)）。
  - 局部配置时,可以指定每个单独的入站或出站用怎样的方式传输。
  - 通常来说客户端和服务器对应的入站和出站需要使用同样的传输方式。当其配置指定了一种传输方式，但没有填写具体设置时，此传输方式会使用全局配置中的设置。


## TransportObject

`TransportObject` 对应配置文件的 `transport` 项。

```json
{
  "transport": {
    "tcpSettings": {},
    "kcpSettings": {},
    "wsSettings": {},
    "httpSettings": {},
    "quicSettings": {},
    "dsSettings": {},
    "grpcSettings": {}
  }
}
```

> `tcpSettings`: [TcpObject](./transports/tcp.md)

针对 TCP 连接的配置。

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

针对 mKCP 连接的配置。

> `wsSettings`: [WebSocketObject](./transports/websocket).md

针对 WebSocket 连接的配置。

> `httpSettings`: [HttpObject](./transports/h2.md)

针对 HTTP/2 连接的配置。

> `quicSettings`: [QuicObject](./transports/quic.md)

针对 QUIC 连接的配置。

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

针对 gRPC 连接的配置。

> `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

针对 Domain Socket 连接的配置。


## StreamSettingsObject

`StreamSettingsObject` 对应入站或出站中的 `streamSettings` 项。每一个入站或出站都可以分别配置不同的传输配置，都可以设置 `streamSettings` 来进行一些传输的配置。

```json
{
    "network": "tcp",
    "security": "none",
    "tlsSettings": {},
    "xtlsSettings": {},
    "tcpSettings": {},
    "kcpSettings": {},
    "wsSettings": {},
    "httpSettings": {},
    "quicSettings": {},
    "dsSettings": {},
    "grpcSettings": {},
    "sockopt": {
        "mark": 0,
        "tcpFastOpen": false,
        "tproxy": "off",
        "domainStrategy": "AsIs",
        "dialerProxy": ""
    }
}
```

>  `network`: "tcp" | "kcp" | "ws" | "http" | "domainsocket" | "quic"

连接的数据流所使用的传输方式类型，默认值为 `"tcp"`

>  `security`: "none" | "tls" | "xtls" 

是否启用传输层加密，支持的选项有 
- `"none"` 表示不加密（默认值）
- `"tls"` 表示使用 [TLS](https://en.wikipedia.org/wiki/base/transport_Layer_Security)。
- `"xtls"` 表示使用 [XTLS](./features/xtls.md)。

>  `tlsSettings`: [TLSObject](#tlsobject)

TLS 配置。TLS 由 Golang 提供，通常情况下TLS协商的结果为使用 TLS 1.3，不支持 DTLS。  

>  `xtlsSettings`: [XTLSObject](#tlsobject)

XTLS 配置。XTLS 是 Xray 的原创黑科技, 也是使 Xray 性能一骑绝尘的核心动力。
XTLS 与 TLS 有相同的安全性, 配置方式也和TLS一致. 点击此处查看 [XTLS的技术细节剖析](./features/xtls.md)

::: danger
TLS / XTLS 是目前最安全的传输加密方案, 且外部看来流量类型和正常上网具有一致性。
启用 XTLS 并且配置合适的XTLS流控模式, 可以在保持和 TLS 相同的安全性的前提下, 性能达到数倍甚至十几倍的提升。
当 `security` 的值从 `tls` 改为 `xtls` 时, 只需将 `tlsSettings` 修改成为 `xtlsSettings`
:::

>  `tcpSettings`: [TcpObject](./transports/tcp.md)

当前连接的 TCP 配置，仅当此连接使用 TCP 时有效。配置内容与上面的全局配置相同。

>  `kcpSettings`: [KcpObject](./transports/mkcp.md)

当前连接的 mKCP 配置，仅当此连接使用 mKCP 时有效。配置内容与上面的全局配置相同。

>  `wsSettings`: [WebSocketObject](./transports/websocket.md)

当前连接的 WebSocket 配置，仅当此连接使用 WebSocket 时有效。配置内容与上面的全局配置相同。

>  `httpSettings`: [HttpObject](./transports/h2.md)

当前连接的 HTTP/2 配置，仅当此连接使用 HTTP/2 时有效。配置内容与上面的全局配置相同。

>  `quicSettings`: [QUICObject](./transports/quic.md)

当前连接的 QUIC 配置，仅当此连接使用 QUIC 时有效。配置内容与上面的全局配置相同。

>  `grpcSettings`: [GRPCObject](./transports/grpc.md)

当前连接的 gRPC 配置，仅当此连接使用 gRPC 时有效。配置内容与上面的全局配置相同。

>  `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

当前连接的 Domain socket 配置，仅当此连接使用 Domain socket 时有效。配置内容与上面的全局配置相同。

>  `sockopt`: [SockoptObject](#sockoptobject)

透明代理相关的具体配置。


### TLSObject

```json
{
    "serverName": "xray.com",
    "allowInsecure": false,
    "alpn": [
        "h2",
        "http/1.1"
    ],
    "minVersion": "1.2",
    "maxVersion": "1.3",
    "preferServerCipherSuites": true,
    "cipherSuites": "此处填写你需要的加密套件名称,每个套件名称之间用:进行分隔",
    "certificates": [],
    "disableSystemRoot": false,
    "enableSessionResumption": false
}
```

>  `serverName`: string

指定服务器端证书的域名，在连接由 IP 建立时有用。

当目标连接由域名指定时，比如在 Socks 入站接收到了域名，或者由 Sniffing 功能探测出了域名，这个域名会自动用于 `serverName`，无须手动配置。

>  `alpn`: \[ string \]

一个字符串数组，指定了 TLS 握手时指定的 ALPN 数值。默认值为 `["h2", "http/1.1"]`。

>  `minVersion`: \[ string \]

minVersion为可接受的最小SSL/TLS版本。

>  `maxVersion`: \[ string \]

maxVersion为可接受的最大SSL/TLS版本。

>  `preferServerCipherSuites`: true | false

指示服务器选择客户端最喜欢的密码套件 或 服务器最优选的密码套件。

如果为true则为使用服务器的最优选的密码套件

>  `cipherSuites`: \[ string \]

CipherSuites用于配置受支持的密码套件列表, 每个套件名称之间用:进行分隔. 

你可以在 [这里](https://golang.org/src/crypto/tls/cipher_suites.go#L500 )或 [这里](https://golang.org/src/crypto/tls/cipher_suites.go#L44) 找到golang加密套件的名词和说明

::: danger
以上两项配置为非必要选项，正常情况下不影响安全性
在未配置的情况下golang根据设备自动选择. 
若不熟悉, 请勿配置此选项, 填写不当引起的问题自行负责
:::

>  `allowInsecure`: true | false

是否允许不安全连接（仅用于客户端）。默认值为 `false`。

当值为 `true` 时，Xray 不会检查远端主机所提供的 TLS 证书的有效性。

::: danger
出于安全性考虑，这个选项不应该在实际场景中选择true，否则可能遭受中间人攻击。
:::

>  `disableSystemRoot`: true | false

是否禁用操作系统自带的 CA 证书。默认值为 `false`。

当值为 `true` 时，Xray 只会使用 `certificates` 中指定的证书进行 TLS 握手。当值为 `false` 时，Xray 只会使用操作系统自带的 CA 证书进行 TLS 握手。

>  `enableSessionResumption`: true | false

此参数的设置为false时, ClientHello 里没有 session_ticket 这个扩展。
通常来讲 go 语言程序的 ClientHello 里并没有用到这个扩展, 因此建议保持默认值。
默认值为 `false`。

>  `certificates`: \[ [CertificateObject](#certificateobject) \]

证书列表，其中每一项表示一个证书（建议 fullchain）。

::: tip
如果要在 ssllibs 或者 myssl 获得 A/A+ 等级的评价, 请参考 [这里](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::


#### CertificateObject

```json
{
    "ocspStapling": 3600,
    "usage": "encipherment",
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
>  `ocspStapling`: number  

ocspStapling 检查更新时间间隔。 单位：秒

>  `usage`: "encipherment" | "verify" | "issue"

证书用途，默认值为 `"encipherment"`。

* `"encipherment"`：证书用于 TLS 认证和加密。
* `"verify"`：证书用于验证远端 TLS 的证书。当使用此项时，当前证书必须为 CA 证书。
* `"issue"`：证书用于签发其它证书。当使用此项时，当前证书必须为 CA 证书。

::: tip TIP 1
在 Windows 平台上可以将自签名的 CA 证书安装到系统中，即可验证远端 TLS 的证书。
:::

::: tip TIP 2
当有新的客户端请求时，假设所指定的 `serverName` 为 `"xray.com"`，Xray 会先从证书列表中寻找可用于 `"xray.com"` 的证书，如果没有找到，则使用任一 `usage` 为 `"issue"` 的证书签发一个适用于 `"xray.com"` 的证书，有效期为一小时。并将新的证书加入证书列表，以供后续使用。
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

>  `certificateFile`: string

证书文件路径，如使用 OpenSSL 生成，后缀名为 .crt。

>  `certificate`: \[ string \]

一个字符串数组，表示证书内容，格式如样例所示。`certificate` 和 `certificateFile` 二者选一。

>  `keyFile`: string

密钥文件路径，如使用 OpenSSL 生成，后缀名为 .key。目前暂不支持需要密码的 key 文件。

>  `key`: \[ string \]

一个字符串数组，表示密钥内容，格式如样例如示。`key` 和 `keyFile` 二者选一。


### SockoptObject

```json
{
    "mark": 0,
    "tcpFastOpen": false,
    "tproxy": "off",
    "domainStrategy": "AsIs",
    "dialerProxy": ""
}
```

>  `mark`: number

一个整数。当其值非零时，在ountbound连接以此数值上标记 SO_MARK。

* 仅适用于 Linux 系统。
* 需要 CAP_NET_ADMIN 权限。

>  `tcpFastOpen`: true | false

是否启用 [TCP Fast Open](https://zh.wikipedia.org/wiki/TCP%E5%BF%AB%E9%80%9F%E6%89%93%E5%BC%80)。

当其值为 `true` 时，强制开启 TFO；当其值为 `false` 时，强制关闭 TFO；当此项不存在时，使用系统默认设置。
可用于inbound/ountbound。

* 仅在以下版本（或更新版本）的操作系统中可用:
  * Windows 10 (1604)
  * Mac OS 10.11 / iOS 9
  * Linux 3.16：系统已默认开启，无需配置。

>  `tproxy`: "redirect" | "tproxy" | "off"

是否开启透明代理（仅适用于 Linux）。

* `"redirect"`：使用 Redirect 模式的透明代理。支持所有基于 IPv4/6 的 TCP 和 UDP 连接。
* `"tproxy"`：使用 TProxy 模式的透明代理。支持所有基于 IPv4/6 的 TCP 和 UDP 连接。
* `"off"`：关闭透明代理。

透明代理需要 Root 或 `CAP\_NET\_ADMIN` 权限。

::: danger
当 [Dokodemo-door](./inbounds/dokodemo.md) 中指定了 `followRedirect`为`true`，且 Sockopt设置中的`tproxy` 为空时，Sockopt设置中的`tproxy` 的值会被设为 `"redirect"`。
:::

>  `domainStrategy`: "AsIs" | "UseIP" | "UseIPv4" | "UseIPv6"

在之前的版本中，当 Xray 尝试使用域名建立系统连接时，域名的解析由系统完成，不受 Xray 控制。这导致了在 [非标准Linux环境中无法解析域名](https://github.com/v2ray/v2ray-core/issues/1909) 等问题。为此，Xray 1.3.1 为 Sockopt 引入了 Freedom 中的 domainStrategy，解决了此问题。

在目标地址为域名时, 配置相应的值, SysteDailer 的行为模式如下:
- `"AsIs"`: 通过系统DNS服务器解析获取IP, 向此域名发出连接。
- `"UseIP"`、`"UseIPv4"` 和 `"UseIPv6"`: 使用[内置 DNS 服务器](./dns.md)解析获取IP后, 直接向此IP发出连接。

默认值为 `"AsIs"`。

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

>  `dialerProxy`: ""

一个出站代理的标识。当值不为空时，将使用指定的 outbound 发出连接。
此选项可用于支持底层传输方式的链式转发。

::: danger
此选项与 PorxySettingsObject.Tag 不兼容
:::

