# MASQUE

Транспорт MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), используется вместе с исходящим ([outbound](../outbounds/masque.md)) и входящим ([inbound](../inbounds/masque.md)) подключениями masque.

Туннель создаётся расширенным запросом CONNECT (`:protocol` равен `connect-ip`), а IP-пакеты передаются в HTTP Datagram ([RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)). Поддерживаются две версии HTTP:

- HTTP/3 (по умолчанию): работает поверх QUIC. IP-пакеты передаются в кадрах QUIC DATAGRAM; пакеты, которые другая сторона отправляет в капсулах DATAGRAM, отбрасываются.
- HTTP/2 ([RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)): работает поверх TCP. IP-пакеты передаются в капсулах DATAGRAM в потоке запроса. Подходит для сетей, где UDP недоступен.

Версию HTTP определяет `alpn` в `tlsSettings`:

- Исходящее подключение: HTTP/2 используется, если `alpn` содержит `h2` и не содержит `h3`, иначе — HTTP/3.
- Входящее подключение: HTTP/2 (TCP) прослушивается, если `alpn` содержит `h2`, а HTTP/3 (UDP) — если `alpn` содержит `h3` или не содержит `h2`. Если указаны оба, они обслуживаются одновременно на одном порту.

::: tip
REALITY не поддерживается.

Для HTTP/3: RFC 9484 требует, чтобы туннель передавал IPv6-пакеты размером 1280 байт, а начальный размер пакета Chrome (1250 байт) для этого мал. Поэтому MASQUE не использует отпечаток Chrome из [quicParams](./finalmask.md#quicparams), и начальный размер пакета QUIC зафиксирован на 1350 байт. Если MTU пути меньше, соединение не устанавливается.

Для HTTP/2: TLS-рукопожатие исходящего подключения использует `fingerprint` из `tlsSettings` (по умолчанию `chrome`), а [quicParams](./finalmask.md#quicparams) не действует.
:::

## MasqueObject

`MasqueObject` соответствует элементу `masqueSettings` в [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "method": "masque",
        // [!field focus]
        "masqueSettings": {
          "host": "example.com",
          "path": "/.well-known/masque/ip/{target}/{ipproto}/",
          "user": "love@xray.com",
          "pass": "password",
          "headers": {}
        },
        "security": "tls",
        "tlsSettings": {
          "serverName": "example.com"
        }
      }
    }
  ]
}
```

Входящее подключение использует только `path`; остальные параметры предназначены только для исходящего подключения.

> `host`: string

`:authority` запроса. Приоритет: `host` > `serverName` > `address`; два последних включают порт, если он не 443.

> `path`: string

Путь URI-шаблона сервера. По умолчанию `/.well-known/masque/ip/{target}/{ipproto}/` из RFC 9484.

Поддерживается только полный туннель: `{target}` и `{ipproto}` заменяются на `*`, другие переменные шаблона не поддерживаются.

Входящее подключение принимает только запросы с таким же путём, на остальные отвечает 404, поэтому `path` на обеих сторонах должен совпадать.

> `user`: string

> `pass`: string

Имя пользователя и пароль аутентификации HTTP Basic, соответствуют `email` и `pass` в [UserObject](../inbounds/masque.md#userobject) входящего подключения masque. `user` не должен содержать `:`.

> `headers`: map \{string: string\}

Дополнительные HTTP-заголовки запроса. Их можно использовать для способов аутентификации, отличных от `user` и `pass`, например `"Authorization": "Bearer ..."`.

Не должны содержать `host` и `Capsule-Protocol`, а также `Authorization`, если задан `user` или `pass`. По умолчанию `User-Agent` не отправляется; поддерживаются специальные значения `chrome`, `firefox`, `safari`, `edge`, `curl` и `golang`.
