# API Interface

The API interface configuration provides [gRPC](https://grpc.io/)-based API interfaces for remote procedure calls.

You can enable the interface through the `api` configuration module. When the `api` configuration is enabled, Xray will automatically build an outbound proxy with the same name as the `tag`. You must manually route all API inbound connections to this outbound proxy via [Routing Configuration](./routing.md). Please refer to [Relevant Configuration](#relevant-configuration) in this section.

Since [v1.8.12](https://github.com/XTLS/Xray-core/releases/tag/v1.8.12), a simplified configuration mode is supported. You only need to configure the `ApiObject`, without needing to configure `inbounds` and `routing`. However, when using the simplified configuration, the traffic statistics feature does not count the traffic of API inbound connections.

::: warning
Most users will not need this API; beginners can skip this section.
:::

## ApiObject

`ApiObject` corresponds to the `api` field in the configuration file.

```json
{
  "api": {
    "tag": "api",
    "listen": "127.0.0.1:8080",
    "services": [
      "HandlerService",
      "LoggerService",
      "StatsService",
      "RoutingService"
    ]
  }
}
```

> `tag`: string

The identifier of the outbound proxy.

> `listen`: string

The IP and port for the API service to listen on. This is an optional configuration item.

If this item is omitted, you need to add `inbounds` and `routing` configurations according to the example in [Relevant Configuration](#relevant-configuration) below.

> `services`: \[string\]

The list of enabled APIs. See [API List](#supported-api-list) for available values.

## Relevant Configuration

You can add an `api` inbound in the `inbounds` configuration:

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

Add a routing rule for the `api` inbound in the `routing` configuration:

```json
"routing": {
  "rules": [
    {
      "inboundTag": [
        "api"
      ],
      "outboundTag": "api"
    }
  ]
}
```

Add `api` in the basic configuration:

```json
"api": {
  "tag": "api",
  "services": [
    "StatsService"
  ]
}
```

## Supported API List

### HandlerService

APIs for modifying inbound and outbound proxies. Available functions are as follows:

- Add a new inbound;
- Add a new outbound;
- Remove an existing inbound;
- Remove an existing outbound;
- List outbounds;
- List inbounds;
- Add a user to an inbound (supports VMess, VLESS, Trojan, Shadowsocks only);
- Remove a user from an inbound (supports VMess, VLESS, Trojan, Shadowsocks only);

### RoutingService

APIs for adding, removing, replacing routing rules, and querying balancer statistics. Available functions are as follows:

- `adrules`: Add or replace routing configuration
- `rmrules`: Remove routing rules
- `sib`: Disconnect connections from a source IP
- `bi`: Query balancer statistics
- `bo`: Force balancer to select a specific `outboundTag`

You can use commands like `./xray help api bi` to query specific usage.

### LoggerService

Supports restarting the built-in Logger, which can be used with `logrotate` to perform operations on log files.

### StatsService

Built-in data statistics service. See [Statistics](./stats.md) for details.

### ReflectionService

Allows gRPC clients to retrieve the list of APIs on the server.

```bash
$ grpcurl -plaintext localhost:10085 list
grpc.reflection.v1alpha.ServerReflection
v2ray.core.app.proxyman.command.HandlerService
v2ray.core.app.stats.command.StatsService
xray.app.proxyman.command.HandlerService
xray.app.stats.command.StatsService
```

## API Call Examples

[Xray-API-documents](https://github.com/XTLS/Xray-API-documents) @crossfw
