# TLS

TLS is a common transport-security mechanism.

It can be used to configure transport-layer encryption, certificate verification, client fingerprints, and related certificate settings.

## TLSObject

`TLSObject` corresponds to the `tlsSettings` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // outbound example; also applies to inbound
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
          "echSockopt": {}
        }
      }
    }
  ]
}
```

> `serverName`: string

Server name. The server certificate's SAN must contain this value. It can be a domain name or an IP address. If it is a domain name, it will be sent in the SNI extension of the Client Hello. IP addresses will not send the SNI extension, because SNI does not allow IP addresses. If you fill in an IPv6 address, wrap it in `[]`.

When left empty, the value in `address` is used automatically if that value is a domain name.

Special value `"FromMitM"` causes Xray to use the SNI extracted from TLS decrypted by a `dokodemo-door` inbound.

> `verifyPeerCertByName`: string

Client-only. The SNI used for certificate verification. Multiple domain names can be separated with `,`; it is enough for any one SAN in the certificate to match one of them. This overrides the `serverName` used for verification and is intended for special cases such as domain fronting.

Special value `"FromMitM"` causes Xray to additionally include the SNI extracted from TLS decrypted by a `dokodemo-door` inbound.

> `rejectUnknownSni`: bool

When set to `true`, the server rejects the TLS handshake if the received SNI does not match the certificate domain. The default is `false`.

> `alpn`: [string]

An array of strings that specifies the ALPN values used during TLS handshake. The default value is `["h2", "http/1.1"]`.

Special value `["FromMitM"]`, when it is the only element, causes outbound TLS to reuse the ALPN from the TLS connection decrypted by a `dokodemo-door` inbound.

> `minVersion`: string

`minVersion` is the minimum acceptable TLS version.

> `maxVersion`: string

`maxVersion` is the maximum acceptable TLS version.

> `cipherSuites`: string

`cipherSuites` configures the list of supported cipher suites, separated by `:`.

You can find Go cipher-suite names and descriptions [here](https://golang.org/src/crypto/tls/cipher_suites.go#L500) or [here](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
These two options are not required in normal cases and usually do not affect security. If left unset, Go chooses automatically according to the platform. If you are not familiar with them, do not configure them.
:::

> `allowInsecure`: true | false

Whether to allow insecure connections. Client-only. The default value is `false`.

When set to `true`, Xray does not verify the validity of the TLS certificate provided by the remote host.

::: danger
~~For security reasons, this option should not be set to `true` in real deployments, otherwise you may be vulnerable to man-in-the-middle attacks.~~

This option is deprecated. Use `pinnedPeerCertSha256` to specify the certificate manually instead.
:::

> `disableSystemRoot`: true | false

Whether to disable the operating system's built-in CA certificates. The default value is `false`.

When set to `true`, Xray uses only the certificates specified in `certificates` during TLS handshake. When set to `false`, Xray uses only the operating system's built-in CA certificates during TLS handshake.

> `enableSessionResumption`: true | false

Whether to enable session resumption. It is disabled by default, and session resumption is only attempted when both the server and the client enable it.

If negotiation succeeds, certificates do not need to be transmitted during the handshake. This saves a tiny amount of handshake time, which is usually negligible.

Note that this is not TLS 0-RTT. `gotls` does not support that feature yet, so this does not reduce TLS handshake RTT.

> `fingerprint`: string

This parameter configures the fingerprint of the `TLS Client Hello`. The default value is `chrome`. To revert to native Go TLS, set it to `unsafe`. When enabled, Xray uses the uTLS library to **simulate** a TLS fingerprint, or generates one randomly. Three configuration styles are supported:

1. TLS fingerprints of the latest versions of common browsers, including:

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

2. Automatically generate a fingerprint when Xray starts:

- `"random"`: randomly choose one from newer browser versions
- `"randomized"`: generate a completely random unique fingerprint that fully supports TLS 1.3 with X25519

3. Use native uTLS hello names such as `"HelloRandomizedNoALPN"` or `"HelloChrome_106_Shuffle"`. See the full list in the [uTLS library](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434).

::: tip
This feature only **simulates** the `TLS Client Hello` fingerprint. Behavior and other fingerprints remain the same as Go. If you want more complete browser-like TLS fingerprints and behavior, use [Browser Dialer](./websocket.md#browser-dialer).
:::

::: tip
When this feature is enabled, some TLS options that affect TLS fingerprints are overridden by the uTLS library and stop taking effect, such as ALPN.
The parameters still passed through are:
`"serverName" "disableSystemRoot" "pinnedPeerCertSha256" "masterKeyLog"`
:::

> `pinnedPeerCertSha256`: string

Used to specify the SHA-256 hash of the remote server certificate. It uses hexadecimal encoding and is case-insensitive, for example `e8e2d387fdbffeb38e9c9065cf30a97ee23c0e3d32ee6f78ffae40966befccc9`. Multiple hash values can be joined with `,`, and verification succeeds if any one of them matches.

This encoding matches the SHA-256 certificate fingerprint shown by the Chrome certificate viewer and the SHA-256 certificate fingerprint format used on crt.sh. You can compute it with `xray tls hash --cert <cert.pem>`, or with `openssl x509 -noout -fingerprint -sha256 -in cert.pem`, including its colon-separated format. `xray tls ping` also prints the SHA-256 hash of the remote certificate.

This check overrides normal certificate validation. There are two cases:

- If the core finds that the matching hash belongs to a leaf certificate, verification succeeds immediately.
- If the core finds that the matching hash belongs to a CA certificate, whether root or intermediate, it uses the value in `serverName` to verify that the leaf certificate is signed by that CA.

> `certificates`: \[ [CertificateObject](#certificateobject) \]

Certificate list. Each item represents one certificate. A full chain is recommended.

::: tip
If you want an A or A+ rating from tools such as ssllibs or myssl, see [this discussion](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `curvePreferences`: [string]

An array of strings that specifies the curves supported when performing ECDHE during TLS handshake. Supported values are:

```text
CurveP256
CurveP384
CurveP521
X25519
X25519MLKEM768
SecP256r1MLKEM768*
SecP384r1MLKEM1024*
```

\*: not supported by uTLS

As of Go 1.26, the default includes all curves above. Changing the order does not force either side to prefer a specific curve; the actual curve is negotiated by the key-exchange mechanism itself.

> `masterKeyLog`: string

Path to a `(Pre)-Master-Secret` log file. It can be used by software such as Wireshark to decrypt TLS connections sent by Xray.

> `echServerKeys`: string

Server-only parameter used to enable Encrypted Client Hello on the server.

Use `xray tls ech --serverName example.com` to generate an ECH Server Key and its corresponding Config. `example.com` is the SNI exposed to the outside when SNI is encrypted, and can be any value. The Server Key includes the ECHConfig. If you lose the client-side Config, you can recover it with `xray tls ech -i "your server key"`. You can publish it in a DNS HTTPS record; see the format [here](https://dns.google/query?name=encryptedsni.com&rr_type=HTTPS) or in RFC 9460.

Note that after ECH is configured, the server still accepts normal non-ECH connections.

> `echConfigList`: string

Client-only parameter that configures ECHConfig. A non-empty value means the client enables Encrypted Client Hello. Two formats are supported.

The first is a fixed ECHConfig string, for example:

`"AF7+DQBaAAAgACA51i3Ssu4wUMV4FNCc8iRX5J+YC4Bhigz9sacl2lCfSQAkAAEAAQABAAIAAQADAAIAAQACAAIAAgADAAMAAQADAAIAAwADAAtleGFtcGxlLmNvbQAA"`

The second is querying a DNS server. For example, when using a CDN, you can dynamically obtain ECHConfig from HTTPS records. If a valid ECH Config is obtained, Xray obeys the TTL returned by the server. The query target is the configured SNI, or the configured server domain name if SNI is empty and the target is a domain name.

The basic format is `"udp://1.1.1.1"`, meaning query ECHConfig through UDP DNS 1.1.1.1. You can also use `"https://1.1.1.1/dns-query"` or `h2c://` to query via DoH or h2c. All of these support an explicit port, such as `udp://1.1.1.1:53`. If omitted, the default port is 53 or 443 according to the protocol.

You can also specify a dedicated domain for the ECHConfig lookup in the form `"example.com+https://1.1.1.1/dns-query"`. In that case Xray forcibly uses the ECHConfig from the DNS records of `example.com` for the connection. This is useful if you want to obtain ECHConfig from DNS without exposing that you are querying the target domain's HTTPS record, or when you do not want to publish HTTPS records under that domain.

> `echSockopt`: [SockoptObject](./sockopt.md#sockoptobject)

Adjusts the underlying socket options of the connection used when querying DNS for ECH records.

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

Server certificates are hot-reloaded every 3600 seconds, which is once per hour.

> `ocspStapling`: number

OCSP stapling refresh interval in seconds. The default value is `0`. Any non-zero value enables OCSP stapling and also replaces the default 3600-second certificate hot-reload interval; reloading and OCSP stapling happen together.

> `oneTimeLoading`: true | false

Load only once. The default is `false`. When set to `true`, both certificate hot reload and OCSP stapling are disabled.

> `usage`: "encipherment" | "verify" | "issue"

Certificate usage. The default value is `"encipherment"`.

- `"encipherment"`: the certificate is used for TLS authentication and encryption
- `"verify"`: the certificate is used to verify remote TLS certificates; in this case it must be a CA certificate
- `"issue"`: the certificate is used to issue other certificates; in this case it must also be a CA certificate

::: tip TIP 1
On Windows, you can install a self-signed CA certificate into the system store to verify remote TLS certificates.
:::

::: tip TIP 2
When a new client request arrives, suppose the specified `serverName` is `"xray.com"`. Xray first looks through the certificate list for a certificate usable for `"xray.com"`. If none is found, it uses any certificate whose `usage` is `"issue"` to issue one suitable for `"xray.com"` with a one-hour validity period, then adds that new certificate to the list for later use.
:::

::: tip TIP 3
When both `certificateFile` and `certificate` are specified, Xray prefers `certificateFile`. The same applies to `keyFile` and `key`.
:::

::: tip TIP 4
When `usage` is `"verify"`, both `keyFile` and `key` may be empty.
:::

::: tip TIP 5
You can generate a self-signed CA certificate with `xray tls cert`.
:::

::: tip TIP 6
If you already own a domain name, you can conveniently obtain free third-party certificates with tools such as [acme.sh](https://github.com/acmesh-official/acme.sh).
:::

> `buildChain`: true | false

Only takes effect when the certificate usage is `issue`. If set to `true`, the CA certificate is embedded into the issued certificate chain.

::: tip TIP 1
You should not embed a root certificate into the chain. This option is suitable only when the signing CA certificate is an intermediate certificate.
:::

> `certificateFile`: string

Path to the certificate file, for example a `.crt` file generated by OpenSSL.

> `certificate`: [string]

An array of strings representing the certificate content, in the same format as the sample above. Choose either `certificate` or `certificateFile`.

> `keyFile`: string

Path to the private-key file, for example a `.key` file generated by OpenSSL. Password-protected key files are not currently supported.

> `key`: [string]

An array of strings representing the private-key content, in the same format as the sample above. Choose either `key` or `keyFile`.
