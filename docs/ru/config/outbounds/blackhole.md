# Blackhole

Blackhole - это протокол исходящих данных, который блокирует все исходящие данные. В сочетании с [конфигурацией маршрутизации](../routing.md) он может быть использован для запрета доступа к определенным сайтам.

## OutboundConfigurationObject

`OutboundConfigurationObject` соответствует элементу `settings` в [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "blackhole",
      "settings": {
        // [!code focus:3]
        "response": {
          "type": "none"
        }
      }
    }
  ]
}
```

> `response`: [ResponseObject](#responseobject)

Настройка ответа Blackhole.

Blackhole отправит указанный ответ после получения данных , а затем закроет соединение. Данные для будут отброшены.
Если этот параметр не указан, Blackhole просто закроет соединение.

### ResponseObject

```json
{
  "type": "none"
}
```

> `type`: "http" | "none"

Если `type` равен `"none"` (значение по умолчанию), Blackhole просто закроет соединение.

Если `type` равен `"http"`, Blackhole вернет простой пакет HTTP 403, а затем закроет соединение.
