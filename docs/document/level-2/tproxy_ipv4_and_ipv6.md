---
title: TProxy 透明代理 (ipv4 and ipv6)
---

# TProxy 透明代理（ipv4 and ipv6）配置教程

本配置参考了[TProxy 透明代理的新 V2Ray 白话文教程](https://guide.v2fly.org/app/tproxy.html)，[透明代理（TProxy）配置教程](https://xtls.github.io/document/level-2/tproxy.html#%E5%BC%80%E5%A7%8B%E4%B9%8B%E5%89%8D)以及[透明代理通过 gid 规避 Xray 流量](https://xtls.github.io/document/level-2/iptables_gid.html)，加入了透明代理对 ipv6 的支持，并且使用 VLESS-TCP-XTLS-RPRX-Vision 方案对抗封锁。

关于 Xray 的配置并不是本文重点，使用者可依实际情况进行修改，具体可以参考[官方文档示例](https://github.com/XTLS/Xray-examples)或其他优秀示例 比如[@chika0801](https://github.com/chika0801/Xray-examples) 又如[@lxhao61](https://github.com/lxhao61/integrated-examples)。

此配置意在解决例如 Netflix 等默认使用 ipv6 连接的网站无法通过旁路由进行代理的问题，或对 ipv6 代理有需要。

本文网络结构为单臂旁路由

本文中所有配置已在 Arch Linux (Kernel: 6.0.10) 环境下测试成功，如在其它环境中使用 iptables 同理。

## Xray 配置

<Tabs title="config.json">

<Tab title="client">

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "tag": "all-in",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy",
          "mark": 255
        }
      }
    }
  ],
  "outbounds": [
    {
      //此为默认outbound，路由(routing)模块若未匹配到任何规则，则默认走此 proxy 出口，如果你希望直连国内优先请将下面 direct 出口放到 outbound 第一，看不懂可忽略
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "yourdomain.domain", //改为你自己的域名，直接填写ipv4或ipv6地址也可以
            "port": 443,
            "users": [
              {
                "id": "uuid", //填写uuid，可通过在终端中输入 xray uuid 生成；此处也支持任意字符串（https://xtls.github.io/config/inbounds/vless.html#clientobject）
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        },
        "network": "tcp",
        "security": "tls", //注意使用 xtls-rprx-vision 流控此处需为 tls
        "tlsSettings": {
          //注意使用 xtls-rprx-vision 流控此处需为 tlsSettings
          "allowInsecure": false,
          "serverName": "yourdomain.domain", //改为你自己的域名
          "fingerprint": "chrome" //模拟TLS Client Hello指纹，可选 chrome, firefox, safari, randomized, 具体参考 https://xtls.github.io/config/transport.html#tlsobject
        }
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "http"
        }
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    }
  ],
  "dns": {
    "servers": [
      {
        "address": "223.5.5.5",
        "port": 53,
        "domains": [
          "geosite:cn",
          "ntp.org",
          "yourdomain.domain" //改为你自己的域名
        ]
      },
      {
        "address": "114.114.114.114",
        "port": 53,
        "domains": [
          "geosite:cn",
          "ntp.org",
          "yourdomain.domain" //改为你自己的域名
        ]
      },
      {
        "address": "8.8.8.8",
        "port": 53,
        "domains": ["geosite:geolocation-!cn"]
      },
      {
        "address": "1.1.1.1",
        "port": 53,
        "domains": ["geosite:geolocation-!cn"]
      }
    ]
  },
  "routing": {
    "domainMatcher": "mph",
    "domainStrategy": "IPIfNotMatch",
    "rules": [
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 53,
        "network": "udp",
        "outboundTag": "dns-out"
      },
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 123,
        "network": "udp",
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["223.5.5.5", "114.114.114.114"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["8.8.8.8", "1.1.1.1"],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "block"
      },
      {
        "type": "field",
        "protocol": ["bittorrent"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["geoip:private", "geoip:cn"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "domain": ["geosite:cn"],
        "outboundTag": "direct"
      }
    ]
  }
}
```

</Tab>

<Tab title="sever_json">

```json
{
  "log": {
    "loglevel": "warning"
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        //阻止 cnip 提高安全性，或者可以将 cn 流量导入 warp 中，详见https://xtls.github.io/document/level-2/warp.html
        "type": "field",
        "ip": ["geoip:cn"],
        "outboundTag": "block"
      }
    ]
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "uuid", //与客户端相同
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "certificates": [
            {
              "certificateFile": "/etc/ssl/private/fullchain.crt",
              "keyFile": "/etc/ssl/private/crt.key" //参照小小白话文将生成的 fullchain.crt 以及 cert.key证书的路径相应填于此处(https://xtls.github.io/document/level-0/ch06-certificates.html#_6-4-%E6%AD%A3%E5%BC%8F%E8%AF%81%E4%B9%A6%E7%94%B3%E8%AF%B7)
            }
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ]
}
```

</Tab>

</Tabs>

## iptables 配置

此处配置将 ipv4 与 ipv6 写在同一文件中。

<Tab title="iptales">

```
# 设置策略路由v4
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
# 代理局域网设备v4
iptables -t mangle -N XRAY
iptables -t mangle -A XRAY -d 127.0.0.1/32 -j RETURN
iptables -t mangle -A XRAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -j RETURN -m mark --mark 0xff
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -j XRAY
# 代理网关本机v4
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_MASK -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY_MASK -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A XRAY_MASK -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_MASK -j RETURN -m mark --mark 0xff
iptables -t mangle -A XRAY_MASK -p udp -j MARK --set-mark 1
iptables -t mangle -A XRAY_MASK -p tcp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j XRAY_MASK
# 新建 DIVERT 规则，避免已有连接的包二次通过 TPROXY，理论上有一定的性能提升v4
iptables -t mangle -N DIVERT
iptables -t mangle -A DIVERT -j MARK --set-mark 1
iptables -t mangle -A DIVERT -j ACCEPT
iptables -t mangle -I PREROUTING -p tcp -m socket -j DIVERT
# 设置策略路由v6
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106
# 代理局域网设备v6
ip6tables -t mangle -N XRAY6
ip6tables -t mangle -A XRAY6 -d ::1/128 -j RETURN
ip6tables -t mangle -A XRAY6 -d fe80::/10 -j RETURN
ip6tables -t mangle -A XRAY6 -d fd00::/8 -p tcp -j RETURN
ip6tables -t mangle -A XRAY6 -d fd00::/8 -p udp ! --dport 53 -j RETURN
ip6tables -t mangle -A XRAY6 -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6
# 代理网关本机v6
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -d fe80::/10 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d fd00::/8 -p tcp -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d fd00::/8 -p udp ! --dport 53 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A XRAY6_MASK -p udp -j MARK --set-mark 1
ip6tables -t mangle -A XRAY6_MASK -p tcp -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -j XRAY6_MASK
# 新建 DIVERT 规则，避免已有连接的包二次通过 TPROXY，理论上有一定的性能提升v6
ip6tables -t mangle -N DIVERT
ip6tables -t mangle -A DIVERT -j MARK --set-mark 1
ip6tables -t mangle -A DIVERT -j ACCEPT
ip6tables -t mangle -I PREROUTING -p tcp -m socket -j DIVERT

# 直连从主路由发出
ip route add default via 192.168.31.1 #写主路由ip, 采用下述方法一可不写此命令
ip -6 route add default via fd00:6868:6868::1 #写主路由ipv6, 采用下述方法一可不写此命令
```

</Tab>

::: tip 使用方法

将上述配置写入一个文件（如 `tproxy.rules`），之后将该文件赋予可执行权限，最后使用 root 权限执行该文件即可（`# ./tpoxy.rules`）。

或直接`source tproxy.rules`
:::

::: tip 关于最后一行命令

在旁路由使用命令`ip route show`，如果使用下属方法一，则`default via`后应是主路由 ip，无需更改；如使用下述方法二，则`default via`后应是旁路由 ip，此时直连网站 DNS 解析会回环，造成直连网站无法访问，因此需指定为主路由 ip。
:::

其中，网关地址`192.168.0.0/16`, `fd00::/8`等可由`ip address | grep -w inet | awk '{print $2}'`以及`ip address | grep -w inet6 | awk '{print $2}'`[获得](https://xtls.github.io/document/level-2/iptables_gid.html#_4-%E8%AE%BE%E7%BD%AE-iptables-%E8%A7%84%E5%88%99)

或者在 windows 网络设置中查看。

又或者在路由器“上网设置”中查看。

如果前缀`192.168`, `fd00:`相同可不更改，不同则更改为相应值，写法可通过 Goolge 搜索得到。

## 局域网设备上网设置

此处假定旁路由 ipv4, ipv6 地址分别为`192.168.31.100`, `fd00:6868:6868::8866`, 旁路由的 ipv4, ipv6 地址可由命令`ip add`获得。

### 方法一

局域网设备上网有两种方式，第一种就是在使用设备上进行静态 IP 的配置，将网关指向旁路由 IP。但注意绝大部分手机不支持 ipv6 的静态 ipv6 配置，除非 root 后进行相关设置。

以 windows 设备为例，可以先开启 DHCP 记录自动分配的 IP 以参考，然后手写静态配置。

::: tip DNS 设置

此配置劫持 DNS 流量，DNS 可以随便写
:::

<img width="231" alt="image" src="https://user-images.githubusercontent.com/110686480/208310266-632e36b9-a23b-4b90-aa28-583b50e87c66.png"> <img width="238" alt="image" src="https://user-images.githubusercontent.com/110686480/208309659-e3172218-ef27-4a94-a017-225f8e05b611.png">

### 方法二

局域网设备上网的第二种方式，是在路由器上进行网关设置，这种方法对于连接到此路由器的设备无需做任何设置即可科学上网，但注意有些路由器不支持 ipv6 的网关设置，有 ipv6 需求的设备仍需在所需设备上单独手动配置 ipv6 相关设置参考方法一。

<img width="600" alt="image" src="https://user-images.githubusercontent.com/110686480/208310174-2245a890-eb6b-4341-899f-81c6ac8255ff.png">

## 写在最后

如今 ipv6 并未完全普及，我们日常访问的流量 99%仍为 ipv4 流量；很多 VPS 商家虽然提供 ipv6 地址，但线路优化非常垃圾，甚至处于不可用状态，为何要加入 ipV6 的设置？

可以看到目前 ipv6 处于很尴尬的境地，各种设备对于 ipv6 的支持很烂，但是都在逐步完善，同时 Windows 系统对于 ipv6 的优先级也在提高，很多浏览器也会优先进行 ipv6 的解析以及访问，很多网站也开始默认使用 ipv6 进行访问（比如 Netflix, 如果没有配置 ipv6, 浏览器打开 Netflix 会显示 Not Available 是因为没有代理 Netflix 的 ipv6 请求，当然可以选择禁用 Windows 的 ipv6，但支持 ipv6 的 pt 站就无法使用）

这种情况下 ipv4 无法完全胜任网络冲浪的需求，即使是那 1%的流量，遇到了也会让人头疼不已。

而可以预见 ipv6 也会逐步与 ipv4 分庭抗礼，所以有必要加入 ipV6 的设置。
