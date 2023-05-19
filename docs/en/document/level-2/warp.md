---
title: Enhancing Proxy Security with Cloudflare Warp
---

# Enhancing Proxy Security with Cloudflare Warp

Xray (1.6.5+) has added outbound WireGuard support. Although the added code and dependencies will increase the core size, we believe that this is a necessary new feature for three reasons:

1. Through recent discussions and [experiments](https://github.com/net4people/bbs/issues/129#issuecomment-1308102504), we know that proxying the traffic back to China is not safe. One way to deal with this is to route the back-to-China traffic to a black hole, but the downside is that due to the delay in geosite and geoip updates or the lack of knowledge on how to properly split the traffic on the client side, the traffic ends up going to the black hole, affecting the user experience. In this case, we only need to import the back-to-China traffic into Cloudflare Warp, which can achieve the same level of security without affecting the user experience.
2. As we all know, most airports will log the domain names visited by users, and some airports will even audit and block some user traffic. One way to protect user privacy is to use chain proxies on the client side. The WireGuard lightweight VPN protocol used by Warp adds an extra layer of encryption within the proxy layer. For airports, the target of all user traffic is Warp, thereby maximizing privacy protection.
3. It is easy to use, and only one core is needed to complete the split, Wireguard Tun, and chain proxy settings.

## Applying for a Warp Account

1. Thank you Cloudflare for promoting a free internet. Now you can use the Warp service for free, and the nearest server will be automatically selected based on the exit.
2. Use a VPS and download [wgcf](https://github.com/ViRb3/wgcf/releases).
3. Run `wgcf register` to generate `wgcf-account.toml`.
4. Run `wgcf generate` to generate `wgcf-profile.conf`. Copy the following content:

```
[Interface]
PrivateKey = my private key
Address = 172.16.0.2/32
Address = 2606:4700:110:8949:fed8:2642:a640:c8e1/128
DNS = 1.1.1.1
MTU = 1280
[Peer]
PublicKey = Warp public key
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = engage.cloudflareclient.com:2408
```

## Diverting inbound traffic to warp on the server side

Add a new WireGuard outbound in the existing ones.

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "My private key",
    "address": ["172.16.0.2/32", "2606:4700:110:8949:fed8:2642:a640:c8e1/128"],
    "peers": [
      {
        "publicKey": "Warp public key",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ]
  },
  "tag": "wireguard-1"
}
```

Recommended routing strategy is `IPIfNonMatch`.

Add the following to the existing router:

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

## Using Warp Chain Proxy on the Client Side

```json
{
   "outbounds":[
      {
         "protocol":"wireguard",
         "settings":{
            "secretKey":"My private key",
            "peers":[
               {
                  "publicKey":"Warp public key",
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
                  "address":"My IP",
                  "port":My port,
                  "users":[
                     {
                        "id":"My UUID",
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
