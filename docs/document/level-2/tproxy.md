---
title: TProxy 透明代理
---

# 透明代理（TProxy）配置教程

本配置基于[TProxy 透明代理的新 V2Ray 白话文教程](https://guide.v2fly.org/app/tproxy.html)，加入了 Xray 的新特性，使用 VLESS + XTLS Vision 方案，并将旧教程中默认出站代理的分流方式改为默认出站直连，使用者请按照实际情况进行修改。

本文中所有配置已在 Raspberry Pi 2B、Ubuntu 20.04 环境下测试成功，如在其它环境中使用请自行调整配置。

## 开始之前

请检查您的设备是否有可用的网络连接，且服务端已经配置成功，客户端已经安装完毕。

需注意的是，目前很多透明代理教程都会将 Linux 系统的 IP 转发打开，但这样会导致 Splice 性能下降。详情请参考[大案牍术破案纪实第三篇--我们是如何破解 Splice 性能下降甚至低于 Direct 之谜的](https://github.com/XTLS/Xray-core/discussions/59)。

这里我想要补充的是，很多透明代理教程会使用 Netfilter 进行分流，使直连流量直接发出而不经过 Xray，这时必须开启 IP 转发；也有的教程，如本文，会将所有流量导入 Xray 之中，由 Xray 的路由模块进行分流，这时无需开启 IP 转发。

## Xray 配置

为了更好的分流体验，请替换默认路由规则文件为 [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat)，否则 Xray-core 将无法加载本配置。

```bash
sudo curl -oL /usr/local/share/xray/geoip.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat
sudo curl -oL /usr/local/share/xray/geosite.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat
```

```json
{
  "log": {
    "loglevel": "warning",
    "error": "/var/log/xray/error.log",
    "access": "/var/log/xray/access.log"
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
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 2
        }
      }
    },
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "服务端域名",
            "port": 443,
            "users": [
              {
                "id": "UUID",
                "flow": "xtls-rprx-vision",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "xtls",
        "sockopt": {
          "mark": 2
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
      "settings": {
        "address": "8.8.8.8"
      },
      "proxySettings": {
        "tag": "proxy"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 2
        }
      }
    }
  ],
  "dns": {
    "hosts": {
      "服务端域名": "服务端 IP"
    },
    "servers": [
      {
        "address": "119.29.29.29",
        "port": 53,
        "domains": ["geosite:cn"],
        "expectIPs": ["geoip:cn"]
      },
      {
        "address": "223.5.5.5",
        "port": 53,
        "domains": ["geosite:cn"],
        "expectIPs": ["geoip:cn"]
      },
      "8.8.8.8",
      "1.1.1.1",
      "https+local://doh.dns.sb/dns-query"
    ]
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 53,
        "outboundTag": "dns-out"
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
        "domain": ["geosite:geolocation-!cn"],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "ip": ["geoip:telegram"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

::: tip TIP
本配置会劫持所有发往 53 端口的流量以解决 DNS 污染问题，所以客户端和本机的 DNS 服务器的地址可以随意配置。
:::

## 策略路由配置

```
sudo ip route add local default dev lo table 100 # 添加路由表 100
sudo ip rule add fwmark 1 table 100 # 为路由表 100 设定规则
```

## Netfilter 配置

::: warning 注意
nftables 配置与 iptables 配置二选一，不可同时使用。
:::

<Tabs title="netfilter">

<Tab title="nftables1">

```nftables
#!/usr/sbin/nft -f

flush ruleset

define RESERVED_IP = {
    10.0.0.0/8,
    100.64.0.0/10,
    127.0.0.0/8,
    169.254.0.0/16,
    172.16.0.0/12,
    192.0.0.0/24,
    224.0.0.0/4,
    240.0.0.0/4,
    255.255.255.255/32
}

table ip xray {
        chain prerouting {
                type filter hook prerouting priority mangle; policy accept;
                ip daddr $RESERVED_IP return
                ip daddr 192.168.0.0/16 tcp dport != 53 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                ip protocol tcp tproxy to 127.0.0.1:12345 meta mark set 1
                ip protocol udp tproxy to 127.0.0.1:12345 meta mark set 1
        }
        chain output {
                type route hook output priority mangle; policy accept;
                ip daddr $RESERVED_IP return
                ip daddr 192.168.0.0/16 tcp dport != 53 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                meta mark 2 return
                ip protocol tcp meta mark set 1
                ip protocol udp meta mark set 1
        }
}
```

::: tip 使用方法

将上述配置写入一个文件（如 `nft.conf`），之后将该文件赋予可执行权限，最后使用 root 权限执行该文件即可（`# ./nft.conf`）。
:::

</Tab>

<Tab title="iptables1">

```bash
iptables -t mangle -N XRAY
iptables -t mangle -A XRAY -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY -d 100.64.0.0/10 -j RETURN
iptables -t mangle -A XRAY -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY -d 169.254.0.0/16 -j RETURN
iptables -t mangle -A XRAY -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A XRAY -d 192.0.0.0/24 -j RETURN
iptables -t mangle -A XRAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 240.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p tcp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -j XRAY

iptables -t mangle -N XRAY_SELF
iptables -t mangle -A XRAY_SELF -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY_SELF -d 100.64.0.0/10 -j RETURN
iptables -t mangle -A XRAY_SELF -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY_SELF -d 169.254.0.0/16 -j RETURN
iptables -t mangle -A XRAY_SELF -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.0.0.0/24 -j RETURN
iptables -t mangle -A XRAY_SELF -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_SELF -d 240.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_SELF -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.168.0.0/16 -p tcp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_SELF -m mark --mark 2 -j RETURN
iptables -t mangle -A XRAY_SELF -p tcp -j MARK --set-mark 1
iptables -t mangle -A XRAY_SELF -p udp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j XRAY_SELF
```

</Tab>

</Tabs>

配置完成后，将局域网内其它设备的默认网关改为该设备 IP，就可以直接翻墙了。在其它主机和本机皆测试成功后，可进行下一步配置。

## 配置永久化与开机自启

<br/>

<Tabs title="netfilter2">

<Tab title="nftables2">

首先将已经编辑好的 nftables 配置文件移动到 `/etc` 目录下，并重命名为 `nftables.conf`。然后编辑 `/lib/systemd/system/nftables.service`。

```ini
[Unit]
Description=nftables
Documentation=man:nft(8) http://wiki.nftables.org
Wants=network-pre.target
Before=network-pre.target shutdown.target
Conflicts=shutdown.target
DefaultDependencies=no

[Service]
Type=oneshot
RemainAfterExit=yes
StandardInput=null
ProtectSystem=full
ProtectHome=true
ExecStart=/usr/sbin/nft -f /etc/nftables.conf ; /usr/sbin/ip route add local default dev lo table 100 ; /usr/sbin/ip rule add fwmark 1 table 100
ExecReload=/usr/sbin/nft -f /etc/nftables.conf
ExecStop=/usr/sbin/nft flush ruleset ; /usr/sbin/ip route del local default dev lo table 100 ; /usr/sbin/ip rule del table 100

[Install]
WantedBy=sysinit.target
```

最后 enable 即可。

</Tab>

<Tab title="iptables2">

关于 iptables 的永久化，建议直接安装 `iptables-persistent`。

安装过程中会提示你选择“是否保存配置”，如果已经将 iptables 配置写入系统，那么此时选择“是”即可；如果尚未写入也没有关系，安装完毕后将配置写入，然后执行 `netfilter-persistent save` 即可（需要 root 权限）。

之后编辑 `/lib/systemd/system/netfilter-persistent.service`。

```ini
[Unit]
Description=netfilter persistent configuration
DefaultDependencies=no
Wants=network-pre.target systemd-modules-load.service local-fs.target
Before=network-pre.target shutdown.target
After=systemd-modules-load.service local-fs.target
Conflicts=shutdown.target
Documentation=man:netfilter-persistent(8)

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/netfilter-persistent start ; /usr/sbin/ip route add local default dev lo table 100 ; /usr/sbin/ip rule add fwmark 1 table 100
ExecStop=/usr/sbin/netfilter-persistent stop ; /usr/sbin/ip route flush dev lo table 100 ; /usr/sbin/ip rule del table 100

[Install]
WantedBy=multi-user.target
```

</Tab>

</Tabs>
