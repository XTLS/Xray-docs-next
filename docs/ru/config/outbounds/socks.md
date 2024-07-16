# Socks

Стандартная реализация протокола Socks, совместимая с [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol), [Socks 4a](https://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4A.protocol) и Socks 5.

::: danger
**Протокол Socks не обеспечивает шифрования передачи, поэтому он не подходит для передачи данных через общедоступные сети.**
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "127.0.0.1",
      "port": 1234,
      "users": [
        {
          "user": "test user",
          "pass": "test pass",
          "level": 0
        }
      ]
    }
  ]
}
```

> `servers`: \[ [ServerObject](#serverobject) \]

Список Socks-серверов, где каждый элемент представляет собой конфигурацию сервера.

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "users": [
    {
      "user": "test user",
      "pass": "test pass",
      "level": 0
    }
  ]
}
```

> `address`: address

Адрес сервера, обязательный параметр.

::: tip
Поддерживается подключение только к Socks 5 серверам.
:::

> `port`: number

Порт сервера, обязательный параметр.

> `users`: \[ [UserObject](#userobject) \]

Массив, представляющий список пользователей, где каждый элемент представляет собой конфигурацию пользователя.

Если список не пуст, Socks-клиент будет использовать информацию о пользователе для аутентификации; если не указан, аутентификация не выполняется.

Значение по умолчанию: пустой массив.

#### UserObject

```json
{
  "user": "test user",
  "pass": "test pass",
  "level": 0
}
```

> `user`: string

Имя пользователя, тип данных: строка. Обязательный параметр.

> `pass`: string

Пароль, тип данных: строка. Обязательный параметр.

> `level`: number

Уровень пользователя, для соединения будет использоваться [локальная политика](../policy.md#levelpolicyobject), соответствующая этому уровню пользователя.

Значение userLevel соответствует значению `level` в разделе [policy](../policy.md#policyobject). Если не указано, используется значение по умолчанию - 0.



