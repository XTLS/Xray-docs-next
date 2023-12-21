---
title: 出站流量重定向
---

# 基于 fwmark 或 sendThrough 的流量重定向

通过 Xray 将特定的流量指向特定出口，实现全局路由“分流”

## 前言

之前在网络上看到许多代理或者 VPN 会接管全局路由，如果与 Xray 同时安装，会导致 Xray 失效。参考了网络上许多教程，及时分流，也是通过维护一张或者多张 CIDR
路由表来实现的。这种情况下并不优雅，如果我想可以任意替换，实现按需分流，那有没有更好的办法呢？有！

通过 fwmark 或 Xray 的 sendThrough/sockopt.interface，再简单配合路由表功能即可实现：

1. Xray 可设置指定的 Tag、域名等走指定接口。如果您的接口是双栈的，可以指定 IPV4 或者 IPV6
2. 其余用户则走原 IPV4 或者 IPV6

具体设置如下（以 Debian10 为例）：

## 1、安装代理或者 VPN 软件（例如 Wireguard、IPsec 等）

根据不同系统和不同软件，请参考官方安装方法

## 2、编辑 VPN 配置文件（以 WireGuard 为例）

原始文件：

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

在 `[Interface]` 下添加如下命令：
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
- 此配置文件融合了 `fwmark` / `sendThrough` / `sockopt.interface`，表示
- 送入此设备 `%i` 的连接 / 送入此 `<IPv4/6>` 的连接 / `fwmark` 被标记为 `<mark>` 的连接  
- 将会使用 wireguard 进行转发
- `%i` 是 wireguard 配置文件中的占位符，表示在启动时替换为这个设备的名称
:::


保存

可顺手安装

::: warning
如果使用了 `[Interface]` 中的 `DNS` 字段，这个程序将会是必须的
:::

```bash
apt install openresolv
```

## 3、启用 WireGuard 网络接口

加载内核模块

```bash
modprobe wireguard
```

检查 WG 模块加载是否正常

```bash
lsmod | grep wireguard
```

## 4、Xray-core 配置文件修改

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
      //修改此处，可v4或者v6
    },
    //            <--请在不同的方案中选择-->   方案1：fwmark
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
    }  //设置fwmark为<mark>的用户走指定方式”UseIPv6””UseIPv4”
    //            <--请在不同的方案中选择-->   方案2：sendThrough
    {
      "tag": "wg0",
      "protocol": "freedom",
      "sendThrough": "your wg0 v4 address",
      //修改此处，可v4或者v6
      "settings": {
        "domainStrategy": "UseIPv4"
      }
      //修改此处，可v4或者v6
    },
    //            <--请在不同的方案中选择-->   方案3：sockopt.interface
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
    //            <--请在不同的方案中选择-->   结束
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
        "outboundTag": "api",
        "type": "field"
      },
      {
        "type": "field",
        "outboundTag": "wg0",
        "inboundTag": [
          "<inboundTag>"
          //需要之前在 inbound 中指定好 Tag，这里是 api 生成的,还可以添加域名等等
        ]
      },
      {
        "outboundTag": "blocked",
        "protocol": [
          "bittorrent"
        ],
        "type": "field"
      }
    ]
  },
  "stats": {}
}
```

::: tip
可以通过修改 "domainStrategy": "UseIPv6"来控制对应用户的访问方式 实测优先级要高于系统本身的 gai.config
:::

## 5、系统设置配置

::: tip
需要打开系统的 ip_forward
`sysctl -w net.ipv4.ip_forward=1`
`sysctl -w net.ipv6.conf.all.forwarding=1`
:::

## 6、完成 WireGuard 相关设置

开启隧道

```bash
wg-quick up wg0
```

开机自启

```bash
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

验证 IPv4/IPv6

> 在代理上 运行 `curl ip-api.com -4/-6` / 浏览器访问ip-api.com

## 后记

本文本意是可以避免的多余的流量浪费，将路由和分流的功能交给 Xray 处理。避免了维护路由表的繁琐工作。顺便技术提升 UP。

## 感谢

[XTLS/Xray-core](https://github.com/XTLS/Xray-core); [v2fly/v2ray-core](https://github.com/v2fly/v2ray-core); [WireGuard](https://www.wireguard.com/); [@p3terx](https://p3terx.com/); @w; @Hiram; @Luminous; @Ln; @JackChou;
<!--剩下几位大佬我实在找不到他们的地址或Github空间，请大家帮忙找吧-->