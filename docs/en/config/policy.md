# Local Policy

Local policy allows setting different user levels and corresponding policy settings, such as connection timeout settings. Every connection processed by Xray corresponds to a user, and different policies are applied according to the user's level.

## PolicyObject

`PolicyObject` corresponds to the `policy` item in the configuration file.

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

A set of key-value pairs, where each key is a number in string format (required by JSON), such as `"0"`, `"1"`, etc. The double quotes cannot be omitted. This number corresponds to the user level. Each value is a [LevelPolicyObject](#levelpolicyobject).

::: tip
Each inbound and outbound proxy can now set a user level. Xray will apply different local policies based on the actual user level.
:::

> `system`: [SystemPolicyObject](#systempolicyobject)

Xray system-level policies.

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

Handshake time limit when establishing a connection. Unit is seconds. Default value is `4`. When an inbound proxy processes a new connection, if the time used during the handshake phase exceeds this time, the connection is interrupted.

> `connIdle`: number

Connection idle time limit. Unit is seconds. Default value is `300`. When an inbound/outbound processes a connection, if no data is transferred (including uplink and downlink data) within the `connIdle` time, the connection is interrupted.

> `uplinkOnly`: number

Time limit after the downlink connection is closed. Unit is seconds. Default value is `2`. When the server (such as a remote website) closes the downlink connection, the outbound proxy will interrupt the connection after waiting for the `uplinkOnly` time.

> `downlinkOnly`: number

Time limit after the uplink connection is closed. Unit is seconds. Default value is `5`. When the client (such as a browser) closes the uplink connection, the inbound proxy will interrupt the connection after waiting for the `downlinkOnly` time.

::: tip
In HTTP browsing scenarios, `uplinkOnly` and `downlinkOnly` can be set to `0` to improve connection closing efficiency.
:::

> `statsUserUplink`: true | false

When set to `true`, enables uplink traffic statistics for all users of the current level.

> `statsUserDownlink`: true | false

When set to `true`, enables downlink traffic statistics for all users of the current level.

> `statsUserOnline`: true | false
> When set to `true`, enables online user count statistics for all users of the current level. (Online criteria: connection activity within 20 seconds).

> `bufferSize`: number

The internal buffer size for each request, in KB. Note that multiple requests may be carried on the same connection via multiplexing (e.g., when using mux.cool or gRPC). This means that even if they share an underlying connection, their buffer pools are independent.

When the internal buffer is larger than this value, the next write operation will only be performed after the internal buffer is sent out until it is less than or equal to this value.

Note that for a UDP request, if a write attempt is made while the buffer is full, the write operation will not be blocked but **discarded**. If set too low or to 0, it may cause unexpected bandwidth waste.

Default values:

- On ARM, MIPS, MIPSLE platforms, the default value is `0`.
- On ARM64, MIPS64, MIPS64LE platforms, the default value is `4`.
- On other platforms, the default value is `512`.

The default value can be set via the environment variable `XRAY_RAY_BUFFER_SIZE`. Note that the unit in the environment variable is MB (setting the environment variable to 1 is equivalent to setting the config to 1024).

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

When set to `true`, enables uplink traffic statistics for all inbound proxies.

> `statsInboundDownlink`: true | false

When set to `true`, enables downlink traffic statistics for all inbound proxies.

> `statsOutboundUplink`: true | false

When set to `true`, enables uplink traffic statistics for all outbound proxies.

> `statsOutboundDownlink`: true | false

When set to `true`, enables downlink traffic statistics for all outbound proxies.
