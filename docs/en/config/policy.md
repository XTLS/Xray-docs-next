# Local Policy

Local policy can be used to set different policy settings for different user levels, such as connection timeout settings. Each connection handled by Xray corresponds to a user, and different policies are applied based on the user's level.

## PolicyObject

`PolicyObject` corresponds to the `policy` field in the configuration file.

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

A set of key-value pairs, where each key is a string representation of a number (as required by JSON), such as `"0"`, `"1"`, etc., with the number corresponding to the user level. Each value is a [LevelPolicyObject](#levelpolicyobject).

::: tip
Each inbound and outbound proxy can now set the user level, and Xray will apply different local policies based on the actual user level.
:::

> `system`: [SystemPolicyObject](#systempolicyobject)

Xray system-level policy.

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

The time limit for handshake during connection establishment. Unit: seconds. Default: `4`. When processing a new inbound connection, if the time used in the handshake phase exceeds this limit, the connection will be aborted.

> `connIdle`: number

The time limit for connection idle time. Unit: seconds. Default: `300`. When processing an inbound/outbound connection, if no data is transferred (including upstream and downstream data) within `connIdle` time, the connection will be aborted.

> `uplinkOnly`: number

The time limit after the downstream connection is closed. Unit: seconds. Default: `2`. When the server (such as a remote website) closes the downstream connection, the outbound proxy will abort the connection after waiting for `uplinkOnly` time.

> `downlinkOnly`: number

The time limit after the upstream connection is closed. Unit: seconds. Default: `5`. When the client (such as a browser) closes the upstream connection, the inbound proxy will abort the connection after waiting for `downlinkOnly` time.

::: tip
In the scenario of HTTP browsing, you can set `uplinkOnly` and `downlinkOnly` to `0` to improve the efficiency of connection closing.
:::

> `statsUserUplink`: true | false

When set to `true`, enables upstream traffic statistics for all users at the current level.

> `statsUserDownlink`: true | false

When set to `true`, enables downstream traffic statistics for all users at the current level.

> `statsUserOnline`: true | false

When set to `true`, enables counting online users for all users at the current level by email.

> `bufferSize`: number

The internal buffer size of each connection. Unit: kB. When set to `0`, the internal buffer is disabled.

Default values:

- On ARM, MIPS, and MIPSLE platforms, the default value is `0`.
- On ARM64, MIPS64, and MIPS64LE platforms, the default value is `4`.
- On other platforms, the default value is `512`.

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

When set to `true`, enables upstream traffic statistics for all inbound proxies.

> `statsInboundDownlink`: true | false

When set to `true`, enables downstream traffic statistics for all inbound proxies.

> `statsOutboundUplink`: true | false

When set to `true`, enables upstream traffic statistics for all outbound proxies.

> `statsOutboundDownlink`: true | false

When set to `true`, enables downstream traffic statistics for all outbound proxies.
