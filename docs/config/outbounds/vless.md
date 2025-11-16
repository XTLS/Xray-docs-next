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
- `xtls-rprx-vision`：使用新 XTLS 模式 包含内层握手随机填充 支持 uTLS 模拟客户端指纹
- `xtls-rprx-vision-udp443`：同 `xtls-rprx-vision`, 但是不会拦截目标为 443 端口的 UDP 流量

XTLS 仅在以下搭配下可用

- TCP+TLS/Reality 此时将直接在底层对拷加密后的数据（若传输的是 TLS 1.3）。
- VLESS Encryption 无底层传输限制，若底层不支持直接对拷（见上）则仅穿透 Encryption.

<!-- prettier-ignore -->
::: tip 关于 xtls-rprx-*-udp443 流控模式

启用了 Xray-core 的 XTLS 时，通往 UDP 443 端口的流量默认会被拦截（一般情况下为 QUIC），这样应用就不会使用 QUIC 而会使用 TLS，XTLS 才会真正生效。实际上，QUIC 本身也不适合被代理，因为 QUIC 自带了 TCP 的功能，它作为 UDP 流量在通过 VLESS 协议传输时，底层协议为 TCP，就相当于两层阻塞控制了。

若不需要拦截，请在客户端填写 `xtls-rprx-*-udp443`，服务端不变。
:::

::: tip 关于 Splice 模式
Splice 是 Linux Kernel 提供的函数，系统内核直接转发 TCP，不再经过 Xray 的内存，大大减少了数据拷贝、CPU 上下文切换的次数。

Splice 模式的的使用限制：

- Linux 环境
- 入站协议为 `Dokodemo door`、`Socks`、`HTTP` 等纯净的 TCP 连接, 或其它使用了 XTLS 的入站协议
- 出站协议为 VLESS + XTLS

此外，使用 Splice 时网速显示会滞后，这是特性，不是 bug。

使用 Vision 模式 如果满足上述条件 会自动启用 Splice
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

**完整极简配置案例**

**内网端默认出站 direct 否则回环**，另开一个 VLESS 出站配置 `"reverse": { "tag": "yyy" }` 就会自动连接公网端，无需配置路由

此 tag 视为入站，可以在内网端的路由等处作为入站 tag 使用，并且它与公网端 reverse 的 tag 没有任何关系，可以不同

```json-comments
{
	"outbounds": [
		{
			"protocol": "direct" // essential
		},
		{
			"protocol": "vless",
			"settings": {
				"address": "server.com",
				"port": 443,
				"encryption": "mlkem768x25519plus.native.0rtt.2PcBa3Yz0zBdt4p8-PkJMzx9hIj2Ve-UmrnmZRPnpRk",
				"id": "ac04551d-6ebf-4685-86e2-17c12491f7f4",
				"flow": "xtls-rprx-vision",
				"reverse": {
					"tag": "r-inbound"
				}
			}
		}
	]
}
```

**内网端可以设 CDN 等多条冗余线路均为 `"reverse": { "tag": "yyy" }` 对应公网端多个相同的 `"reverse": { "tag": "xxx" }`**

### 安全注意事项

公网端可以给不同 id 设不同 reverse 穿透至不同的内网设备，**客户端应当用新的 id，不然拿到客户端配置就能劫持你的反向代理**

用于内网穿透的连接即使开了 XTLS Vision，也只是吃到了 padding，并没有裸奔，是否给用于使用的连接开 XTLS 裸奔自行分析

内网端 direct 出站可以设置 redirect 以限制访问范围，或者你把默认出站设为 block，只路由允许访问的范围至 direct

例如：你只想限制反向代理的目的地是内网设备 `127.0.0.1:8000` 这个地址，那就可以在内网端的直连出口添加以下配置

```json-comments
{
    "protocol": "direct" // essential
    "settings": {
        "redirect": "127.0.0.1:8000"
    }
}
```

**如果你在用别人提供的内网穿透服务或不信任 VPS，内网应开一个 VLESS Encryption 服务端承接流量，确保身份认证及数据安全**
