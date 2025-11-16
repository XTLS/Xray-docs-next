# Socks (Mixed)

Стандартная реализация протокола Socks, совместимая с [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol), [Socks 4a](https://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4A.protocol) и Socks 5.

::: danger
**Протокол Socks не обеспечивает шифрования передачи, поэтому он не подходит для передачи данных через общедоступные сети.**
:::

## OutboundConfigurationObject

```json
{
  "address": "127.0.0.1",
  "port": 1234,
  "user": "test user",
  "pass": "test pass",
  "level": 0,
  "email": "love@xray.com"
}
```

> `address`: address

Адрес сервера, обязательный параметр.

::: tip
Поддерживается подключение только к Socks 5 серверам.
:::

> `port`: number

Порт сервера, обязательный параметр.

> `user`: string

Имя пользователя, тип данных: строка. Обязательный параметр.

> `pass`: string

Пароль, тип данных: строка. Обязательный параметр.

> `level`: number

Уровень пользователя, для соединения будет использоваться [локальная политика](../policy.md#levelpolicyobject), соответствующая этому уровню пользователя.

Значение userLevel соответствует значению `level` в разделе [policy](../policy.md#policyobject). Если не указано, используется значение по умолчанию - 0.

> `email`: string

Адрес электронной почты, используемый для идентификации пользователя.
