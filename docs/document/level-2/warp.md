---
title: 通过 Cloudflare Warp 增强代理安全性
---

# 通过 Cloudflare Warp 增强代理安全性

Xray（1.6.5+）新加入了 WireGuard 出站，虽然增加的代码和依赖会增大 core 体积，但是我们认为这是一个很有必要的新功能，原因有三：

1. 通过近期的一些讨论和[实验](https://github.com/net4people/bbs/issues/129#issuecomment-1308102504)，我们知道代理回国流量是不安全的。一种应对方式是将回国流量路由至黑洞，它的缺点是由于 geosite 和 geoip 更新的不及时或者新手不知道如何在客户端适当分流，结果流量进入黑洞，影响使用体验。
   这时我们只需要将回国流量导入 Cloudflare Warp，可以在不影响使用体验的情况下达到同样的安全性。
2. 众所周知，大部分机场会记录用户访问域名的日志，某些机场还会审计和阻断一些用户流量。保护用户私密性的一个方法，就是在客户端使用链式代理。
   Warp 使用的 WireGuard 轻量级 VPN 协议会在代理层内增加一层加密。对于机场而言，用户所有流量的目标都是 Warp，从而最大程度保护自己的隐私。
3. 方便使用，只需要一个 core 即可完成分流，Wireguard Tun，链式代理的设置。

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
    "endpoint":{
       "v4": "162.159.192.7",
       "v6": "[2606:4700:d0::a29f:c007]",
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
```json
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
3. 如果你还拥有一个 warp-plus 的密钥，你还可以运行 `wgcf-cli license -l [密钥]` 进行绑定
- （密钥可以在[我们群](https://t.me/projectXray/)里发送 `/keyget@getwarpplusbot` 获取）输出：
```json
❯ wgcf-cli license -l 9zs5I61a-l9j8m7T5-4pC6k20X
{
    "id": "cd7f4695-e9ef-4bb0-b412-5f4d84919db7",
    "created": "0001-01-01T00:00:00Z",
    "updated": "2023-12-14T12:32:18.689777921Z",
    "premium_data": 0,
    "quota": 0,
    "warp_plus": true,
    "referral_count": 0,
    "referral_renewal_countdown": 0,
    "role": "child"
}
```
4. 运行 `wgcf-cli generate --xray` 来生成一个WireGurad出站，他会将内容保存到 `wgcf.xray.json` 内
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
                "allowedIPs": [
                    "0.0.0.0/0",
                    "::/0"
                ],
                "endpoint": "162.159.192.1:2408"
            }
        ],
        "reserved": [
            240,
            25,
            146
        ],
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
    "address": ["172.16.0.2/32", "2606:4700:110:8949:fed8:2642:a640:c8e1/128"],
    "peers": [
      {
        "publicKey": "Warp公钥",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ],
    "reserved":[0, 0, 0] // 如果你有的话，粘贴reserved到这里
  },
  "tag": "wireguard-1"
}
```

路由策略推荐`IPIfNonMatch`

在现有路由中新增以下

```json
            {
                "type": "field",
                "domain": [
                    "geosite:cn"
                ],
                "outboundTag": "wireguard-1"
            },
            {
                "type": "field",
                "ip": [
                    "geoip:cn"
                ],
                "outboundTag": "wireguard-1"
            },
```

## 客户端使用 warp 链式代理

```json
{
   "outbounds":[
      {
         "protocol":"wireguard",
         "settings":{
            "secretKey":"我的私钥",
            "peers":[
               {
                  "publicKey":"Warp公钥",
                  "endpoint":"engage.cloudflareclient.com:2408"
               }
            ],
            "reserved":[0, 0, 0] // 如果你有的话，粘贴reserved到这里
         },
         "streamSettings":{
            "sockopt":{
               "dialerProxy":"proxy"
            }
         },
         "tag":"wireguard-1"
      },
      {
         "tag":"proxy",
         "protocol":"vmess",
         "settings":{
            "vnext":[
               {
                  "address":"我的IP",
                  "port":我的端口,
                  "users":[
                     {
                        "id":"我的UUID",
                        "security":"auto"
                     }
                  ]
               }
            ]
         },
         "streamSettings":{
            "network":"tcp"
         }
      }
   ]
}
```
