# Transport

Transports specify how Xray communicates with peers.

Transports specify how to achieve stable data transmission. Both ends of a connection often need to specify the same transport protocol to successfully establish a connection. Like, if one end uses WebSocket, the other end must also use WebSocket, or else the connection cannot be established.

## StreamSettingsObject

`StreamSettingsObject` corresponds to the `streamSettings` property in the inbound or outbound config. Each inbound or outbound can be configured with different transports and can use `streamSettings` to specify local configs.

```json
{
  "network": "tcp",
  "security": "none",
  "tlsSettings": {},
  "realitySettings": {},
  "tcpSettings": {},
  "kcpSettings": {},
  "wsSettings": {},
  "httpSettings": {},
  "grpcSettings": {},
  "httpupgradeSettings": {},
  "xhttpSettings": {},
  "sockopt": {
    "mark": 0,
    "tcpMaxSeg": 1440,
    "tcpFastOpen": false,
    "tproxy": "off",
    "domainStrategy": "AsIs",
    "dialerProxy": "",
    "acceptProxyProtocol": false,
    "tcpKeepAliveInterval": 0,
    "tcpKeepAliveIdle": 300,
    "tcpUserTimeout": 10000,
    "tcpCongestion": "bbr",
    "interface": "wg0",
    "v6only": false,
    "tcpWindowClamp": 600,
    "tcpMptcp": false,
    "tcpNoDelay": false
  }
}
```

> `network`: "tcp" | "kcp" | "ws" | "http" | "grpc" | "httpupgrade" | "xhttp"

The underlying protocol of the transport used by the data stream of the connection, defaulting to `"tcp"`.

> `security`: "none" | "tls" | "reality"

Whether to enable transport layer encryption. Supported options below.

- `"none"` enables no encryption (default).
- `"tls"` enables encryption with [TLS](https://en.wikipedia.org/wiki/transport_Layer_Security).
- `"reality"` enables encryption with REALITY.

> `tlsSettings`: [TLSObject](#tlsobject)

Configures vanilla TLS. The TLS encryption suite is provided by Golang, which often uses TLS 1.3, and has no support for DTLS.

> `realitySettings`: [RealityObject](#realityobject)

Configures REALITY. REALITY is a piece of advanced encryption technology developed in-house, with higher security than vanilla TLS, but configs of both are largely the same.

::: tip
REALITY is by far the most secure transport encryption solution, perfectly mimicking normal web browsing when observed. Enabling REALITY with appropriate XTLS Vision flow control schemes has the potential of reaching magnitudes of performance boosts.
:::

> `tcpSettings`: [TcpObject](./transports/tcp.md)

Configures the current TCP connection. Valid only when TCP is used. Same schema as global.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Configures the current mKCP connection. Valid only when mKCP is used. Same schema as global.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Configures the current WebSocket connection. Valid only when WebSocket is used. Same schema as global.

> `httpSettings`: [HttpObject](./transports/h2.md)

Configures the current HTTP/2 connection. Valid only when HTTP/2 is used. Same schema as global.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Configures the current gRPC connection. Valid only when gRPC is used. Same schema as global.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Configures the current HTTPUpgrade connection. Valid only when HTTPUpgrade is used. Same schema as global.

> `xhttpSettings`: [XHttpObject](./transports/splithttp.md)

Configures XHTTP connections. Valid only when XHTTP is used. Same schema as global.

> `sockopt`: [SockoptObject](#sockoptobject)

Configures transparent proxies.

### TLSObject

```json
{
  "serverName": "xray.com",
  "rejectUnknownSni": false,
  "allowInsecure": false,
  "alpn": ["h2", "http/1.1"],
  "minVersion": "1.2",
  "maxVersion": "1.3",
  "cipherSuites": "Specify encryption suites here, separated by :",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertificateChainSha256": [""],
  "masterKeyLog": ""
}
```

> `serverName`: string

Specifies the domain of the server-side certificate, useful when connecting only via IP addresses.

When the target is specified by domains, like when the domain is received by SOCKS inbounds or detected via sniffing, the extracted domain will automatically be used as `serverName`, without any need for manual configuration.

> `rejectUnknownSni`: bool

When `true`, the server rejects TLS handshakes if the SNI received does not match domains specified in the certificate. The default value is `false`.

> `alpn`: [ string ]

An array of strings specifying the ALPN values used in TLS handshakes. Defaults to `["h2", "http/1.1"]`.

> `minVersion`: [ string ]

`minVersion` specifies the minimum SSL/TLS version accepted.

> `maxVersion`: [ string ]

`maxVersion` specifies the maximum SSL/TLS version accepted.

> `cipherSuites`: [ string ]

`CipherSuites` specifies a list of supported cryptographic suites, with names of each separated by a colon.

You can find the names and descriptions of encryption suites in Go [here](https://golang.org/src/crypto/tls/cipher_suites.go#L500) or [here](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
The above two configs are optional and do not have impact on security under normal circumstances. When not configured, Go will select the parameters automatically on a per-device basis. If you are not familiar with these configs, leave them as is, or you will bear consequences of potential problems caused by your improper configuration.
:::

> `allowInsecure`: true | false

Whether to allow insecure connections (client-only). Defaults to `false`.

When `true`, Xray will not verify the validity of the TLS certificate provided by the outbound.

::: danger
This should not be set to `true` in deployments for security reaons, or it can be susceptible to man-in-the-middle attacks.
:::

> `disableSystemRoot`: true | false

Whether to disable the CA certificates provided by the operating system. Defaults to `false`.

When `true`, Xray will only use the certificates specified in `certificates` for TLS handshakes. When `false`, Xray will only use the CA certificates provided by the operating system for TLS handshakes.

> `enableSessionResumption`: true | false

When `false`, the `session_ticket` extension will not be included in ClientHello. Oftentimes the ClientHello in Go programs does not have this extension enabled, so it is recommended to leave it as-is. Defaults to `false`.

> `fingerprint`: string

Specifies the fingerprint of the `TLS Client Hello` message. When empty, fingerprint simulation will not be enabled. When enabled, Xray will **simulate** the `TLS` fingerprint through the uTLS library or have it generated randomly. Three types of options are supported:

1. Simulate TLS fingerprints of the latest versions of popular browsers, including:

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

1. Have a fingerprint generated automatically when xray starts

- `"random"`: randomly select one of the up-to-date browsers
- `"randomized"`: generate a completely random and unique fingerprint (100% compatible with TLS 1.3 using X25519)

1. Use uTLS native fingerprint variable names, such as `"HelloRandomizedNoALPN"` `"HelloChrome_106_Shuffle"`. See the full list in the [uTLS library](https://github.com/refraction-networking/utls/blob/master/u_common.go#L162).

::: tip
This feature only **simulates** the fingerprint of `TLS Client Hello` message, leaving other behaviours the same as vanilla Go TLS. If you want to simulate a browser `TLS` more completely, use the [Browser Dialer](./transports/websocket.md#browser-dialer).
:::

::: tip
When using this feature, some TLS options that affect the TLS fingerprint will be overridden by the utls library and will no longer be effective, such as ALPN.
The parameters that will be passed are
`"serverName" "allowInsecure" "disableSystemRoot" "pinnedPeerCertificateChainSha256" "masterKeyLog"`
:::

> `pinnedPeerCertificateChainSha256`: [string]

Specifies the SHA256 hash values of the certificate chain of the remote server, using the standard encoding format. Only when the hash value of the server-side certificate chain matches any of the specified can a TLS connection be successfully established.

When the connection fails with this active, the hash value of the remote certificate will be shown.

::: danger
It is not recommended to use this method to obtain the hash value of the certificate chain, because in this case, there will be no opportunity to verify whether the certificate provided by the server at this time is a real certificate, and it cannot be guaranteed that the obtained certificate hash value is the expected hash value.
:::

::: tip
If you need to obtain the hash value of the certificate, run `xray tls certChainHash --cert <cert.pem>` in the command line, where `<cert.pem>` is replaced by the actual certificate file path.
:::

> `certificates`: [ [CertificateObject](#certificateobject) ]

A list of certificates, each representing a single certificate (fullchain recommended).

::: tip
If you want to achieve A/A+ rating in SSLLabs or MySSL tests, visit [here](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600) for further information.
:::

> `masterKeyLog`: string

Path to the (Pre-)Master-Secret log file. Can be used by sniffers like WireShark to decrypt TLS connections managed by Xray. Cannot be used with uTLS at the moment, and requires Xray-core v.8.7 or later.

#### RealityObject

```json
{
  "show": false,
  "dest": "example.com:443",
  "xver": 0,
  "serverNames": ["example.com", "www.example.com"],
  "privateKey": "",
  "minClientVer": "",
  "maxClientVer": "",
  "maxTimeDiff": 0,
  "shortIds": ["", "0123456789abcdef"],
  "fingerprint": "chrome",
  "serverName": "",
  "publicKey": "",
  "shortId": "",
  "spiderX": ""
}
```

::: tip
Further information available in the [REALITY project repo](https://github.com/XTLS/REALITY).
:::

> `show`: true | false

Emits verbose logs when `true`.

::: tip
**Inbound** (**server-side**) configs below.
:::

> `dest`: string

Required. Same schema as [dest](./features/fallback.md#fallbackobject) in VLESS `fallbacks`.

> `xver`: string

Optional. Same schema as [xver](./features/fallback.md#fallbackobject) in VLESS `fallbacks`.

> `serverNames`: [string]

Required. A list of accepted server names. No support for `*` wildcards yet.

> `privateKey`: string

Required. Generate with `./xray x25519`.

> `minClientVer`: string

Optional. Minimal accepted version of the Xray client, specified in `x.y.z`.

> `maxClientVer`: string

Optional. Maximum accepted version of the Xray client, specified in `x.y.z`.

> `maxTimeDiff`: number

Optional. The maximum time difference allowed, specified in milliseconds.

> `shortIds`: [string]

Required. A list of `shortId`s accepted. Can be used to distinguish different clients.

Specified in hex strings, with the length as multiples of 2. Cannot be longer than 16 characters.

`shortId` on clients can be left blank if a blank value exists on the server.

::: tip
**Outbound** (**client-side**) configs below.
:::

> `serverName`: string

One of the server names accepted by the server.

> `fingerprint`: string

Required. Same as the [TLSObject](#tlsobject).

> `shortId`: string

One of the short IDs accepted by the server.

Specified in hex strings, with the length as multiples of 2. Cannot be longer than 16 characters.

`shortId` on clients can be left blank if a blank value exists on the server.

> `publicKey`: string

Required. The public key that corresponds to the private key on the server. Can be obtained by `./xray x25519 -i "privateKey"`.

> `spiderX`: string

The bootstrapping path and query params of the spider. It's recommended to have this varied per client.

#### CertificateObject

```json
{
  "ocspStapling": 3600,
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

> `ocspStapling`: number

OCSP stapling update interval in seconds for certificate hot reload. Default value is `3600`, i.e. one hour.

> `oneTimeLoading`: true | false

Load only once. When set to `true`, it will disable certificate hot reload and OCSP stapling feature.

::: warning
When set to `true`, OCSP stapling will be disabled.
:::

> `usage`: "encipherment" | "verify" | "issue"

Certificate usage, default value is `"encipherment"`.

- `"encipherment"`: The certificate is used for TLS authentication and encryption.
- `"verify"`: The certificate is used to verify the remote TLS certificate. When using this option, the current certificate must be a CA certificate.
- `"issue"`: The certificate is used to issue other certificates. When using this option, the current certificate must be a CA certificate.

::: tip TIP 1
On Windows platform, self-signed CA certificate can be installed in the system for verifying remote TLS certificates.
:::

::: tip TIP 2
When a new client request comes in, assuming the specified `serverName` is `"xray.com"`, Xray will first look for a certificate that can be used for `"xray.com"` in the certificate list. If not found, it will issue a certificate for `"xray.com"` using any certificate with `usage` set to `"issue"`, with a validity of one hour. The new certificate is then added to the certificate list for later use.
:::

::: tip TIP 3
When both `certificateFile` and `certificate` are specified, Xray will use `certificateFile` as the priority. The same applies to `keyFile` and `key`.
:::

::: tip TIP 4
When `usage` is set to `"verify"`, `keyFile` and `key` can both be empty.
:::

::: tip TIP 5
Use `xray tls cert` to generate self-signed CA certificate.
:::

::: tip TIP 6
If you already have a domain name, you can use tools to obtain free third-party certificates easily, such as [acme.sh](https://github.com/acmesh-official/acme.sh).
:::

> `buildChain`: true | false

Only valid when `usage` is `issue`. When set to `true`, the CA certificate will be appended to leaf certificate as chain during issuing certificates.

::: tip TIP 1
Root certificates should not be embedded in the certificate chain. This option is only applicable when the signing CA certificate is an intermediate certificate.
:::

> `certificateFile`: string

Path to the certificate file generated by OpenSSL, with the suffix `.crt`.

> `certificate`: [ string ]

A string array representing the certificate content, in the format shown in the example. Either `certificate` or `certificateFile` can be used.

> `keyFile`: string

Path to the key file generated by OpenSSL, with the suffix `.key`. Password-protected key files are not currently supported.

> `key`: [ string ]

A string array representing the key content, in the format shown in the example. Either `key` or `keyFile` can be used.

### SockoptObject

```json
{
  "mark": 0,
  "tcpFastOpen": false,
  "tproxy": "off",
  "domainStrategy": "AsIs",
  "dialerProxy": "",
  "acceptProxyProtocol": false,
  "tcpKeepAliveInterval": 0,
  "tcpcongestion": "bbr",
  "interface": "wg0",
  "tcpMptcp": false,
  "tcpNoDelay": false
}
```

> `mark`: number

An integer value. When its value is non-zero, SO_MARK is marked with this value on the outbound connection.

- Only applicable to Linux systems.
- Requires CAP_NET_ADMIN permission.

> `tcpFastOpen`: true | false | number

Specifies whether [TCP Fast Open](https://en.wikipedia.org/wiki/TCP_Fast_Open) is enabled.

When its value is `true` or a positive integer, TFO is enabled; when its value is `false` or a negative integer, TFO is forced to be disabled; when this item does not exist or is `0`, the system default setting is used. It can be used for inbound/outbound connections.

- Only available in the following (or later) versions of operating systems:
  - Windows 10 (1607)
  - Mac OS 10.11 / iOS 9
  - Linux 3.16: It needs to be set through the kernel parameter `net.ipv4.tcp_fastopen`, which is a bitmap. `0x1` represents the client allows enabling it, and `0x2` represents the server allows enabling it. The default value is `0x1`. If the server wants to enable TFO, set this kernel parameter value to `0x3`.
  - FreeBSD 10.3 (Server) / 12.0 (Client): The kernel parameters `net.inet.tcp.fastopen.server_enabled` and `net.inet.tcp.fastopen.client_enabled` need to be set to `1`.
- For inbound, the `positive integer` set here represents the maximum number of TFO connection requests to be processed, **note that not all operating systems support this setting**:
  - Linux/FreeBSD: The `positive integer` value set here represents the upper limit, and the maximum acceptable value is 2147483647. If it is set to `true`, it will take `256`. Note that in Linux, `net.core.somaxconn` will limit the upper limit of this value. If it exceeds `somaxconn`, please also increase `somaxconn`.
  - Mac OS: When it is `true` or a `positive integer`, it only represents enabling TFO, and the upper limit needs to be set separately through the kernel parameter `net.inet.tcp.fastopen_backlog`.
  - Windows: When it is `true` or a `positive integer`, it only represents enabling TFO.
- For outbound, setting it to `true` or a `positive integer` only represents enabling TFO on any operating system.

> `tproxy`: "redirect" | "tproxy" | "off"

Specifies whether to enable transparent proxy (only applicable to Linux).

- `"redirect"`: Use the transparent proxy in Redirect mode. It supports all TCP connections based on IPv4/6.
- `"tproxy"`: Use the transparent proxy in TProxy mode. It supports all TCP and UDP connections based on IPv4/6.
- `"off"`: Turn off transparent proxy.

Transparent proxy requires Root or `CAP\_NET\_ADMIN` permission.

::: danger
When `followRedirect` is set to `true` in [Dokodemo-door](./inbounds/dokodemo.md), and `tproxy` in the Sockopt settings is empty, the value of `tproxy` in the Sockopt settings will be set to `"redirect"`.
:::

> `domainStrategy`: "AsIs" | "UseIP" | "UseIPv4" | "UseIPv6"

In previous versions, when Xray attempted to establish a system connection using a domain name, the resolution of the domain name was completed by the system and not controlled by Xray. This led to issues such as the inability to resolve domain names in non-standard Linux environments. To solve this problem, Xray 1.3.1 introduced Freedom's `domainStrategy` into Sockopt.

When the target address is a domain name, the corresponding value is configured, and the behavior of SystemDialer is as follows:

- `"AsIs"`: Resolve the IP address using the system DNS server and connect to the domain name.
- `"UseIP"`, `"UseIPv4"`, and `"UseIPv6"`: Resolve the IP address using the [built-in DNS server](./dns.md) and connect to the IP address directly.

The default value is `"AsIs"`.

::: danger

Improper configuration may cause infinite loops when this feature is enabled.

In short, connecting to the server requires waiting for the DNS query result, and completing the DNS query requires connecting to the server.

> Tony: Which came first, the chicken or the egg?

Explanation:

1. Trigger condition: proxy server (proxy.com). Built-in DNS server, non-local mode.
2. Before Xray attempts to establish a TCP connection to proxy.com, it queries proxy.com using the built-in DNS server.
3. The built-in DNS server establishes a connection to dns.com and sends a query to obtain the IP address of proxy.com.
4. Improper routing rules cause proxy.com to proxy the query sent in step 3.
5. Xray attempts to establish another TCP connection to proxy.com.
6. Before establishing the connection, Xray queries proxy.com using the built-in DNS server.
7. The built-in DNS server reuses the connection established in step 3 to send a query.
8. A problem arises. The establishment of the connection in step 3 requires waiting for the query result in step 7, and the completion of the query in step 7 requires waiting for the connection in step 3 to be fully established.
9. Good game!

Solution:

- Adjust the split of internal DNS servers.
- Use Hosts file.
- ~~If you still don't know the solution, then don't use this feature.~~

Therefore, it is **not recommended** for inexperienced users to use this feature.

:::

> `dialerProxy`: ""

An identifier for an outbound proxy. When the value is not empty, the specified outbound will be used to establish the connection. This option can be used to support chain forwarding of underlying transport protocols.

::: danger
This option is incompatible with ProxySettingsObject.Tag
:::

> `acceptProxyProtocol`: true | false

Only used for inbound, indicates whether to accept the PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to pass the true source IP and port of a request. **If you are not familiar with it, please ignore this option first**.

Common reverse proxy software (such as HAProxy, Nginx) can be configured to send it, and VLESS fallbacks xver can also send it.

When set to `true`, after the lowest-level TCP connection is established, the requesting party must first send PROXY protocol v1 or v2, otherwise the connection will be closed.

> `tcpKeepAliveInterval`: number

Interval between TCP keep-alive packets, in seconds. ~~This setting only applies to Linux.~~

Not configuring this item or configuring it as 0 means using the default value of Go.

::: tip
When filling in a negative number, such as `-1`, TCP keep-alive is not enabled.
:::

> `tcpcongestion`: ""

TCP congestion control algorithm. Only supported by Linux. Not configuring this item means using the system default value.

::: tip
Common algorithms

- bbr (recommended)
- cubic
- reno

:::

::: tip
Execute the command `sysctl net.ipv4.tcp_congestion_control` to get the system default value.
:::

> `interface`: ""

Specifies the name of the bound outbound network interface. supported by Linux MacOS iOS.<br>
MacOS iOS Requires Xray-core v1.8.6 or higher.

> `tcpMptcp`: true | false

Xray-core v1.8.6 New parameter.<br>
Default value `false`, fill in `true` to enable [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP), need to be enabled in both server and client configuration.

> `tcpNoDelay`: true | false

Default value `false`, recommended to be enabled with "tcpMptcp": true.

>  `customSockopt`: []

An array for advanced users to specify any sockopt. In theory, all the above connection-related settings can be set equivalently here. Naturally, other options that exist in Linux but have not been added to the core can also be set. The example below is equivalent to `"tcpcongestion": "bbr"` in core.

Please make sure you understand Linux socket programming before using it.

```json
"customSockopt": [
  {
    "type": "str",
    "level":"6",
    "opt": "13",
    "value": "bbr"
  }
]
```

> `type`: ""

Required, the type of setting, valid values are `int` or `str`.

> `level`: ""

Optional, protocol level, used to specify the effective range, the default is `6`, which is TCP.

> `opt`: ""

The option name of the operation, using decimal (the example here is that the value of `TCP_CONGESTION` is defined as `0xd` and converted to decimal is 13)

> `value`: ""

The option value to be set, the example here is set to bbr.

Decimal numbers are required when type is specified as int.
