# 通过 Cloudflare Warp 增强代理安全性

Xray（1.6.5+）新加入了 WireGuard 出站，虽然增加的代码和依赖会增大 core 体积，但是我们认为这是一个很有必要的新功能，原因有三：

1. 通过近期的一些讨论和[实验](https://github.com/net4people/bbs/issues/129#issuecomment-1308102504)，我们知道代理回国流量是不安全的。一种应对方式是将回国流量路由至黑洞，它的缺点是由于 geosite 和 geoip 更新的不及时或者新手不知道如何在客户端适当分流，结果流量进入黑洞，影响使用体验。
   这时我们只需要将回国流量导入 Cloudflare Warp，可以在不影响使用体验的情况下达到同样的安全性。
2. 众所周知，大部分机场会记录用户访问域名的日志，某些机场还会审计和阻断一些用户流量。保护用户私密性的一个方法，就是在客户端使用链式代理。
   Warp 使用的 WireGuard 轻量级 VPN 协议会在代理层内增加一层加密。对于机场而言，用户所有流量的目标都是 Warp，从而最大程度保护自己的隐私。
3. 方便使用，只需要一个 core 即可完成分流，WireGuard Tun，链式代理的设置。

## 申请 Warp 账户

### 感谢 Cloudflare 推动自由的互联网，现在你可以免费使用 Warp 服务，连接的时候会根据出口自动选择最近的服务器

#### 方法 1：

1. 使用一台 vps，下载 [wgcf](https://github.com/ViRb3/wgcf/releases)
2. 运行 `wgcf register` 生成 `wgcf-account.toml`
3. 运行 `wgcf generate` 生成 `wgcf-profile.conf` 拷贝内容如下：

```ini
[Interface]
PrivateKey = 我的私钥
Address = 172.16.0.2/32
Address = 2606:4700:110:8949:fed8:2642:a640:c8e1/128
DNS = 1.1.1.1
MTU = 1280
[Peer]
PublicKey = Warp公钥
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = engage.cloudflareclient.com:2408
```

#### 方法 2：

1. 使用 [warp-reg.sh](https://github.com/chise0713/warp-reg.sh)，运行：

```
bash -c "$(curl -L warp-reg.vercel.app)"
```

- 输出

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

2. 拷贝输出的内容

#### 方法 3：

1. 使用[wgcf-cli](https://github.com/ArchiveNetwork/wgcf-cli)，运行以下内容进行安装：

```
bash -c "$(curl -L wgcf-cli.vercel.app)"
```

2. 运行 `wgcf-cli register` 进行注册，输出：

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

- 完整文件将会保存到工作目录的 `wgcf.json` 内。

3. 运行 `wgcf-cli generate --xray` 来生成一个WireGurad出站，他会将内容保存到 `wgcf.xray.json` 内

- 示例文件：

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

## 在服务端分流回国流量至 warp

在现有出站中新增一个 WireGurad 出站

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "我的私钥",
    "address": [
      "172.16.0.2/32",
      "2606:4700:110:8949:fed8:2642:a640:c8e1/128"
    ],
    "peers": [
      {
        "publicKey": "Warp公钥",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ],
    "reserved": [0, 0, 0] // 如果你有的话，粘贴reserved到这里
  },
  "tag": "wireguard-1"
}
```

路由策略推荐`IPIfNonMatch`

在现有路由中新增以下

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

## 客户端使用 warp 链式代理

```json
{
  "outbounds": [
    {
      "protocol": "wireguard",
      "settings": {
        "secretKey": "我的私钥",
        "peers": [
          {
            "publicKey": "Warp公钥",
            "endpoint": "engage.cloudflareclient.com:2408"
          }
        ],
        "reserved": [0, 0, 0] // 如果你有的话，粘贴reserved到这里
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
        "address": "我的IP",
        "port": 12345, // 你的端口
        "id": "我的UUID",
        "security": "auto"
      },
      "streamSettings": {
        "method": "tcp"
      }
    }
  ]
}
```

## 通过 MASQUE 接入 Warp

WireGuard 走 UDP，用的是 WARP 一整组端口（远不止 `2408`）、横跨整片 anycast 段，在 UDP 被整体封锁或限速的网络里不一定可用。此时可以改用 [MASQUE](../../config/transports/masque.md)（CONNECT-IP，RFC 9484）接入同一套 Warp：它跑在 HTTP/2（TCP）或 HTTP/3（QUIC）之上的 TLS 里，与官方 Warp 客户端一致。

使用 [MASQUE 出站](../../config/outbounds/masque.md)，配置填在 `streamSettings.masqueSettings.warp` 里。

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

- `privateKey`：设备的 P-256（secp256r1）私钥，PEM 或 base64 均可，支持 PKCS#8 与 SEC 1 格式。核心据此即时生成一张自签名客户端证书做 mTLS，Cloudflare 只校验其公钥是否为该设备注册时登记的那一个，不传输任何口令。
- `publicKey`：MASQUE 端点证书的 P-256 公钥（SubjectPublicKeyInfo），PEM 或 base64 均可。服务端证书会被 pin 到该公钥，所以 `serverName` 可任意填；`tlsSettings` 中设置了 `pinnedPeerCertSha256` 或 `verifyPeerCertByName` 时则忽略 `publicKey`，只按它们验证（见下文 SNI 部分）。当前 masque 边缘（如 `162.159.198.2`）使用固定的自签名证书，其公钥可自行读取：

  ```bash
  openssl s_client -connect 162.159.198.2:443 \
    -servername consumer-masque.cloudflareclient.com -alpn h2 -tls1_3 </dev/null \
    | openssl x509 -noout -pubkey | openssl pkey -pubin -outform der | base64 -w 0
  ```

- `address`：Warp 注册时分配给设备的地址（IPv4 /32、IPv6 /128），Warp 不在隧道内下发地址，故在此显式填写。

::: warning
与 WireGuard 不同，MASQUE 用的是一把 **P-256（secp256r1）** 设备密钥（上面的 `privateKey`）。前文 wgcf / warp-reg 生成的是 WireGuard 的 Curve25519 密钥，masque 用不了。需要用支持 MASQUE 的注册方式取得这把 P-256 私钥及其 `address`，`publicKey` 用上面读到的边缘公钥即可。该设备还需开启 `warp_enabled`，否则端点会返回 access denied。
:::

### 端点与端口都不固定

Warp 是一大片 anycast，不要绑死在单个 IP 或单个端口上：

- WireGuard：用 WARP 一整组 UDP 端口（`2408`、`500`、`1701`、`4500`、`2371`、`4233`、`8854` 等几十个），分布在 `162.159.192.0/24`、`162.159.193.0/24`、`162.159.195.0/24`、`188.114.96.0/22` 等 anycast 段。
- MASQUE（H2/TCP）：后端落在 `162.159.198.0/24` 段内的多台主机上（如 `.2`、`.10`），实测 `443` `500` `1701` `4443` `4500` `8443` `8095` 等端口都能完成握手并返回相同的 masque 证书。

不同账户类型的 masque 端点不同，三者的 `publicKey` 相同（IPv4 实测返回同一张证书）：

| 账户类型   | IPv4            | IPv6               |
| ---------- | --------------- | ------------------ |
| WARP       | `162.159.198.2` | `2606:4700:103::2` |
| WARP+      | `162.159.199.2` | `2606:4700:104::2` |
| Zero Trust | `162.159.197.2` | `2606:4700:102::2` |

某个 IP 或端口被针对时，换掉出站 `settings` 里的 `address` / `port` 即可，`warp` 里的各项都不用动。换 IP 时要确认对方返回的证书公钥与 `publicKey` 一致，否则会被 pin 拒绝，例如 `162.159.198.1` 返回的就是另一张证书。

### SNI 与 FinalMask

pin 只校验公钥，不校验域名，masque 边缘也是按 IP 而不是 SNI 选择后端（实测 `162.159.198.2` 对不同的 SNI 都返回同一张证书），所以 `serverName` 有两种填法：

- `consumer-masque.cloudflareclient.com`：官方 Warp 客户端发送的名字，下面的示例用的就是它。名字本身会暴露 masque，遇到按 SNI 封锁时配合 `fragment` / `noise`。
- `www.cloudflare.com` 这类普通域名：握手里不出现 masque 的名字。有的边缘对 Cloudflare 上站点的 SNI 会返回该站点的 CDN 证书，这时按 `publicKey` 的 pin 会失败，可在 `tlsSettings` 中改用 `pinnedPeerCertSha256`（`xray tls ping` 会输出证书的 SHA256）或 `verifyPeerCertByName` 验证，设置后忽略 `publicKey`，即 WARP 的 domain fronting。

两种都改变不了 IP，masque 用的是独立的 IP 段，这才是它真正的特征。

[FinalMask](../../config/transports/finalmask.md) 可以再加一层伪装：H2（TCP）在 `finalmask.tcp` 用 `fragment` 分片 Client Hello，H3（QUIC）在 `finalmask.udp` 用 `noise` 伪装 QUIC Initial。

::: warning
masque 边缘不支持 ECH，会直接拒绝（实测 H2 报 `ECH_REJECTED` 后证书校验失败，H3 的 QUIC 连接以 `CRYPTO_ERROR 0x179` / `ech_required` 关闭），隐藏名字换 `serverName` 即可。ECH 只对 **WARP API** 的调用有用（通用边缘支持 ECH）。
:::

完整出站示例（H2 + fragment，UDP 受限时最稳）：

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

走 HTTP/3 时把 `alpn` 换成 `["h3"]`，并把伪装放到 `finalmask.udp` 的 `noise`。其余分流、链式代理用法与上面的 WireGuard 一致。
