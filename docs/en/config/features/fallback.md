# Fallback

> **Fallback is one of Xray's most powerful features, effectively preventing active probing and allowing multiple services to share common ports.**

Fallback provides Xray with high-strength resistance against active probing and features a unique first-packet fallback mechanism.

Fallback can also split different types of traffic based on `path`, allowing a single port to be shared by multiple services.

Currently, you can use the fallback feature by configuring `fallbacks` when using VLESS or Trojan protocols, allowing for very rich configuration combinations.

## Fallbacks Configuration

```json
  "fallbacks": [
    {
      "dest": 80
    }
  ]
```

> `fallbacks`: \[ [FallbackObject](#fallbackobject) \]

An array containing a series of powerful fallback distribution configurations.

### FallbackObject

```json
{
  "name": "",
  "alpn": "",
  "path": "",
  "dest": 80,
  "xver": 0
}
```

**`fallbacks` is an array; this is the configuration description for one of its child elements.**

The `fallbacks` item is optional and can only be used with the TCP+TLS transport combination.

- When this item has child elements, [Inbound TLS](../transport.md#tlsobject) must set `"alpn":["http/1.1"]`.

Usually, you need to first set a default fallback with both `alpn` and `path` omitted or empty, and then configure other traffic splitting as needed.

VLESS will forward traffic to the address specified by `dest` if, after TLS decryption, the first packet length is < 18, the protocol version is invalid, or authentication fails.

For other transport combinations, the `fallbacks` item or all child elements must be deleted. In this case, Fallback will not be enabled. VLESS will wait to read the required length, and if the protocol version is invalid or authentication fails, it will directly disconnect.

> `name`: string

Attempts to match TLS SNI (Server Name Indication). Empty means any. Default is `""`.

> `alpn`: string

Attempts to match the TLS ALPN negotiation result. Empty means any. Default is `""`.

Xray will only attempt to read the TLS ALPN negotiation result when necessary. If successful, it outputs `realAlpn =` to the info log.
Usage: Solves the issue where Nginx's h2c service cannot be compatible with http/1.1 simultaneously. Nginx would require two `listen` lines, for 1.1 and h2c respectively.
Note: When `fallbacks` `alpn` contains `"h2"`, [Inbound TLS](../transport.md#tlsobject) needs to set `"alpn":["h2","http/1.1"]` to support h2 access.

::: tip
The `alpn` set in Fallback matches the _actually negotiated_ ALPN, whereas the `alpn` set in Inbound TLS is the list of _optional_ ALPNs during the handshake. The meanings are different.
:::

> `path`: string

Attempts to match the HTTP PATH of the first packet. Empty means any. Default is empty. If non-empty, it must start with `/`. h2c is not supported.

Smart: Xray will only attempt to peek at the PATH when necessary (not exceeding 55 bytes; uses the fastest algorithm, does not fully parse HTTP). If successful, it outputs the INFO log `realPath =`.
Usage: Offloading WebSocket traffic or HTTP camouflage traffic from other inbounds. It performs pure traffic forwarding without extra processing. Theoretical performance is stronger than Nginx.

Note: **The inbound where fallbacks is located must itself be TCP+TLS**. This is used for offloading to other WS inbounds; the offloaded inbound does not need to configure TLS.

> `dest`: string | number

Decides the destination of the TCP traffic after TLS decryption. Currently supports two types of addresses: (This item is mandatory, otherwise it will not start)

1. TCP, formatted as `"addr:port"`, where `addr` supports IPv4, domain name, and IPv6. If a domain name is filled, a TCP connection will be initiated directly (without going through the built-in DNS).
2. Unix domain socket, formatted as an absolute path, like `"/dev/shm/domain.socket"`. Can handle [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html) by adding `@` at the beginning, or `@@` for abstract with padding.

If only `port` is filled, it can be a number or a string, like `80` or `"80"`. It usually points to a cleartext http service (`addr` will be filled as `"localhost"`).

Note: Only after v25.7.26 does a `dest` containing only a port point to `localhost`. Before this, it was `127.0.0.1`. After the change, the actual target is likely `::1`. Some webserver templates copied online might listen on `::1` but only allow `127` to enter or apply the proxy protocol, which may lead to different behaviors.

> `xver`: number

Sends [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt), specifically used to pass the real source IP and port. Fill 1 or 2. Default is 0, meaning it is not sent. It is recommended to fill 1 if needed.

Currently, filling 1 or 2 functions identically, only the structure differs (the former is printable, the latter is binary). Both TCP and WS inbounds in Xray support receiving PROXY protocol.

::: warning
If you are [configuring Nginx to accept PROXY protocol](https://docs.nginx.com/nginx/admin-guide/load-balancer/using-proxy-protocol/#configuring-nginx-to-accept-the-proxy-protocol), besides setting `proxy_protocol`, you also need to set `set_real_ip_from`, otherwise issues may occur.
:::

### Supplementary Explanation

- It will match the most precise child element, regardless of the order of child elements. If several child elements with identical `alpn` and `path` are configured, the last one will prevail.
- Fallback offloading is forwarding at the decrypted TCP layer, not the HTTP layer. It only checks the first packet's PATH when necessary.
- You can view more tips and insights on using Fallbacks here:
  - [Analysis of Fallbacks Features](../../document/level-1/fallbacks-lv1)

## Fallbacks Design Theory <Badge text="WIP" type="warning"/>
