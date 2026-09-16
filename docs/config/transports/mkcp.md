# mKCP

mKCP 使用 UDP 来模拟 TCP 连接。

mKCP 牺牲带宽来降低延迟。传输同样的内容，mKCP 一般比 TCP 消耗更多的流量。

::: tip
请确定主机上的防火墙配置正确
:::

## KcpObject

`KcpObject` 对应 [`StreamSettingsObject`](../transport.md#streamsettingsobject) 中的 `kcpSettings` 项。

```json
{
  // outbound 示例，同样可用于 inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "method": "mkcp",
        // [!field focus]
        "kcpSettings": {
          "mtu": 1350,
          "tti": 20,
          "uplinkCapacity": 5,
          "downlinkCapacity": 20,
          "cwndMultiplier": 1,
          "maxSendingWindow": 2097152
        }
      }
    }
  ]
}
```

::: tip
`header` 和 `seed` 字段已被移除，请使用 [FinalMask](../transports/finalmask.md#finalmaskobject) 进行配置。

并且曾经默认的 mKCP 混淆也被移除，要连接旧版服务端，需要在 FinalMask 中配置 `mkcp-legacy`（`settings.header` 与 `settings.value` 均留空即为旧版默认的 XOR 混淆）。
:::

> `mtu`: number

最大传输单元（maximum transmission unit）
请选择一个介于 576 - 1460 之间的值。

默认值为 `1350`。

> `tti`: number

传输时间间隔（transmission time interval），单位毫秒（ms），mKCP 将以这个时间频率发送数据。
请选译一个介于 10 - 100 之间的值。

默认值为 `50`。

> `uplinkCapacity`: number

上行链路容量，即主机发出数据所用的最大带宽，单位 MB/s，注意是 Byte 而非 bit。
可以设置为 0，表示一个非常小的带宽。

默认值 `5`。

> `downlinkCapacity`: number

下行链路容量，即主机接收数据所用的最大带宽，单位 MB/s，注意是 Byte 而非 bit。
可以设置为 0，表示一个非常小的带宽。

默认值 `20`。

::: tip
`uplinkCapacity` 和 `downlinkCapacity` 决定了 mKCP 的传输速度。
以客户端发送数据为例，客户端的 `uplinkCapacity` 指定了发送数据的速度，而服务器端的 `downlinkCapacity` 指定了接收数据的速度。两者的值以较小的一个为准。

推荐把 `downlinkCapacity` 设置为一个较大的值，比如 100，而 `uplinkCapacity` 设为实际的网络速度。当速度不够时，可以逐渐增加 `uplinkCapacity` 的值，直到带宽的两倍左右。
:::

> `cwndMultiplier`: number

拥塞窗口倍数，用于乘在由 `uplinkCapacity`、`mtu`、`tti` 推导出的发送在途包数上。最小值为 `1`。

默认值为 `1`。

> `maxSendingWindow`: number

最大发送窗口，单位是字节。实际按 `maxSendingWindow / mtu` 折算为在途包数，因此不得小于 `mtu`。

默认值为 `2097152`。

## 鸣谢

- [@skywind3000](https://github.com/skywind3000) 发明并实现了 KCP 协议。
- [@xtaci](https://github.com/xtaci) 将 KCP 由 C 语言实现翻译成 Go。
- [@xiaokangwang](https://github.com/xiaokangwang) 测试 KCP 与 Xray 的整合并提交了最初的 PR。

## 对 KCP 协议的改进

### 更小的协议头

原生 KCP 协议使用了 24 字节的固定头部，而 mKCP 修改为数据包 18 字节，确认（ACK）包 16 字节。更小的头部有助于躲避特征检查，并加快传输速度。

另外，原生 KCP 的单个确认包只能确认一个数据包已收到，也就是说当 KCP 需要确认 100 个数据已收到时，它会发出 24 \* 100 = 2400 字节的数据。其中包含了大量重复的头部数据，造成带宽的浪费。mKCP 会对多个确认包进行压缩，100 个确认包只需要 16 + 2 + 100 \* 4 = 418 字节，相当于原生的六分之一。

### 确认包重传

原生 KCP 协议的确认（ACK）包只发送一次，如果确认包丢失，则一定会导致数据重传，造成不必要的带宽浪费。而 mKCP 会以一定的频率重发确认包，直到发送方确认为止。单个确认包的大小为 22 字节，相比起数据包的 1000 字节以上，重传确认包的代价要小得多。

### 连接状态控制

mKCP 可以有效地开启和关闭连接。当远程主机主动关闭连接时，连接会在两秒钟之内释放；当远程主机断线时，连接会在最多 30 秒内释放。

原生 KCP 不支持这个场景。
