# TUN

Creates a TUN interface; traffic sent to this interface will be processed by Xray. Currently, only Windows and Linux are supported.

## InboundConfigurationObject

```json
{
  "name": "xray0",
  "MTU": 1500,
  "UserLevel": 0
}
```

> `name`: string

The name of the created TUN interface. Default is `"xray0"`.

> `MTU`: number

The MTU of the interface. Default is `1500`.

> `userLevel`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `userLevel` corresponds to the `level` value in [policy](../policy.md#policyobject). If not specified, the default is 0.

## Usage Tips

Currently, Xray does not automatically modify the system routing table. You need to manually configure routes to direct data to the created TUN interface; otherwise, it remains just an interface.

If you only want to proxy specific process(es), the process name routing in the Xray routing system will be very useful.

::: warning
Be aware of potential traffic loop issues. After setting routes, requests initiated by Xray might be sent back to Xray, causing a loop!
Use `interface` in `sockopt` to bind to the actual physical network interface to avoid this problem. `ipconfig` (Windows) or `ip a` (Linux) will help you find the interface name you need.
Alternatively, use the outbound `sendThrough` setting. It is available directly in `OutboundObject` without the deep nesting level of `sockOpt.interface`. Here you need to use the IP address on the network card, such as 192.168.1.2 (As you can see, its disadvantage is that it cannot automatically support dual-stack; please choose according to the IP actually used for your outbound connection).
:::
