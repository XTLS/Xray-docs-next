# Hysteria

::: tip
При использовании с протоколом `hysteria`, `quic native udp` включен по умолчанию.

При использовании с `hysteria inbound`, `auth` будет переопределен `clients` (если он существует).

Возможность использования других `протоколов` в качестве прокси для `udp` зависит от наличия у этого `протокола` возможностей `uot`.

Включение `finalmask.udp` нарушит работу маскировки страниц `masquerade`.
:::

## HysteriaObject

`HysteriaObject` соответствует пункту `hysteriaSettings` в конфигурации транспорта.

```json
{
  "version": 2,
  "auth": "password",
  "udpIdleTimeout": 60,
  "masquerade": {
    "type": "",

    "dir": "",

    "url": "",
    "rewriteHost": false,
    "insecure": false,

    "content": "",
    "headers": {
      "key": "value"
    },
    "statusCode": 0
  }
}
```

> `version`: number

Версия Hysteria, должна быть равна 2.

> `auth`: string

Пароль аутентификации Hysteria, должен совпадать на сервере и клиенте.

> `udpIdleTimeout`: number

Единица измерения: секунды, по умолчанию 60.

Время ожидания в режиме ожидания для одного соединения `quic native udp`. Если это время слишком велико, соединение может быть не строго соблюдено и может быть сначала разорвано политикой.

> `masquerade`: [MasqObject](#MasqObject)

Маскировка страниц HTTP/3.

### MasqObject

```json
{
  "type": "",

  "dir": "",

  "url": "",
  "rewriteHost": false,
  "insecure": false,

  "content": "",
  "headers": {
    "key": "value"
  },
  "statusCode": 0
}
```

> `type`: "file" | "proxy" | "string"

Если оставить это поле пустым, отобразится стандартная страница ошибки 404.

> `dir`: string

Элементы конфигурации, когда `type` равен `file`.

> `url`: string

Элементы конфигурации, когда `type` имеет значение `proxy`.

> `rewriteHost`: false | true

Элементы конфигурации, когда `type` имеет значение `proxy`.

> `insecure`: false | true

Элементы конфигурации, когда `type` имеет значение `proxy`.

> `content`: string

Элементы конфигурации, когда `type` имеет значение `string`.

> `headers`: map{ string, string }

Элементы конфигурации, когда `type` имеет значение `string`.

> `statusCode`: int

Элементы конфигурации, когда `type` имеет значение `string`.
