# Hysteria

The Xray implementation of Hysteria2's underlying QUIC transport. It is usually used in conjunction with [hysteria2 outbound](../outbounds/hysteria.md).

## HysteriaObject

`HysteriaObject` corresponds to the `hysteriaSettings` item in the transport configuration.

```json
{
  "version": 2,
  "auth": "password",
  "up": "0",
  "down": "0",
  "udphop": {
    "port": "1145-1919",
    "interval": 30
  },
  "initStreamReceiveWindow": 8388608,
  "maxStreamReceiveWindow": 8388608,
  "initConnectionReceiveWindow": 20971520,
  "maxConnectionReceiveWindow": 20971520,
  "maxIdleTimeout": 30,
  "keepAlivePeriod": 0,
  "disablePathMTUDiscovery": false
}
```

> `version`: number

Hysteria version, must be 2.

> `auth`: string

Hysteria authentication password. Must be consistent between the server and the client.

> `up`: string

> `down`: string

Upload/Download rate limits. Default is 0.

The format is user-friendly and supports various common bit-per-second notations, including `1000000`, `100kb`, `20 mb`, `100 mbps`, `1g`, `1 tbps`, etc. It is case-insensitive, and spaces between the number and unit are optional. If no unit is specified, it defaults to bps (bits per second). It cannot be lower than 65535 bps.

The negotiation behavior is consistent with the original Hysteria:

The server's value limits the maximum Brutal mode rate that the client can choose. 0 means no limit on the client.

If the client sets this to 0, it uses BBR mode. If not 0, it uses Brutal mode, subject to the server's limit.

Note relativity: Server upload is client download, and server download is client upload.

> `udphop`: {"port": string, "interval": number}

UDP port hopping configuration.

`port` is the port range for hopping. It can be a numeric string, such as `"1234"`; or a numeric range, such as `"1145-1919"` (indicating ports 1145 to 1919, totaling 775 ports). Commas can be used for segmentation, such as `11,13,15-17` (indicating port 11, port 13, and ports 15 to 17, totaling 5 ports).

`interval` is the port hopping interval in seconds. Minimum is 5, default is 30 seconds.

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

These four are specific QUIC window parameters. **Unless you fully understand what you are doing, it is not recommended to modify these values.** If you must modify them, it is recommended to keep the ratio of the stream receive window to the connection receive window at 2:5.

> `maxIdleTimeout`: number

Maximum idle timeout (seconds). The server will close the connection if no data is received from the client for this duration. Range: 4~120 seconds. Default: 30 seconds.

> `keepAlivePeriod`: number

QUIC KeepAlive interval (seconds). Range: 2~60 seconds. Disabled by default.

> `disablePathMTUDiscovery`: bool

Whether to disable Path MTU Discovery.
