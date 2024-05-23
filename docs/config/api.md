# API 接口

API 接口配置提供了一些基于 [gRPC](https://grpc.io/)的 API 接口供远程调用。

可以通过 api 配置模块开启接口。当 api 配置开启时，Xray 会自建一个和 tag 同名的出站代理，须手动将所有的 API 入站连接通过 [路由规则配置](./routing.md) 指向这一出站代理。请参考本节中的 [相关配置](#相关配置)。

[v1.8.12](https://github.com/XTLS/Xray-core/releases/tag/v1.8.12) 起支持简易配置模式，只配置 ApiObject 即可，不需要配置 inbounds 和 routing。但是使用简易配置时，流量统计功能不统计 API 入站连接的流量。

::: warning
大多数用户并不会用到此 API，新手可以直接忽略这一项。
:::

## ApiObject

`ApiObject` 对应配置文件的 `api` 项。

```json
{
  "api": {
    "tag": "api",
    "listen": "127.0.0.1:8080",
    "services": ["HandlerService", "LoggerService", "StatsService", "RoutingService"]
  }
}
```

> `tag`: string

出站代理标识。

> `listen`: string

API 服务监听的 IP 和端口。这是一个可选配置项。

省略这项时需要按照下面[相关配置](#相关配置)中的示例，添加 inbounds 和 routing 配置。

> `services`: \[string\]

开启的 API 列表，可选的值见 [API 列表](#支持的-api-列表)。

## 相关配置

可以在 inbounds 配置中增加一个 api 的 inbound

```json
"inbounds": [
  {
    "listen": "127.0.0.1",
    "port": 10085,
    "protocol": "dokodemo-door",
    "settings": {
      "address": "127.0.0.1"
    },
    "tag": "api"
  }
]
```

在路由配置中增加针对 api inbound 的路由规则

```json
"routing": {
  "rules": [
    {
      "inboundTag": [
        "api"
      ],
      "outboundTag": "api",
      "type": "field"
    }
  ]
}
```

在基础配置中增加 api

```json
"api": {
  "tag": "api",
  "services": [
    "StatsService"
  ]
}
```

## 支持的 API 列表

### HandlerService

一些对于入站出站代理进行修改的 API，可用的功能如下：

- 添加一个新的入站代理；
- 添加一个新的出站代理；
- 删除一个现有的入站代理；
- 删除一个现有的出站代理；
- 在一个入站代理中添加一个用户（仅支持 VMess、VLESS、Trojan、Shadowsocks（v1.3.0+））；
- 在一个入站代理中删除一个用户（仅支持 VMess、VLESS、Trojan、Shadowsocks（v1.3.0+））；

### RoutingService

添加、删除、替换 routing 规则，查询均衡器统计信息的 API，可用的功能如下：

- adrules 添加、替换 routing 配置
- rmrules 删除 routing 规则
- sib 断开来源 IP 的连接
- bi 查询均衡器统计信息
- bo 强制均衡器选中指定的 outboundTag

可以使用类似于 `./xray help api bi` 这样的命令来查询具体用法。  

### LoggerService

支持对内置 Logger 的重启，可配合 logrotate 进行一些对日志文件的操作。

### StatsService

内置的数据统计服务，详见 [统计信息](./stats.md)。

### ReflectionService

支持 gRPC 客户端获取服务端的 API 列表。

```bash
$ grpcurl -plaintext localhost:10085 list
grpc.reflection.v1alpha.ServerReflection
v2ray.core.app.proxyman.command.HandlerService
v2ray.core.app.stats.command.StatsService
xray.app.proxyman.command.HandlerService
xray.app.stats.command.StatsService
```

## API 调用示例

[Xray-API-documents](https://github.com/XTLS/Xray-API-documents) @crossfw
