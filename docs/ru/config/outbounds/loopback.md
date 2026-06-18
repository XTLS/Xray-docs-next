# Loopback

Loopback — это outbound с возвратом трафика, который отправляет трафик обратно в `routing` для повторной обработки, не выводя его за пределы ядра.

::: tip Применение

- В местах, где можно указать только outbound и нельзя напрямую задать `balancerTag`, Loopback позволяет косвенно использовать балансировщик.<br>
  Например, `proxySettings` и `dialerProxy` в цепочках прокси, а также `fallbackTag` при балансировке нагрузки.
- После того как трафик уже был разделен один раз, его можно дополнительно детализировать по другим условиям.<br>
  Например, TCP- и UDP-трафик, разделенные одной и той же группой правил routing, можно направить в разные outbound.

:::

## OutboundConfigurationObject

`OutboundConfigurationObject` соответствует элементу `settings` в [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "loopback",
      // [!code focus:4]
      "settings": {
        "inboundTag": "TagUseAsInbound",
        "sniffing": {}
      }
    }
  ]
}
```

> `inboundTag`: string

Тег входящего соединения, используемый при повторном входе в routing.

Этот тег можно использовать в routing как `inboundTag`; это означает, что данные из этого outbound снова войдут в routing с этим тегом и будут повторно обработаны соответствующими правилами.

> `sniffing`: [SniffingObject](../inbound.md#sniffingobject)

Распознавание трафика; настройки такие же, как у [входящего прокси](../inbound.md#sniffingobject). По умолчанию отключено.
