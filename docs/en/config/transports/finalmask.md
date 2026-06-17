# FinalMask

FinalMask performs the last stage of traffic camouflage after the core has already processed transport-layer encryption, including TLS and REALITY.

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
        // [!code focus:33]
        "finalmask": {
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
            "bbrProfile": "standard",
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

## TCPMask

An array used to camouflage TCP traffic emitted by the core. The first item in the array is the innermost camouflage layer.

```json
{
  "finalmask": {
    // [!code focus:6]
    "tcp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: string

The type of this camouflage layer.

> `settings`: object

The concrete settings for this camouflage type.

See the fields for each type below.

### header-custom

```json
{
  "type": "header-custom",
  // [!code focus:35]
  "settings": {
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
  "type": "fragment",
  // [!code focus:6]
  "settings": {
    "packets": "tlshello",
    "length": "100-200",
    "delay": "10-20",
    "maxSplit": "3-6"
  }
}
```

Controls outgoing TCP fragmentation. In some cases it can deceive censorship systems, for example by bypassing SNI blacklists.

`"length"`, `"delay"`, and `"maxSplit"` are all [Int32Range](../../development/intro/guide.md#int32range) values.

`"packets"`: supports two fragmentation modes. `"1-3"` slices the TCP stream and applies to the client's 1st through 3rd write operations. `"tlshello"` fragments the TLS handshake packet.

`"length"`: fragment size in bytes. It must not be `0`.

`"delay"`: delay between fragments in milliseconds.

When it is `0` and `"packets": "tlshello"` is set, the fragmented Client Hello will be sent in a single TCP packet, as long as its original size does not exceed the MSS or MTU and the system does not fragment it automatically.

`"maxSplit"`: maximum number of splits. This limits how many pieces a single packet can be broken into. `0` means unlimited.

### sudoku

```json
{
  "type": "sudoku",
  // [!code focus:10]
  "settings": {
    "password": "",
    "ascii": "",

    "customTable": "", // field name is custom_table in the upstream documentation
    "customTables": [""], // field name is custom_tables in the upstream documentation

    "paddingMin": 0, // field name is padding_min in the upstream documentation
    "paddingMax": 0 // field name is padding_max in the upstream documentation
  }
}
```

For the meaning of these fields, see the [upstream documentation](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.md).

## UDPMask

An array used to camouflage UDP traffic emitted by the core. The first item in the array is the innermost camouflage layer.

```json
{
  "finalmask": {
    // [!code focus:6]
    "udp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: string

The type of this camouflage layer.

> `settings`: object

The concrete settings for this camouflage type.

See the fields for each type below.

### header-custom

Always merged into the packet header.

```json
{
  "type": "header-custom",
  // [!code focus:18]
  "settings": {
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
}
```

`client[n].rand`: adds a specified number of random bytes. Conflicts with `packet`.

`client[n].randRange`: range of random-byte values. The default is `0-255`.

`client[n].type`: the type of `packet`. Supported values are `array`, `str`, `hex`, and `base64`. The default is `array`.

`client[n].packet`: adds fixed data. Conflicts with `rand`.

### mkcp-legacy

```json
{
  "type": "mkcp-legacy",
  // [!code focus:4]
  "settings": {
    "header": "", // dns dtls srtp utp wechat wireguard
    "value": "" // password domain
  }
}
```

Legacy mKCP packet-header camouflage/obfuscation. The meaning of `value` depends on `header`. Note that the forgery is only a simple packet-header forgery and does not mean the full protocol is implemented.

> When empty: applies AES-128-GCM encryption with `value` as the password. If `value` is empty, it falls back to the default simple XOR obfuscation.

> `dns`: forged as a DNS query. `value` is the specified domain; defaults to `www.baidu.com` when empty.

> `dtls`: forged as DTLS 1.2 application data. `value` has no effect.

> `srtp`: forged as SRTP. `value` has no effect.

> `utp`: forged as uTP (BitTorrent). `value` has no effect.

> `wechat`: forged as a WeChat video call. `value` has no effect.

> `wireguard`: forged as WireGuard. `value` has no effect.

### noise

Noise sent before the actual data.

```json
{
  "type": "noise",
  // [!code focus:12]
  "settings": {
    "reset": "30-60",
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
}
```

`reset`: an [Int32Range](../../development/intro/guide.md#int32range) value in seconds. After noise is sent, it resets after this duration so noise can be sent again to the same address. `0` means no reset, so it is sent only once.

`rand`: adds random bytes, or random bytes of a specified length. Conflicts with `packet`.

`randRange`: range of random-byte values. The default is `0-255`.

`type`: the type of `packet`. Supported values are `array`, `str`, `hex`, and `base64`. The default is `array`.

`packet`: adds fixed data. Conflicts with `rand`.

`delay`: delay in milliseconds. After one noise item is sent, wait for the specified time before sending the next one.

### salamander

Salamander obfuscation. From Hysteria2.

```json
{
  "type": "salamander",
  // [!code focus:4]
  "settings": {
    "password": "your-password",
    "packetSize": "512-1200"
  }
}
```

`password`: the obfuscation password.

#### gecko

`packetSize`: [Int32Range](../../development/intro/guide.md#int32range)

When non-empty, enables Gecko obfuscation, which applies additional fragmentation-and-padding obfuscation to QUIC long-header packets (short-header packets use Salamander directly). `packetSize` specifies the fragment size, and its upper bound must not exceed 2048.

### sudoku

```json
{
  "type": "sudoku",
  // [!code focus:10]
  "settings": {
    "password": "",
    "ascii": "",

    "customTable": "",
    "customTables": [""],

    "paddingMin": 0,
    "paddingMax": 0
  }
}
```

Same as the TCP version.

### xdns

Uses DNS queries to transmit data, similar to DNSTT. It performs standard DNS queries to carry payloads and supports TXT, A, and AAAA query types.

Because of technical limitations, the effective MTU is very small, QUIC cannot be used, and pairing it with mKCP is recommended. Recommended MTU values are 130 on the client side; on the server side, use 900 for TXT, which carries almost raw byte data, reduce appropriately to below 1/2 for AAAA, and below 1/8 for A. The theoretical encoding efficiency differs, while actual results depend on how many AAAA or A records intermediate forwarders tolerate in responses.

Since the queries are standard, they can be forwarded through any UDP DNS server, although the efficiency may be quite poor.

To use this feature, the server needs to listen on port 53, then the proxy protocol should point to a DNS server such as `8.8.8.8:53`, and you must own one of the domains in `domains`, then point its NS record to the server.

For example, if you own `example.com`, set an A record like `a.example.com` to the server IP, set an NS record like `t.example.com` to `a.example.com`, and then use `t.example.com`. The host used for the A record must not be a subdomain of the host used for the NS record.

```json
{
  "type": "xdns",
  // [!code focus:4]
  "settings": {
    "domains": ["t.example.com"],
    "resolvers": ["t.example.com+udp://8.8.8.8:53"]
  }
}
```

`domains`: used on the server side. A list of domains. It supports specifying a query type as `domain:method`, where `method` can be `txt`, `a`, or `aaaa`. If omitted, the query type is unrestricted.

`resolvers`: used on the client side. A list of DNS resolvers. The format is `domain[:method]+udp://server:port`, where `method` can be `txt` (default), `a`, or `aaaa`.

At least one of `domains` and `resolvers` must be set.

### xicmp

```json
{
  "type": "xicmp",
  // [!code focus:4]
  "settings": {
    "dgram": false, // optional
    "ips": [] // optional
  }
}
```

`dgram`: Lower permissions, client-side only (Linux, Mac, iOS)

`ips`: ips

### realm

Self-built https://github.com/apernet/hysteria-realm-server

```json
{
  "type": "realm",
  // [!code focus:8]
  "settings": {
    "url": "realm://public@xxx/your-realm-name",
    "stunServers": [
      "stun.nextcloud.com:3478",
      "global.stun.twilio.com:3478"
    ],
    "tlsConfig": {} // optional
  }
}
```

`url`: realm[+http]\://token@host[:port]/id

`stunServers`: Multiple IPv4/IPv6 addresses are used for NAT port prediction

`tlsConfig`: Same as tlsSettings

Connection failures require debug-level logging. Possible contributing factors include the STUN provider, the Realm provider, and punch packets affecting the QUIC handshake (extremely low probability)

## quicParams

```json
{
  "finalmask": {
    // [!code focus:19]
    "quicParams": {
      "congestion": "force-brutal",
      "bbrProfile": "standard",
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
```

Used for QUIC parameter tuning in XHTTP H3 and Hysteria.

> `congestion`: reno | bbr | brutal | force-brutal

Congestion-control algorithm. Hysteria defaults to `brutal`, while XHTTP H3 defaults to `bbr`.

`reno` and `bbr` are well-known algorithms.

`brutal`: negotiates a fixed packet-sending rate with the peer, or falls back to BBR.

`force-brutal`: same as `brutal`, but it forces upstream traffic to use the fixed packet-sending rate from `brutalUp`, ignoring peer negotiation.

Note that XHTTP H3 cannot use `brutal` because it has no negotiation mechanism, but it does support `force-brutal`, which does not require negotiation.

> `bbrProfile`: conservative | standard | aggressive

When QUIC congestion control is set to BBR, this controls the BBR preset. The default is `standard`. `conservative` is slightly more cautious, while `aggressive` is slightly more aggressive.

> `debug`: false | true

Enables logs for `bbr` and `brutal` congestion control.

> `brutalUp`: string

> `brutalDown`: string

Upload and download rate limits. The default value is `0`.

The format is user-friendly and supports many common bits-per-second notations, including `1000000`, `100kb`, `20 mb`, `100 mbps`, `1g`, and `1 tbps`. It is case-insensitive, spaces between units are optional, and if no unit is specified, the default is `bps`. The value must not be lower than 65535 bps.

The negotiation behavior is the same as Hysteria Brutal:

The server-side value limits the highest Brutal-mode rate the client may choose. A value of `0` means the server does not limit the client.

If the client-side value is `0`, BBR mode is used. If it is non-zero, Brutal mode is used and is still constrained by the server-side limit.

Remember that direction is relative: the server's upload is the client's download, and the server's download is the client's upload.

> `udpHop`: {"ports": string, "interval": number}

UDP port-hopping configuration.

`ports` is the hopping port range. It can be a numeric string such as `"1234"`, or a numeric range such as `"1145-1919"` for ports 1145 through 1919. Commas can be used to separate segments, for example `11,13,15-17`.

`interval` is the port-hopping interval in seconds. It must be at least 5, and the default is 30 seconds.

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

These four are the concrete QUIC window parameters. **Do not change them unless you fully understand what you are doing.** If you do need to change them, it is recommended to keep the ratio between the stream receive window and the connection receive window at 2:5.

> `maxIdleTimeout`: number

Maximum idle timeout in seconds. This is how long the server waits without receiving any client data before closing the connection. The supported range is 4 to 120 seconds. The default is 30 seconds.

> `keepAlivePeriod`: number

QUIC KeepAlive interval in seconds. The supported range is 2 to 60 seconds. Disabled by default.

> `disablePathMTUDiscovery`: bool

Whether to disable Path MTU Discovery.

Other implementations forcibly disable this on operating systems other than Linux, Windows, and Darwin, while Xray does not force-disable it. If your OS is not one of `linux`, `windows`, or `darwin`, you may need to disable it manually.

> `maxIncomingStreams`: number

Server-side parameter. If set, it must not be smaller than `8`.
