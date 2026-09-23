# MASQUE

HTTP/3-транспорт MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), используется вместе с исходящим подключением masque ([outbound](../outbounds/masque.md)).

Туннель создаётся расширенным запросом CONNECT в HTTP/3 (`:protocol` равен `connect-ip`), а IP-пакеты передаются в HTTP Datagram ([RFC 9297](https://www.rfc-editor.org/rfc/rfc9297)). Поддерживаются только кадры QUIC DATAGRAM; пакеты, которые сервер отправляет в капсулах DATAGRAM, отбрасываются.

::: tip
Всегда используется HTTP/3, ALPN фиксирован как `h3`. REALITY не поддерживается.

RFC 9484 требует, чтобы туннель передавал IPv6-пакеты размером 1280 байт, а начальный размер пакета Chrome (1250 байт) для этого мал. Поэтому MASQUE не использует отпечаток Chrome из [quicParams](./finalmask.md#quicparams), и начальный размер пакета QUIC зафиксирован на 1350 байт. Если MTU пути меньше, соединение не устанавливается.
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
          "headers": {
            "Authorization": "Basic dXNlcjpwYXNz"
          }
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

> `host`: string

`:authority` запроса. Приоритет: `host` > `serverName` > `address`; два последних включают порт, если он не 443.

> `path`: string

Путь URI-шаблона сервера. По умолчанию `/.well-known/masque/ip/{target}/{ipproto}/` из RFC 9484.

Поддерживается только полный туннель: `{target}` и `{ipproto}` заменяются на `*`, другие переменные шаблона не поддерживаются.

> `headers`: map \{string: string\}

Дополнительные HTTP-заголовки запроса, обычно для аутентификации, например `"Authorization": "Basic " + base64("имя:пароль")` или `"Authorization": "Bearer ..."`.

Не должны содержать `host` и `Capsule-Protocol`. По умолчанию `User-Agent` не отправляется; поддерживаются специальные значения `chrome`, `firefox`, `safari`, `edge`, `curl` и `golang`.
