# Enhancing Proxy Security via Cloudflare Warp

Xray (1.6.5+) has added a WireGuard outbound. Although the additional code and dependencies increase the core size, we believe this is a highly necessary new feature for three reasons:

1. Through recent discussions and [experiments](https://github.com/net4people/bbs/issues/129#issuecomment-1308102504), we know that routing traffic back to China via a proxy is insecure. One countermeasure is to route return traffic to a blackhole. The downside is that if `geosite` and `geoip` rules are not updated in time, or if beginners don't know how to configure routing properly on the client side, legitimate traffic enters the blackhole, affecting the user experience.
   By routing return traffic (traffic destined for China) to Cloudflare Warp instead, we can achieve the same level of security without impacting the user experience.
2. It is well known that most proxy providers ("Airports") log user domain access history, and some even audit and block certain user traffic. One way to protect user privacy is to use a chain proxy on the client side.
   The WireGuard lightweight VPN protocol used by Warp adds a layer of encryption within the proxy layer. For the proxy provider, the destination of all user traffic appears to be Warp, thereby maximizing privacy protection.
3. Ease of use. A single core can handle routing, WireGuard Tun, and chain proxy settings.

## Applying for a Warp Account

### Thanks to Cloudflare for promoting a free internet. You can now use the Warp service for free, and it will automatically select the nearest server when connecting

#### Method 1

1. Use a VPS to download [wgcf](https://github.com/ViRb3/wgcf/releases).
2. Run `wgcf register` to generate `wgcf-account.toml`.
3. Run `wgcf generate` to generate `wgcf-profile.conf`. Copy the content as follows:

```ini
[Interface]
PrivateKey = My_Private_Key
Address = 172.16.0.2/32
Address = 2606:4700:110:8949:fed8:2642:a640:c8e1/128
DNS = 1.1.1.1
MTU = 1280
[Peer]
PublicKey = Warp_Public_Key
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = engage.cloudflareclient.com:2408
```

#### Method 2

1. Use [warp-reg.sh](https://github.com/chise0713/warp-reg.sh), run:

```
bash -c "$(curl -L warp-reg.vercel.app)"
```

- Output:

```json
{
  "endpoint": {
    "v4": "162.159.192.7",
    "v6": "[2606:4700:d0::a29f:c007]"
  },
  "reserved_dec": [35, 74, 190],
  "reserved_hex": "0x234abe",
  "reserved_str": "I0q+",
  "private_key": "yL0kApRiZW4VFfNkKAQ/nYxnMFT3AH0dfVkj1GAlr1k=",
  "public_key": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
  "v4": "172.16.0.2",
  "v6": "2606:4700:110:81f3:2a5b:3cad:9d4:9ea6"
}
```

1. Copy the output content.

#### Method 3

1. Use [wgcf-cli](https://github.com/ArchiveNetwork/wgcf-cli). Run the following to install:

```
bash -c "$(curl -L wgcf-cli.vercel.app)"
```

1. Run `wgcf-cli register` to register. Output:

```
❯ wgcf-cli register
{
    "endpoint": {
        "v4": "162.159.192.7:0",
        "v6": "[2606:4700:d0::a29f:c007]:0"
    },
    "reserved_str": "6nT5",
    "reserved_hex": "0xea74f9",
    "reserved_dec": [
        234,
        116,
        249
    ],
    "private_key": "WIAKvgUlq5fBazhttCvjhEGpu8MmGHcb1H0iHSGlU0Q=",
    "public_key": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
    "addresses": {
        "v4": "172.16.0.2",
        "v6": "2606:4700:110:8d9c:3c4e:2190:59d1:2d3c"
    }
}
```

- The complete file will be saved to `wgcf.json` in the working directory.

1. Run `wgcf-cli generate --xray` to generate a WireGuard outbound config. It will save the content to `wgcf.xray.json`.

- Example file:

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "6CRVRLgFwGajnikoVOPTDNZnDhx3EydhPsMgpxHfBCY=",
    "address": [
      "172.16.0.2/32",
      "2606:4700:110:857a:6a95:fe27:1870:2a9d/128"
    ],
    "peers": [
      {
        "publicKey": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
        "allowedIPs": ["0.0.0.0/0", "::/0"],
        "endpoint": "162.159.192.1:2408"
      }
    ],
    "reserved": [240, 25, 146],
    "mtu": 1280
  },
  "tag": "wireguard"
}
```

## Routing Traffic Back to China via Warp on the Server Side

Add a new WireGuard outbound to your existing outbounds:

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "My_Private_Key",
    "address": [
      "172.16.0.2/32",
      "2606:4700:110:8949:fed8:2642:a640:c8e1/128"
    ],
    "peers": [
      {
        "publicKey": "Warp_Public_Key",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ],
    "reserved": [0, 0, 0] // If you have it, paste 'reserved' here
  },
  "tag": "wireguard-1"
}
```

Recommended routing strategy: `IPIfNonMatch`.

Add the following to your existing routing rules:

```
            {
                "domain": [
                    "geosite:cn"
                ],
                "outboundTag": "wireguard-1"
            },
            {
                "ip": [
                    "geoip:cn"
                ],
                "outboundTag": "wireguard-1"
            }
```

## Using Warp Chain Proxy on the Client Side

```json
{
  "outbounds": [
    {
      "protocol": "wireguard",
      "settings": {
        "secretKey": "My_Private_Key",
        "peers": [
          {
            "publicKey": "Warp_Public_Key",
            "endpoint": "engage.cloudflareclient.com:2408"
          }
        ],
        "reserved": [0, 0, 0] // If you have it, paste 'reserved' here
      },
      "streamSettings": {
        "sockopt": {
          "dialerProxy": "proxy"
        }
      },
      "tag": "wireguard-1"
    },
    {
      "tag": "proxy",
      "protocol": "vmess",
      "settings": {
        "address": "My_Server_IP",
        "port": 12345, // My_Port
        "id": "My_UUID",
        "security": "auto"
      },
      "streamSettings": {
        "method": "tcp"
      }
    }
  ]
}
```

## Connecting to Warp via MASQUE

WireGuard runs over UDP, uses a whole set of WARP ports (far more than just `2408`) spread across entire anycast ranges, and may not be usable on networks where UDP is blocked or throttled as a whole. In that case, you can use [MASQUE](../../config/transports/masque.md) (CONNECT-IP, RFC 9484) instead to connect to the same Warp service: it runs over HTTP/2 (TCP) or HTTP/3 (QUIC) inside TLS, the same as the official Warp client.

Use the [MASQUE outbound](../../config/outbounds/masque.md); the configuration goes in `streamSettings.masqueSettings.warp`.

### WarpObject

```json
{
  // [!field focus]
  "warp": {
    "privateKey": "MHcCAQEE...",
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
    "address": ["172.16.0.2/32", "2606:4700:110:8a36::2/128"]
  }
}
```

- `privateKey`: the device's P-256 (secp256r1) private key, in either PEM or base64; both PKCS#8 and SEC 1 formats are supported. From it, the core generates a self-signed client certificate on the fly for mTLS. Cloudflare only checks whether its public key is the one registered for this device at registration time, and no password of any kind is transmitted.
- `publicKey`: the P-256 public key (SubjectPublicKeyInfo) of the MASQUE endpoint certificate, in either PEM or base64. The server certificate is pinned to this public key, so `serverName` can be set to anything. The current masque edge (e.g. `162.159.198.2`) uses a fixed self-signed certificate, and you can read its public key yourself:

  ```bash
  openssl s_client -connect 162.159.198.2:443 \
    -servername consumer-masque.cloudflareclient.com -alpn h2 -tls1_3 </dev/null \
    | openssl x509 -noout -pubkey | openssl pkey -pubin -outform der | base64 -w 0
  ```

- `address`: the addresses assigned to the device at Warp registration (IPv4 /32, IPv6 /128). Warp does not assign addresses inside the tunnel, so they are set explicitly here.

::: warning
Unlike WireGuard, MASQUE uses a **P-256 (secp256r1)** device key (the `privateKey` above). The wgcf / warp-reg tools described earlier generate WireGuard Curve25519 keys, which masque cannot use. You need to obtain this P-256 private key and its `address` through a registration method that supports MASQUE; for `publicKey`, simply use the edge public key read above. The device must also have `warp_enabled` turned on, otherwise the endpoint returns access denied.
:::

### Endpoints and Ports Are Not Fixed

Warp is a large anycast network; do not tie yourself to a single IP or a single port:

- WireGuard: uses a whole set of WARP UDP ports (dozens of them, such as `2408`, `500`, `1701`, `4500`, `2371`, `4233`, and `8854`), spread across anycast ranges such as `162.159.192.0/24`, `162.159.193.0/24`, `162.159.195.0/24`, and `188.114.96.0/22`.
- MASQUE (H2/TCP): the backends sit on multiple hosts within the `162.159.198.0/24` range (e.g. `.2`, `.10`). In testing, ports such as `443` `500` `1701` `4443` `4500` `8443` `8095` all complete the handshake and return the same masque certificate.

Different account types have different masque endpoints, and all three share the same `publicKey` (tested over IPv4, they return the same certificate):

| Account type | IPv4            | IPv6               |
| ------------ | --------------- | ------------------ |
| WARP         | `162.159.198.2` | `2606:4700:103::2` |
| WARP+        | `162.159.199.2` | `2606:4700:104::2` |
| Zero Trust   | `162.159.197.2` | `2606:4700:102::2` |

When a particular IP or port is targeted, just change `address` / `port` in the outbound's `settings`; none of the items in `warp` need to be touched. When changing the IP, make sure the public key of the certificate returned by the other side matches `publicKey`, otherwise it will be rejected by the pin. For example, `162.159.198.1` returns a different certificate.

### SNI and FinalMask

The pin only checks the public key, not the domain name, and the masque edge also selects the backend by IP rather than by SNI (in testing, `162.159.198.2` returned the same certificate for different SNIs), so there are two ways to set `serverName`:

- `consumer-masque.cloudflareclient.com`: the name sent by the official Warp client, which is what the example below uses. The name itself reveals masque; if you run into SNI-based blocking, combine it with `fragment` / `noise`.
- An ordinary domain such as `www.cloudflare.com`: the masque name does not appear in the handshake, and the rest of the configuration stays the same.

Neither of them can change the IP: masque uses its own separate IP range, and that is its real signature.

[FinalMask](../../config/transports/finalmask.md) can add another layer of camouflage: for H2 (TCP), use `fragment` in `finalmask.tcp` to fragment the Client Hello; for H3 (QUIC), use `noise` in `finalmask.udp` to camouflage the QUIC Initial.

::: warning
The masque edge does not support ECH and rejects it outright (in testing, H2 reports `ECH_REJECTED` and then certificate verification fails, while the H3 QUIC connection is closed with `CRYPTO_ERROR 0x179` / `ech_required`). To hide the name, simply change `serverName`. ECH is only useful for **WARP API** calls (the general edge supports ECH).
:::

Complete outbound example (H2 + fragment, the most stable option when UDP is restricted):

```json
{
  "protocol": "masque",
  "settings": {
    "address": "162.159.198.2",
    "port": 443
  },
  "streamSettings": {
    "method": "masque",
    "masqueSettings": {
      "warp": {
        "privateKey": "MHcCAQEE...",
        "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
        "address": ["172.16.0.2/32", "2606:4700:110:8a36::2/128"]
      }
    },
    "security": "tls",
    "tlsSettings": {
      "serverName": "consumer-masque.cloudflareclient.com",
      "alpn": ["h2"]
    },
    "finalmask": {
      "tcp": [
        {
          "type": "fragment",
          "settings": {
            "packets": "tlshello",
            "lengths": ["10-20"],
            "delays": ["10-20"]
          }
        }
      ]
    }
  },
  "tag": "warp-masque"
}
```

To use HTTP/3, change `alpn` to `["h3"]` and move the camouflage to `noise` in `finalmask.udp`. Other usage, such as routing and chain proxying, is the same as for WireGuard above.
