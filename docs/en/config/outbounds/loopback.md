# Loopback

Loopback is an outbound data protocol. Its function is to re-inject data sent through this outbound back into the routing inbound, allowing the data to be processed by the routing system again without leaving Xray-core.

## OutboundConfigurationObject

```json
{
  "inboundTag": "TagUseAsInbound"
}
```

> `inboundTag`: string

The inbound protocol identifier used for re-routing.

This identifier can be used for `inboundTag` in routing rules, indicating that data from this outbound can be processed again by the corresponding routing rules.

### How to use?

If you need to perform finer-grained splitting on traffic that has already been split by routing rules—for example, if TCP traffic and UDP traffic split by the same group of routing rules need to go through different outbounds—you can use the `loopback` outbound to achieve this.

```json
{
  "outbounds": [
    {
      "protocol": "loopback",
      "tag": "need-to-split",
      "settings": {
        "inboundTag": "traffic-input" // This tag is used for the inboundTag of RuleObject below
      }
    },
    {
      "tag": "tcp-output"
      // settings like protocol, settings, streamSettings
    },
    {
      "tag": "udp-output"
      // settings like protocol, settings, streamSettings
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["traffic-input"], // tag set in loopback
        "network": "tcp",
        "outboundTag": "tcp-output"
      },
      {
        "inboundTag": ["traffic-input"], // tag set in loopback
        "network": "udp",
        "outboundTag": "udp-output"
      }
    ]
  }
}
```
