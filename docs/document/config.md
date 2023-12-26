# 配置运行

[下载并安装](./install) 了 Xray 之后，您需要对它进行一下配置。

为了演示，这里只介绍简单的配置方式。更多的模板: [Xray-examples](https://github.com/XTLS/Xray-examples)

如需配置更复杂的功能，请参考更详细的 [配置文件](../config/) 中相关说明。

::: danger
为了避免你的流量被解密，<br>
你应该使用 `xray uuid` 或 `uuidgen` 生成一个独一无二的uuid <br>
在服务端上，放入 `inbounds[0].settings.clients[0].id` 内 <br>
在客户端内，放入 `outbounds[0].settings.vnext[0].users[0].id` 内 <br>
:::

## 服务端配置

你需要一台防火墙外的服务器，来运行服务器端的 Xray。配置如下：

```json
{
  "inbounds": [
    {
      "port": 10086, // 服务器监听端口
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811"  // 记得替换这个字段，使用 `xray uuid` 或 `uuidgen` 生成
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

服务器的配置中需要确保 `id` 和端口与客户端一致，就可以正常连接了。

## 客户端配置

在你的 PC（或手机）中，需要用以下配置运行 Xray ：

```json
{
  "inbounds": [
    {
      "port": 1080, // SOCKS 代理端口，在浏览器中需配置代理并指向这个端口
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "server", // 服务器地址，请修改为你自己的服务器 ip 或域名
            "port": 10086, // 服务器端口
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811"  // 记得替换这个字段，使用 `xray uuid` 或 `uuidgen` 生成
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "ip": ["geoip:private","geoip:cn"], // 绕过局域网和国内IP段
        "outboundTag": "direct"
      }
    ]
  }
}
```
上述配置唯一要更改的地方是你的服务器 IP 和用户 uuid，配置中已注明。上述配置会把除局域网（比如访问路由器）和国内IP段（比如访问bilibili、acfun）以外的所有流量转发至你的服务器。

## 运行

- 在 Windows 和 macOS 中，配置文件通常是 Xray 同目录下的 `config.json` 文件。
  - 直接运行 `Xray` 或 `Xray.exe` 即可。
- 在 Linux 中，配置文件通常位于 `/etc/xray/` 或 `/usr/local/etc/xray/` 目录下。
  - 运行 `xray run -c /etc/xray/config.json`
  - 或使用 systemd 等工具将 Xray 作为服务在后台运行。

更多详细的说明可以参考 [配置文档](../config/) 和 [小小白话文](./level-0/)。
