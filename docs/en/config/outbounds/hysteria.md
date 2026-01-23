# Hysteria

Client implementation of the Hysteria protocol.

This page is very simple because the Hysteria protocol is actually composed of a simple proxy control protocol and a tuned QUIC underlying transport. In Xray, the proxy protocol and the underlying transport are separated. For more details (such as `brutal`), please refer to [hysteriaSettings](../transports/hysteria.md) in the underlying transport section.

## OutboundConfigurationObject

```json
{
  "version": 2,
  "address": "192.168.108.1",
  "port": 3128
}
```

> `version`: number

Hysteria version, must be 2.

> `address`: string

Hysteria proxy server address, required.

> `port`: int

Hysteria proxy server port, required.
