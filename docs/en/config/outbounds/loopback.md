# Loopback

Loopback is a loopback outbound used to send traffic back to routing for further processing without leaving the core.

::: tip Uses

- In places where only an outbound can be specified and `balancerTag` cannot be written directly, Loopback can be used to indirectly use a balancer.<br>
  For example, `proxySettings` and `dialerProxy` in chained proxies, and `fallbackTag` in load balancing.
- After traffic has already been routed once, it can be further subdivided based on more conditions.<br>
  For example, TCP traffic and UDP traffic routed by the same set of routing rules can be sent to different outbounds.

:::

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "loopback",
      // [!code focus:4]
      "settings": {
        "inboundTag": "TagUseAsInbound",
        "sniffing": {}
      }
    }
  ]
}
```

> `inboundTag`: string

The inbound tag used when re-entering routing.

This tag can be used as `inboundTag` in routing, indicating that data from this outbound will re-enter routing with this tag and be processed again by the corresponding rules.

> `sniffing`: [SniffingObject](../inbound.md#sniffingobject)

Traffic sniffing. The specific configuration is the same as that of [Inbound](../inbound.md#sniffingobject). Disabled by default.
