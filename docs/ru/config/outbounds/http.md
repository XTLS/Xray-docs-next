# HTTP

Протокол HTTP.

::: danger
**Протокол HTTP не обеспечивает шифрования передачи, что делает его непригодным для передачи по общедоступным сетям и более уязвимым для использования в качестве скомпрометированного хоста для атак.**
:::

::: tip
`HTTP` может проксировать только протоколы TCP и не может обрабатывать протоколы на основе UDP.
:::

## OutboundConfigurationObject

```json
{
  "servers": [
    {
      "address": "192.168.108.1",
      "port": 3128,
      "users": [
        {
          "user": "my-username",
          "pass": "my-password"
        }
      ]
    }
  ],
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2"
  }
}
```

::: tip
В настоящее время в исходящем HTTP-протоколе действительна конфигурация `streamSettings` с параметрами `security` и `tlsSettings`.
:::

> `servers`: \[ [ServerObject](#serverobject) \]

Список HTTP-серверов, каждый элемент которого является конфигурацией сервера. Если настроено несколько серверов, они используются по кругу (RoundRobin).

> `headers`: map{ string, string }

HTTP-заголовки, пара "ключ-значение". Каждый ключ представляет собой имя HTTP-заголовка, все пары "ключ-значение" будут прикрепляться к каждому запросу.

### ServerObject

```json
{
  "address": "192.168.108.1",
  "port": 3128,
  "users": [
    {
      "user": "my-username",
      "pass": "my-password"
    }
  ]
}
```

> `address`: string

Адрес HTTP-прокси-сервера, обязательный параметр.

> `port`: int

Порт HTTP-прокси-сервера, обязательный параметр.

> `user`: \[[AccountObject](#accountobject)\]

Массив, каждый элемент которого представляет собой учетную запись пользователя. Значение по умолчанию: пустой массив.

#### AccountObject

```json
{
  "user": "my-username",
  "pass": "my-password"
}
```

> `user`: string

Имя пользователя, тип данных: строка. Обязательный параметр.

> `pass`: string

Пароль, тип данных: строка. Обязательный параметр.



