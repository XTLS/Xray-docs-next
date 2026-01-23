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

```json
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
   "outbounds":[
      {
         "protocol":"wireguard",
         "settings":{
            "secretKey":"My_Private_Key",
            "peers":[
               {
                  "publicKey":"Warp_Public_Key",
                  "endpoint":"engage.cloudflareclient.com:2408"
               }
            ],
            "reserved":[0, 0, 0] // If you have it, paste 'reserved' here
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
                  "address":"My_Server_IP",
                  "port":My_Port,
                  "users":[
                     {
                        "id":"My_UUID",
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
