# REALITY

REALITY is a modified form of TLS that uses the appearance and handshake characteristics of a target site as camouflage.

REALITY can only be used together with the `RAW`, `XHTTP`, and `gRPC` transport methods.

:::: tip
REALITY is currently one of the most secure transport-security schemes, and from the outside its traffic shape is consistent with ordinary web browsing.<br>
Enabling REALITY together with a suitable XTLS Vision flow-control mode can improve performance by several times or even more than ten times.

::: details For developers
REALITY only modifies TLS. On the client side it mainly requires slight handling around a fully random session ID and custom certificate verification, and in theory it is broadly compatible with most TLS combinations.
For more information, see the [REALITY project](https://github.com/XTLS/REALITY).
:::
::::

## RealityObject

`RealityObject` corresponds to the `realitySettings` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // outbound example; also applies to inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "security": "reality",
        // [!code focus:30]
        "realitySettings": {
          // Inbound (server-side) settings
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
          // Outbound (client-side) settings
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

> `show`: true | false

When set to `true`, debug information is printed.

::: tip
The following fields are for **inbound** (**server-side**) configuration.
:::

> `target`: string

Required. The format is the same as VLESS fallback [dest](../features/fallback.md#fallbackobject).

The old name was `dest`. In current versions the two fields are aliases.

If `target` supports the post-quantum key-exchange algorithm X25519MLKEM768, the REALITY client also automatically uses that post-quantum algorithm for key negotiation. You can check support with `xray tls ping cloudflare.com`, replacing the domain with your `target` and optionally including a port.

The core decides whether the current configuration is client-side or server-side based on whether this field exists. Do not fill it in on the client side, or it will cause incorrect detection.

::: warning
For camouflage reasons, Xray **directly forwards** traffic that fails authentication, meaning traffic that is not a valid REALITY request, to `target`.
If the IP address of the `target` site is special, for example a site behind Cloudflare CDN, your server effectively becomes a port forwarder for Cloudflare and may be abused after scanning.

To avoid that, consider placing Nginx or something similar in front to filter out unwanted SNI values.
You can also consider configuring `limitFallbackUpload` and `limitFallbackDownload` to limit the rate.
:::

> `xver`: number

Optional. The format is the same as VLESS fallback [xver](../features/fallback.md#fallbackobject).

> `serverNames`: [string]

Required. The list of `serverName` values allowed for clients. `*` wildcards are not supported.

Usually this should stay consistent with `target`. In practice, valid values are any SNI accepted by the server according to the behavior of `target`, and typically refer to the [SAN](https://en.wikipedia.org/wiki/Subject_Alternative_Name) values on the returned certificate.

The list may contain an empty string `""`, meaning connections without SNI are accepted. Using this feature does not require `target` to have an IP certificate; you only need to ensure that it does not reject a Client Hello without SNI. When using this feature, the client-side `serverName` cannot be empty and should instead be filled with any valid IP address as a placeholder.

You can use `xray tls ping` to observe how the server responds to requests without SNI.

> `privateKey`: string

Required. Generate it with `./xray x25519`.

> `minClientVer`: string

Optional. Minimum Xray client version, in `x.y.z` format.

> `maxClientVer`: string

Optional. Maximum Xray client version, in `x.y.z` format.

> `maxTimeDiff`: number

Optional. Maximum allowed time difference, in milliseconds.

> `shortIds`: [string]

Required. The list of available `shortId` values for clients, which can be used to distinguish different clients.

See the `shortId` field for the required format.

If the list contains an empty string, the client-side `shortId` may also be empty.

> `mldsa65Seed`: string

Server-only. The private key used to add an extra post-quantum signature to the certificate sent to the REALITY client, using ML-DSA-65. If a quantum computer capable of breaking x25519 ever exists, leaked `password` material could allow MITM attacks; this feature is intended to prevent that future risk.

Generate the keypair with `xray mldsa65`. After the server is configured with the private key, the signature is added only as a certificate extension, so it does not affect old clients or clients that do not enable this feature.

Note that after enabling this feature, the certificate returned by `target` **must** be longer than 3500 bytes, because the post-quantum signature makes the temporary REALITY certificate larger. To avoid becoming a fingerprint, the `target` certificate also needs to be large. You can inspect this with `xray tls ping example.com`. For fully post-quantum security, `target` also needs to support the X25519MLKEM768 post-quantum key exchange, which can be checked with the same command.

> `limitFallbackUpload` / `limitFallbackDownload`

::: warning
The best practice for REALITY is still to borrow certificates from the same ASN, so in most cases you do not need this feature. It is only worth considering when you are forced to borrow certificates from something like a free CDN such as Cloudflare and want to avoid your server becoming an acceleration node for others.

Fallback rate limiting is itself a fingerprint and is not recommended. If you are developing a panel or one-click script, make sure these parameters are randomized.
:::

::: tip
`limitFallbackUpload` and `limitFallbackDownload` are optional and can rate-limit fallback connections that fail verification. `bytesPerSec` defaults to `0`, which means disabled.

Mechanism: for each unverified fallback connection, the rate-limiting algorithm starts after `afterBytes` bytes have been transmitted.
The algorithm uses a token bucket. The bucket capacity is `burstBytesPerSec`. Each transmitted byte consumes one token. The bucket starts full with `burstBytesPerSec` tokens.
Every second the bucket is refilled with `bytesPerSec` tokens until full.

Example: `afterBytes=10485760`, `burstBytesPerSec=5242880`, `bytesPerSec=1048576` means traffic is limited to 1 MB/s after 15 MB has been transmitted. If transmission pauses, it can burst back up to 5 MB/s after 5 seconds and then settle again at 1 MB/s.

Guidance: if `afterBytes` and `burstBytesPerSec` are too large, rate limiting has little practical effect. If `bytesPerSec` and `burstBytesPerSec` are too small, the behavior becomes easy to detect.
These parameters should be chosen with the resource size of the borrowed site in mind. If you do not want bursts, set `burstBytesPerSec` to `0`.
:::

> `afterBytes`: number

Optional. Starts rate limiting fallback REALITY connections only after the specified number of bytes has been transmitted. The default is `0`.

> `bytesPerSec`: number

Optional. Base rate limit for fallback REALITY connections, in bytes per second. The default is `0`, meaning disabled.

> `burstBytesPerSec`: number

Optional. Burst rate limit for fallback REALITY connections, in bytes per second. It takes effect when it is greater than `bytesPerSec`.

::: tip
The following fields are for **outbound** (**client-side**) configuration.
:::

> `serverName`: string

One of the server-side `serverNames`.

The client can also set this to any IP address. In that case Xray sends a Client Hello without an SNI extension. To use this feature, the server-side `serverNames` must contain an empty string `""`.

> `fingerprint`: string

Required. Same as [TLSObject](./tls.md#tlsobject). Note that `unsafe`, which disables uTLS for TLS, is not supported here because REALITY relies on that library to manipulate lower-level TLS parameters.

> `shortId`: string

One of the server-side `shortIds`.

Its length is 8 bytes, which means up to 16 hexadecimal characters in the range `0` to `f`. It may be shorter than 16 characters, and the core pads trailing zeroes automatically, but the number of characters must be **even**, because one byte is represented by two hex digits.

For example, `aa1234` is automatically expanded to `aa12340000000000`, but `aaa1234` causes an error.

Zero is also even, so if the server-side `shortIds` contains an empty string `""`, the client-side value may also be empty.

> `password`: string

Required. The public key corresponding to the server private key. Generate it with `./xray x25519 -i "server private key"`. The old field name was `publicKey`, but it was renamed to avoid misunderstanding. It is indeed an x25519 public key, but in the REALITY design it is held by the client and should not be treated as something to publish openly.

> `mldsa65Verify`

Optional. The public key used for `mldsa65` signature verification. When non-empty, Xray uses it to verify the certificate returned by the server. See the description of `mldsa65Seed` for details.

> `spiderX`: string

Initial crawler path and parameters. It is recommended that each client use a different value.
