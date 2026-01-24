# Transport (uTLS, REALITY)

Transport is the method used by the current Xray node to establish connections with other nodes.

Transport specifies a stable method for data transmission. Generally, both ends of a network connection need to have symmetrical transport methods. For example, if one end uses WebSocket, the other end must also use WebSocket; otherwise, the connection cannot be established.

## StreamSettingsObject

`StreamSettingsObject` corresponds to the `streamSettings` item in inbound or outbound configurations. Each inbound or outbound can be configured with different transport settings independently, and `streamSettings` can be set to perform some transport configurations.

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

> `network`: "raw" | "xhttp" | "kcp" | "grpc" | "ws" | "httpupgrade" | "hysteria"

The type of transport method used for the connection data stream. The default value is `"raw"`.

::: tip
After version v24.9.30, to better reflect actual behavior, the TCP transport method has been renamed to RAW. For compatibility, `"network": "raw"` and `"network": "tcp"`, as well as `rawSettings` and `tcpSettings`, are aliases for each other.
:::

> `security`: "none" | "tls" | "reality"

Whether to enable transport layer encryption. Supported options are:

- `"none"`: Indicates no encryption (default value).
- `"tls"`: Indicates using [TLS](https://en.wikipedia.org/wiki/Transport_Layer_Security).
- `"reality"`: Indicates using REALITY.

> `tlsSettings`: [TLSObject](#tlsobject)

TLS configuration. TLS is provided by Golang. Usually, the TLS negotiation result is TLS 1.3. DTLS is not supported.

> `realitySettings`: [RealityObject](#realityobject)

Reality configuration. Reality is an original black technology from Xray. Reality offers higher security than TLS, and its configuration method is consistent with TLS.

::: tip
Reality is currently the most secure transport encryption scheme, and the traffic type appears consistent with normal web browsing from the outside. Enabling Reality and configuring an appropriate XTLS Vision flow control mode can achieve several times or even more than ten times performance improvement.
:::

> `rawSettings`: [RawObject](./transports/raw.md)

RAW configuration for the current connection. Only valid when this connection uses RAW.

> `xhttpSettings`: [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113)

XHTTP configuration for the current connection. Only valid when this connection uses XHTTP.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

mKCP configuration for the current connection. Only valid when this connection uses mKCP.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

gRPC configuration for the current connection. Only valid when this connection uses gRPC.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

WebSocket configuration for the current connection. Only valid when this connection uses WebSocket.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

HTTPUpgrade configuration for the current connection. Only valid when this connection uses HTTPUpgrade.

> `hysteriaSettings`: [HysteriaObject](./transports/hysteria.md)

Hysteria configuration for the current connection. Only valid when this connection uses Hysteria.

> `sockopt`: [SockoptObject](#sockoptobject)

Specific configurations related to transparent proxying.

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
  "cipherSuites": "Enter the cipher suite names you need here, separated by :",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertSha256": "",
  "curvePreferences": [""],
  "masterKeyLog": "",
  "echServerKeys": "",
  "echConfigList": "",
  "echForceQuery": "",
  "echSockopt": {}
}
```

> `serverName`: string

Server name. The server certificate's SAN must contain this value. It can be a domain name or an IP address. If it is a domain name, it will be sent in the SNI extension of the Client Hello. IP addresses will not send the SNI extension (SNI extension does not allow IP addresses). If filling in IPv6, use `[]` to wrap it.

When left empty, the value in `address` (if it is a domain name) is automatically used.

Special value `"FromMitM"`: This causes it to use the SNI contained in the TLS decrypted from the dokodemo-door inbound.

::: tip
As mentioned above, since this value is used to verify whether the server certificate is valid, if you modify it to be inconsistent with the server certificate domain for special purposes, you need to enable `allowInsecure`; otherwise, certificate authentication will fail. For security reasons, we do not recommend using this method for a long time. If you want to securely spoof SNI, please consider using REALITY.
:::

> `verifyPeerCertInNames`: \[ string \]

Client-only. List of SNIs used to verify certificates (only one SAN in the certificate needs to be in this list). This will override `serverName` used for verification, used for special purposes like domain fronting. It is safer than modifying `serverName` and enabling `allowInsecure` because it still performs certificate signature verification.

Special value `"FromMitM"`: This causes it to additionally include the SNI contained in the TLS decrypted from the dokodemo-door inbound.

> `rejectUnknownSni`: bool

When set to `true`, the server refuses the TLS handshake if the received SNI does not match the certificate domain. Default is `false`.

> `alpn`: \[ string \]

An array of strings specifying the ALPN values during TLS handshake. Default value is `["h2", "http/1.1"]`.

Special value: `["FromMitM"]` (when this is the only element) will cause the outbound TLS to use the ALPN used by the TLS connection decrypted from the dokodemo-door inbound.

> `minVersion`: string

`minVersion` is the minimum acceptable TLS version.

> `maxVersion`: string

`maxVersion` is the maximum acceptable TLS version.

> `cipherSuites`: string

`CipherSuites` is used to configure the list of supported cipher suites, separated by `:`.

You can find Golang cipher suite names and descriptions [here](https://golang.org/src/crypto/tls/cipher_suites.go#L500) or [here](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
The above two configuration items are optional and usually do not affect security. Golang automatically selects based on the device when not configured. Do not configure this option if you are unfamiliar with it; you are responsible for issues caused by improper configuration.
:::

> `allowInsecure`: true | false

Whether to allow insecure connections (client-only). Default value is `false`.

When set to `true`, Xray will not check the validity of the TLS certificate provided by the remote host.

::: danger
For security reasons, this option should not be set to `true` in actual scenarios, otherwise, you may suffer from Man-in-the-Middle attacks.
:::

> `disableSystemRoot`: true | false

Whether to disable the operating system's built-in CA certificates. Default value is `false`.

When set to `true`, Xray will only use certificates specified in `certificates` for TLS handshake. When set to `false`, Xray will only use the OS's built-in CA certificates for TLS handshake.

> `enableSessionResumption`: true | false

Whether to enable session resumption. Disabled by default. Session resumption negotiation will only be attempted when both the server and client enable it.

If negotiation is successful, certificates do not need to be transmitted during the handshake. Saves a tiny bit of handshake time (almost negligible).

Note: This is not TLS 0-RTT. gotls does not support this feature yet. It will not reduce the RTT of the TLS handshake.

> `fingerprint` : string

This parameter is used to configure the fingerprint of the specified `TLS Client Hello`. Default is `chrome`. To revert to native go TLS, set to `unsafe`. When enabled, Xray will **simulate** `TLS` fingerprints via the uTLS library or generate them randomly. Supports three configuration methods:

1. Latest versions of common browsers, including:
   - `"chrome"`
   - `"firefox"`
   - `"safari"`
   - `"ios"`
   - `"android"`
   - `"edge"`
   - `"360"`
   - `"qq"`

2. Automatically generate a fingerprint when Xray starts:
   - `"random"`: Randomly select one from newer browser versions.
   - `"randomized"`: Completely randomly generate a unique fingerprint (100% supports TLS 1.3 using X25519).

3. Use uTLS native fingerprint variable names, e.g., `"HelloRandomizedNoALPN"`, `"HelloChrome_106_Shuffle"`. See the [uTLS library](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434) for the full list.

::: tip
This feature only **simulates** the `TLS Client Hello` fingerprint. Behavior and other fingerprints are the same as Golang. If you wish to simulate browser `TLS` fingerprints and behavior more completely, you can use [Browser Dialer](./transports/websocket.md#browser-dialer).
:::

::: tip
When using this feature, some TLS options affecting TLS fingerprints will be overwritten by the uTLS library and will no longer take effect, such as ALPN.
Parameters passed include:
`"serverName"`, `"allowInsecure"`, `"disableSystemRoot"`, `"pinnedPeerCertSha256"`, `"masterKeyLog"`.
:::

> `pinnedPeerCertSha256`: string

Used to specify the remote server's certificate SHA256 hash. Uses hex and is case-insensitive. Example: `e8e2d387fdbffeb38e9c9065cf30a97ee23c0e3d32ee6f78ffae40966befccc9`. This encoding is the same as the SHA-256 certificate fingerprint in Chrome certificate viewer and the Certificate Fingerprints SHA-256 format on crt.sh. It can also be calculated using `xray tls leafCertHash --cert <cert.pem>`. You can use `~` to connect more hash values; verification passes if any one matches.

This verification is called only after normal certificate verification succeeds. There are two cases:

- 1. When the core finds a matching hash value for the leaf certificate, verification passes directly.
- 2. When the core finds a matching value for a CA certificate (root or intermediate), it verifies if the signature on the leaf certificate comes from that CA authorization.

Normal certificate verification is performed before this verification. Therefore, for self-signed certificates, consider enabling `allowInsecure` and configuring the hash here. For self-signed CAs, you can pin the CA here and set `verifyPeerCertInNames` (the CA certificate used in its verification flow will be replaced by the CA certificate found here).

> `certificates`: \[ [CertificateObject](#certificateobject) \]

List of certificates, where each item represents a certificate (fullchain is recommended).

::: tip
If you want to get an A/A+ rating on ssllibs or myssl, please refer to [this discussion](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `curvePreferences`: \[ string \]

An array of strings specifying the curves supported when performing ECDHE in TLS handshake. Supported curves are as follows (case-insensitive):

```
CurveP256
CurveP384
CurveP521
X25519
X25519MLKEM768
```

The default value as of go1.25 includes the above five curves. Adjusting the order does not make the client or server prefer a particular curve; the actual curve will be negotiated by the key exchange mechanism itself.

> `masterKeyLog` : string

(Pre)-Master-Secret log file path, can be used by software like Wireshark to decrypt TLS connections sent by Xray.

> `echServerKeys` : string

Server-only parameter. Used to enable Encrypted Client Hello on the server.

Use `xray tls ech --serverName example.com` to generate usable ECH Server Key and corresponding Config. `example.com` is the SNI exposed externally when SNI is encrypted; you can fill in whatever you want. The Server Key contains ECHConfig. If you accidentally lose the Config used by the client, use `xray tls ech -i "your server key"` to retrieve it. You can publish it in the HTTPS record of DNS, refer to the format [here](https://dns.google/query?name=encryptedsni.com&rr_type=HTTPS) or RFC 9460.

Note that after configuring ECH, the server still accepts normal non-ECH connections.

> `echConfigList` : string

Client-only parameter. Configures ECHConfig. If not empty, it means the client enables Encrypted Client Hello. Supports two formats:

The first is a fixed ECHConfig string, e.g., `"AF7+DQBaAAAgACA51i3Ssu4wUMV4FNCc8iRX5J+YC4Bhigz9sacl2lCfSQAkAAEAAQABAAIAAQADAAIAAQACAAIAAgADAAMAAQADAAIAAwADAAtleGFtcGxlLmNvbQAA"`

The second is querying from a DNS server. For example, when using a CDN, you can dynamically obtain the configured ECHConfig via HTTPS records. If a valid ECH Config is obtained, Xray will respect the TTL issued by the server. The query target will be the configured SNI, or the configured server domain name (if SNI is empty and the target is a domain name).

The basic format is `"udp://1.1.1.1"`, indicating querying from UDP DNS 1.1.1.1. You can also use formats like `"https://1.1.1.1/dns-query"` (or `h2c://`), indicating querying via DOH (h2c) (replace with locally available servers for actual use). All three support modifying port numbers, e.g., `udp://1.1.1.1:53`. If omitted, defaults to 53/443 based on protocol.

Specifically, you can use a designated domain for querying ECHConfig, in the format `"example.com+https://1.1.1.1/dns-query"`. In this way, Xray will force the use of the ECHConfig in the DNS record of `example.com` for connection. This is useful if you want to get ECHConfig from DNS but don't want to expose yourself querying the HTTPS record of this domain or publishing HTTPS records under this domain.

> `echForceQuery` : string

Controls the strategy when using DNS to query ECH Config. Options: `none` (default), `half`, `full`.

`none`: Query once. If a valid ECH Config is not obtained, it will query again after five minutes. If the query fails, **ECH will not be used**.

`half`: Query once. If failed, attempts to query on every request. If the query fails, **ECH will not be used**. If the query succeeds and gets a response but does not contain ECH Config, **ECH will not be used** either, and it will not query again within five minutes.

`full`: Query once. Forcibly requires a valid ECH Config to connect successfully; otherwise, the connection fails. Recommended if you definitely want to use ECH. The first two simulate fallback behavior to ensure availability but may lead to plaintext SNI being sent.

Regardless of query success or failure, only the first connection will block waiting for the query response result; subsequent updates will not block connections.

> `echSockopt` : [SockoptObject](#sockoptobject)

Adjusts the underlying socket options of the connection used when querying ECH records using DNS.

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
For more information, please refer to the [REALITY Project](https://github.com/XTLS/REALITY).
:::

::: tip
Reality only modifies TLS. Client implementation only requires slight modification of fully random session IDs and custom certificate verification, theoretically fully compatible with most TLS combinations.

However, this does not apply to QUIC, because the session ID field that Reality needs to modify is entirely random in almost all TCP TLS implementations for compatibility purposes, but in QUIC TLS, this field has 0 length, leaving no room for modification.
:::

> `show` : true | false

When set to `true`, debug information is output.

::: tip
The following are **Inbound** (**Server-side**) configurations.
:::

> `target` : string

Required. Format same as VLESS `fallbacks` [dest](./features/fallback.md#fallbackobject).

Formerly named `dest`, both fields are aliases in the current version.

If `target` supports the post-quantum key exchange algorithm X25519MLKEM768, the Reality client will also automatically use this post-quantum algorithm for key negotiation. You can check support using `xray tls ping cloudflare.com` (change URL to dest, can include port).

The core distinguishes whether the current configuration is client or server based on the existence of this field. Do not fill it in on the client side, otherwise, it will cause identification errors.

::: warning
To ensure effective camouflage, Xray will **directly forward** traffic that fails authentication (non-legitimate Reality requests) to `target`.
If the IP address of the `target` website is special (e.g., websites using CloudFlare CDN), it is equivalent to your server acting as a port forwarder for CloudFlare, which may cause traffic theft after being scanned.

To prevent this, consider methods like fronting with Nginx to filter out SNIs that do not meet requirements.
Alternatively, consider configuring `limitFallbackUpload` and `limitFallbackDownload` to limit rates.
:::

> `xver` : number

Optional. Format same as VLESS `fallbacks` [xver](./features/fallback.md#fallbackobject).

> `serverNames` : \[string\]

Required. List of `serverNames` available to clients. `*` wildcard is not supported.

Generally consistent with `target`. Actual valid values are any SNI accepted by the server (depending on the configuration of `target` itself), usually referring to the [SAN](https://en.wikipedia.org/wiki/Subject_Alternative_Name) of the returned certificate.

Can contain empty value `""` representing acceptance of connections without SNI. Using this feature does not require `target` to have an IP certificate, just ensure it does not refuse connections upon receiving a Client Hello without SNI. When using this feature, the client `serverName` cannot be empty; it needs to be filled with any valid IP address as a placeholder.

You can use `xray tls ping` to observe the server's response behavior to requests without SNI.

> `privateKey` : string

Required. Execute `./xray x25519` to generate.

> `minClientVer` : string

Optional. Minimum Xray client version, format `x.y.z`.

> `maxClientVer` : string

Optional. Maximum Xray client version, format `x.y.z`.

> `maxTimeDiff` : number

Optional. Maximum allowed time difference in milliseconds.

> `shortIds` : \[string\]

Required. List of `shortIds` available to clients, used to distinguish different clients.

Format requirements see `shortId`.

If empty value is included, client `shortId` can be empty.

> `mldsa65Seed` : string

Server-only. Private key used to add extra post-quantum signatures to the certificate sent to the Reality client, using ML-DSA-65 (if a quantum computer capable of breaking x25519 exists, password leakage could allow MITM; this feature prevents such future attacks).

Use `xray mldsa65` to generate public-private key pairs. Configuring the private key on the server only adds it to certificate extensions, not affecting older clients or clients with this feature disabled.

Note: After configuring this feature, the length of the certificate returned by `target` **must** be greater than 3500, because post-quantum signatures cause the temporary certificate returned by Reality to become larger. To prevent creating a fingerprint, the certificate returned by `target` must also be large. You can check using `xray tls ping example.com`. Also, for perfect post-quantum security, `target` also needs to support post-quantum key exchange X25519MLKEM768; support can also be checked via the previous command.

> `limitFallbackUpload`/`limitFallbackDownload`

::: warning
Warning: For REALITY best practice, always steal certificates from the same ASN, so you probably won't use this feature; only when you are forced to steal certificates from free CDNs like Cloudflare, to avoid your server becoming an acceleration node for others, consider enabling this feature.

Fallback rate limiting is a fingerprint and is not recommended. If you are a panel/one-click script developer, be sure to randomize these parameters.
:::

::: tip
`limitFallbackUpload` and `limitFallbackDownload` are optional. They limit the speed of fallback connections that fail verification. `bytesPerSec` defaults to 0, meaning disabled.

Principle: For each unverified fallback connection, the rate limiting algorithm is enabled after transmitting `afterBytes` bytes.
Rate limiting uses a token bucket algorithm. The bucket capacity is `burstBytesPerSec`. Each byte transmitted consumes one token. Initial `burstBytesPerSec` is full.
The bucket is filled with `bytesPerSec` tokens every second until full.

Example: `afterBytes=10485760`, `burstBytesPerSec=5242880`, `bytesPerSec=1048576` means limiting speed to 1MB/s after transmitting 15MB. If transmission pauses, after 5 seconds it can burst to 5MB/s, then revert to 1MB/s.

Suggestion: Too large `afterBytes` and `burstBytesPerSec` will not be effective for rate limiting. Too small `bytesPerSec` and `burstBytesPerSec` are easy to detect.
Parameters should be set reasonably combined with the resource size of the stolen website. If burst is not allowed, `burstBytesPerSec` can be set to 0.
:::

> `afterBytes` : number

Optional. Limits the speed of fallback REALITY connections. Start limiting after transmitting specified bytes. Default is 0.

> `bytesPerSec` : number

Optional. Limits the speed of fallback REALITY connections. Base rate limit (bytes/second). Default 0 means rate limiting is disabled.

> `burstBytesPerSec` : number

Optional. Limits the speed of fallback REALITY connections. Burst rate limit (bytes/second). Effective when greater than `bytesPerSec`.

::: tip
The following are **Outbound** (**Client-side**) configurations.
:::

> `serverName` : string

One of the server `serverNames`.

Specifically, the client can set this to any IP address, and Xray will send a Client Hello without SNI extension. To use this feature, ensure server `serverNames` contains empty value `""`.

> `fingerprint` : string

Required. Same as [TLSObject](#tlsobject). Note: Using `unsafe` to disable uTLS is not supported here, because the REALITY protocol implementation uses this library to manipulate underlying TLS parameters.

> `shortId` : string

One of the server `shortIds`.

Length is 8 bytes, i.e., 16 hexadecimal characters (0~f). Can be less than 16; the core will automatically pad with 0s at the end, but the count must be **even** (since one byte has 2 hex digits).

E.g., `aa1234` will be auto-padded to `aa12340000000000`, but `aaa1234` will cause an error.

0 is also even, so if server `shortIds` contains empty value `""`, client can also be empty.

> `password` : string

Required. Public key corresponding to the server private key. Generated using `./xray x25519 -i "server private key"`. Formerly `publicKey`, renamed to prevent misunderstanding (this is indeed an x25519 public key in status, but in Reality design, it is held by the client and cannot be public).

> `mldsa65Verify`

Optional. Public key used for mldsa65 signature verification. When non-empty, use this public key to check the certificate returned by the server. See description of `"mldsa65Seed"` for details.

> `spiderX` : string

Initial path and parameters for the spider. It is recommended that each client be different.

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

Server certificate, hot reloaded every 3600 seconds (i.e., one hour).

> `ocspStapling`: number

OCSP stapling update interval in seconds, default is 0. Any non-zero value enables OCSP stapling and overrides the default 3600-second certificate hot reload time (executes OCSP stapling while reloading).

> `oneTimeLoading`: true | false

Load only once, default `false`. When set to `true`, certificate hot reloading and OCSP stapling are disabled.

> `usage`: "encipherment" | "verify" | "issue"

Certificate usage, default value is `"encipherment"`.

- `"encipherment"`: Certificate is used for TLS authentication and encryption.
- `"verify"`: Certificate is used to verify remote TLS certificates. When using this item, the current certificate must be a CA certificate.
- `"issue"`: Certificate is used to issue other certificates. When using this item, the current certificate must be a CA certificate.

::: tip TIP 1
On Windows platforms, self-signed CA certificates can be installed into the system to verify remote TLS certificates.
:::

::: tip TIP 2
When there is a new client request, assuming the specified `serverName` is `"xray.com"`, Xray will first look for a valid certificate for `"xray.com"` in the certificate list. If not found, it will use any certificate with `usage` `"issue"` to issue a certificate valid for `"xray.com"` with a validity period of one hour. The new certificate is added to the certificate list for future use.
:::

::: tip TIP 3
When both `certificateFile` and `certificate` are specified, Xray prefers `certificateFile`. Same for `keyFile` and `key`.
:::

::: tip TIP 4
When `usage` is `"verify"`, `keyFile` and `key` can both be empty.
:::

::: tip TIP 5
Use `xray tls cert` to generate self-signed CA certificates.
:::

::: tip TIP 6
If you already own a domain, you can use tools like [acme.sh](https://github.com/acmesh-official/acme.sh) to easily get free third-party certificates.
:::

> `buildChain`: true | false

Only effective when certificate usage is `issue`. If `true`, embed the CA certificate into the certificate chain when issuing certificates.

::: tip TIP 1
Root certificates should not be embedded in the certificate chain. This option is only suitable when the signing CA certificate is an intermediate certificate.
:::

> `certificateFile`: string

Certificate file path. If generated using OpenSSL, extension is .crt.

> `certificate`: \[ string \]

An array of strings representing certificate content, format as shown in the example. Choose one between `certificate` and `certificateFile`.

> `keyFile`: string

Key file path. If generated using OpenSSL, extension is .key. Password-protected key files are not supported currently.

> `key`: \[ string \]

An array of strings representing key content, format as shown in the example. Choose one between `key` and `keyFile`.

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
  "tcpWindowClamp": 600,
  "tcpMptcp": false,
  "addressPortStrategy": "",
  "customSockopt": []
}
```

> `mark`: number

An integer. When non-zero, mark the outbound connection with this value using SO_MARK.

- Only applies to Linux systems.
- Requires CAP_NET_ADMIN permission.

> `tcpMaxSeg`: number

Used to set the Maximum Segment Size (MSS) for TCP packets.

> `tcpFastOpen`: true | false | number

Whether to enable [TCP Fast Open](https://en.wikipedia.org/wiki/TCP_Fast_Open).

When set to `true` or a `positive integer`, TFO is enabled; when `false` or `negative`, TFO is forced disabled; when absent or `0`, system default is used. Can be used for inbound/outbound.

- Only available in the following (or newer) OS versions:
  - Linux 3.16: Requires setting kernel parameter `net.ipv4.tcp_fastopen`. This parameter is a bitmap: `0x1` allows client to enable, `0x2` allows server to enable; default is `0x1`. If server needs to enable TFO, set this to `0x3`.
  - ~~Windows 10 (1607)~~ (Implementation incorrect)
  - Mac OS 10.11 / iOS 9 (Needs testing)
  - FreeBSD 10.3 (Server) / 12.0 (Client): Requires kernel parameters `net.inet.tcp.fastopen.server_enabled` and `net.inet.tcp.fastopen.client_enabled` set to `1`. (Needs testing)

- For Inbound, the `positive integer` set here represents the [limit of pending TFO connection requests](https://tools.ietf.org/html/rfc7413#section-5.1). **Note: Not all OSs support setting this here**:
  - Linux / FreeBSD: The `positive integer` here represents the limit. Max acceptable value is 2147483647. If `true`, it takes `256`. Note on Linux, `net.core.somaxconn` limits this value. If exceeding `somaxconn`, increase `somaxconn` as well.
  - Mac OS: `true` or `positive integer` only enables TFO. The limit needs to be set via kernel parameter `net.inet.tcp.fastopen_backlog`.
  - Windows: `true` or `positive integer` only enables TFO.

- For Outbound, setting to `true` or `positive integer` only enables TFO on any OS.

> `tproxy`: "redirect" | "tproxy" | "off"

Whether to enable transparent proxy (Linux only).

- `"redirect"`: Use Redirect mode transparent proxy. Supports all IPv4/6 TCP connections.
- `"tproxy"`: Use TProxy mode transparent proxy. Supports all IPv4/6 TCP and UDP connections.
- `"off"`: Disable transparent proxy.

Transparent proxy requires Root or `CAP_NET_ADMIN` permission.

::: danger
When `followRedirect` is `true` in [Dokodemo-door](./inbounds/tunnel.md), and `tproxy` in Sockopt settings is empty, the value of `tproxy` in Sockopt settings will be set to `"redirect"`.
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

Default value `"AsIs"`.

When the target address is a domain name, configure the value to control the Outbound connection behavior:

- `"AsIs"`: Xray does no special handling of domains. Finally, Xray uses Go's built-in Dial to initiate connection. Priority is fixed to RFC6724 default (will not follow gai.conf etc.), usually IPv6 preferred.
- Other values: Use Xray-core [Built-in DNS Server](dns.md) for resolution. If no DNSObject exists, system DNS is used. If multiple IPs match, the core randomly selects one as the target IP.
- `"IPv4"`: Attempt to connect using only IPv4.
- `"IPv4v6"`: Attempt to connect using IPv4 or IPv6, but use IPv4 for dual-stack domains. (v4v6 swapped is analogous).
- When `"queryStrategy"` is set in built-in DNS, actual behavior intersects with this option. Only IP types included in both will be resolved. E.g., `"queryStrategy": "UseIPv4"` + `"domainStrategy": "UseIP"` is effectively `"domainStrategy": "UseIPv4"`.
- `"Use"` prefix: If resolution result doesn't meet requirements (e.g., domain only has IPv4 but used UseIPv6), fallback to AsIs.
- `"Force"` prefix: If resolution result doesn't meet requirements, connection fails.

::: tip TIP
When using `"UseIP"` or `"ForceIP"` modes, and `sendThrough` is specified in [Outbound Connection Configuration](outbound.md#outboundobject), the core automatically judges required IP type (IPv4 or IPv6) based on `sendThrough`. If a single IP type is manually specified (e.g., UseIPv4) but mismatches `sendThrough` local address, connection fails.
:::

::: danger
Enabling this feature with improper configuration may cause infinite loops.

TL;DR: Connecting to server requires waiting for DNS result; finishing DNS query requires connecting to server.

> Tony: Chicken or egg first?

Detailed explanation:

1. Trigger: Proxy server (`proxy.com`). Built-in DNS server, non-Local mode.
2. Xray attempts to establish TCP connection to `proxy.com`. **Before** that, query `proxy.com` via built-in DNS.
3. Built-in DNS connects to `dns.com` to query IP of `proxy.com`.
4. **Improper** routing rules cause `proxy.com` to proxy the query sent in step 3.
5. Xray attempts to establish another TCP connection to `proxy.com`.
6. Before establishing, query `proxy.com` via built-in DNS.
7. Built-in DNS reuses connection from step 3 to send query.
8. Problem: Connection in step 3 waits for query result in step 7; query in step 7 waits for connection in step 3 to fully establish.
9. Good Game!

Solutions:

- Change traffic splitting for built-in DNS server.
- Use Hosts.
- ~~If you still don't know the solution, don't use this feature.~~

Therefore, inexperienced users are **not recommended** to use this feature unauthorized.
:::

> `dialerProxy`: ""

An outbound proxy identifier. When not empty, connection is made using specified outbound. Used for chain forwarding supporting underlying transports.

::: danger
Incompatible with ProxySettingsObject.Tag.
:::

> `acceptProxyProtocol`: true | false

Inbound only. Indicates whether to accept PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is for passing real source IP and port. **Ignore if you don't understand it**.

Common reverse proxies (HAProxy, Nginx) can be configured to send it. VLESS fallbacks xver can also send it.

When `true`, requester must send PROXY protocol v1 or v2 after bottom-layer TCP establishment, otherwise connection closes.

> `tcpKeepAliveIdle`: number

TCP idle time threshold in seconds. Keep-Alive probes start after connection is idle for this duration.

For outbound, Xray uses Chrome defaults (idle & interval both 45s). Setting this or `tcpKeepAliveInterval` to negative disables default keepalive; positive overrides default.

For inbound, Keep-Alive is disabled by default. Enabled if either this or `tcpKeepAliveInterval` is non-zero. If only one is set, the other follows OS settings.

> `tcpKeepAliveInterval`: number

Interval between Keep-Alive packets in seconds after TCP enters Keep-Alive state. See above for behavior.

> `tcpUserTimeout`: number

In milliseconds. Details: https://github.com/grpc/proposal/blob/master/A18-tcp-user-timeout.md

> `tcpcongestion`: ""

TCP congestion control algorithm. Linux only.
Not configuring means using system default.

::: tip Common Algorithms

- bbr (Recommended)
- cubic
- reno
  :::

::: tip
Run `sysctl net.ipv4.tcp_congestion_control` to get system default.
:::

> `interface`: ""

Bind outbound network interface name. Supports Linux / iOS / Mac OS / Windows.

> `V6Only`: true | false

When `true`, listening on `::` only accepts IPv6 connections. Linux only.

> `tcpWindowClamp`: number

Bind advertised window size to this value. Kernel picks max between this and SOCK_MIN_RCVBUF/2.

> `tcpMptcp`: true | false

Default `false`. When `true`, enables [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP). Client-only parameter, as golang 1.24+ enables MPTCP by default on listen.
Currently only supports Linux, requires Kernel 5.6+.

> `tcpNoDelay`: true | false

Option removed as golang enables TCP no delay by default. To disable, use customSockopt.

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

Use SRV or TXT records to specify target address/port for outbound. Default `none` (off).

Query goes through system DNS, not Xray built-in DNS. Domain queried is the outbound domain. If query fails, request proceeds with original address/port.

`Srv` prefix: Query SRV record (standard format). `Txt` prefix: Query TXT record (format like `127.0.0.1:80`).

`PortOnly`: Reset port only. `AddressOnly`: Reset address only. `PortAndAddress`: Reset both.

Effective before sockopt `domainStrategy` resolution. After reset, still resolves per `domainStrategy` (if any), but ineffective if Freedom `domainStrategy` is set to resolve to IP beforehand.

PS: If normal domain traffic comes to AsIs Freedom outbound, it attempts resolution and reset here. E.g., core queries SRV record for google.com and resets target accordingly.

> `customSockopt`: []

Array for advanced users to specify any sockopt. Theoretically covers all connection settings. Supports Linux, Windows, Darwin. Example equivalent to `"tcpcongestion": "bbr"`:

Ensure you understand Socket programming.

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

Optional. Target system. Skipped if mismatch. Options: `linux`, `windows`, `darwin` (lowercase). Executes if empty.

> `type`: ""

Required. Type, `int` or `str`.

> `level`: ""

Optional. Protocol level. Default 6 (TCP).

> `opt`: ""

Option name in decimal (Example TCP_CONGESTION 0xd is 13).

> `value`: ""

Value to set. Example sets bbr.
Use decimal number if type is int.

> `happyEyeballs`: [HappyEyeballsObject](#happyeyeballsobject)

RFC-8305 Happy Eyeballs implementation, TCP only. Races target domains and selects first success. Only effective when `Sockopt.domainStrategy` is not `AsIs`.

Note: `UseIPv4v6` / `ForceIPv4v6` reduces available IPs to IPv4 only, falling back to IPv6 query only on failure. Not recommended. Suggest `UseIP` / `ForceIP` with `HappyEyeballs.interleave`.

::: warning
Do not use `Freedom` outbound's `domainStrategy` with this, as `Sockopt` will only see the replaced IP.
:::

#### HappyEyeballsObject

```json
"happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4
}
```

> `tryDelayMs`: number

Interval between race requests in ms. Default 0 (disabled). Recommended 250.

> `prioritizeIPv6`: bool

Whether first IP is IPv6 when sorting. Default `false` (IPv4 first).

> `interleave`: number

"First Address Family count" in RFC-8305. Default 1. Defines interleaving behavior for sorting IP versions.

E.g., waiting IP queue sorted as 46464646 (set to 1), 44664466 (set to 2).

> `maxConcurrentTry`: number

Max concurrent attempts. Prevents core from making massive connections if many IPs resolve but fail. Default 4. Set to 0 to disable happyEyeballs.
