# Sockopt

Sockopt is used to configure low-level network behavior.

It can be used to tune transparent proxying, DNS resolution strategy, and many other socket-level options.

## SockoptObject

`SockoptObject` corresponds to the `sockopt` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // outbound example; also applies to inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "sockopt": {
          // [!code focus:19]
          "mark": 0,
          "tcpMaxSeg": 1440,
          "tcpFastOpen": false,
          "tproxy": "off",
          "domainStrategy": "AsIs",
          "happyEyeballs": {},
          "dialerProxy": "",
          "acceptProxyProtocol": false,
          "trustedXForwardedFor": [],
          "tcpKeepAliveInterval": 0,
          "tcpKeepAliveIdle": 300,
          "tcpUserTimeout": 10000,
          "tcpcongestion": "bbr",
          "interface": "wg0",
          "V6Only": false,
          "tcpWindowClamp": 600,
          "tcpMptcp": false,
          "addressPortStrategy": "",
          "customSockopt": []
        }
      }
    }
  ]
}
```

> `mark`: number

An integer. When non-zero, outbound connections are marked with this value through `SO_MARK`.

- Linux only.
- Requires `CAP_NET_ADMIN`.

> `tcpMaxSeg`: number

Used to set the maximum segment size of TCP packets.

> `tcpFastOpen`: true | false | number

Whether to enable [TCP Fast Open](https://en.wikipedia.org/wiki/TCP_Fast_Open).

When set to `true` or a positive integer, TFO is enabled. When set to `false` or a negative value, TFO is forcibly disabled. When the field is absent or `0`, the system default is used. This option is available for both inbound and outbound.

- It is only available on the following operating systems or later:
  - Linux 3.16: requires the kernel parameter `net.ipv4.tcp_fastopen`. This parameter is a bitmap where `0x1` allows the client side and `0x2` allows the server side. The default is `0x1`. If the server must enable TFO, set it to `0x3`.
  - ~~Windows 10 (1607)~~, but the implementation is incorrect
  - Mac OS 10.11 / iOS 9, needs testing
  - FreeBSD 10.3 on server side / 12.0 on client side: requires `net.inet.tcp.fastopen.server_enabled=1` and `net.inet.tcp.fastopen.client_enabled=1`, needs testing

- For inbound, a positive integer here means the [maximum number of pending TFO connection requests](https://tools.ietf.org/html/rfc7413#section-5.1). **Not every operating system supports setting this here**:
  - Linux / FreeBSD: the positive integer is used as the limit. The maximum accepted value is 2147483647. If set to `true`, the value becomes `256`. On Linux, `net.core.somaxconn` also caps it, so if you exceed `somaxconn`, raise that as well.
  - Mac OS: `true` or a positive integer only means enabling TFO. The backlog must be configured separately via `net.inet.tcp.fastopen_backlog`.
  - Windows: `true` or a positive integer only means enabling TFO.

- For outbound, `true` or a positive integer simply means enabling TFO on any supported OS.

> `tproxy`: "redirect" | "tproxy" | "off"

Whether to enable transparent proxying. Linux only.

- `"redirect"`: transparent proxy in Redirect mode, supporting all IPv4 and IPv6 TCP connections
- `"tproxy"`: transparent proxy in TProxy mode, supporting all IPv4 and IPv6 TCP and UDP connections
- `"off"`: disable transparent proxying

Transparent proxying requires root or `CAP_NET_ADMIN`.

::: danger
When [Dokodemo-door](../inbounds/tunnel.md) has `followRedirect` set to `true`, and `tproxy` is empty in Sockopt, the `tproxy` value is set to `"redirect"`.
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

The default value is `"AsIs"`.

When the target address is a domain name, this field controls how outbound connections resolve and use that target:

- With `"AsIs"`, Xray does not specially handle the domain name. In the end it uses Go's built-in dialer directly. The priority is fixed to the RFC 6724 default and does not follow configurations such as `gai.conf`, so in practice IPv6 is usually preferred.
- With any other value, Xray uses the Xray-core [built-in DNS server](../dns.md) for resolution. If there is no `DNSObject`, system DNS is used. If multiple IP addresses match, the core randomly picks one target IP.
- `"IPv4"` means try IPv4 only. `"IPv4v6"` means try IPv4 or IPv6, but for dual-stack domains prefer IPv4. The same logic applies to the IPv6-first variants.
- When built-in DNS also sets `"queryStrategy"`, the actual behavior is the intersection of the two settings. Only IP types included in both are resolved. For example, `"queryStrategy": "UseIPv4"` together with `"domainStrategy": "UseIP"` behaves the same as `"domainStrategy": "UseIPv4"`.
- When using a `"Use"` option, Xray falls back to `"AsIs"` if the resolution result does not match the requested family, such as a domain that only has IPv4 while using `UseIPv6`.
- When using a `"Force"` option, the connection fails outright if the resolution result does not match the requested family.

::: tip TIP
When using `"UseIP"` or `"ForceIP"`, and [OutboundObject](../outbound.md#outboundobject) specifies `sendThrough`, the core automatically infers whether IPv4 or IPv6 is needed from the local address. If you manually force a single IP family, such as `UseIPv4`, but it conflicts with `sendThrough`, the connection fails.
:::

::: danger
Improper use of this feature can create an infinite loop.

Short version: connecting to the server needs a DNS result, but completing the DNS query also needs to connect to the server.

> Tony: which came first, the chicken or the egg?

Detailed explanation:

1. Trigger condition: the proxy server is `proxy.com`, and the built-in DNS server is enabled in non-Local mode.
2. Before Xray establishes a TCP connection to `proxy.com`, it queries `proxy.com` through the built-in DNS server.
3. The built-in DNS server connects to `dns.com` and sends a query to obtain the IP of `proxy.com`.
4. Bad routing rules cause the request sent in step 3 to be proxied through `proxy.com`.
5. Xray now tries to establish another TCP connection to `proxy.com`.
6. Before doing that, it again queries `proxy.com` through the built-in DNS server.
7. The built-in DNS server reuses the connection from step 3 and sends the new query.
8. The problem appears: the connection from step 3 is waiting for the query result from step 7, while step 7 cannot finish until the connection from step 3 is fully established.
9. Good game.

Possible solutions:

- Fix the traffic split of the built-in DNS server.
- Use hosts.
- ~~If you still do not know how to solve it, do not use this feature.~~

So this feature is **not recommended** for inexperienced users unless they understand the routing implications.
:::

> `dialerProxy`: ""

An outbound identifier. When non-empty, the specified outbound is used to establish the connection. It can be used for chained forwarding that still respects transport configuration.

::: danger
This option is incompatible with `ProxySettingsObject.Tag`.
:::

> `acceptProxyProtocol`: true | false

Inbound-only. Controls whether PROXY protocol is accepted.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to pass the real source IP and port. If you do not know what it is, ignore this option.

Common reverse proxies such as HAProxy and Nginx can be configured to send it, and VLESS fallback `xver` can also send it.

When set to `true`, the peer must send PROXY protocol v1 or v2 immediately after the underlying TCP connection is established, otherwise the connection is closed.

> `trustedXForwardedFor`: [ string ]

Only applies to the three HTTP-based inbounds: `XHTTP`, `WebSocket`, and `HTTPUpgrade`.

It controls when Xray trusts `X-Forwarded-For` and uses it to overwrite `SourceIP`.

If left unset, the old behavior remains: as long as the request contains `X-Forwarded-For`, Xray reads it.

After setting this field, each array item is treated as an additional required header name. Xray trusts `X-Forwarded-For` only when the request also contains at least one of those headers. The header values do not matter; only the presence of the key is checked.

> `tcpKeepAliveIdle`: number

TCP idle threshold in seconds. Once a TCP connection has been idle for this long, Keep-Alive probes begin.

For outbound, Xray uses Chrome's default values, where both idle and interval are 45 seconds. Setting either this field or `tcpKeepAliveInterval` to a negative value disables that default keepalive; a positive value overrides it.

For inbound, Keep-Alive is disabled by default. It becomes enabled when either this field or `tcpKeepAliveInterval` is non-zero. If only one is set, the other follows the operating-system default.

> `tcpKeepAliveInterval`: number

Time interval in seconds between Keep-Alive probes after TCP enters Keep-Alive state. The rest of the behavior is described above.

> `tcpUserTimeout`: number

In milliseconds. See: https://github.com/grpc/proposal/blob/master/A18-tcp-user-timeout.md

> `tcpcongestion`: ""

TCP congestion-control algorithm. Linux only.
When unset, the operating-system default is used.

::: tip Common algorithms

- `bbr` (recommended)
- `cubic`
- `reno`

:::

::: tip
Run `sysctl net.ipv4.tcp_congestion_control` to see the current system default.
:::

> `interface`: ""

Bind the outbound connection to a specific network-interface name. Supported on Linux, iOS, Mac OS, and Windows.

> `V6Only`: true | false

When set to `true`, listening on `::` accepts only IPv6 connections. Linux only.

> `tcpWindowClamp`: number

Bind the advertised TCP window size to this value. The kernel chooses the larger value between this and `SOCK_MIN_RCVBUF / 2`.

> `tcpMptcp`: true | false

The default value is `false`. When set to `true`, [Multipath TCP](https://en.wikipedia.org/wiki/Multipath_TCP) is enabled. This is client-only, because starting with Go 1.24 MPTCP is enabled by default when listening. It currently requires Linux kernel 5.6 or later.

> `tcpNoDelay`: true | false

This field has been removed because Go enables TCP no delay by default. If you want to disable it, do so through `customSockopt`.

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

Use SRV records or TXT records to specify the target address and or port used by outbound. The default value is `none`, which disables the feature.

These lookups go through system DNS rather than Xray's built-in DNS. The queried name is the outbound domain name. If the lookup fails, the request is sent using the original address and port.

`Srv*` means querying SRV records in their standard format. `Txt*` means querying TXT records in a format such as `127.0.0.1:80`.

`PortOnly` resets only the port. `AddressOnly` resets only the address. `PortAndAddress` resets both.

This option takes effect before `domainStrategy` inside `sockopt`. After the address is rewritten, it is still resolved according to `domainStrategy`, if any. However, it takes effect after `Freedom`'s own `domainStrategy`, so if that one already resolved the domain to an IP, this option no longer works.

As a practical consequence, if ordinary domain traffic is sent into a `Freedom` outbound with `AsIs`, enabling this field makes the core try to resolve and rewrite the address and port, for example by querying `google.com` for SRV records.

> `customSockopt`: []

An array for advanced users to specify any needed socket option. In theory, all connection-related settings above can be expressed here, and you can also set other socket options that exist but are not exposed directly by the core. It currently supports Linux, Windows, and Darwin. The example below is equivalent to `"tcpcongestion": "bbr"`.

Make sure you understand socket programming before using it.

```json
"customSockopt": [
  {
    "system": "linux",
    "type": "str",
    "level": "6",
    "opt": "13",
    "value": "bbr"
  }
]
```

> `system`: ""

Optional. Restricts the option to a specific operating system. If the current system does not match, the option is skipped. Supported values are `linux`, `windows`, and `darwin`, all in lowercase. If left empty, the option is applied directly.

> `type`: ""

Required. The value type to set. Currently `int` and `str` are supported.

> `level`: ""

Optional. Protocol level. The default is `6`, which means TCP.

> `opt`: ""

The option number to operate on, in decimal. In the example above, `13` is the decimal form of `TCP_CONGESTION`, whose hexadecimal value is `0xd`.

> `value`: ""

The value to set. In the example above, the value is `bbr`.

When `type` is `int`, the value must be a decimal number.

> `happyEyeballs`: [HappyEyeballsObject](#happyeyeballsobject)

An RFC 8305 Happy Eyeballs implementation, TCP only. When the target is a domain name, it races the resolved addresses and chooses the first successful one. It only works when `Sockopt.domainStrategy` is not `AsIs`.

Note that `UseIPv4v6` and `ForceIPv4v6` effectively reduce the usable list to IPv4 and only query IPv6 if IPv4 resolution fails. That is not recommended. Prefer `UseIP` or `ForceIP` together with `HappyEyeballs.interleave`.

::: warning
Do not use this together with the `domainStrategy` on a `Freedom` outbound, because then `Sockopt` only sees the final IP after replacement.
:::

### HappyEyeballsObject

```json
"happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4
}
```

> `tryDelayMs`: number

Delay between each racing attempt, in milliseconds. The default is `0`, which disables the feature. A recommended value is `250`.

> `prioritizeIPv6`: bool

Controls which IP family comes first after sorting. The default is `false`, meaning IPv4 comes first.

> `interleave`: number

The RFC 8305 `First Address Family Count`. The default value is `1`. It controls how IPv4 and IPv6 addresses are interleaved.

For example, the waiting dial queue may be ordered as `46464646` when this is `1`, or `44664466` when it is `2`, where `6` means an IPv6 address and `4` means an IPv4 address.

> `maxConcurrentTry`: number

Maximum number of concurrent attempts. This prevents the core from launching too many connections when a domain resolves to many addresses and all of them fail. The default is `4`. Setting it to `0` disables Happy Eyeballs.
