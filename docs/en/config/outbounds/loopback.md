# Loopback

Loopback is an outbound protocol. It can send traffics through corresponding outbound to routing inbound, thus rerouting traffics to other routing rules without leaving Xray-core.

## OutboundConfigurationObject

```json
{
  "inboundTag": "TagUseAsInbound"
}
```

> `inboundTag`: string

Use as an inbound tag for routing.

This tag can be used as `inboundTag` in routing rules, all traffics going through this outbound can be rerouted with routing rules with corresponding inbound tag.
