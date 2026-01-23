# Transparent Proxy: Bypassing Xray Traffic via GID

In existing `iptables` transparent proxy guides (**[New V2Ray Plain English Guide - Transparent Proxy](https://guide.v2fly.org/app/transparent_proxy.html)**, **[New V2Ray Plain English Guide - Transparent Proxy (TPROXY)](https://guide.v2fly.org/app/tproxy.html)**, **[Transparent Proxy (TProxy) Configuration Tutorial](./tproxy)**), the method used to bypass Xray traffic (to prevent routing loops) involves marking packets (`mark`). Specifically, marks are applied to Xray's outbound traffic, and `iptables` rules are set to direct traffic with corresponding marks to go out directly, thus bypassing the Xray proxy process.

There are several issues with this approach:

1. **[Unexplained traffic entering the PREROUTING chain](https://github.com/v2ray/v2ray-core/issues/2621)**.
2. Android systems have their own marking mechanism, making this solution unusable on Android.

The solution in this tutorial does not require setting marks. Theoretically, it offers higher performance and avoids the issues mentioned above.

## Concept

TProxy traffic can only be received by the root user (`uid==0`) or other users with `CAP_NET_ADMIN` privileges.

`iptables` rules can route traffic based on UID (User ID) and GID (Group ID).

By running Xray as a user with `uid==0` but `gid!=0`, we can set `iptables` rules to exclude traffic from that specific GID, thereby bypassing Xray traffic.

## Configuration Process

### 1. Prerequisites

**Android System**

1. System must be rooted.
2. Install **[busybox](https://play.google.com/store/apps/details?id=stericson.busybox)**.
3. Have a terminal capable of executing commands, such as `adb shell`, `termux`, etc.

**Other Linux Systems**

Requires dependencies: `sudo`, `iptables-mod-tproxy`, and `iptables-mod-extra`.

Most systems come with these built-in. For OpenWrt, run:

```bash
opkg install sudo iptables-mod-tproxy iptables-mod-extra
```

Here are some common dependencies for OpenWrt. Missing them might prevent Xray from running:

```bash
opkg install libopenssl ca-certificates
```

### 2. Add User (Skip for Android users)

Android systems do not support managing users via the `/etc/passwd` file, so please ignore this and proceed to the next step.

```bash
grep -qw xray_tproxy /etc/passwd || echo "xray_tproxy:x:0:23333:::" >> /etc/passwd
```

Here, `xray_tproxy` is the username, `0` is the UID, and `23333` is the GID. The username and GID can be customized, but the UID must be 0.
To check if the user was added successfully, run:

```bash
sudo -u xray_tproxy id
```

The displayed result should show UID as 0 and GID as 23333.

### 3. Configure/Run Xray and Set iptables Rules

Modify based on the existing `iptables` transparent proxy guides (**[New V2Ray Plain English Guide - Transparent Proxy](https://guide.v2fly.org/app/transparent_proxy.html)**, **[New V2Ray Plain English Guide - Transparent Proxy (TPROXY)](https://guide.v2fly.org/app/tproxy.html)**, **[Transparent Proxy (TProxy) Configuration Tutorial](./tproxy)**):

1. Modify the JSON configuration file to delete content related to `mark`.
2. Modify `iptables` rules to delete content related to `mark`, and add the option `-m owner ! --gid-owner 23333` to the rule applied in the OUTPUT chain.

For example:

```bash
iptables -t mangle -A OUTPUT -j XRAY_SELF
```

Change to:

```bash
iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 -j XRAY_SELF
```

1. Modify the way Xray is run so that it runs as a user with `uid=0` and `gid=23333`. Refer to [this section](#_3-configure-max-open-files-run-xray-client).

## Below is a complete configuration process for implementing global TProxy

### 1. Complete the Prerequisites and User Addition steps above

### 2. Prepare Xray Configuration File

Configure Xray `dokodemo-door` to listen on port 12345, enable `followRedirect` and `tproxy`. Setting `sniffing` is not required:

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
      Your Server Configuration
    }
  ]
}
```

### 3. Configure Max Open Files & Run Xray Client

For issues regarding the maximum number of open files, see: **[Too many open files issue](https://guide.v2fly.org/app/tproxy.html#解决-too-many-open-files-问题)**.

Currently, Xray servers installed using the official script automatically configure the maximum open file limit, so no further modification is needed.

**Android System**

```bash
ulimit -SHn 1000000
setuidgid 0:23333 "Command to run Xray"&
```

**Other Linux Systems**

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy "Command to run Xray"&
```

For example:

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy xray -c /etc/xray/config.json &
```

_First command:_

Changes the maximum number of open files. It is only effective for the current terminal and must be run every time before starting Xray. This command sets the maximum file limit for the client.

_Second command:_

Runs the Xray client as a user with `uid=0` and a non-zero `gid`. The `&` at the end indicates running in the background.

**Check if Max Open Files was set successfully**

```bash
cat /proc/PID_OF_XRAY/limits
```

Find the `max open files` item; it should match the value you set. You can get the PID by running `ps`, `ps -aux`, `ps -a`, or `pidof xray`.

Check both the server and the client.

### 4. Set iptables Rules

**Proxy IPv4**

```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Proxy LAN devices
iptables -t mangle -N XRAY
# "Gateway IPv4 subnet" is obtained by running "ip address | grep -w inet | awk '{print $2}'". There are usually multiple.
iptables -t mangle -A XRAY -d Gateway_IPv4_Subnet_1 -j RETURN
iptables -t mangle -A XRAY -d Gateway_IPv4_Subnet_2 -j RETURN
...

# Direct connection for Multicast/Class E/Broadcast addresses
iptables -t mangle -A XRAY -d 224.0.0.0/3 -j RETURN


# If the gateway serves as the main router, add this line.
# See: [https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项](https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项)
# Gateway_LAN_IPv4_Subnet is one of the results from "ip address | grep -w "inet" | awk '{print $2}'".
iptables -t mangle -A XRAY ! -s Gateway_LAN_IPv4_Subnet -j RETURN

# Mark TCP packets with 1, forward to port 12345
# Traffic is accepted by Xray dokodemo-door only if mark is set to 1
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
# Apply rules
iptables -t mangle -A PREROUTING -j XRAY

# Proxy the Gateway itself
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -m owner --gid-owner 23333 -j RETURN
iptables -t mangle -A XRAY_MASK -d Gateway_IPv4_Subnet_1 -j RETURN
iptables -t mangle -A XRAY_MASK -d Gateway_IPv4_Subnet_2 -j RETURN
...
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/3 -j RETURN
iptables -t mangle -A XRAY_MASK -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -p tcp -j XRAY_MASK
iptables -t mangle -A OUTPUT -p udp -j XRAY_MASK
```

**Proxy IPv6 (Optional)**

```bash
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# Proxy LAN devices
ip6tables -t mangle -N XRAY6
# "Gateway IPv6 subnet" is obtained by running "ip address | grep -w inet6 | awk '{print $2}'".
ip6tables -t mangle -A XRAY6 -d Gateway_IPv6_Subnet_1 -j RETURN
ip6tables -t mangle -A XRAY6 -d Gateway_IPv6_Subnet_2 -j RETURN
...

# If the gateway serves as the main router, add this line.
# See: [https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项](https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables透明代理的其它注意事项)
# Gateway_LAN_IPv6_Subnet is one of the results from "ip address | grep -w "inet6" | awk '{print $2}'".
ip6tables -t mangle -A XRAY6 ! -s Gateway_LAN_IPv6_Subnet -j RETURN

ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6

# Proxy the Gateway itself
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -m owner --gid-owner 23333 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d Gateway_IPv6_Subnet_1 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d Gateway_IPv6_Subnet_2 -j RETURN
...
ip6tables -t mangle -A XRAY6_MASK -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -p tcp -j XRAY6_MASK
ip6tables -t mangle -A OUTPUT -p udp -j XRAY6_MASK
```
