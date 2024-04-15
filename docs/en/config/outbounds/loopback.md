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

### How to use?

If you need to do some more detailed routing for traffics that have been routed by routing rules, like splitting routed traffics to TCP traffics and UDP traffics and send them to different outbounds, this can be done with `loopback` outbound.

``` jsonc
{
  "outbounds": [
    {
      "protocol": "loopback",
      "tag": "need-to-split",
      "settings": {
        "inboundTag": "traffic-input" // This tag will be used as the inboundTag inside the RuleObject 
      }
    },
    {
      "tag": "tcp-output",
      // protocol, settings, streamSettings etc.
    },
    {
      "tag": "udp-output",
      // protocol, settings, streamSettings etc.
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["traffic-input"], // tag set in the loopback outbound setting
        "network": "tcp",
        "outboundTag": "tcp-output"
      },
      {
        "inboundTag": ["traffic-input"], // tag set in the loopback outbound 
        "network": "udp",
        "outboundTag": "udp-output"
      }
    ]
  }
}
```
