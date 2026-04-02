# Hysteria

Hysteria2 的底层 QUIC 传输的 Xray 实现，通常搭配 hysteria[出站](../outbounds/hysteria.md) 和 hysteria[入站](../inbounds/hysteria.md) 使用，此时兼容其官方实现。

## HysteriaObject

`HysteriaObject` 对应传输配置的 `hysteriaSettings` 项。

```json
{
  "version": 2,
  "auth": "password",
  "udpIdleTimeout": 60,
  "masquerade": {
    "type": "",

    "dir": "",

    "url": "",
    "rewriteHost": false,
    "insecure": false,

    "content": "",
    "headers": {
      "key": "value"
    },
    "statusCode": 0
  }
}
```

> `version`: number

Hysteria 版本，必须为 2。

> `auth`: string

Hysteria 认证密码，服务端和客户端需要保持一致。

搭配 `hysteria inbound` 时将会被 `clients` 覆盖 (如果存在)

> `udpIdleTimeout`: number

单位秒，默认 60。

单条 `quic native udp` 连接空闲等待时间，过大应该不会严格遵守，可能会先被 policy 掐断。

> `masquerade`: [MasqObject](#MasqObject)

http3 页面伪装。

### MasqObject

```json
{
  "type": "",

  "dir": "",

  "url": "",
  "rewriteHost": false,
  "insecure": false,

  "content": "",
  "headers": {
    "key": "value"
  },
  "statusCode": 0
}
```

> `type`: "file" | "proxy" | "string"

不填为默认的 404 页面。

> `dir`: string

type 为 file 时的配置项。

> `url`: string

type 为 proxy 时的配置项。

> `rewriteHost`: false | true

type 为 proxy 时的配置项。

> `insecure`: false | true

type 为 proxy 时的配置项。

> `content`: string

type 为 string 时的配置项。

> `headers`: map{ string, string }

type 为 string 时的配置项。

> `statusCode`: int

type 为 string 时的配置项。
