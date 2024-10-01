# RAW

Режим транспорта RAW — один из рекомендуемых в настоящее время режимов транспорта.

Может использоваться в различных комбинациях с различными протоколами.

## RawObject

`RawObject` соответствует элементу `rawSettings` в конфигурации транспорта.

```json
{
  "acceptProxyProtocol": false,
  "header": {
    "type": "none"
  }
}
```

> `acceptProxyProtocol`: true | false

Только для входящих подключений, указывает, следует ли принимать PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) используется для передачи реального исходного IP-адреса и порта запроса, **если вы не знаете, что это такое, проигнорируйте этот параметр**.

Распространенные программы для обработки обратного прокси (например, HAProxy, Nginx) можно настроить на его отправку, VLESS fallbacks xver также может его отправлять.

Если установлено значение `true`, то после установления TCP-соединения на самом нижнем уровне запрашивающая сторона должна сначала отправить PROXY protocol v1 или v2, иначе соединение будет закрыто.

Значение по умолчанию: `false`.

> `header`: [NoneHeaderObject](#noneheaderobject) | [HttpHeaderobject](#httpheaderobject)

Настройки маскировки заголовка пакета данных, значение по умолчанию: `NoneHeaderObject`.

::: tip
HTTP-маскировка не может быть разделена другими HTTP-серверами (например, Nginx), но может быть разделена с помощью VLESS fallbacks path.
:::

### NoneHeaderObject

Маскировка не выполняется.

```json
{
  "type": "none"
}
```

> `type`: "none"

Указывает, что маскировка не выполняется.

### HttpHeaderObject

Конфигурация HTTP-маскировки должна быть одинаковой как на входящем, так и на исходящем соединении, и ее содержимое должно совпадать.

```json
{
  "type": "http",
  "request": {},
  "response": {}
}
```

> `type`: "http"

Указывает на выполнение HTTP-маскировки.

> `request`: [HTTPRequestObject](#httprequestobject)

HTTP-запрос.

> `response`: [HTTPResponseObject](#httpresponseobject)

HTTP-ответ.

#### HTTPRequestObject

```json
{
  "version": "1.1",
  "method": "GET",
  "path": ["/"],
  "headers": {
    "Host": ["www.baidu.com", "www.bing.com"],
    "User-Agent": [
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
    ],
    "Accept-Encoding": ["gzip, deflate"],
    "Connection": ["keep-alive"],
    "Pragma": "no-cache"
  }
}
```

> `version`: string

Версия HTTP, значение по умолчанию — `"1.1"`.

> `method`: string

Метод HTTP, значение по умолчанию — `"GET"`.

> `path`: \[ string \]

Путь, массив строк. Значение по умолчанию — `["/"]`. Если имеется несколько значений, то при каждом запросе случайным образом выбирается одно из них.

> `headers`: map{ string, \[ string \]}

HTTP-заголовки, пары ключ-значение, где каждый ключ представляет имя HTTP-заголовка, а соответствующее значение является массивом.

Каждый запрос будет содержать все ключи и случайно выбранное соответствующее значение. Значение по умолчанию см. в примере выше.

#### HTTPResponseObject

```json
{
  "version": "1.1",
  "status": "200",
  "reason": "OK",
  "headers": {
    "Content-Type": ["application/octet-stream", "video/mpeg"],
    "Transfer-Encoding": ["chunked"],
    "Connection": ["keep-alive"],
    "Pragma": "no-cache"
  }
}
```

> `version`: string

Версия HTTP, значение по умолчанию — `"1.1"`.

> `status`: string

Состояние HTTP, значение по умолчанию — `"200"`.

> `reason`: string

Описание состояния HTTP, значение по умолчанию — `"OK"`.

> `headers`: map {string, \[ string \]}

HTTP-заголовки, пары ключ-значение, где каждый ключ представляет имя HTTP-заголовка, а соответствующее значение является массивом.

Каждый запрос будет содержать все ключи и случайно выбранное соответствующее значение. Значение по умолчанию см. в примере выше.
