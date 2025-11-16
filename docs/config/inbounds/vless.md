# VLESS（XTLS Vision Seed）

VLESS 是一个无状态的轻量传输协议，它分为入站和出站两部分，可以作为 Xray 客户端和服务器之间的桥梁。

与 [VMess](./vmess.md) 不同，VLESS 不依赖于系统时间，认证方式同样为 UUID。

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com",
      "flow": "xtls-rprx-vision",
      "reverse": {}
    }
  ],
  "decryption": "none",
  "fallbacks": [
    {
      "dest": 80
    }
  ]
}
```

> `clients`: \[ [ClientObject](#clientobject) \]

一个数组，代表一组服务端认可的用户.

其中每一项是一个用户 [ClientObject](#clientobject)。

> `decryption`: "none"

[VLESS 加密](https://github.com/XTLS/Xray-core/pull/5067)设置。不能留空，禁用需显式设置为 `"none"`.

推荐大多数用户使用 ./xray vlessenc 自动生成该字段确保编写不会出错。下方详细配置仅推荐高级用户阅读。

其格式为一串字段由 `.` 连接的详细配置。 如 `mlkem768x25519plus.native.0rtt.100-111-1111.75-0-111.50-0-3333.ptjHQxBQxTJ9MWr2cd5qWIflBSACHOevTauCQwa_71U`. 本文档将用点分开的单独部分称之为一个块

- 第1个块为握手方式，目前有且仅有 `mlkem768x25519plus`. 要求服务端与客户端一致
- 第2个块为加密方式，可选 `native`/`xorpub`/`random`, 分别对应: 原始格式数据包/原始格式+混淆公钥部分/全随机数（类似 VMESS/Shadows socks）。要求服务端与客户端一致
- 第3个块为会话恢复票据有效时间。格式为 `600s` 或 `100-500s`. 前者将在该时长和该时长的一半之间随机一个时间(如 `600s`=`300-600s`)，后者则手动指定随即范围

往后为 padding, 连接建立后服务端发送一些垃圾数据用以混淆长度特征，无需与客户端相同(出站的相同部分为客户端向服务端方向发送的 padding)，属于可变长部分，格式为 `padding.delay.padding`+`(.delay.padding)`\*n（可插入多个 padding, 要求两个 padding 块之间必须包含一个 delay 块） 比如可以写一个超长的 `padding.delay.padding.delay.padding.delay.padding.delay.padding.delay.padding`

-`padding` 格式为 `probability-min-max` 如 `100-111-1111` 含义为 100% 发送一个长度 111~1111 的padding. -`delay` 格式同样为 `probability-min-max` 如 `75-0-111` 含义为 75% 的概率等待 0~111 毫秒

第一个 padding 块存在特殊要求，要求概率为 100% 且最小长度大于 0. 若不存在任何 padding, 核心自动使用 `100-111-1111.75-0-111.50-0-3333` 作为 padding 设置。

最后一个块会被核心识别为认证客户端使用的参数，可用 `./xray x25519`（使用 PrivateKey 部分） 或 `./xray mlkem768`（使用 Seed 部分） 生成，要求与客户端对应。`mlkem768` 属于后量子算法，可以防止（未来）客户端参数泄露后被量子计算机破解出私钥并冒充服务端。该参数仅用于验证，握手过程无论如何都是后量子安全的，现有的加密数据无法被未来出现的量子计算机破解。

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

一个数组，包含一系列强大的回落分流配置（可选）。
fallbacks 的具体配置请点击 [FallbackObject](../features/fallback.md#fallbacks-配置)

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com",
  "flow": "xtls-rprx-vision",
  "reverse" {}
}
```

> `id`: string

VLESS 的用户 ID，可以是任意小于 30 字节的字符串, 也可以是一个合法的 UUID.
自定义字符串和其映射的 UUID 是等价的, 这意味着你将可以这样在配置文件中写 id 来标识同一用户,即

- 写 `"id": "我爱🍉老师1314"`,
- 或写 `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (此 UUID 是 `我爱🍉老师1314` 的 UUID 映射)

其映射标准在 [VLESS UUID 映射标准：将自定义字符串映射为一个 UUIDv5](https://github.com/XTLS/Xray-core/issues/158)

你可以使用命令 `xray uuid -i "自定义字符串"` 生成自定义字符串所映射的的 UUID。

> 也可以使用命令 `xray uuid` 生成随机的 UUID.

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `email`: string

用户邮箱，用于区分不同用户的流量（会体现在日志、统计中）。

> `flow`: string

流控模式，用于选择 XTLS 的算法。

目前入站协议中有以下流控模式可选：

- 无 `flow` 或者 空字符： 使用普通 TLS 代理
- `xtls-rprx-vision`：使用新 XTLS 模式 包含内层握手随机填充

XTLS 仅在以下搭配下可用

- TCP+TLS/Reality 此时将直接在底层对拷加密后的数据（若传输的是 TLS 1.3）。
- VLESS Encryption 无底层传输限制，若底层不支持直接对拷（见上）则仅穿透 Encryption.

> `reverse`: struct

VLESS 极简反向代理配置，和核心内部自带的的通用反向代理作用相同但是配置更简单。

存在此项代表来自该用户的连接可以被用作可以用于建立反向代理隧道。

当前写法

```json
"reverse": {
  "tag": "r-outbound"
}
```

`tag` 为该反向代理的出站代理 tag. 使用路由将流量路由到该出站将会透过反向代理转发到连入的客户端路由系统中(客户端配置详见 VLESS 出站).

当有多个不同的连接(可以来自不同的设备)接入时核心会对每个请求随机选择一条派发反向代理数据。
