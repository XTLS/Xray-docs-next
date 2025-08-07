# VMess

[VMess](../../development/protocols/vmess.md) 是一个加密传输协议，通常作为 Xray 客户端和服务器之间的桥梁。

::: danger
VMess 依赖于系统时间，请确保使用 Xray 的系统 UTC 时间误差在 120 秒之内，时区无关。在 Linux 系统中可以安装`ntp`服务来自动同步系统时间。
:::

## OutboundConfigurationObject

```json
{
  "vnext": [
    {
      "address": "127.0.0.1",
      "port": 37192,
      "users": [
        {
          "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
          "security": "auto",
          "level": 0,
          "experiments": ""
        }
      ]
    }
  ]
}
```

> `vnext`：\[ [ServerObject](#serverobject) \]

一个数组，包含一组的服务端配置.

其中每一项是一个服务端配置[ServerObject](#serverobject)。

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 37192,
  "users": []
}
```

> `address`: address

服务端地址，支持 IP 地址或者域名。

> `port`: number

服务端监听的端口号, 必填。

> `users`: \[ [UserObject](#userobject) \]

一个数组，代表一组服务端认可的用户.

其中每一项是一个用户[UserObject](#userobject)。

#### UserObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "security": "auto",
  "level": 0,
  "experiments": ""
}
```

> `id`：string

Vmess 的用户 ID，可以是任意小于 30 字节的字符串, 也可以是一个合法的 UUID.

自定义字符串和其映射的 UUID 是等价的, 这意味着你将可以这样在配置文件中写 id 来标识同一用户,即

- 写 `"id": "我爱🍉老师1314"`,
- 或写 `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (此 UUID 是 `我爱🍉老师1314` 的 UUID 映射)

其映射标准在 [VLESS UUID 映射标准：将自定义字符串映射为一个 UUIDv5](https://github.com/XTLS/Xray-core/issues/158)

你可以使用命令 `xray uuid -i "自定义字符串"` 生成自定义字符串所映射的的 UUID, 也可以使用命令 `xray uuid` 生成随机的 UUID。

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `security`: "aes-128-gcm" | "chacha20-poly1305" | "auto" | "none" | "zero"

加密方式，客户端将使用配置的加密方式发送数据，服务器端自动识别，无需配置。

- `"aes-128-gcm"`：使用 AES-128-GCM 算法
- `"chacha20-poly1305"`：使用 Chacha20-Poly1305 算法
- `"auto"`：默认值，自动选择（运行框架为 AMD64、ARM64 或 s390x 时为 aes-128-gcm 加密方式，其他情况则为 Chacha20-Poly1305 加密方式）
- `"none"`：不加密，保持vmess消息结构
- `"zero"`：不加密，数据流直接拷贝(类似vless)

不推荐在未开启 TLS 加密并强制校验证书的情况下使用 `"none"` `"zero"` 伪加密方式。无论使用哪种加密方式， VMess 的包头都会受到加密和认证的保护。

注意，auto 只是判断客户端的 AES 硬件加速支持状态，如果服务端没有 AES 硬件加速支持，仍然需要手动设置到 chacha20-poly1305, 这非常重要，因为 Chacha20-Poly1305 在支持 AES 加速的平台上比 AES-128-GCM 耗时多了约 48% 但是在不支持 AES 加速的平台上, AES-128-GCM 的耗时将比 Chacha20-Poly1305 高出 2000% 以上。

> `experiments`: string

启用的 VMess 协议实验性功能。（此处的功能为不稳定功能， 可能随时被移除）多个启用的实验之间可以用 | 字符分割，如 "AuthenticatedLength|NoTerminationSignal" 。

"AuthenticatedLength" 启用认证的数据包长度实验。此实验需要同时在客户端与服务器端同时开启，并运行相同版本的程序。

"NoTerminationSignal" 启用不发送断开连接标致实验。此实验可能会影响被代理的连接的稳定性。
