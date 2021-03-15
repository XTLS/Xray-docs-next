---
date: "2020-12-23T00:00:00.000Z"
description: Project X 的文档.
title: VLESS
weight: 6
---

::: danger
目前 VLESS 没有自带加密，请用于可靠信道，如 TLS。</br>
目前 VLESS 不支持分享。</br>


VLESS 是一个无状态的轻量传输协议，它分为入站和出站两部分，可以作为 Xray 客户端和服务器之间的桥梁。

与 [VMess](../vmess) 不同，VLESS 不依赖于系统时间，认证方式同样为 UUID，但不需要 alterId。

## OutboundConfigurationObject

---

```json
{
  "vnext": [
    {
      "address": "example.com",
      "port": 443,
      "users": [
        {
          "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
          "encryption": "none",
          "flow": "xtls-rprx-direct",
          "level": 0
        }
      ]
    }
  ]
}
```

> `vnext`: \[ [ServerObject](#serverobject) \]

一个数组, 表示 VLESS 服务器列表，包含一组指向服务端的配置, 其中每一项是一个服务器配置。



### ServerObject

---

```json
{
  "address": "example.com",
  "port": 443,
  "users": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "encryption": "none",
      "flow": "xtls-rprx-direct",
      "level": 0
    }
  ]
}
```

> `address`: address

服务端地址，指向服务端，支持域名、IPv4、IPv6。

> `port`: number

服务端端口，通常与服务端监听的端口相同。

> `users`: \[ [UserObject](#userobject) \]

数组, 一组服务端认可的用户列表, 其中每一项是一个用户配置



### UserObject

---

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "encryption": "none",
  "flow": "xtls-rprx-direct",
  "level": 0
}
```

> `id`: string

VLESS 的用户 ID，可以是任意小于30字节的字符串, 也可以是一个合法的UUID. </br>
自定义字符串和其映射的 UUID 是等价的, 这意味着你将可以这样在配置文件中写id来标识同一用户,即
  - 写    "id": "我爱🍉老师1314",
  - 或写    "id": "5783a3e7-e373-51cd-8642-c83782b807c5" (此UUID是 `我爱🍉老师1314` 的 UUID 映射)  
 
其映射标准在[VLESS UUID 映射标准：将自定义字符串映射为一个 UUIDv5](https://github.com/XTLS/Xray-core/issues/158)

你可以使用命令 `xray uuid -map "自定义字符串"` 生成自定义字符串所映射的的 UUID.</br> 
也可以使用命令 `xray uuid` 生成随机的UUID. 

> `encryption`: "none"

需要填 `"none"`，不能留空。

该要求是为了提醒使用者没有加密，也为了以后出加密方式时，防止使用者填错属性名或填错位置导致裸奔。</br>
若未正确设置 encryption 的值，使用 Xray 或 -test 时会收到错误信息。

> `flow`: string

流控模式，用于选择 XTLS 的算法。

目前出站协议中有以下流控模式可选：

- `xtls-rprx-origin`：最初的流控模式。该模式纪念价值大于实际使用价值
- `xtls-rprx-origin-udp443`：同 `xtls-rprx-origin`, 但放行了目标为 443 端口的 UDP 流量
- `xtls-rprx-direct`：所有平台皆可使用的典型流控模式
- `xtls-rprx-direct-udp443`：同 `xtls-rprx-direct`, 但是放行了目标为 443 端口的 UDP 流量
- `xtls-rprx-splice`：Linux 平台下最建议使用的流控模式
- `xtls-rprx-splice-udp443`：同 `xtls-rprx-splice`, 但是放行了目标为 443 端口的 UDP 流量

::: warning
**注意**

当 `flow` 被指定时，还需要将该出站协议的 `streamSettings.security` 一项指定为 `xtls`，`tlsSettings` 改为 `xtlsSettings`。详情请参考 [streamSettings](../../base/transport#streamsettingsobject)。

此外，目前 XTLS 仅支持 TCP、mKCP、DomainSocket 这三种传输方式。


{{% notice %}}
**关于 `xtls-rprx-*-udp443` 流控模式**

启用了 Xray-core 的 XTLS 时，通往 UDP 443 端口的流量默认会被拦截（一般情况下为 QUIC），这样应用就不会使用 QUIC 而会使用 TLS，XTLS 才会真正生效。实际上，QUIC 本身也不适合被代理，因为 QUIC 自带了 TCP 的功能，它作为 UDP 流量在通过 VLESS 协议传输时，底层协议为 TCP，就相当于两层 TCP 了。

若不需要拦截，请在客户端填写 `xtls-rprx-*-udp443`，服务端不变。


::: danger
Splice 是 Linux Kernel 提供的函数，系统内核直接转发 TCP，不再经过 Xray 的内存，大大减少了数据拷贝、CPU 上下文切换的次数。

Splice 模式的的使用限制：

- Linux 环境
- 入站协议为 `Dokodemo door`、`Socks`、`HTTP` 等纯净的 TCP 连接, 或其它使用了 XTLS 的入站协议
- 出站协议为 VLESS + XTLS 或 Trojan + XTLS

此外，使用 Splice 时网速显示会滞后，这是特性，不是 bug。

需要注意的是，使用 mKCP 协议时不会使用 Splice（是的，虽然没有报错，但实际上根本没用到）。


> `level`: number

用户等级，连接会使用这个用户等级对应的[本地策略](../../base/policy#levelpolicyobject)。

level 的值, 对应 [policy](../../base/policy#policyobject) 中 level 的值. 如不指定, 默认为 0.


