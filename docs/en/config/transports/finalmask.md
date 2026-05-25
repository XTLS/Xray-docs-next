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

An array used to camouflage TCP traffic emitted by the core. The first item in the array is the outermost camouflage layer.

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

> `type`: header-custom | fragment | sudoku

The type of this camouflage layer.

> `settings`: header-custom | fragment | sudoku

The concrete settings for this camouflage type. See the fields for each type below.

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
  "password": "",
  "ascii": "",

  "customTable": "", // field name is custom_table in the upstream documentation
  "customTables": [""], // field name is custom_tables in the upstream documentation

  "paddingMin": 0, // field name is padding_min in the upstream documentation
  "paddingMax": 0 // field name is padding_max in the upstream documentation
}
```

For the meaning of these fields, see the [upstream documentation](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.md).

## UDPMask

An array used to camouflage UDP traffic emitted by the core. The first item in the array is the outermost camouflage layer.

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

> `type`: header-custom | header-dns | header-dtls | header-srtp | header-utp | header-wechat | header-wireguard | mkcp-original | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

The type of this camouflage layer.

> `settings`: header-custom | header-dns | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

The concrete settings for this camouflage type. See the fields for each type below.

### header-custom

Always merged into the packet header.

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

The old mKCP DNS camouflage. Some campus networks allow DNS queries before login, so this adds a DNS header to KCP.

```json
{
  "domain": "www.example.com"
}
```

### header-dtls

The old mKCP DTLS camouflage. It disguises packets as DTLS 1.2 traffic. No extra settings.

### header-srtp

The old mKCP SRTP camouflage. It disguises packets as SRTP traffic and may be recognized as video-call traffic such as FaceTime. No extra settings.

### header-utp

The old mKCP uTP camouflage. It disguises packets as uTP traffic and may be recognized as BitTorrent download traffic. No extra settings.

### header-wechat

The old mKCP WeChat Video camouflage. It disguises packets as WeChat video-call traffic. No extra settings.

### header-wireguard

The old mKCP WireGuard camouflage. It disguises packets as WireGuard traffic, though it is not the real WireGuard protocol. No extra settings.

### mkcp-original

The simple obfuscation that used to be the default in mKCP. You may need it to connect to older mKCP servers. No extra settings.

### mkcp-aes128gcm

Corresponds to the old mKCP `seed` feature. It uses AES-128-GCM for obfuscation.

```json
{
  "password": "your-password"
}
```

### noise

Noise sent before the actual data.

```json
{
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

Same as the TCP version.

### xdns

Uses DNS queries to transmit data, similar to DNSTT. It performs standard DNS queries to carry payloads and supports TXT, A, and AAAA query types.

Because of technical limitations, the effective MTU is very small, QUIC cannot be used, and pairing it with mKCP is recommended. Recommended MTU values are 130 on the client side; on the server side, use 900 for TXT, which carries almost raw byte data, reduce appropriately to below 1/2 for AAAA, and below 1/8 for A. The theoretical encoding efficiency differs, while actual results depend on how many AAAA or A records intermediate forwarders tolerate in responses.

Since the queries are standard, they can be forwarded through any UDP DNS server, although the efficiency may be quite poor.

To use this feature, the server needs to listen on port 53, then the proxy protocol should point to a DNS server such as `8.8.8.8:53`, and you must own one of the domains in `domains`, then point its NS record to the server.

For example, if you own `example.com`, set an A record like `a.example.com` to the server IP, set an NS record like `t.example.com` to `t.example.com`, and then use `t.example.com`. The host used for the A record must not be a subdomain of the host used for the NS record.

```json
{
  "domains": ["t.example.com"],
  "resolvers": ["t.example.com+udp://8.8.8.8:53"]
}
```

`domains`: used on the server side. A list of domains. It supports specifying a query type as `domain:method`, where `method` can be `txt`, `a`, or `aaaa`. If omitted, the query type is unrestricted.

`resolvers`: used on the client side. A list of DNS resolvers. The format is `domain[:method]+udp://server:port`, where `method` can be `txt` (default), `a`, or `aaaa`.

At least one of `domains` and `resolvers` must be set.

### xicmp

Requires at least `CAP_NET_RAW` permissions and must be the outermost layer, which means the first item in the array. It cannot be used together with `udpHop` or `dialerProxy`.

```json
{
  "listenIp": "0.0.0.0",
  "id": 0
}
```

`listenIp`: the IP address to listen on. The default is `"0.0.0.0"`.

Note that this differs from the usual TCP/UDP listening addresses `"0.0.0.0"` and `"::"`. Because ICMP over IPv4 and ICMPv6 over IPv6 are not interchangeable protocols, specifying `"0.0.0.0"` here means listening only for IPv4 ICMP, and the same applies in reverse.

`id`: if multiple clients share the same IP, it is recommended that the server keep this as `0`.

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
