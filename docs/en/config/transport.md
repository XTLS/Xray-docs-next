# Transport Protocol

Transport protocol is the way that Xray nodes communicate with each other.

Transport protocol specifies a stable way to transmit data. Typically, both ends of a network connection need to use the same transport protocol to establish a connection. For example, if one end uses WebSocket, the other end must also use WebSocket, otherwise the connection cannot be established.

Transport protocol configuration has two parts:

1. Global configuration ([TransportObject](#transportobject))
2. Local configuration ([StreamSettingsObject](#streamsettingsobject)).

- When configuring locally, you can specify how each individual inbound or outbound connection is transmitted.
- Typically, the inbound and outbound connections corresponding to the client and server need to use the same transport protocol. When a transport protocol is specified but no specific settings are provided, the transport protocol will use the settings from the global configuration.

## TransportObject

The `TransportObject` corresponds to the `transport` item in the configuration file.

```json
{
  "transport": {
    "tcpSettings": {},
    "kcpSettings": {},
    "wsSettings": {},
    "httpSettings": {},
    "quicSettings": {},
    "dsSettings": {},
    "grpcSettings": {},
    "httpupgradeSettings": {}
  }
}
```

> `tcpSettings`: [TcpObject](./transports/tcp.md)

Configuration for TCP connections.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Configuration for mKCP connections.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Configuration for WebSocket connections.

> `httpSettings`: [HttpObject](./transports/h2.md)

Configuration for HTTP/2 connections.

> `quicSettings`: [QuicObject](./transports/quic.md)

Configuration for QUIC connections.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Configuration for gRPC connections.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Configuration for HTTPUpgrade connections.

> `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

Configuration for Domain Socket connections.

## StreamSettingsObject

`StreamSettingsObject` corresponds to the `streamSettings` item in inbound or outbound configuration. Each inbound or outbound can be configured with different transport settings and can use `streamSettings` to perform some transport configurations.

```json
{
  "network": "tcp",
  "security": "none",
  "tlsSettings": {},
  "tcpSettings": {},
  "kcpSettings": {},
  "wsSettings": {},
  "httpSettings": {},
  "quicSettings": {},
  "dsSettings": {},
  "grpcSettings": {},
  "httpupgradeSettings": {},
  "sockopt": {
    "mark": 0,
    "tcpFastOpen": false,
    "tproxy": "off",
    "domainStrategy": "AsIs",
    "dialerProxy": "",
    "acceptProxyProtocol": false,
    "tcpKeepAliveInterval": 0
  }
}
```

> `network`: "tcp" | "kcp" | "ws" | "http" | "quic" | "grpc" | "httpupgrade"

The type of transport used by the connection's data stream, with a default value of `"tcp"`.

> `security`: "none" | "tls" | "reality"

Whether to enable transport layer encryption, with supported options:

- `"none"` means no encryption (default value).
- `"tls"` means using [TLS](https://en.wikipedia.org/wiki/base/transport_Layer_Security).
- `"xtls"` means using [XTLS](./features/xtls.md). <Badge text="Deprecated" type="warning"/>

> `tlsSettings`: [TLSObject](#tlsobject)

TLS configuration. TLS is provided by Golang, and usually the result of TLS negotiation is to use TLS 1.3, and DTLS is not supported.

> `xtlsSettings`: [XTLSObject](#tlsobject) <Badge text="Deprecated" type="warning"/>

XTLS configuration. XTLS is Xray's original technology, which is the core driver of Xray's outstanding performance. XTLS has the same security as TLS and uses the same configuration as TLS.

::: tip
TLS/XTLS is currently the most secure transport encryption scheme, and its traffic appears consistent with normal web traffic to outsiders. Enabling XTLS and configuring the appropriate XTLS flow control mode can provide several times to even more than ten times the performance improvement while maintaining the same security as TLS. When changing the value of `security` from `tls` to `xtls`, simply modify `tlsSettings` to `xtlsSettings`.
:::

> `tcpSettings`: [TcpObject](./transports/tcp.md)

The TCP configuration for the current connection, only valid when TCP is used for this connection. The configuration is the same as the global configuration above.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

The mKCP configuration for the current connection, only valid when mKCP is used for this connection. The configuration is the same as the global configuration above.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

The WebSocket configuration for the current connection, only valid when WebSocket is used for this connection. The configuration is the same as the global configuration above.

> `httpSettings`: [HttpObject](./transports/h2.md)

The HTTP/2 configuration for the current connection, only valid when HTTP/2 is used for this connection. The configuration is the same as the global configuration above.

> `quicSettings`: [QUICObject](./transports/quic.md)

The QUIC configuration for the current connection, only valid when QUIC is used for this connection. The configuration is the same as the global configuration above.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

The gRPC configuration for the current connection, only valid when gRPC is used for this connection. The configuration is the same as the global configuration above.

> `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

The Domain socket configuration for the current connection, only valid when Domain socket is used for this connection. The configuration is the same as the global configuration above.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Configuration of the current HTTPUpragde connection. Valid only when HTTPUpgrade is used by this connection. The configuration schema is the exact same as the global schema.

> `sockopt`: [SockoptObject](./chat#sockoptobject)

Specific configuration for transparent proxies.

### TLSObject

```json
{
  "serverName": "xray.com",
  "rejectUnknownSni": false,
  "allowInsecure": false,
  "alpn": ["h2", "http/1.1"],
  "minVersion": "1.2",
  "maxVersion": "1.3",
  "cipherSuites": "Specify the names of the encryption suites you need here, separated by :",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertificateChainSha256": [""]
}
```

> `serverName`: string

Specifies the domain name of the server certificate, useful when the connection is established by IP.

When the target connection is specified by domain name, such as when the domain name is received by the Socks inbound or when it is detected by the Sniffing function, this domain name is automatically used for `serverName` without manual configuration.

> `rejectUnknownSni`: bool

When set to `true`, the server rejects the TLS handshake if the received SNI does not match the domain name in the certificate. The default value is `false`.

> `alpn`: [ string ]

An array of strings that specifies the ALPN values to be used during the TLS handshake. The default value is `["h2", "http/1.1"]`.

> `minVersion`: [ string ]

`minVersion` is the minimum acceptable SSL/TLS version.

> `maxVersion`: [ string ]

`maxVersion` is the maximum acceptable SSL/TLS version.

> `cipherSuites`: [ string ]

`CipherSuites` is used to configure the supported list of cryptographic suites, with each suite name separated by a colon.

You can find the names and descriptions of Golang encryption suites at [here](https://golang.org/src/crypto/tls/cipher_suites.go#L500) or [here](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
The above two configurations are optional and normally do not affect security. If not configured, Golang will automatically select based on the device. If you are not familiar with these options, do not configure them, and any problems caused by improper configuration are your responsibility.
:::

> `allowInsecure`: true | false

Whether to allow insecure connections (only for clients). The default value is `false`.

When set to `true`, Xray will not verify the validity of the TLS certificate provided by the remote host.

::: danger
For security reasons, this option should not be set to true in practical scenarios, otherwise, it may be susceptible to man-in-the-middle attacks.
:::

> `disableSystemRoot`: true | false

Whether to disable the CA certificate provided by the operating system. The default value is `false`.

When set to `true`, Xray will only use the certificates specified in `certificates` for TLS handshakes. When set to `false`, Xray will only use the CA certificates provided by the operating system for TLS handshakes.

> `enableSessionResumption`: true | false

When this parameter is set to false, the `session_ticket` extension is not included in the ClientHello message. Generally, the ClientHello message in Go language programs does not use this extension, so it is recommended to keep the default value. The default value is `false`.

> `fingerprint`: string

This parameter is used to configure the fingerprint of the `TLS Client Hello`. When its value is empty, this feature is not enabled. After enabling it, Xray will **simulate** the `TLS` fingerprint through the uTLS library or generate it randomly. Three configuration options are supported:

1. TLS fingerprints of the latest versions of popular browsers, including:

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

1. Generate a fingerprint when xray starts

- `"random"`: randomly select one in newer versions of browsers
- `"randomized"`: generate a completely random and unique fingerprint (100% compatible with TLS 1.3 using X25519)

1. Use uTLS native fingerprint variable names, such as `"HelloRandomizedNoALPN"` `"HelloChrome_106_Shuffle"`. See the full list in [uTLS library](https://github.com/refraction-networking/utls/blob/master/u_common.go#L162).

::: tip
This feature only **simulates** the fingerprint of the `TLS Client Hello`, and its behavior and other fingerprints are the same as Golang. If you want to simulate browser `TLS` fingerprints and behaviors more completely, you can use the [Browser Dialer](./transports/websocket.md#browser-dialer).
:::

> `pinnedPeerCertificateChainSha256`: [string]

Specifies the SHA256 hash value of the certificate chain for the remote server, using standard encoding format. Only when the hash value of the server-side certificate chain matches one of the settings can a TLS connection be successfully established.

When the connection fails due to this configuration, the hash value of the remote server certificate will be displayed.

::: danger
It is not recommended to use this method to obtain the hash value of the certificate chain, because in this case, there will be no opportunity to verify whether the certificate provided by the server at this time is a real certificate, and it cannot be guaranteed that the obtained certificate hash value is the expected hash value.
:::

::: tip
If you need to obtain the hash value of the certificate, run `xray tls certChainHash --cert <cert.pem>` in the command line, where `<cert.pem>` should be replaced with the actual certificate file path.
:::

> `certificates`: [ [CertificateObject](./chat#certificateobject) ]

A list of certificates, each representing a certificate (recommended fullchain).

::: tip
If you want to obtain the A/A+ rating in ssllibs or myssl evaluation, please refer to [here](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

#### CertificateObject

```json
{
  "ocspStapling": 3600,
  "oneTimeLoading": false,
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

- `"redirect"`: Use the transparent proxy in Redirect mode. It supports all TCP and UDP connections based on IPv4/6.
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

