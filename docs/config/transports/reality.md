# REALITY

REALITY 是对 TLS 的一种修改，通过借用目标站点的 TLS 外观与握手特征来完成伪装。

:::: tip
REALITY 是目前最安全的传输安全方案之一, 且外部看来流量类型和正常上网具有一致性。<br>
启用 REALITY 并且配置合适的 XTLS Vision 流控模式, 可以达到数倍甚至十几倍的性能提升。

::: details 致开发者
REALITY 只是修改了 TLS，客户端的实现只需要轻度修改完全随机的 session id 和自定义证书验证即可，理论上与大多数 TLS 组合完全兼容。
更多信息请参考 [REALITY 项目](https://github.com/XTLS/REALITY).
:::
::::

## RealityObject

`RealityObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `realitySettings` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "security": "reality",
        "realitySettings": {
          // [!code focus:28]
          // 入站（服务端）配置
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
          // 出站（客户端）配置
          "serverName": "",
          "fingerprint": "chrome",
          "password": "",
          "shortId": "",
          "mldsa65Verify": "",
          "spiderX": ""
        }
      }
    }
  ]
}
```

> `show` : true | false

当值为 `true` 时，输出调试信息。

::: tip
以下为**入站**（**服务端**）配置。
:::

> `target` : string

必填，格式同 VLESS `fallbacks` 的 [dest](../features/fallback.md#fallbackobject)。

旧称 dest, 当前版本两个字段互为alias

如果 target 支持后量子密钥交换算法 X25519MLKEM768, 那么 REALITY 客户端也会自动使用该后量子算法进行密钥协商。具体是否支持可以使用 `xray tls ping cloudflare.com` (网址更改为dest, 可以带端口号) 检查。

核心按照这个字段是否存在区分是当前是客户端还是服务端配置，不要在客户端填写，否则会造成识别异常。

::: warning
为了伪装的效果考虑，Xray 对于鉴权失败（非合法 REALITY 请求）的流量，会**直接转发**至 target.
如果 target 网站的 IP 地址特殊（如使用了 CloudFlare CDN 的网站） 则相当于你的服务器充当了 CloudFlare 的端口转发，可能造成被扫描后偷跑流量的情况。

为了杜绝这种情况，可以考虑前置 Nginx 等方法过滤掉不符合要求的 SNI。
或者也可以考虑配置 `limitFallbackUpload` 和 `limitFallbackDownload`，限制其速率。
:::

> `xver` : number

选填，格式同 VLESS `fallbacks` 的 [xver](../features/fallback.md#fallbackobject)

> `serverNames` : \[string\]

必填，客户端可用的 `serverName` 列表，不支持 \* 通配符。

一般与 target 保持一致即可，实际的可选值为服务器所接受的任何 SNI（依据 target 本身的配置有所不同），一般是参考是所返回证书的 [SAN](https://zh.wikipedia.org/wiki/%E4%B8%BB%E9%A2%98%E5%A4%87%E7%94%A8%E5%90%8D%E7%A7%B0).

其中可包含空值 `""` 代表接受没有SNI的连接。使用此特性不要求 `target` 具有 IP 证书，只需确保在收到无 SNI 的 Client Hello 其不会拒绝连接。使用这一特性时客户端 `serverName` 不能为空，需要填入任意有效 IP 地址占位。

可以使用 `xray tls ping` 观察服务端对无 SNI 请求的响应行为。

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

仅服务端，为发送给 REALITY 客户端的证书添加额外的后量子签名所使用的私钥，使用 ML-DSA-65 (如果存在可以破解 x25519 的量子计算机，password 泄露可能导致连接可以被 mitm, 该功能可以防止未来的这种攻击)

使用 `xray mldsa65` 生成使用的公私钥对，服务端配置私钥后只会在证书扩展中添加，不影响旧版客户端或没启用该功能的客户端。

注意，配置该功能后 target 所返回的证书长度**必须**大于 3500, 因为后量子签名会导致 REALITY 返回的临时证书变大，为了防止产生特征 target 返回的证书也要很大。 可以使用 `xray tls ping example.com` 进行查看检查。同时为了完美的后量子安全，target 也需要支持后量子密钥交换 X25519MLKEM768, 支持情况一样可以通过前面的命令查看。

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

服务端 `serverNames` 之一。

特别地，客户端可以将其设置为任意 IP 地址，Xray 将会发送无 SNI 扩展的 Client Hello. 要使用这一特性请确保服务端 `serverNames` 中包含空值 `""`。

> `fingerprint` : string

必填，同 [TLSObject](./tls.md#tlsobject)。 注意：此处不支持使用 `unsafe` 禁用 utls, 因为 REALITY 协议实现使用了该库以操作底层 TLS 参数。

> `shortId` : string

服务端 shortIds 之一。

长度为 8 个字节，即 16 个 0~f 的数字字母，可以小于16个，核心将会自动在后面补0, 但位数必须是**偶数** (因为一个字节有2位16进制数)

如 `aa1234` 会被自动补全为 `aa12340000000000`, 但是`aaa1234` 则会导致错误。

0也是偶数，所以若服务端的 `shordIDs` 包含空值 `""` ，客户端也可为空。

> `password` : string

必填，服务端私钥对应的公钥。使用 `./xray x25519 -i "服务器私钥"` 生成。旧称 publicKey, 为防止误解更名(这个东西地位上确实是 x25519 公钥但是在 REALITY 的设计中是客户端持有，不能公开)

> `mldsa65Verify`

可选，mldsa65 签名验证使用的公钥，非空时使用该公钥检查服务端返回的证书，详情见 `"mldsa65Seed"` 的描述。

> `spiderX` : string

爬虫初始路径与参数，建议每个客户端不同。
