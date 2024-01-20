# mKCP

mKCP uses UDP to emulate TCP connections.

mKCP sacrifices bandwidth to reduce latency. To transmit the same content, mKCP generally consumes more data than TCP.

::: tip
Make sure the firewall on the host is configured correctly.
:::

## KcpObject

`KcpObject` corresponds to the `kcpSettings` in the [Transport Protocol](../transport.md),

```json
{
  "mtu": 1350,
  "tti": 20,
  "uplinkCapacity": 5,
  "downlinkCapacity": 20,
  "congestion": false,
  "readBufferSize": 1,
  "writeBufferSize": 1,
  "header": {
    "type": "none"
  },
  "seed": "Password"
}
```

> `mtu`: number

Maximum transmission unit. It indicates the maxium bytes that an UDP packet can carry. Recommended value is between `576` and `1460`

The default value is `1350`

> `tti`: number

Transmission time interval, measured in milliseconds (ms), determines how often mKCP sends data. Please choose a value between `10` and `100`

The default value is `50`

> `uplinkCapacity`: number

Uplink capacity refers to the maximum bandwidth used by the host to send data, measured in MB/s (note: Byte, not bit). It can be set to 0, indicating a very small bandwidth.

The default value is `5`

> `downlinkCapacity`: number

Downlink capacity refers to the maximum bandwidth used by the host to receive data, measured in MB/s (note: Byte, not bit). It can be set to 0, indicating a very small bandwidth.

The default value is `20`

::: tip
`uplinkCapacity` and `downlinkCapacity` determine the transmission speed of mKCP. For example, when a client sends data, the client's `uplinkCapacity` specifies the speed of sending data, while the server's `downlinkCapacity` specifies the speed of receiving data. The value used is the smaller of the two.

It is recommended to set `downlinkCapacity` to a larger value, such as `100`, and set `uplinkCapacity` to the actual network speed. If the speed is insufficient, gradually increase the value of `uplinkCapacity` until it is about twice the bandwidth.
:::

> `congestion`: true | false

Whether or not to enable congestion control.
When congestion control is enabled, Xray will detect network quality. It will send less packets when packet loss is severe, or more packets when network is not fully filled.

The default value is `false`

> `readBufferSize`: number

The read buffer size for a single connection, measured in `MB`

The default value is `2`

> `writeBufferSize`: number

The write buffer size for a single connection, measured in `MB`

The default value is `2`

::: tip
`readBufferSize` and `writeBufferSize` specify the memory size used by a single connection. When high-speed transmissions are required, specifying larger values for `readBufferSize` and `writeBufferSize` can improve speed to some extent, but it will also consume more memory.

When the network speed is no more than `20 MB/s`, the default value of `1MB` is sufficient; after exceeding this limit, you can increase the values of `readBufferSize` and `writeBufferSize` appropriately and then manually balance the relationship between speed and memory.
:::

> `header`: [HeaderObject](#headerobject)

Configuration for packet header obfuscation.

> `seed`: string

An optional obfuscation seed is used to obfuscate traffic data using the `AES-128-GCM` algorithm. The client and server need to use the same seed.

This obfuscation mechanism cannot ensure the security of the content, but it may be able to resist some blocking.

::: tip NOTE
Currently, in the testing environment, enabling this setting has not resulted in the original unobfuscated version being blocked by ports.
:::

### HeaderObject

```json
{
  "type": "none"
}
```

> `type`: string

Type of obfuscation. Corresponding inbound and outbound must have the same value. Choices are:

- `"none"`：Default value. No obfuscation is used.
- `"srtp"`：Obfuscated as SRTP traffic. It may be recognized as video calls such as Facetime.
- `"utp"`：Obfuscated as uTP traffic. It may be recognized as Bittorrent traffic.
- `"wechat-video"`：Obfuscated to WeChat traffic.
- `"dtls"`：Obfuscated as DTLS 1.2 packets.
- `"wireguard"`：Obfuscated as WireGuard packets. (NOT true WireGuard protocol)

## Special Thanks

- [@skywind3000](https://github.com/skywind3000) Credit for inventing and implementing the original KCP protocol in C.
- [@xtaci](https://github.com/xtaci) Credit for re-implementing KCP protocol in Go.
- [@xiaokangwang](https://github.com/xiaokangwang) Credit for testing the integration of KCP with Xray and submitting the initial PR.

## Improvements to the KCP protocol

### smaller protocol header

The original KCP protocol uses a fixed header of 24 bytes, while mKCP modifies it to 18 bytes for data packets and 16 bytes for acknowledgement (ACK) packets. A smaller header helps evade feature detection and speeds up transmission.

In addition, the original KCP can only confirm that one packet has been received with a single ACK packet. This means that when KCP needs to confirm that 100 packets have been received, it will send out 2400 bytes of data (24 x 100), including a large amount of repeated header information that wastes bandwidth. mKCP compresses multiple ACK packets, so 100 ACK packets only require 418 bytes (16 + 2 + 100 x 4), which is equivalent to one-sixth of the original KCP.

### ACK packet retransmission

In the original KCP protocol, an ACK packet is only sent once. If an ACK packet is lost, it will cause unnecessary bandwidth waste due to data retransmission. In contrast, mKCP retransmits ACK packets at a certain frequency until they are confirmed by the sender. The size of a single ACK packet is 22 bytes, much smaller than the data packets which are over 1000 bytes. Therefore, the cost of retransmitting ACK packets is much lower.

### Connection state control

mKCP can effectively initiate and close connections. When the remote host initiates disconnection, the connection will be released within two seconds. When the remote host lost connection, the connection will be released within a maximum of 30 seconds.

The original KCP does not support this scenario.
