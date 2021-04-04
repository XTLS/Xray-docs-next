---
title: 出站流量重定向
---

# 基于 fwmark 或 sendThrough 的流量重定向

通过 Xray 将特定的流量指向特定出口，实现全局路由“分流”

## 前言

之前在网络上看到许多代理或者 VPN 会接管全局路由，如果与 Xray 同时安装，会导致 Xray 失效。参考了网络上许多教程，及时分流，也是通过维护一张或者多张 CIDR
路由表来实现的。这种情况下并不优雅，如果我想可以任意替换，实现按需分流，那有没有更好的办法呢？有！

通过 fwmark 或 Xray 的 sendThrough，再简单配合路由表功能即可实现：

1. Xray 可设置指定的 Tag、域名等走指定接口。如果您的接口是双栈的，可以指定 IPV4 或者 IPV6
2. 其余用户则走原 IPV4 或者 IPV6

具体设置如下（以 Debian10 为例）：

## 1、安装代理或者 VPN 软件（例如 Wireguard、IPsec 等）

根据不同系统和不同软件，请参考官方安装方法

## 2、编辑 VPN 配置文件（以 WireGuard 为例）

原始文件：

<Tabs title="if-config">

<Tab title="fwmark">

```ini
[Interface]
PrivateKey = xxxxxxxxxxxxxxxxxxxx
Address = "your wg0 v4 address"
Address = "your wg0 v6 address"
DNS = 8.8.8.8
MTU = 1280
[Peer]
PublicKey = xxxxxxxxxxxxxxxxxxxxx
AllowedIPs = ::/0
AllowedIPs = 0.0.0.0/0
Endpoint = "ip:port"
```

在 `[Interface]` 下添加如下命令：

```ini
Table = off
PostUP = ip -4 rule add fwmark <mark> lookup <table>
PostUP = ip -4 route add default dev <接口名称> table <table>
PostUP = ip -4 rule add table main suppress_prefixlength 0
PostUP = ip -6 rule add fwmark <mark> lookup <table>
PostUP = ip -6 rule add not fwmark <table> table <table>
PostUP = ip -6 route add ::/0 dev <接口名称> table <table>
PostUP = ip -6 rule add table main suppress_prefixlength 0
PostDown = ip -4 rule delete fwmark <mark> lookup <table>
PostDown = ip -4 rule delete table main suppress_prefixlength 0
PostDown = ip -6 rule delete fwmark <mark> lookup <table>
PostDown = ip -6 rule delete not fwmark <table> table <table>
PostDown = ip -6 rule delete table main suppress_prefixlength 0
```

::: tip

- 此命令表示 IPv4 中 fwmark 为 `<mark>`，IPv6 中 fwmark 为`<mark>`，::/0 全局 v6 走 WireGuard
- 可根据自己需求增删命令，mark 值要与 Xray-core 中设置为相同，table 值自定
- 如果不支持配置文件，可以在系统中修改路由表
  :::

</Tab>

<Tab title="sendThrough">

```ini
[Interface]
PrivateKey = xxxxxxxxxxxxxxxxxxxx
Address = "your wg0 v4 address"
Address = "your wg0 v6 address"
DNS = 8.8.8.8
MTU = 1280
[Peer]
PublicKey = xxxxxxxxxxxxxxxxxxxxx
AllowedIPs = ::/0
AllowedIPs = 0.0.0.0/0
Endpoint = "ip:port"
```

在 `[Interface]` 下添加如下命令：

```ini
Table = off
PostUP = ip -4 rule add from "your wg0 v4 address" lookup <table>
PostUP = ip -4 route add default dev wg0 table <table>
PostUP = ip -4 rule add table main suppress_prefixlength 0
PostUP = ip -6 rule add not fwmark <table> table <table>
PostUP = ip -6 route add ::/0 dev wg0 table <table>
PostUP = ip -6 rule add table main suppress_prefixlength 0
PostDown = ip -4 rule delete from "your wg0 v4 address" lookup <table>
PostDown = ip -4 rule delete table main suppress_prefixlength 0
PostDown = ip -6 rule delete not fwmark <table> table <table>
PostDown = ip -6 rule delete table main suppress_prefixlength 0
```

::: tip

- 此命令表示 IPV4 中来自 `your wg0 v4 address` 地址的走 WireGuard，IPv6 中::/0 全局 v6 走 WireGuard）
- 可根据自己需求增删命令，实现 v6 分流，也可以与 fwmark 融合
- 如果不支持配置文件，可以在系统中修改路由表
  :::

</Tab>

</Tabs>

保存

可顺手安装

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

<Tabs title="xray-config">

<Tab title="fwmark">

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
        "domainStrategy": "UseIPv6"
        //设置默认用户走指定方式”UseIPv6”或者”UseIPv4”
      }
    },
    {
      "protocol": "freedom",
      "tag": "wg0",
      "streamSettings": {
        "sockopt": {
          "mark": <mark>
        }
      },
      "settings": {
        "domainStrategy": "UseIPv6"
      }
      //设置fwmark为<mark>的用户走指定方式”UseIPv6””UseIPv4”
    },
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
          //需要之前在inbound中指定好Tag，我这里是api生成的,还可以添加域名等等
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

</Tab>

<Tab title="sendThrough">

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
          //需要之前在 inbound 中指定好 Tag，我这里是 api 生成的,还可以添加域名等等
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

</Tab>

</Tabs>

::: tip
可以通过修改 "domainStrategy": "UseIPv6"来控制对应用户的访问方式 实测优先级要高于系统本身的 gai.config
:::

## 5、系统设置配置

::: tip
需要打开系统的 ip_forward
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

> 自行验证 Google 搜索 myip

## 后记

本文本意是可以避免的多余的流量浪费，将路由和分流的功能交给 Xray 处理。避免了维护路由表的繁琐工作。顺便技术提升 UP。

## 感谢

@Xray-core @V2ray-core @WireGuard @p3terx @w @Hiram @Luminous @Ln @JackChou
