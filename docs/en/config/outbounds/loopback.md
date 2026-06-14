# Loopback

Loopback is a loopback outbound used to send traffic back to routing for further processing without leaving the core.

## OutboundConfigurationObject

`OutboundConfigurationObject` corresponds to the `settings` item in [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "loopback",
      // [!code focus:3]
      "settings": {
        "inboundTag": "TagUseAsInbound"
      }
    }
  ]
}
```

> `inboundTag`: string

The inbound tag used when re-entering routing.

This tag can be used as `inboundTag` in routing, indicating that data from this outbound will re-enter routing with this tag and be processed again by the corresponding rules.

::: tip Uses

- In places where only an outbound can be specified and `balancerTag` cannot be written directly, Loopback lets you use a balancer indirectly.<br>
  For example, `proxySettings` and `dialerProxy` in chained proxies, and `fallbackTag` in load balancing.
- After traffic has already been routed once, it can be further subdivided using more conditions.<br>
  For example, TCP traffic and UDP traffic split by the same set of routing rules can be sent to different outbounds.

:::
