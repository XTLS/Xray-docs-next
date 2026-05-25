# Hysteria

Реализация клиента протокола Hysteria.

Эта страница очень проста, так как протокол hysteria фактически состоит из простого протокола управления прокси и оптимизированной QUIC-реализации транспорта. В Xray прокси-протокол и конфигурация транспорта разделены. Подробности, включая `brutal`, см. в параметрах транспорта [hysteriaSettings](../transports/hysteria.md) и [FinalMask.quicParams](../transports/finalmask.md#quicparams).

::: tip
Сам протокол `hysteria` не имеет аутентификации. При использовании с транспортным уровнем, отличным от `hysteria`, он не сможет выступать в качестве прокси для `udp`, и его использование с другими транспортными уровнями не рекомендуется.
:::

## OutboundConfigurationObject

`OutboundConfigurationObject` соответствует элементу `settings` в [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "hysteria",
      // [!code focus:5]
      "settings": {
        "version": 2,
        "address": "192.168.108.1",
        "port": 3128
      }
    }
  ]
}
```

> `version`: number

Версия Hysteria, должна быть равна 2.

> `address`: string

Адрес прокси-сервера Hysteria, обязательно.

> `port`: int

Порт прокси-сервера Hysteria, обязательно.
