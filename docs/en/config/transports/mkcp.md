# mKCP

mKCP uses UDP to simulate TCP connections.

mKCP sacrifices bandwidth to reduce latency. To transmit the same amount of content, mKCP generally consumes more traffic than TCP.

::: tip
Please ensure that the firewall configuration on the host is correct.
:::

## KcpObject

`KcpObject` corresponds to the `kcpSettings` item in the transport configuration.

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
    "type": "none",
    "domain": "example.com"
  },
  "seed": "Password"
}
```

> `mtu`: number

Maximum Transmission Unit.
Please select a value between 576 and 1460.

The default value is `1350`.

> `tti`: number

Transmission Time Interval, in milliseconds (ms). mKCP will send data at this frequency.
Please select a value between 10 and 100.

The default value is `50`.

> `uplinkCapacity`: number

Uplink capacity, i.e., the maximum bandwidth used by the host to send data. The unit is MB/s. Note that it is Byte, not bit.
Can be set to 0, representing a very small bandwidth.

The default value is `5`.

> `downlinkCapacity`: number

Downlink capacity, i.e., the maximum bandwidth used by the host to receive data. The unit is MB/s. Note that it is Byte, not bit.
Can be set to 0, representing a very small bandwidth.

The default value is `20`.

::: tip
`uplinkCapacity` and `downlinkCapacity` determine the transmission speed of mKCP.
Taking a client sending data as an example, the client's `uplinkCapacity` specifies the speed of sending data, while the server's `downlinkCapacity` specifies the speed of receiving data. The actual speed will be the smaller of the two values.

It is recommended to set `downlinkCapacity` to a larger value, such as 100, and set `uplinkCapacity` to the actual network speed. When the speed is insufficient, you can gradually increase the value of `uplinkCapacity` until it is about twice the bandwidth.
:::

> `congestion`: true | false

Whether to enable congestion control.

When congestion control is enabled, Xray automatically monitors network quality. When packet loss is severe, it automatically reduces throughput; when the network is smooth, it appropriately increases throughput.

The default value is `false`.

> `readBufferSize`: number

The read buffer size for a single connection, in MB.

The default value is `2`.

> `writeBufferSize`: number

The write buffer size for a single connection, in MB.

The default value is `2`.

::: tip
`readBufferSize` and `writeBufferSize` specify the memory size used by a single connection.
When high-speed transmission is required, specifying larger `readBufferSize` and `writeBufferSize` will improve speed to a certain extent, but it will also use more memory.

When the network speed does not exceed 20MB/s, the default value of 1MB can meet the demand; beyond that, you can appropriately increase the values of `readBufferSize` and `writeBufferSize`, and then manually balance the relationship between speed and memory.
:::

> `header`: [HeaderObject](#headerobject)

Packet header camouflage settings.

> `seed`: string

Optional obfuscation password. Uses the AES-128-GCM algorithm to obfuscate traffic data. Must be consistent between the client and the server.

This obfuscation mechanism cannot be used to guarantee the security of communication content, but it may help mitigate some forms of blocking.

> Currently, in test environments, no port blocking phenomena have been observed after enabling this setting compared to the original unobfuscated version.

### HeaderObject

```json
{
  "type": "none",
  "domain": "example.com"
}
```

> `type`: string

Camouflage type. Optional values are:

- `"none"`: Default value. No camouflage is performed; sent data is a packet without characteristics.
- `"srtp"`: Disguised as SRTP packets, recognized as video call data (e.g., FaceTime).
- `"utp"`: Disguised as uTP packets, recognized as BT download data.
- `"wechat-video"`: Disguised as WeChat video call packets.
- `"dtls"`: Disguised as DTLS 1.2 packets.
- `"wireguard"`: Disguised as WireGuard packets. (Not the real WireGuard protocol).
- `"dns"`: Some campus networks allow DNS queries without logging in. Adding a DNS header to KCP allows traffic to be disguised as DNS requests, potentially bypassing login requirements on some campus networks.

> `domain`: string

Used with the camouflage type `"dns"`. You can fill in any domain name.

## Credits

- [@skywind3000](https://github.com/skywind3000) Invented and implemented the KCP protocol.
- [@xtaci](https://github.com/xtaci) Ported KCP from C implementation to Go.
- [@xiaokangwang](https://github.com/xiaokangwang) Tested the integration of KCP with Xray and submitted the initial PR.

## Improvements to the KCP Protocol

### Smaller Protocol Header

The native KCP protocol uses a fixed header of 24 bytes, while mKCP modifies this to 18 bytes for data packets and 16 bytes for acknowledgement (ACK) packets. Smaller headers help evade characteristic detection and increase transmission speed.

Additionally, native KCP's single ACK packet can only acknowledge the receipt of one data packet. This means that when KCP needs to acknowledge the receipt of 100 data packets, it sends 24 _100 = 2400 bytes of data. This includes a large amount of repetitive header data, causing bandwidth waste. mKCP compresses multiple ACK packets; 100 ACK packets require only 16 + 2 + 100_ 4 = 418 bytes, which is equivalent to one-sixth of the native size.

### ACK Packet Retransmission

The native KCP protocol sends acknowledgement (ACK) packets only once. If an ACK packet is lost, it inevitably leads to data retransmission, causing unnecessary bandwidth waste. mKCP retransmits ACK packets at a certain frequency until the sender confirms receipt. The size of a single ACK packet is 22 bytes, which is much smaller than the cost of retransmitting a data packet of over 1000 bytes.

### Connection State Control

mKCP can effectively open and close connections. When the remote host actively closes the connection, the connection is released within two seconds; when the remote host disconnects, the connection is released within a maximum of 30 seconds.

Native KCP does not support this scenario.
