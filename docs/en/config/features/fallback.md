# Fallback

> **Fallback is one of the most powerful features of Xray, which can effectively prevent active probing and allows you to use one port for multiple services**

Fallback provides Xray with high-strength anti-active probing capabilities and has a unique first-packet fallback mechanism.

Fallback can also divide traffic of different types based on path for multi-service sharing on a single port.

Currently, you can use the fallback feature by configuring fallbacks when using VLESS or Trojan protocols, thus creating an unimaginable combo of services becomes REALITY.

## fallbacks configuration

```json
  "fallbacks": [
    {
      "dest": 80
    }
  ]
```

> `fallbacks`: \[ [FallbackObject](#fallbackobject) \]

**`fallbacks` is an array, and here is an example configuration of one of its child elements.**

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

The `fallbacks` object is optional and can only be used for the `TCP+TLS` transport combination.

- When `fallbacks` configure with any child elements，`"alpn":["http/1.1"]` needs to be configured in [Inbound TLS](../transport.md#tlsobject).

Usually, you need to set up a default fallback with both `alpn` and `path` omitted or empty, and then configure other routing rules as needed.

VLESS will forward traffic with TLS decrypted first packet length <18, invalid protocol version, or failed authentication to the address specified by `dest`.

For other transport combinations, you must remove the `fallbacks` object or all its child elements. At this point, no `fallbacks` will be enabled, and VLESS will wait until it reads enough data. If the protocol version is invalid or authentication fails, the connection will be terminated directly.

> `name`: string

Attempt to match the TLS SNI (Server Name Indication), where an empty value matches any SNI. The default value is `""`, which means empty value.

> `alpn`: string

Attempt to match the result of TLS ALPN negotiation, where an empty value matches any ALPN result. The default value is `""` , which means empty value.

VLESS will read the TLS ALPN negotiation result only when necessary. If successful, it will output `realAlpn =` info to the log.
Purpose: To solve the problem of Nginx's inability to simultaneously support http/1.1 and h2c services. Nginx needs to write two lines of listen, one for 1.1 and one for h2c.
Note: When `"h2"` is included in fallbacks alpn, the Inbound TLS needs to be set as `"alpn":["h2","http/1.1"]` to support `h2` access.

::: tip
The `alpn` set in the Fallback is used to match the actual negotiated ALPN, while the `alpn` set in the Inbound TLS represents the list of optional ALPNs during the handshake. These two have different meanings.
:::

> `path`: string

Attempt to match the first packet HTTP PATH, where an empty value matches any PATH and a default value is empty. If non-empty, it must start with `/`, and h2c is not supported.

Smart: VLESS will only attempt to check the PATH (no more than 55 bytes; the fastest algorithm that does not fully parse HTTP) when necessary. If successful, it will output `realPath =` in the INFO log.
Purpose: To route other inbound WebSocket traffic or HTTP disguised traffic, without additional processing, purely forwarding traffic, and theoretically better performance than Nginx.

Note: **The inbound where fallbacks is located must be TCP+TLS**. This is for routing to other WebSocket inbound, while the inbound being routed doesn't need to configure TLS.

> `dest`: string | number

Determines the destination of decrypted TLS TCP traffic, which currently supports two types of addresses: (this field is required, otherwise it cannot be started)

1. TCP, in the format of `"addr:port"`, where addr supports IPv4, domain names, and IPv6. If a domain name is entered, a direct TCP connection will be made (rather than using the built-in DNS resolver).
2. Unix domain socket, in the format of an absolute path, such as `"/dev/shm/domain.socket"`, which can be prefixed with `@` to represent [abstract](https://www.man7.org/linux/man-pages/man7/unix.7.html), and `@@` to represent padded abstract.

If only the port is specified, both numbers and strings are accepted, such as `80` or `"80"`. This usually points to a plaintext HTTP service (and the addr will be filled in as `"127.0.0.1"`).

> `xver`: number

Sends the [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) protocol, which is used to transmit the real source IP and port of the request. The version can be set to `1` or `2`, with a default value of `0`, which means no PROXY protocol is sent. Version `1` is recommended if needed.

Currently, versions `1` and `2` have the same functionality but different structures, where version `1` is printable while version 2 is `binary`. Xray's `TCP` and `WebSocket` inbound already support receiving the PROXY protocol.

::: warning
If you are [configuring Nginx to receive the PROXY protocol](https://docs.nginx.com/nginx/admin-guide/load-balancer/using-proxy-protocol/#configuring-nginx-to-accept-the-proxy-protocol), you need to not only set `proxy_protocol`, but also `set_real_ip_from` to avoid potential issues.
:::

### Additional Information

- Matches the most precise sub-element, regardless of the order of arrangement of the sub-elements. If several sub-elements have the same `alpn` and `path` configurations, the last one specified will be used.
- Fallback routing is performed at the decrypted TCP layer rather than the HTTP layer, and the first packet PATH is only checked when necessary.
- You can learn more about tips and experiences in using Fallbacks by visiting
  - [An Analysis of Fallback Functionality.](../../document/level-1/fallbacks-lv1)

## Fallbacks design theory <Badge text="WIP" type="warning"/>
