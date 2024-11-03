# 本地策略

本地策略，可以设置不同的用户等级和对应的策略设置，比如连接超时设置。Xray 处理的每一个连接都对应一个用户，按照用户的等级（level）应用不同的策略。

## PolicyObject

`PolicyObject` 对应配置文件的 `policy` 项。

```json
{
  "policy": {
    "levels": {
      "0": {
        "handshake": 4,
        "connIdle": 300,
        "uplinkOnly": 2,
        "downlinkOnly": 5,
        "statsUserUplink": false,
        "statsUserDownlink": false,
        "statsUserOnline": false,
        "bufferSize": 4
      }
    },
    "system": {
      "statsInboundUplink": false,
      "statsInboundDownlink": false,
      "statsOutboundUplink": false,
      "statsOutboundDownlink": false
    }
  }
}
```

> `level`: map{string: [LevelPolicyObject](#levelpolicyobject)}

一组键值对，每个键是一个字符串形式的数字（JSON 的要求），比如 `"0"`、`"1"` 等，双引号不能省略，此数字对应用户等级。每一个值是一个 [LevelPolicyObject](#levelpolicyobject).

::: tip
每个入站出站代理现在都可以设置用户等级，Xray 会根据实际的用户等级应用不同的本地策略。
:::

> `system`: [SystemPolicyObject](#systempolicyobject)

Xray 系统级别的策略

### LevelPolicyObject

```json
{
  "handshake": 4,
  "connIdle": 300,
  "uplinkOnly": 2,
  "downlinkOnly": 5,
  "statsUserUplink": false,
  "statsUserDownlink": false,
  "bufferSize": 10240
}
```

> `handshake`: number

连接建立时的握手时间限制。单位为秒。默认值为 `4`。在入站代理处理一个新连接时，在握手阶段如果使用的时间超过这个时间，则中断该连接。

> `connIdle`: number

连接空闲的时间限制。单位为秒。默认值为 `300`。inbound/outbound 处理一个连接时，如果在 `connIdle` 时间内，没有任何数据被传输（包括上行和下行数据），则中断该连接。

> `uplinkOnly`: number

当连接下行线路关闭后的时间限制。单位为秒。默认值为 `2`。当服务器（如远端网站）关闭下行连接时，出站代理会在等待 `uplinkOnly` 时间后中断连接。

> `downlinkOnly`: number

当连接上行线路关闭后的时间限制。单位为秒。默认值为 `5`。当客户端（如浏览器）关闭上行连接时，入站代理会在等待 `downlinkOnly` 时间后中断连接。

::: tip
在 HTTP 浏览的场景中，可以将 `uplinkOnly` 和 `downlinkOnly` 设为 `0`，以提高连接关闭的效率。
:::

> `statsUserUplink`: true | false

当值为 `true` 时，开启当前等级的所有用户的上行流量统计。

> `statsUserDownlink`: true | false

当值为 `true` 时，开启当前等级的所有用户的下行流量统计。

> `statsUserOnline`: true | false
当值为 `true` 时，开启当前等级的所有用户的在线数量统计。(在线标准：20秒内有过连接活动)

> `bufferSize`: number

每个连接的内部缓存大小。单位为 kB。当值为 `0` 时，内部缓存被禁用。

默认值:

- 在 ARM、MIPS、MIPSLE 平台上，默认值为 `0`。
- 在 ARM64、MIPS64、MIPS64LE 平台上，默认值为 `4`。
- 在其它平台上，默认值为 `512`。

### SystemPolicyObject

```json
{
  "statsInboundUplink": false,
  "statsInboundDownlink": false,
  "statsOutboundUplink": false,
  "statsOutboundDownlink": false
}
```

> `statsInboundUplink`: true | false

当值为 `true` 时，开启所有入站代理的上行流量统计。

> `statsInboundDownlink`: true | false

当值为 `true` 时，开启所有入站代理的下行流量统计。

> `statsOutboundUplink`: true | false

当值为 `true` 时，开启所有出站代理的上行流量统计。

> `statsOutboundDownlink`: true | false

当值为 `true` 时，开启所有出站代理的下行流量统计。
