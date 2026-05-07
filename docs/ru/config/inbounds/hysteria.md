# Hysteria

::: tip
Сам протокол `hysteria` не предусматривает аутентификации; `клиенты` начинают действовать только при использовании с транспортным уровнем `hysteria`.
:::

## InboundConfigurationObject

`InboundConfigurationObject` соответствует элементу `settings` в [`InboundObject`](../inbound.md).

```json
{
  "inbounds": [
    {
      // ...
      "protocol": "hysteria",
      "settings": {
        // [!code focus:8]
        "version": 2,
        "users": [
          {
            "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
            "level": 0,
            "email": "love@xray.com"
          }
        ]
      }
    }
  ]
}
```

> `version`: number

Версия Hysteria, должна быть равна 2.

> `users`: \[ [UserObject](#userobject) \]

Массив, представляющий группу пользователей, одобренных сервером.

### UserObject

```json
{
  "auth": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com"
}
```

> `auth`: string

Строка любой длины.

> `level`: number

Уровень пользователя, для подключения будет использоваться [локальная политика](../policy.md#levelpolicyobject), соответствующая этому уровню пользователя.

Значение level соответствует значению `level` в разделе [policy](../policy.md#policyobject). Если не указано, используется значение по умолчанию - 0.

> `email`: string

Адрес электронной почты пользователя, используется для разделения трафика разных пользователей (отображается в журналах, статистике).
