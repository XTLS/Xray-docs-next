# 透明代理通过gid规避Xray流量

在现有的iptables透明代理白话文(**[新 V2Ray 白话文指南-透明代理](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[新 V2Ray 白话文指南-透明代理(TPROXY)](https://guide.v2fly.org/app/tproxy.html)** 、 **[透明代理（TProxy）配置教程](./tproxy)**)教程中，对Xray流量的规避处理是打mark实现的。即对Xray出站流量打mark，通过设置iptables规则对对应mark的流量直连，来规避Xray流量，防止回环。

这么做有以下几个问题：

1. **[莫名流量进入PREROUTING链](https://github.com/v2ray/v2ray-core/issues/2621)**

2. 安卓系统有自己的mark机制，该方案在安卓上不可用

本教程的方案不需要设置mark，理论性能更高，同时也不存在上述问题。
## 思路
tproxy流量只能被root权限用户(uid==0)或其他有CAP_NET_ADMIN权限的用户接收。

iptables规则可以通过uid(用户id)和gid(用户组id)分流。

让Xray运行在一个uid==0但gid!=0的用户上，设置iptables规则不代理该gid的流量来规避Xray流量。

## 配置过程
### 1. 前期准备
**安卓系统**

1. 系统已root

2. 安装 **[busybox](https://play.google.com/store/apps/details?id=stericson.busybox)**

3. 有一个可以执行命令的终端，可以使用adb shell，termux等。

**其它Linux系统**

需要依赖sudo，iptables的tproxy模块和extra模块。

一般系统都有自带，openwrt运行：
```bash
opkg install sudo iptables-mod-tproxy iptables-mod-extra
```
另附上一些openwrt常用的依赖，缺少可能导致Xray无法运行
```bash
opkg install libopenssl ca-certificates
```
### 2. 添加用户(安卓用户请忽略)
安卓系统不支持/etc/passwd文件来管理用户，请忽略，直接下一步。
```bash
grep -qw xray_tproxy /etc/passwd || echo "xray_tproxy:x:0:23333:::" >> /etc/passwd
```
其中xray_tproxy是用户名，0是uid，23333是gid，用户名和gid可以自己定，uid必须为0。
检查用户是否添加成功，运行
```bash
sudo -u xray_tproxy id
```
显示的结果应该是uid为0，gid为23333
### 3. 配置运行Xray，配置iptables规则
在现有的iptables透明代理白话文(**[新 V2Ray 白话文指南-透明代理](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[新 V2Ray 白话文指南-透明代理(TPROXY)](https://guide.v2fly.org/app/tproxy.html)** 、 **[透明代理（TProxy）配置教程](./tproxy)**)教程的基础上修改：

1. 修改json配置文件，删除mark相关内容

2. 修改iptables规则，删除mark相关内容，并在OUTPUT链应用规则处添加选项"-m owner ! --gid-owner 23333"。

如：
```bash
iptables -t mangle -A OUTPUT -j XRAY_SELF
```
改为
```bash
iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 -j XRAY_SELF
```
3. 修改运行Xray的方式，使其运行在uid为0，gid为23333的用户上，参考[这里](#3-配置最大文件大开数运行xray客户端)。
## 下面提供一个实现tproxy全局代理的完整配置过程
### 1. 完成 **[前期准备](#1-前期准备)** 和 **[添加用户](#2-添加用户安卓用户请忽略)**
### 2. 准备Xray配置文件
配置Xray任意门监听12345，开启followRedirect和tproxy，不需要设置sniffing：
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
### 3. 配置最大文件大开数&运行Xray客户端
关于最大文件大开数问题见： **[too many open files 问题](https://guide.v2fly.org/app/tproxy.html#解决-too-many-open-files-问题)**

目前Xray服务端使用官方脚本安装的已经自动配置了最大文件大开数，无需再修改。

**安卓系统**
```bash
ulimit -SHn 1000000
setuidgid 0:23333 "运行Xray的命令"&
```
**其它Linux系统**
```bash
ulimit -SHn 1000000
sudo -u xray_tproxy "运行Xray的命令"&
```
*第一条命令：*

改变最大打开文件数，只对当前终端有效，每次启动Xray前都要运行，该命令是设置客户端的最大文件大开数

*第二条命令：*

以uid为0，gid不为0的用户来运行Xray客户端，后面加&代表放在后台运行

**检查最大文件大开数是否设置成功**
```bash
cat /proc/Xray的pid/limits
```
找到max open files一项，应该是你设置的数值。pid的获取方法为运行`ps`或`ps -aux`或`ps -a`

服务端和客户端都要检查

### 4. 设置iptables规则
**代理ipv4**
```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# 代理局域网设备
iptables -t mangle -N XRAY
#  "网关所在ipv4网段" 通过运行命令"ip address | grep -w inet | awk '{print $2}'"获得，一般有多个
iptables -t mangle -A XRAY -d 网关所在ipv4网段1 -j RETURN
iptables -t mangle -A XRAY -d 网关所在ipv4网段2 -j RETURN
...

# 组播地址直连
iptables -t mangle -A XRAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 255.255.255.255/32 -j RETURN

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
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_MASK -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY_MASK -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -p tcp -j XRAY_MASK
iptables -t mangle -A OUTPUT -p udp -j XRAY_MASK
```

**代理ipv6(可选)**
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
