---
title: GID 透明代理
---

# 透明代理通过 gid 规避 Xray 流量

在现有的 iptables 透明代理白话文(**[新 V2Ray 白话文指南-透明代理](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[新 V2Ray 白话文指南-透明代理(TPROXY)](https://guide.v2fly.org/app/tproxy.html)** 、 **[透明代理（TProxy）配置教程](./tproxy)**)教程中，对 Xray 流量的规避处理是打 mark 实现的。即对 Xray 出站流量打 mark，通过设置 iptables 规则对对应 mark 的流量直连，来规避 Xray 流量，防止回环。

这么做有以下几个问题：

1. **[莫名流量进入 PREROUTING 链](https://github.com/v2ray/v2ray-core/issues/2621)**

2. 安卓系统有自己的 mark 机制，该方案在安卓上不可用

本教程的方案不需要设置 mark，理论性能更高，同时也不存在上述问题。

## 思路

tproxy 流量只能被 root 权限用户(uid==0)或其他有 CAP_NET_ADMIN 权限的用户接收。

iptables 规则可以通过 uid(用户 id)和 gid(用户组 id)分流。

让 Xray 运行在一个 uid==0 但 gid!=0 的用户上，设置 iptables 规则不代理该 gid 的流量来规避 Xray 流量。

## 配置过程

### 1. 前期准备

**安卓系统**

1. 系统已 root

2. 安装 **[busybox](https://play.google.com/store/apps/details?id=stericson.busybox)**

3. 有一个可以执行命令的终端，可以使用 adb shell，termux 等。

**其它 Linux 系统**

需要依赖 sudo，iptables 的 tproxy 模块和 extra 模块。

一般系统都有自带，openwrt 运行：

```bash
opkg install sudo iptables-mod-tproxy iptables-mod-extra
```

另附上一些 openwrt 常用的依赖，缺少可能导致 Xray 无法运行

```bash
opkg install libopenssl ca-certificates
```

### 2. 添加用户(安卓用户请忽略)

安卓系统不支持/etc/passwd 文件来管理用户，请忽略，直接下一步。

```bash
grep -qw xray_tproxy /etc/passwd || echo "xray_tproxy:x:0:23333:::" >> /etc/passwd
```

其中 xray_tproxy 是用户名，0 是 uid，23333 是 gid，用户名和 gid 可以自己定，uid 必须为 0。
检查用户是否添加成功，运行

```bash
sudo -u xray_tproxy id
```

显示的结果应该是 uid 为 0，gid 为 23333

### 3. 配置运行 Xray，配置 iptables 规则

在现有的 iptables 透明代理白话文(**[新 V2Ray 白话文指南-透明代理](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[新 V2Ray 白话文指南-透明代理(TPROXY)](https://guide.v2fly.org/app/tproxy.html)** 、 **[透明代理（TProxy）配置教程](./tproxy)**)教程的基础上修改：

1. 修改 json 配置文件，删除 mark 相关内容

2. 修改 iptables 规则，删除 mark 相关内容，并在 OUTPUT 链应用规则处添加选项"-m owner ! --gid-owner 23333"。

如：

```bash
iptables -t mangle -A OUTPUT -j XRAY_SELF
```

改为

```bash
iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 -j XRAY_SELF
```

3. 修改运行 Xray 的方式，使其运行在 uid 为 0，gid 为 23333 的用户上，参考[这里](#3-配置最大文件大开数运行xray客户端)。

## 下面提供一个实现 tproxy 全局代理的完整配置过程

### 1. 完成 **[前期准备](#1-前期准备)** 和 **[添加用户](#2-添加用户安卓用户请忽略)**

### 2. 准备 Xray 配置文件

配置 Xray 任意门监听 12345，开启 followRedirect 和 tproxy，不需要设置 sniffing：

```json
{
  "inbounds": [
    {
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
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
      你的服务器配置
    }
  ]
}
```

### 3. 配置最大文件大开数&运行 Xray 客户端

关于最大文件大开数问题见： **[too many open files 问题](https://guide.v2fly.org/app/tproxy.html#解决-too-many-open-files-问题)**

目前 Xray 服务端使用官方脚本安装的已经自动配置了最大文件大开数，无需再修改。

**安卓系统**

```bash
ulimit -SHn 1000000
setuidgid 0:23333 "运行Xray的命令"&
```

**其它 Linux 系统**

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy "运行Xray的命令"&
```

_第一条命令：_

改变最大打开文件数，只对当前终端有效，每次启动 Xray 前都要运行，该命令是设置客户端的最大文件大开数

_第二条命令：_

以 uid 为 0，gid 不为 0 的用户来运行 Xray 客户端，后面加&代表放在后台运行

**检查最大文件大开数是否设置成功**

```bash
cat /proc/Xray的pid/limits
```

找到 max open files 一项，应该是你设置的数值。pid 的获取方法为运行`ps`或`ps -aux`或`ps -a`

服务端和客户端都要检查

### 4. 设置 iptables 规则

**代理 ipv4**

```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# 代理局域网设备
iptables -t mangle -N XRAY
#  "网关所在ipv4网段" 通过运行命令"ip address | grep -w inet | awk '{print $2}'"获得，一般有多个
iptables -t mangle -A XRAY -d 网关所在ipv4网段1 -j RETURN
iptables -t mangle -A XRAY -d 网关所在ipv4网段2 -j RETURN
...

# 组播地址/E类地址/广播地址直连
iptables -t mangle -A XRAY -d 224.0.0.0/3 -j RETURN


#如果网关作为主路由，则加上这一句，见：https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项
#网关LAN_IPv4地址段，运行命令"ip address | grep -w "inet" | awk '{print $2}'"获得，是其中的一个
iptables -t mangle -A XRAY ! -s 网关LAN_IPv4地址段 -j RETURN

# 给 TCP 打标记 1，转发至 12345 端口
# mark只有设置为1，流量才能被Xray任意门接受
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
# 应用规则
iptables -t mangle -A PREROUTING -j XRAY

# 代理网关本机
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -m owner --gid-owner 23333 -j RETURN
iptables -t mangle -A XRAY_MASK -d 网关所在ipv4网段1 -j RETURN
iptables -t mangle -A XRAY_MASK -d 网关所在ipv4网段2 -j RETURN
...
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/3 -j RETURN
iptables -t mangle -A XRAY_MASK -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -p tcp -j XRAY_MASK
iptables -t mangle -A OUTPUT -p udp -j XRAY_MASK
```

**代理 ipv6(可选)**

```bash
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# 代理局域网设备
ip6tables -t mangle -N XRAY6
# "网关所在ip6网段" 通过运行命令"ip address | grep -w inet6 | awk '{print $2}'"获得。
ip6tables -t mangle -A XRAY6 -d 网关所在ipv6网段1 -j RETURN
ip6tables -t mangle -A XRAY6 -d 网关所在ipv6网段2 -j RETURN
...

# 如果网关作为主路由，则加上这一句，见：https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项
# 网关LAN_IPv6地址段，运行命令"ip address | grep -w "inet6" | awk '{print $2}'"获得，是其中的一个
ip6tables -t mangle -A XRAY6 ! -s 网关LAN_IPv6地址段 -j RETURN

ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6

# 代理网关本机
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -m owner --gid-owner 23333 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d 网关所在ipv6网段1 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d 网关所在ipv6网段2 -j RETURN
...
ip6tables -t mangle -A XRAY6_MASK -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -p tcp -j XRAY6_MASK
ip6tables -t mangle -A OUTPUT -p udp -j XRAY6_MASK
```
