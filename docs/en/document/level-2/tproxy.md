---
title: TProxy Transparent Proxy
---

# Transparent Proxy (TProxy) Configuration Tutorial

This configuration is based on the [New V2Ray Plain Guide for Transparent Proxy (TProxy)](https://guide.v2fly.org/app/tproxy.html), adding new features from Xray. It utilizes the VLESS + XTLS Vision scheme. Unlike the old tutorial which defaulted to proxying outbound traffic, this configuration defaults to direct connection for outbound traffic. Users should adjust this according to their actual needs.

All configurations in this article have been successfully tested on Raspberry Pi 2B and Ubuntu 20.04. If you are using a different environment, please adjust the configuration accordingly.

## Before You Start

Please check that your device has an active network connection, the server-side is successfully configured, and the client is installed.

It is worth noting that many transparent proxy tutorials instruct you to enable IP Forwarding on Linux. However, doing so can degrade `Splice` performance. For details, please refer to [Detective Story Part 3: How we solved the mystery of Splice performance dropping even below Direct](https://github.com/XTLS/Xray-core/discussions/59).

I would like to add that many transparent proxy tutorials use Netfilter for traffic splitting (routing), allowing direct traffic to go out without passing through Xray. In that case, IP Forwarding must be enabled. However, some tutorials, like this one, direct *all* traffic into Xray, and the routing module within Xray handles the splitting. In this scenario, IP Forwarding does **not** need to be enabled.

## Xray Configuration

For a better routing experience, please replace the default routing rule files with [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat); otherwise, Xray-core will not be able to load this configuration.

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
            "address": "Server_Domain",
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
      "Server_Domain": "Server_IP"
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
        "inboundTag": ["all-in"],
        "port": 53,
        "outboundTag": "dns-out"
      },
      {
        "ip": ["8.8.8.8", "1.1.1.1"],
        "outboundTag": "proxy"
      },
      {
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "block"
      },
      {
        "domain": ["geosite:geolocation-!cn"],
        "outboundTag": "proxy"
      },
      {
        "ip": ["geoip:telegram"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

::: tip TIP
This configuration hijacks all traffic sent to port 53 to solve DNS pollution issues, so the DNS server addresses on the client and the local machine can be configured arbitrarily.
:::

## Policy Routing Configuration

```bash
sudo ip route add local default dev lo table 100 # Add routing table 100
sudo ip rule add fwmark 1 table 100 # Set rules for routing table 100
```

## Netfilter Configuration

::: warning Note
Choose either **nftables** or **iptables** configuration. Do not use both simultaneously.
:::

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

::: tip Usage

Write the above configuration to a file (e.g., `nft.conf`), then give the file executable permissions, and finally execute the file with root privileges (`# ./nft.conf`).
:::

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

After the configuration is complete, change the default gateway of other devices in the LAN to the IP of this device to bypass the firewall directly. After successfully testing on both other hosts and the local machine, you can proceed to the next step.

## Persistence and Auto-start

First, move the edited `nftables` configuration file to the `/etc` directory and rename it to `nftables.conf`. Then edit `/lib/systemd/system/nftables.service`.

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

Finally, enable it.

For persistence with `iptables`, it is recommended to install `iptables-persistent` directly.

During the installation process, you will be prompted to "Save current IPv4 rules?". If you have already applied the iptables configuration to the system, select "Yes". If not, it doesn't matter; after installation, apply the configuration and then execute `netfilter-persistent save` (root privileges required).

After that, edit `/lib/systemd/system/netfilter-persistent.service`.

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
