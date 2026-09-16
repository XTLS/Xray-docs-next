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
        // [!field focus]
        "sockopt": {
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
When [tunnel](../inbounds/tunnel.md) has `followRedirect` set to `true`, and `tproxy` is empty in Sockopt, the `tproxy` value is set to `"redirect"`.
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"

The default value is `"AsIs"`.

This option controls how the connection destination's domain name is resolved when an outbound establishes an underlying connection.

- Proxy outbounds such as VLESS, VMess, and Trojan: the underlying connection is to the proxy server, so this option controls resolution of the proxy server's domain name. Whether the target domain name in the proxied request is resolved locally is controlled by the outbound's [`targetStrategy`](../outbound.md#outboundobject).
- Freedom outbound: the underlying connection is to the request's target itself, so this option controls resolution of the request's target domain name.

The strategies work as follows:

- With `"AsIs"`, Xray passes the domain name to Go, which resolves it using the operating system's DNS settings and connects. TCP usually tries IPv6 first and tries IPv4 if the connection does not proceed smoothly; UDP prefers IPv4.

  ::: details Address selection and fallback with AsIs
  TCP uses Go's built-in Happy Eyeballs. The address family of the first resolved address is preferred. If the connection has not succeeded after 300 ms, attempts with the other address family begin. If all attempts with the preferred family fail sooner, the other family is tried immediately. This is not controlled by Xray's `sockopt.happyEyeballs`. See [Go's dialing implementation](https://go.dev/src/net/dial.go).

  With a pure Go build of Xray, addresses are sorted using a simplified version of RFC 6724, which usually prefers IPv6 when other conditions are equal and does not read `/etc/gai.conf`. Most official Xray release builds use this approach; behavior may differ slightly on some operating systems or in downstream builds. See [Go's address sorting implementation](https://go.dev/src/net/addrselect.go).

  UDP prefers an IPv4 address from the resolved results and uses IPv6 only if no IPv4 address is available. A send failure does not automatically switch to the other address family. See [Go's UDP address selection implementation](https://go.dev/src/net/ipsock.go).

  Note that a `Use` strategy may fall back to `AsIs` if resolution fails or the results do not meet the requirements. In that case, both TCP and UDP follow the behavior described above.
  :::

- With any other value, Xray uses its [built-in DNS module](../dns.md) for resolution. If no `DNSObject` is configured, system DNS is used. If multiple IP addresses match, one is selected randomly by default; when `sockopt.happyEyeballs` is enabled for TCP, the addresses are raced instead.
- `"IPv4"` means resolve IPv4 only. `"IPv4v6"` means resolve IPv4 first and resolve IPv6 only if that lookup returns an error or no IP addresses. If IPv4 addresses are resolved but subsequent connection attempts fail, it does not fall back to IPv6. `"IPv6"` and `"IPv6v4"` work analogously, with the address-family order reversed.
- When the built-in DNS module also sets `"queryStrategy"`, the resolved IP types are the intersection of the two settings: only IP types allowed by both are resolved. For example, `"queryStrategy": "UseIPv4"` together with `"domainStrategy": "UseIP"` behaves the same as `"domainStrategy": "UseIPv4"`.
- With a `"Use"` option, Xray falls back to `AsIs` if resolution fails or the results do not meet the requirements, such as a domain that only resolves to IPv4 while `UseIPv6` is selected.
- With a `"Force"` option, the connection cannot be established if resolution fails or the results do not meet the requirements.

::: tip
When using `"UseIP"` or `"ForceIP"`, and [OutboundObject](../outbound.md#outboundobject) specifies `sendThrough`, the core automatically infers whether IPv4 or IPv6 is needed from the local address. If you manually force a single IP family, such as `UseIPv4`, but it conflicts with `sendThrough`, the connection fails.
:::

:::: danger Improper configuration of this feature can create an infinite loop!
Connecting to the server needs a DNS result, but completing the DNS query also needs to connect to the server.

This feature is **not recommended** for inexperienced users unless they understand the routing implications.

::: details Detailed explanation

1. Trigger condition: the proxy server address is a domain name (`proxy.com`), and the built-in DNS server is in non-Local mode.
2. Before Xray establishes a TCP connection to `proxy.com`, it queries `proxy.com` through the built-in DNS server.
3. The built-in DNS server connects to `dns.com` and sends a query to obtain the IP of `proxy.com`.
4. Bad routing rules cause the request sent in step 3 to be proxied through `proxy.com`.
5. Xray now tries to establish another TCP connection to `proxy.com`.
6. Before doing that, it again queries `proxy.com` through the built-in DNS server.
7. The built-in DNS server reuses the connection from step 3 and sends the new query.
8. The problem appears: the connection from step 3 is waiting for the query result from step 7, while step 7 cannot finish until the connection from step 3 is fully established.
9. Good game.

Direct connections through Freedom can have the same problem: if connecting to a DNS server requires resolving its own domain name through that same server, a circular dependency is created.

Possible solutions:

- Fix the traffic split of the built-in DNS server.
- Use hosts.
- ~~If you still do not know how to solve it, do not use this feature.~~

:::
::::

> `dialerProxy`: ""

An outbound identifier. When non-empty, the specified outbound is used to establish the connection. This is commonly used to configure chained proxies.

> `acceptProxyProtocol`: true | false

Inbound-only. Controls whether PROXY protocol is accepted.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to pass the real source IP and port. If you do not know what it is, ignore this option.

Common reverse proxies such as HAProxy and Nginx can be configured to send it, and VLESS fallback `xver` can also send it.

When set to `true`, the peer must send PROXY protocol v1 or v2 immediately after the underlying TCP connection is established, otherwise the connection is closed.

> `trustedXForwardedFor`: [ string ]

Only applies to the four HTTP-based transport methods: `XHTTP`, `WebSocket`, `HTTPUpgrade`, and `gRPC`. It controls whether to trust the XFF (`X-Forwarded-For`) header, that is, whether to treat it as coming from a trusted reverse proxy.

Xray checks whether the headers corresponding to the strings in this array are present in the request. If any one of them is present, regardless of its value, Xray allows the value at index 0 in the XFF header to override the source IP; otherwise, it ignores the XFF header.

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

> `addressPortStrategy`: "none" | "SrvPortOnly" | "SrvAddressOnly" | "SrvPortAndAddress" | "TxtPortOnly" | "TxtAddressOnly" | "TxtPortAndAddress"

Use SRV records or TXT records to specify the target address and or port used by outbound. The default value is `none`, which disables the feature.

These lookups go through system DNS rather than Xray's built-in DNS. The queried name is the outbound domain name. If the lookup fails, the request is sent using the original address and port.

`Srv*` means querying SRV records in their standard format. `Txt*` means querying TXT records in a format such as `127.0.0.1:80`.

`PortOnly` resets only the port. `AddressOnly` resets only the address. `PortAndAddress` resets both.

This option takes effect before `sockopt.domainStrategy` resolves the address. After the address is rewritten, it is still resolved according to `domainStrategy`.

Freedom outbounds do not support this option.

> `customSockopt`: []

An array for advanced users to specify any needed socket option. In theory, all connection-related settings above can be expressed here, and you can also set other socket options that exist but are not exposed directly by the core. It currently supports Linux, Windows, and Darwin. The example below is equivalent to `"tcpcongestion": "bbr"`.

Make sure you understand socket programming before using it.

```json
{
  "customSockopt": [
    {
      "system": "linux",
      "network": "tcp",
      "type": "str",
      "level": "6",
      "opt": "13",
      "value": "bbr"
    }
  ]
}
```

> `system`: ""

Optional. Restricts the option to a specific operating system, using lowercase. If the current system does not match, the option is skipped. If left empty, the option is applied directly. Supported values are `linux`, `windows`, `darwin`, and `android` (`android` is only for dedicated Android builds; running a Linux build on Android still counts as `linux`).

> `network`: ""

Optional. Restricts the option to a specific network type. Supported values are `tcp`, `tcp4`, `tcp6`, `udp`, `udp4`, and `udp6`. A value without a numeric suffix means the sockopt is applied to both stacks. Note that an IPv4 target does **not** guarantee that the network passed in by the standard library is `tcp4`/`udp4` — for example, the system may use an IPv6 socket to connect to an IPv4 address. Verify the standard library behavior before using this.

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

An RFC 8305 Happy Eyeballs implementation, TCP only. When the target is a domain name, it races the resolved addresses and chooses the first successful one. It only works when `sockopt.domainStrategy` is not `AsIs`.

Note that `UseIPv4v6` and `ForceIPv4v6` effectively reduce the usable IP list to IPv4 and switch to resolving IPv6 only if IPv4 resolution returns an error or no IP addresses. Failure to connect over IPv4 does not trigger this fallback. This usage is not recommended. Prefer `UseIP` or `ForceIP` together with `happyEyeballs.interleave`.

::: warning
Do not use this feature together with `dialerProxy`, because that prevents `happyEyeballs` from taking effect.
:::

### HappyEyeballsObject

```json
{
  "happyEyeballs": {
    "tryDelayMs": 250,
    "prioritizeIPv6": false,
    "interleave": 1,
    "maxConcurrentTry": 4
  }
}
```

> `tryDelayMs`: number

Delay between each racing attempt, in milliseconds. The default is `0`, which disables the feature. A recommended value is `250`.

Failed requests immediately start requesting the next IP without waiting for this delay.

> `prioritizeIPv6`: bool

Controls which IP family comes first after sorting. The default is `false`, meaning IPv4 comes first.

Unlike the rigid `domainStrategy` in other places, if a route for the request does not exist—such as trying IPv6 first in an IPv4-only environment—the attempt fails immediately and starts trying the next IP without causing redundant delays or connection failures. You can confidently copy this option across different machines as needed.

> `interleave`: number

The RFC 8305 `First Address Family Count`. The default value is `1`. It controls how IPv4 and IPv6 addresses are interleaved.

For example, the waiting dial queue may be ordered as `46464646` when this is `1`, or `44664466` when it is `2`, where `6` means an IPv6 address and `4` means an IPv4 address.

> `maxConcurrentTry`: number

Maximum number of concurrent attempts. This prevents the core from launching too many connections when a domain resolves to many addresses and all of them fail. The default is `4`. Setting it to `0` disables Happy Eyeballs.
