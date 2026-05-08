# FinalMask

FinalMask performs the last stage of traffic obfuscation after the core has already processed transport-layer security, including TLS and REALITY.

It can be used for multiple kinds of TCP and UDP camouflage, as well as QUIC-related parameter tuning.

## FinalMaskObject

`FinalMaskObject` corresponds to the `finalmask` item in [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // outbound example; also applies to inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "finalmask": {
          // [!code focus:30]
          "tcp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "udp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "quicParams": {
            "congestion": "force-brutal",
            "debug": false,
            "brutalUp": "60 mbps",
            "brutalDown": 0,
            "udpHop": {
              "ports": "20000-50000",
              "interval": "5-10"
            },
            "initStreamReceiveWindow": 8388608,
            "maxStreamReceiveWindow": 8388608,
            "initConnectionReceiveWindow": 20971520,
            "maxConnectionReceiveWindow": 20971520,
            "maxIdleTimeout": 30,
            "keepAlivePeriod": 0,
            "disablePathMTUDiscovery": false,
            "maxIncomingStreams": 1024
          }
        }
      }
    }
  ]
}
```

> `tcp[n].type`: header-custom | fragment | sudoku

The first item in the array is the outermost camouflage layer.

Used together with `raw`, `httpupgrade`, `websocket`, `grpc`, and `xhttp`.

`header-custom`:

`fragment`:

`sudoku`:

> `tcp[n].settings`: header-custom | fragment | sudoku

### header-custom

```json
{
  "clients": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ],
  "servers": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ],
  "errors": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ]
}
```

`clients[n][m].delay`: delay in milliseconds. When it is `0`, the data is sent together with the previous packet.

`clients[n][m].rand`: adds a specified number of random bytes. Conflicts with `packet`.

`clients[n][m].randRange`: range of random-byte values. The default is `0-255`.

`clients[n][m].type`: the type of `packet`. Supported values are `array`, `str`, `hex`, and `base64`. The default is `array`.

`clients[n][m].packet`: adds fixed data. Conflicts with `rand`.

### fragment

```json
{
  "packets": "tlshello",
  "length": "100-200",
  "delay": "10-20",
  "maxSplit": "3-6"
}
```

### sudoku

```json
{
  "password": "",
  "ascii": "",

  "customTable": "", // field name is custom_table in the upstream documentation
  "customTables": [""], // field name is custom_tables in the upstream documentation

  "paddingMin": 0, // field name is padding_min in the upstream documentation
  "paddingMax": 0 // field name is padding_max in the upstream documentation
}
```

For the meaning of these fields, see the [upstream documentation](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.md).

> `udp[n].type`: header-custom | header-dns | header-dtls | header-srtp | header-utp | header-wechat | header-wireguard | mkcp-original | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

The first item in the array is the outermost camouflage layer.

Used together with `raw` UDP, `kcp`, `hysteria`, and `xhttp` H3.

`header-custom`: always prepended to the packet as a combined header.

`header-dns`: the old mKCP DNS camouflage. Some campus networks permit DNS requests before login, so this adds a DNS header to KCP.

`header-dtls`: the old mKCP DTLS camouflage. It imitates DTLS 1.2 packets. No extra settings.

`header-srtp`: the old mKCP SRTP camouflage. It imitates SRTP packets and tends to look like video-call traffic such as FaceTime. No extra settings.

`header-utp`: the old mKCP uTP camouflage. It imitates uTP packets and tends to look like BitTorrent traffic. No extra settings.

`header-wechat`: the old mKCP WeChat Video camouflage. It imitates WeChat video-call packets. No extra settings.

`header-wireguard`: the old mKCP WireGuard camouflage. It imitates WireGuard packets, though it is not the real WireGuard protocol. No extra settings.

`mkcp-original`: the simple obfuscation that used to be the default in mKCP. You may need it to connect to older mKCP servers. No extra settings.

`mkcp-aes128gcm`: the old mKCP `seed` feature. It uses AES-128-GCM for obfuscation.

`noise`: noise sent before the actual payload.

`salamander`: Salamander obfuscation from Hysteria2.

`sudoku`:

`xdns`: transmits data through DNS queries in a way similar to DNSTT. It performs standard DNS TXT queries to carry payload.

Because of technical limitations, the effective MTU is very small and QUIC is not usable. It is recommended to pair it with mKCP. Recommended MTU values are 130 on the client and 900 on the server.

Since the queries are standard DNS requests, they can be forwarded by any UDP DNS server, although the efficiency may be very poor.

To use this feature, the server must listen on port 53, the proxy protocol must target a DNS server such as `8.8.8.8:53`, and you must own the `domain` used by xdns and point its NS record to the server.

For example, if you own `example.com`, create an A record like `a.example.com` pointing to your server IP, then create an NS record like `t.example.com` pointing to `t.example.com`, and use `t.example.com` as the domain. The A record must not be a subdomain of the NS record.

`xicmp`: requires at least `CAP_NET_RAW`, must be the outermost layer, which means the first array element, and cannot be used together with `udpHop` or `dialerProxy`.

> `udp[n].settings`: header-custom | header-dns | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

### header-custom

```json
{
  "client": [
    {
      "rand": 0,
      "randRange": "0-255",
      "type": "",
      "packet": []
    }
  ],
  "server": [
    {
      "rand": 0,
      "randRange": "0-255",
      "type": "",
      "packet": []
    }
  ]
}
```

`client[n].rand`: adds a specified number of random bytes. Conflicts with `packet`.

`client[n].randRange`: range of random-byte values. The default is `0-255`.

`client[n].type`: the type of `packet`. Supported values are `array`, `str`, `hex`, and `base64`. The default is `array`.

`client[n].packet`: adds fixed data. Conflicts with `rand`.

### header-dns

```json
{
  "domain": "www.example.com"
}
```

### mkcp-aes128gcm

```json
{
  "password": "your-password"
}
```

### noise

```json
{
  "reset": 0,
  "noise": [
    {
      "rand": "1-8192",
      "randRange": "0-255",
      "type": "",
      "packet": [],
      "delay": "10-20"
    }
  ]
}
```

`noise[n].rand`: adds random bytes, or a specified random length of bytes. Conflicts with `packet`.

`noise[n].randRange`: range of random-byte values. The default is `0-255`.

`noise[n].type`: the type of `packet`. Supported values are `array`, `str`, `hex`, and `base64`. The default is `array`.

`noise[n].packet`: adds fixed data. Conflicts with `rand`.

`noise[n].delay`: delay in milliseconds. After sending one noise item, Xray waits for the specified time before sending the next one.

### salamander

```json
{
  "password": "your-password"
}
```

### sudoku

```json
{
  "password": "",
  "ascii": "",

  "customTable": "",
  "customTables": [""],

  "paddingMin": 0,
  "paddingMax": 0
}
```

The same meanings as in the TCP version apply here.

### xdns

```json
{
  "domain": "www.example.com"
}
```

### xicmp

```json
{
  "listenIp": "0.0.0.0",
  "id": 0
}
```

`listenIp`: the IP address to listen on.

`id`: when multiple clients share the same IP, it is recommended that the server keep this value at `0`.

> `quicParams`: [quicParamsObject](#quicParams)

### quicParams

```json
{
  "congestion": "force-brutal",
  "debug": false,
  "brutalUp": "60 mbps",
  "brutalDown": 0,
  "udpHop": {
    "ports": "20000-50000",
    "interval": "5-10"
  },
  "initStreamReceiveWindow": 8388608,
  "maxStreamReceiveWindow": 8388608,
  "initConnectionReceiveWindow": 20971520,
  "maxConnectionReceiveWindow": 20971520,
  "maxIdleTimeout": 30,
  "keepAlivePeriod": 0,
  "disablePathMTUDiscovery": false,
  "maxIncomingStreams": 1024
}
```

Used for QUIC parameter tuning in XHTTP H3 and Hysteria.

> `congestion`: reno | bbr | brutal | force-brutal

Congestion-control algorithm. Hysteria defaults to `brutal`. XHTTP H3 defaults to `bbr`.

`reno` and `bbr` are well-known algorithms.

`brutal` negotiates a fixed packet-sending rate with the peer, or falls back to BBR. It is supported only by Hysteria, because XHTTP has no negotiation mechanism.

`force-brutal` is the same as `brutal`, but it forcibly uses the fixed upstream rate from `brutalUp` and ignores peer negotiation.

> `debug`: false | true

Enable logging for the `bbr` and `brutal` congestion-control implementations.

> `brutalUp`: string

> `brutalDown`: string

Upload and download rate limits. The default value is `0`.

The format is user-friendly and supports common bit-rate forms such as `1000000`, `100kb`, `20 mb`, `100 mbps`, `1g`, and `1 tbps`. It is case-insensitive, spaces are optional, and when no unit is given the default is `bps`. The value must not be lower than 65535 bps.

The negotiation behavior is the same as Hysteria Brutal:

The server-side value limits the highest Brutal-mode rate the client is allowed to choose. `0` means the client is not limited by the server.

When the client value is `0`, it uses BBR mode. When it is non-zero, it uses Brutal mode and is still constrained by the server-side limit.

Remember the directions are relative: the server's upload is the client's download, and the server's download is the client's upload.

> `udpHop`: {"ports": string, "interval": number}

UDP port-hopping configuration.

`ports` specifies the hopping range. It can be a single numeric string like `"1234"`, or a range like `"1145-1919"`, which means ports 1145 through 1919. Commas can be used to combine ranges, for example `11,13,15-17`.

`interval` is the port-hopping interval in seconds. The minimum is 5. The default is 30 seconds.

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

These four are low-level QUIC window parameters. **Do not change them unless you fully understand what you are doing.** If you do need to change them, it is recommended to keep the ratio between stream and connection receive windows at 2:5.

> `maxIdleTimeout`: number

Maximum idle timeout in seconds. This is how long the server waits without receiving any client data before closing the connection. The supported range is 4 to 120 seconds. The default is 30 seconds.

> `keepAlivePeriod`: number

QUIC KeepAlive interval in seconds. The supported range is 2 to 60 seconds. Disabled by default.

> `disablePathMTUDiscovery`: bool

Whether to disable path MTU discovery.

Other implementations forcibly disable this on systems other than Linux, Windows, and Darwin, while Xray does not enforce that. If your operating system is outside those three, you may need to disable it manually.

> `maxIncomingStreams`: number

Server-side only. If set, it must not be smaller than `8`.
