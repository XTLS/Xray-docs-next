# API Interface

API interface configuration provides a set of APIs based on [gRPC](https://grpc.io/) for remote invocation.

The interface can be enabled through the api configuration module. When the api configuration is enabled, Xray will create an outbound proxy automatically. All incoming API connections need to be manually routed to this outbound proxy through [routing rule configuration](./routing.md).

Please refer to the [related configuration](#related-configuration) in this section.

::: warning
Most users do not need to use this API. Novices can ignore this page entirely.
:::

## ApiObject

`ApiObject` corresponds to the `api` item in the configuration file.

```json
{
  "api": {
    "tag": "api",
    "listen": "127.0.0.1:8080",
    "services": ["HandlerService", "LoggerService", "StatsService"]
  }
}
```

> `tag`: string

Outbound proxy identifier.

> `listen`: string

The IP and port that the API service listens on. This is an optional configuration item.

When you omit this item, you need to add inbounds and routing configurations according to the examples in the [relevant configurations below](#related-configuration).


> `services`: [string]

List of enabled APIs, optional values can be found in [Supported API List](#supported-api-list).

## Related Configuration

An api inbound can be added to the inbounds configuration.

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

Add routing rules for the api inbound in the routing configuration.

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

Add api to basic configuration

```
"api": {
  "tag": "api",
  "services": [
    "StatsService"
  ]
}
```


## Supported API List

### HandlerService

APIs that modify the inbound and outbound proxies, with the following available functions:

- Add a new inbound proxy;
- Add a new outbound proxy;
- Delete an existing inbound proxy;
- Delete an existing outbound proxy;
- Add a user to an inbound proxy (VMess, VLESS, Trojan, and Shadowsocks(v1.3.0+) only);
- Delete a user from an inbound proxy (VMess, VLESS, Trojan, and Shadowsocks(v1.3.0+) only);

## RoutingService

API for adding, deleting, and replacing routing rules and querying equalizer statistics. The available functions are as follows:

* `adrules` adds and replaces routing configuration
* `rmrules` delete routing rules
* `sib` Disconnect source IP
* `bi` Query equalizer statistics
* `bo` Forces the equalizer to select the specified outboundTag

You can use something like `./xray help api bi` to query the specific usage.

### LoggerService

Supports restarting the built-in logger, which can be used in conjunction with logrotate to perform operations on log files.

### StatsService

Built-in data statistics service, see [Statistics Information](./stats.md) for details.

### ReflectionService

Supports gRPC clients to obtain the list of APIs from the server.

```bash
$ grpcurl -plaintext localhost:10085 list
grpc.reflection.v1alpha.ServerReflection
v2ray.core.app.proxyman.command.HandlerService
v2ray.core.app.stats.command.StatsService
xray.app.proxyman.command.HandlerService
xray.app.stats.command.StatsService
```

## API Calling Example

[Xray-API-documents](https://github.com/XTLS/Xray-API-documents) @crossfw
