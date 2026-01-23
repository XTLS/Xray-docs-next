# Traffic Redirection Based on fwmark or sendThrough

Direct specific traffic to specific exits via Xray to achieve global routing "traffic splitting".

## Foreword

Previously, I noticed that many proxies or VPNs take over the global routing table. If installed alongside Xray, this causes Xray to fail. I referred to many tutorials online, and even immediate traffic splitting was achieved by maintaining one or more CIDR routing tables. This approach is not elegant. If I want to be able to replace interfaces arbitrarily and achieve on-demand splitting, is there a better way? Yes!

By using `fwmark` or Xray's `sendThrough`/`sockopt.interface`, combined simply with routing table functions, we can achieve:

1. Xray can set specific Tags, domains, etc., to go through a specific interface. If your interface is dual-stack, you can specify IPv4 or IPv6.
2. The rest of the users will use the original IPv4 or IPv6.

The specific settings are as follows (using Debian 10 as an example):

## 1. Install Proxy or VPN Software (e.g., WireGuard, IPsec, etc.)

Please refer to the official installation methods for different systems and software.

## 2. Edit VPN Configuration File (Using WireGuard as an example)

Original file:

```ini
[Interface]
PrivateKey = <PriKey>
Address = <IPv4>
Address = <IPv6>
DNS = 8.8.8.8
MTU = 1280
[Peer]
PublicKey = <Pubkey>
AllowedIPs = ::/0
AllowedIPs = 0.0.0.0/0
Endpoint = <EndpointIP>:<Port>
```

Add the following commands under `[Interface]`:

```ini
Table = <table>
### fwmark
PostUP = ip rule add fwmark <mark> lookup <table>
PostDown = ip rule del fwmark <mark> lookup <table>
PostUP = ip -6 rule add fwmark <mark> lookup <table>
PostDown = ip -6 rule del fwmark <mark> lookup <table>
## sendThrough
PreUp = ip rule add from <IPv4> lookup <table>
PostDown = ip rule del from <IPv4> lookup <table>
PreUp = ip -6 rule add from <IPv6> lookup <table>
PostDown = ip -6 rule del from <IPv6> lookup <table>
## sockopt.interface
PreUp = ip rule add oif %i lookup <table>
PostDown = ip rule del oif %i lookup <table>
PreUp = ip -6 rule add oif %i lookup <table>
PostDown = ip -6 rule del oif %i lookup <table>
```

::: tip

- This configuration integrates `fwmark` / `sendThrough` / `sockopt.interface`, meaning:
- Connections sent to this device `%i` / Connections sent to this `<IPv4/6>` / Connections marked with `fwmark` `<mark>`
- Will be forwarded using WireGuard.
- `%i` is a placeholder in the WireGuard configuration file, which represents the device name to be replaced at startup.
  :::

Save it.

You can also install this handy tool:

::: warning
If the `DNS` field in `[Interface]` is used, this program is required.
:::

```bash
apt install openresolv
```

## 3. Enable WireGuard Network Interface

Load the kernel module:

```bash
modprobe wireguard
```

Check if the WG module is loaded correctly:

```bash
lsmod | grep wireguard
```

## 4. Xray-core Configuration Modification

```json
{
  "api": {
    "services": [
      "HandlerService",
      "LoggerService",
      "StatsService"
    ],
    "tag": "api"
  },
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "port": <port>,
      "protocol": "dokodemo-door",
      "settings": {
        "address": "127.0.0.1"
      },
      "tag": "api"
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      }
      // Modify here, can be v4 or v6
    },
    //            <--Please choose between different schemes-->   Scheme 1: fwmark
    {
      "protocol": "freedom",
      "tag": "wg0",
      "streamSettings": {
        "sockopt": {
          "mark": // <mark>
        }
      },
      "settings": {
        "domainStrategy": "UseIPv6"
      }
    },  // Users with fwmark set to <mark> use the specified strategy "UseIPv6" or "UseIPv4"
    //            <--Please choose between different schemes-->   Scheme 2: sendThrough
    {
      "tag": "wg0",
      "protocol": "freedom",
      "sendThrough": "your wg0 v4 address",
      // Modify here, can be v4 or v6
      "settings": {
        "domainStrategy": "UseIPv4"
      }
      // Modify here, can be v4 or v6
    },
    //            <--Please choose between different schemes-->   Scheme 3: sockopt.interface
    {
      "tag": "wg0",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      },
      "streamSettings": {
        "sockopt": {
          "interface": "wg0"
        }
      }
    },
    //            <--Please choose between different schemes-->   End
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
  ],
  "policy": {
    "system": {
      "statsInboundDownlink": true,
      "statsInboundUplink": true
    }
  },
  "routing": {
    "rules": [
      {
        "inboundTag": [
          "api"
        ],
        "outboundTag": "api"
      },
      {
        "outboundTag": "wg0",
        "inboundTag": [
          "<inboundTag>"
          // Need to specify the Tag in inbound beforehand; here it's generated by api, domains can also be added, etc.
        ]
      },
      {
        "outboundTag": "blocked",
        "protocol": [
          "bittorrent"
        ]
      }
    ]
  },
  "stats": {}
}
```

::: tip
You can control the access method for corresponding users by modifying `"domainStrategy": "UseIPv6"`. Actual tests show priority is higher than the system's own `gai.config`.
:::

## 5. System Settings Configuration

::: tip
You need to enable the system's `ip_forward`.
`sysctl -w net.ipv4.ip_forward=1`
`sysctl -w net.ipv6.conf.all.forwarding=1`
:::

## 6. Complete WireGuard Settings

Start the tunnel:

```bash
wg-quick up wg0
```

Enable auto-start on boot:

```bash
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

Verify IPv4/IPv6:

> Run `curl ip-api.com -4/-6` on the proxy / Visit ip-api.com via browser

## Postscript

The intention of this article is to avoid unnecessary waste of traffic by handing over the routing and splitting functions to Xray. This avoids the tedious work of maintaining routing tables. It also serves to level up your technical skills.

## Acknowledgments

[XTLS/Xray-core](https://github.com/XTLS/Xray-core); [v2fly/v2ray-core](https://github.com/v2fly/v2ray-core); [WireGuard](https://www.wireguard.com/); [@p3terx](https://p3terx.com/); @w; @Hiram; @Luminous; @Ln; @JackChou;

<!--剩下几位大佬我实在找不到他们的地址或Github空间，请大家帮忙找吧-->
