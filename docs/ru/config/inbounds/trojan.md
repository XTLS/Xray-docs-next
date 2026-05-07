# Trojan

Протокол [Trojan](https://trojan-gfw.github.io/trojan/protocol).

::: danger
Trojan предназначен для работы в правильно настроенном зашифрованном TLS-туннеле.
:::

## InboundConfigurationObject

```json
{
  "inbounds": [
    {
      // ...
      "settings": {
        // [!code focus:12]
        "users": [
          {
            "password": "password",
            "email": "love@xray.com",
            "level": 0
          }
        ],
        "fallbacks": [
          {
            "dest": 80
          }
        ]
      }
    }
  ]
}
```

> `users`: \[ [UserObject](#userobject) \]

Массив, представляющий группу пользователей, одобренных сервером.

Каждый элемент в массиве - это пользователь [UserObject](#userobject).

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

Массив, содержащий ряд конфигураций fallback-маршрутизации (необязательно).
Подробную информацию о настройке fallbacks см. в разделе [FallbackObject](../features/fallback.md#fallbacks-конфигурация).

::: tip
Trojan в Xray имеет полную поддержку fallbacks, конфигурация идентична.
Условия запуска fallback также аналогичны VLESS: длина первого пакета < 58 или 57-й байт не равен `\r` (поскольку Trojan не имеет версии протокола) или ошибка аутентификации.
:::

### UserObject

```json
{
  "password": "password",
  "email": "love@xray.com",
  "level": 0
}
```

> `password`: string

Обязательный параметр, любая строка.

> `email`: string

Адрес электронной почты, необязательный параметр, используется для идентификации пользователя.

::: danger
Если существует несколько объектов UserObject, убедитесь, что адреса электронной почты не дублируются.
:::

> `level`: number

Уровень пользователя, для соединения будет использоваться [локальная политика](../policy.md#levelpolicyobject), соответствующая этому уровню пользователя.

Значение userLevel соответствует значению `level` в разделе [policy](../policy.md#policyobject). Если не указано, используется значение по умолчанию - 0.
