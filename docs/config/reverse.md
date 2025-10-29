# 反向代理

反向代理可以把服务器端的流量向客户端转发，即逆向流量转发。

其底层协议为 Mux.cool, 不过方向是相反的，服务端向客户端发起请求。

反向代理的大致工作原理如下:

- 假设在主机 A 中有一个网页服务器，这台主机没有公网 IP，无法在公网上直接访问。另有一台主机 B，它可以由公网访问。现在我们需要把 B 作为入口，把流量从 B 转发到 A。
  - 在主机 B 中配置 Xray，接收外部请求，所以称为 `portal` （门户）。
  - 在主机 A 中配置 Xray，负责将B的转发和网页服务器桥接起来，称为`bridge`。

## portal 配置

公网端配置一个 VLESS 入站，与 UUID 同级配置 `"reverse": { "tag": "xxx" }`，此 tag 视为出站，把流量路由至此即可使用

**所以公网端一定要有一个默认出站比如 direct，不然会有某一个 reverse 成为默认出站、谁都能访问**

方便演示这里用 [VLESS Encryption](https://github.com/XTLS/Xray-core/pull/5067)，实际上你直接过墙的话会用 [REALITY](https://github.com/XTLS/Xray-core/pull/4915)，当然你也可以用 [tunnel](https://github.com/XTLS/Xray-core/pull/4968) 直接暴露内网端口到公网，也就是下面示例配置中直接访问公网的80端口即可访问到内网想要的地址。

```json-comments
{
	"inbounds": [
		{
			"listen": "0.0.0.0",
			"port": 443,
			"protocol": "vless",
			"settings": {
				"decryption": "mlkem768x25519plus.native.600s.aCF82eKiK6g0DIbv0_nsjbHC4RyKCc9NRjl-X9lyi0k",
				"clients": [
					{
						"id": "ac04551d-6ebf-4685-86e2-17c12491f7f4", // for establishing reverse connection
						"flow": "xtls-rprx-vision",
						"reverse": {
							"tag": "r-outbound"
						}
					},
					{
						"id": "e8758aff-d830-4d08-a59e-271df65b995a", // for user
						"flow": "xtls-rprx-vision",
						"email": "user@example.com"
					}
				]
			}
		},
		{
			"listen": "0.0.0.0",
			"port": 80,
			"protocol": "tunnel",
			"tag": "t-inbound"
		}
	],
	"routing": {
		"rules": [
			{
				"user": [
					"user@example.com"
				],
				"outboundTag": "r-outbound"
			},
			{
				"inboundTag": [
					"t-inbound"
				],
				"outboundTag": "r-outbound"
			}
		]
	},
	"outbounds": [
		{
			"protocol": "direct" // essential
		}
	]
}
```

以上配置中的reverse和routing部分已经是完整配置，无须更改即可正常反向代理。

## bridge 配置

**内网端默认出站 direct 否则回环**，另开一个 VLESS 出站配置 `"reverse": { "tag": "yyy" }` 就会自动连接公网端，无需配置路由

此 tag 视为入站，可以在内网端的路由等处作为入站 tag 使用，并且它与公网端 reverse 的 tag 没有任何关系，可以不同

这个 PR 顺便删除了 VLESS outbound 的 vnext 和 users 的 json 嵌套以简化配置，因为上一版 Xray 中已限制它们只能有一个成员

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
