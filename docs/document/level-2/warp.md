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

1. 感谢 Cloudflare 推动自由的互联网，现在你可以免费使用 Warp 服务，连接的时候会根据出口自动选择最近的服务器
2. 使用一台 vps，下载 [wgcf](https://github.com/ViRb3/wgcf/releases)
3. 运行 `wgcf register` 生成 `wgcf-account.toml`
4. 运行 `wgcf generate` 生成 `wgcf-profile.conf` 拷贝内容如下：

```
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

## 在服务端分流回国流量至 warp

在现有出站中新增一个 WireGurad 出站

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "我的私钥",
    "peers": [
      {
        "publicKey": "Warp公钥",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ]
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
            ]
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
