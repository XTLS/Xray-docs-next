# Loopback

Loopback - это исходящий протокол данных, который перенаправляет данные, прошедшие через это исходящее соединение, обратно на вход маршрутизатора, что позволяет повторно обработать данные по правилам маршрутизации, не покидая Xray-core.

## OutboundConfigurationObject

```json
{
  "inboundTag": "TagUseAsInbound"
}
```

> `inboundTag`: string

Идентификатор входящего протокола, используемый для повторной маршрутизации.

Этот идентификатор может использоваться в маршрутизации для `inboundTag`, указывая, что данные из этого исходящего соединения могут быть повторно обработаны соответствующими правилами маршрутизации.

### Как использовать?

Если необходимо, чтобы трафик, уже разделенный по правилам маршрутизации, был перенаправлен другими правилами маршрутизации (например, трафик TCP и UDP, разделенный одними и теми же правилами маршрутизации, должен идти через разные исходящие соединения), можно использовать исходящее соединение `loopback`.

``` json
{
  "outbounds": [
    {
      "protocol": "loopback",
      "tag": "need-to-split",
      "settings": {
        "inboundTag": "traffic-input" // Этот тег используется ниже для inboundTag в RuleObject
      }
    },
    {
      "tag": "tcp-output",
      // Настройки protocol, settings, streamSettings и т. д.
    },
    {
      "tag": "udp-output",
      // Настройки protocol, settings, streamSettings и т. д.
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["traffic-input"], // Тег, установленный в loopback
        "network": "tcp",
        "outboundTag": "tcp-output"
      },
      {
        "inboundTag": ["traffic-input"], // Тег, установленный в loopback
        "network": "udp",
        "outboundTag": "udp-output"
      }
    ]
  }
}
```


