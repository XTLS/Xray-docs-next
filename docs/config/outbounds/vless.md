# VLESS（XTLS Vision Seed）

VLESS 是一个无状态的轻量传输协议，它分为入站和出站两部分，可以作为 Xray 客户端和服务器之间的桥梁。

与 [VMess](./vmess.md) 不同，VLESS 不依赖于系统时间，认证方式同样为 UUID。

## OutboundConfigurationObject

```json
{
  "address": "example.com",
  "port": 443,
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "encryption": "none",
  "flow": "xtls-rprx-vision",
  "level": 0,
  "reverse": {}
}
```

> `address`: address

服务端地址，指向服务端，支持域名、IPv4、IPv6。

> `port`: number

服务端端口，通常与服务端监听的端口相同。

> `id`: string

VLESS 的用户 ID，可以是任意小于 30 字节的字符串, 也可以是一个合法的 UUID.
自定义字符串和其映射的 UUID 是等价的, 这意味着你将可以这样在配置文件中写 id 来标识同一用户,即

- 写 `"id": "我爱🍉老师1314"`,
- 或写 `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (此 UUID 是 `我爱🍉老师1314` 的 UUID 映射)

其映射标准在 [VLESS UUID 映射标准：将自定义字符串映射为一个 UUIDv5](https://github.com/XTLS/Xray-core/issues/158)

你可以使用命令 `xray uuid -i "自定义字符串"` 生成自定义字符串所映射的的 UUID，也可以使用命令 `xray uuid` 生成随机的 UUID。

> `encryption`: "none"

[VLESS 加密](https://github.com/XTLS/Xray-core/pull/5067)设置。不能留空，禁用需显式设置为 `"none"`.

推荐大多数用户使用 ./xray vlessenc 自动生成该字段确保编写不会出错。下方详细配置仅推荐高级用户阅读。

其格式为一串字段由 `.` 连接的详细配置。 如 `mlkem768x25519plus.native.0rtt.100-111-1111.75-0-111.50-0-3333.ptjHQxBQxTJ9MWr2cd5qWIflBSACHOevTauCQwa_71U`. 本文档将用点分开的单独部分称之为一个块

- 第1个块为握手方式，目前有且仅有 `mlkem768x25519plus`. 要求服务端与客户端一致
- 第2个块为加密方式，可选 `native`/`xorpub`/`random`, 分别对应: 原始格式数据包/原始格式+混淆公钥部分/全随机数（类似 VMESS/Shadows socks）。要求服务端与客户端一致
- 第3个块为是否会话恢复。选择 `0rtt` 将跟随服务端设置尝试使用先前生成的票据跳过握手快速连接（可被服务端手动禁用），选择 `1rtt` 将强制执行 1RTT 的握手过程。此处与服务端设置含义不同，详见 VLESS 入站 `decryption` 设置。

往后为 padding, 连接建立后客户端发送一些垃圾数据用以混淆长度特征，无需与服务端相同（入站的相同部分为服务端向客户端方向发送的 padding），属于可变长部分，格式为 `padding.delay.padding`+`(.delay.padding)`×n（可插入多个 padding, 要求两个 padding 块之间必须包含一个 delay 块） 比如可以写一个超长的 `padding.delay.padding.delay.padding.delay.padding.delay.padding.delay.padding`

- `padding` 格式为 `probability-min-max` 如 `100-111-1111` 含义为 100% 发送一个长度 111~1111 的padding.
- `delay` 格式同样为 `probability-min-max` 如 `75-0-111` 含义为 75% 的概率等待 0~111 毫秒

第一个 padding 块存在特殊要求，要求概率为 100% 且最小长度大于 0. 若不存在任何 padding, 核心自动使用 `100-111-1111.75-0-111.50-0-3333` 作为 padding 设置。

最后一个块会被核心识别为认证服务端使用的参数，可用 `./xray x25519`（使用 Password 部分） 或 `./xray mlkem768`（使用 Client 部分） 生成，要求与服务端对应。`mlkem768` 属于后量子算法，可以防止（未来）客户端参数泄露后被量子计算机破解出私钥并冒充服务端。该参数仅用于验证，握手过程无论如何都是后量子安全的，现有的加密数据无法被未来出现的量子计算机破解。

> `flow`: string

流控模式，用于选择 XTLS 的算法。

目前出站协议中有以下流控模式可选：

- 无 `flow` 或者 空字符： 使用普通 TLS 代理
- `xtls-rprx-vision`：使用 XTLS，包含内层握手随机填充。会拦截目标为 443 端口的 UDP 流量（QUIC），促使浏览器使用普通 HTTPS 以增加可以被 Splice 的流量。
- `xtls-rprx-vision-udp443`：同 `xtls-rprx-vision`, 但是不会拦截 UDP 443，用于有程序强制使用 QUIC，被拦截会导致其无法工作时。

XTLS 仅在以下搭配下可用

- TCP+TLS/Reality 此时若传输的是 TLS 1.3，核心将尝试在底层 Splice 加密后的数据，若成功将节省全部的核心 IO 开销。
- VLESS Encryption 无底层传输限制，若底层不为 TCP 则仅尝试穿透 Encryption，节省 Encryption 的开销，如果是 TCP 则仍将尝试进行 Splice.

::: tip 关于 Splice
Splice 是 Linux Kernel 提供的函数，系统内核直接转发 TCP，不再经过 Xray 的内存，大大减少了数据拷贝、CPU 上下文切换的次数。

使用 Vision 模式时，如果满足下面条件，会自动启用 Splice.

- Linux 环境
- 入站协议为 `Dokodemo door`、`Socks`、`HTTP` 等纯净的 TCP 连接, 或其它使用了 XTLS 的入站协议
- 出站协议为 VLESS + XTLS

使用 Splice 时网速显示会滞后，连接断开后才会计入统计，因为在内核接管连接期间核心无法知道它的流量情况。
:::

> `level`: number

用户等级，连接会使用这个用户等级对应的 [本地策略](../policy.md#levelpolicyobject)。

level 的值, 对应 [policy](../policy.md#policyobject) 中 `level` 的值。 如不指定, 默认为 0。

> `reverse`: struct

VLESS 极简反向代理配置，和核心内部自带的的通用反向代理作用相同但是配置更简单。

存在此项代表该出站可以被用作 VLESS 反向代理出站，其会自动向服务端建立连接注册反向代理隧道。

当前写法

```json
"reverse": {
  "tag": "r-inbound"
}
```

`tag` 为该反向代理的入站代理 tag. 当服务端派发反向代理请求时会从使用这个 tag 的入站进入路由系统，使用路由系统将其路由到你需要的出站。

使用的 UUID 需要是服务端同样配置了 reverse 的 UUID（详见 VLESS 入站）。
