---
title: Transparent proxy via GID
---

# Transparent proxy to circumvent Xray traffic via GID

In the existing transparent proxy configuration(**[New V2Ray vernacular tutorial on transparent proxy](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[New V2Ray vernacular tutorial on transparent proxy (TProxy)](https://guide.v2fly.org/app/tproxy.html)** 、 **[Transparent proxy（TProxy）configuration tutorial](./tproxy.md)**)tutorials, the circumvention of Xray traffic is achieved by using mark. That is, mark outbound traffics and set up iptables rules which directly connect traffics corresponding to the mark, to circumvent the Xray traffic and prevent loop back.

There are several problems with this method:

1. **[Inexplicable traffic into PREROUTING chain](https://github.com/v2ray/v2ray-core/issues/2621)**

2. Android has its own mark mechanism and this solution is not available on Android

The solution in this tutorial does not require a mark setting and has a higher theoretical performance, as well as not having the problems mentioned above.

## Ideas

TProxy traffic can only be received by users with root privileges (uid==0) or other users with CAP_NET_ADMIN privileges.

The iptables rules can separate network traffic by uid (user id) and gid (user group id).
Let Xray run on a user with uid==0 but gid!=0. Set the iptables rule to not proxy traffic for that gid to circumvent Xray traffic.

## Configuration Procedure

### 1. Preliminary preparation

**Android**

1. System has root privilege.

2. Install **[busybox](https://play.google.com/store/apps/details?id=stericson.busybox)**

3. There is a terminal that can execute commands, you can use adb shell, termux etc.

**Other Linux system**

Need sudo, iptables-tproxy module and iptables-extra module。

Usually the system comes with these functions. If you are using openwrt, you will need to run the following command:

```bash
opkg install sudo iptables-mod-tproxy iptables-mod-extra
```

Also attached are some common dependencies for openwrt, the lack of which may prevent Xray from running

```bash
opkg install libopenssl ca-certificates
```

### 2. Add user (Android users please ignore this section)

Android does not support managing users by modifying the /etc/passwd file, please ignore it and go straight to the next step.

```bash
grep -qw xray_tproxy /etc/passwd || echo "xray_tproxy:x:0:23333:::" >> /etc/passwd
```

where xray_tproxy is the username, 0 is the uid and 23333 is the gid, the username and gid can be set by yourself, the uid must be 0.
To check if the user was added successfully, run

```bash
sudo -u xray_tproxy id
```

The result displayed should be uid 0 and gid 23333.

### 3. Configure and run Xray, and configure iptables rules

In the existing transparent proxy configuration(**[New V2Ray vernacular tutorial on transparent proxy](https://guide.v2fly.org/app/transparent_proxy.html)** 、 **[New V2Ray vernacular tutorial on transparent proxy (TProxy)](https://guide.v2fly.org/app/tproxy.html)** 、 **[Transparent proxy（TProxy）configuration tutorial](./tproxy.md)**)tutorials, modify:

1. Modify the json configuration file: remove mark-related content

2. Modify the iptables rule to remove the mark-related content and add the option at the OUTPUT chain application rule: `-m owner ! --gid-owner 23333`

e.g.:

`iptables -t mangle -A OUTPUT -j XRAY_SELF`

Change to

`iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 -j XRAY_SELF`

1. Modify the way you run Xray so that it runs on a user with uid 0 and gid 23333, refer to [here](#_3-configure-and-run-xray-and-configure-iptables-rules).

## Steps

The following provides a complete configuration process for implementing the tproxy global proxy

### 1. Finish **[Preliminary preparation](#_1-preliminary-preparation)** and **[Add user](#_2-add-user-android-users-please-ignore-this-section)**

### 2. Preparing Xray profiles

Configure Xray to listen to 12345 at dokodemo-door, turn on followRedirect and tproxy, no sniffing required:

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
      // Your server configuration
    }
  ]
}
```

### 3. Configuring the maximum number of open files and run the Xray client

About the maximum number of open files, see: **[too many open files issues](https://guide.v2fly.org/app/tproxy.html#解决-too-many-open-files-问题)**

The current Xray server installed with the official script has the maximum number of open files automatically configured, so no further changes are required.

**Android**

```bash
ulimit -SHn 1000000
setuidgid 0:23333 "Command to run Xray"&
```

**Other Linux system**

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy "Command to run Xray"&
```

e.g.:

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy xray -c /etc/xray/config.json &
```

_The first command:_

Change the maximum number of open files, valid only for the current terminal and to be run every time before starting Xray, this command is to set the maximum number of open files for the client.

_The second command:_

Run the Xray client as a user with uid 0 and gid not 0, followed by & for running in the background.

**Check if the maximum number of open files is set successfully**

```bash
cat /proc/"Xray's pid"/limits
```

Find max open files, which should be the value you set. Xray's pid can be obtained by running `ps` or `ps -aux` or `ps -a`

Both the server and client side should be checked.

### 4. Setting up iptables rules

**Proxy ipv4**

```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Proxy LAN devices
iptables -t mangle -N XRAY
# "ipv4 segment where the gateway is located" is obtained by running the command "ip address | grep -w inet | awk '{print $2}'", usually there are multiple
iptables -t mangle -A XRAY -d "first ipv4 segment where the gateway is located" -j RETURN
iptables -t mangle -A XRAY -d "second ipv4 segment where the gateway is located" -j RETURN

# If the gateway is used as the primary router, add this line, see: [Other considerations for transparent proxy of iptables](https://xtls.github.io/en/documents/level-2/transparent_proxy/transparent_proxy/#proxy-ipv6)
# The "gateway LAN_IPv4 address segment", obtained by running the command "ip address | grep -w "inet" | awk '{print $2}'", is one of the results
iptables -t mangle -A XRAY ! -s "gateway LAN_IPv4 address segment" -j RETURN

# Mark 1 for TCP and forward to port 12345
# mark can only be set to 1 for the traffic to be accepted by the Xray dokodemo-door
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
# Apply rules
iptables -t mangle -A PREROUTING -j XRAY

# Proxy gateway itself
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -d "the first ipv4 segment where the gateway is located" -j RETURN
iptables -t mangle -A XRAY_MASK -d "the second ipv4 segment where the gateway is located" -j RETURN

iptables -t mangle -A XRAY_MASK -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 ! -p icmp -j XRAY_MASK
```

**Proxy ipv6 (optional)**

```bash
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# Proxy LAN devices
ip6tables -t mangle -N XRAY6
# The "ipv6 segment where the gateway is located" is obtained by running the command "ip address | grep -w inet6 | awk '{print $2}'".
ip6tables -t mangle -A XRAY6 -d "the first ipv6 segment where the gateway is located" -j RETURN
ip6tables -t mangle -A XRAY6 -d "the second ipv6 segment where the gateway is located" -j RETURN

# If the gateway is used as the primary router, add this line, see: [Other considerations for transparent proxy of iptables](https://xtls.github.io/en/documents/level-2/transparent_proxy/transparent_proxy/#proxy-ipv6)
# The "gateway LAN_IPv6 address segment", obtained by running the command "ip address | grep -w "inet6" | awk '{print $2}'", is one of the results
ip6tables -t mangle -A XRAY6 ! -s "gateway LAN_IPv6 address segment" -j RETURN

ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6

# Proxy gateway itself
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -d "the first ipv6 segment where the gateway is located" -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d "the second ipv6 segment where the gateway is located" -j RETURN

ip6tables -t mangle -A XRAY6_MASK -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 ! -p icmp -j XRAY6_MASK
```
