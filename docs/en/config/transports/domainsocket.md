# Domain Socket

::: danger
We recommend writing it to the `listen` field in [inbounds](../inbound.md)and the transport mode can be TCP, WebSocket, or HTTP/2.

Note that the DomainSocket option here may be deprecated in the future.
:::

Domain Socket uses standard Unix domain sockets to transmit data.

The advantage of using DomainSocket is that it uses the built-in transport channel of the operating system and does not occupy the network cache. Theoretically, it is slightly faster than local loopback networks.

Currently, it can only be used on platforms that support Unix domain sockets, such as Linux and macOS. It is not available until Windows 10 Build 17036.

If DomainSocket is specified as the transport mode, the ports and IP addresses configured in the inbound and outbound proxies will be invalidated, and all transports will be replaced by DomainSocket.

## DomainSocketObject

`DomainSocketObject` corresponds to the `dsSettings` item.

```json
{
  "path": "/path/to/ds/file",
  "abstract": false,
  "padding": false
}
```

> `path`: string

A valid file path.

::: danger
This file must not exist before running Xray.
:::

> `abstract`: true | false

Whether it is an abstract domain socket, with a default value of `false`.

> `padding`: true | false

Whether the abstract domain socket has padding, with a default value of `false`.