# MASQUE

Способ передачи MASQUE CONNECT-IP ([RFC 9484](https://www.rfc-editor.org/rfc/rfc9484)), который переносит IP-пакеты поверх HTTP/3 или HTTP/2. Используется вместе с MASQUE [исходящим](../outbounds/masque.md) и [входящим](../inbounds/masque.md) подключениями.

- HTTP/3: работает поверх QUIC, IP-пакеты отправляются и принимаются в виде QUIC DATAGRAM.
- HTTP/2: работает поверх TCP, туннель устанавливается с помощью расширенного CONNECT ([RFC 8441](https://www.rfc-editor.org/rfc/rfc8441)); можно использовать в сетях, где UDP недоступен.

Используемая версия HTTP определяется параметром `alpn` в `tlsSettings`:

- Исходящее подключение: если `alpn` содержит `h2` и не содержит `h3`, используется HTTP/2, иначе — HTTP/3.
- Входящее подключение: если `alpn` содержит `h2`, по TCP предоставляется HTTP/2; если содержит `h3` или не содержит `h2`, по UDP предоставляется HTTP/3; если есть и то и другое, оба предоставляются одновременно на одном и том же порту.

::: tip
Необходимо использовать `tls`, REALITY не поддерживается.

При использовании HTTP/3 начальный размер пакетов QUIC фиксирован и составляет 1350 байт, при меньшем MTU пути соединение установить невозможно; кроме того, в отличие от Hysteria и XHTTP H3, QUIC-отпечаток Chrome не имитируется. Управление перегрузкой в [quicParams](./finalmask.md#quicparams) по умолчанию — `bbr`, `brutal` тоже работает как `bbr`; если нужен Brutal, используйте `force-brutal`.

При использовании HTTP/2 TLS-рукопожатие исходящего подключения использует `fingerprint` из `tlsSettings` (по умолчанию — `chrome`), а `quicParams` не действует.

UDP-маски [FinalMask](./finalmask.md) применяются к HTTP/3, а TCP-маски — к HTTP/2.
:::

О подключении к Cloudflare WARP см. [Подключение к Warp через MASQUE](../../document/level-2/warp.md#подключение-к-warp-через-masque).

## MasqueObject

`MasqueObject` соответствует элементу `masqueSettings` в [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "masque",
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

Входящее подключение использует только `path`, все остальные параметры используются только исходящим подключением.

> `host`: string

`:authority` запроса CONNECT-IP. Приоритет: `host` > `serverName` > `address`; к двум последним добавляется порт, если он не равен 443.

> `path`: string

Путь URI-шаблона, по умолчанию — `/.well-known/masque/ip/{target}/{ipproto}/` из RFC 9484.

Поддерживается только полный туннель: `{target}` и `{ipproto}` (включая формы запроса вида `{?target,ipproto}`) заменяются на `*`, другие переменные не поддерживаются, путь должен начинаться с `/`.

Входящее подключение принимает только запросы с таким же путём, на остальные запросы возвращается 404, поэтому `path` на обеих сторонах должен совпадать.

> `user`: string

> `pass`: string

Имя пользователя и пароль для аутентификации HTTP Basic; соответствуют `email` и `pass` в [UserObject](../inbounds/masque.md#userobject) входящего подключения MASQUE. `user` не может содержать `:`.

> `headers`: map \{string: string\}

Дополнительные HTTP-заголовки запроса. Могут использоваться для способов аутентификации, отличных от `user` / `pass`, например `"Authorization": "Bearer ..."`.

Не могут содержать `Host` и `Capsule-Protocol`, а если задан `user` или `pass`, — также `Authorization`. По умолчанию `User-Agent` не отправляется; для него также можно указать специальные значения `chrome`, `firefox`, `safari`, `edge`, `curl`, `golang`.

> `warp`: [WarpObject](../../document/level-2/warp.md#warpobject)

Данные устройства для подключения к Cloudflare WARP. Если параметр задан, `host` по умолчанию равен `cloudflareaccess.com`, `path` по умолчанию равен `/`, задавать `user` / `pass` больше нельзя, а адрес туннеля берётся из указанного в нём `address` и больше не назначается сервером. Если в `tlsSettings` задан `pinnedPeerCertSha256` или `verifyPeerCertByName`, указанный в нём `publicKey` игнорируется, и сертификат сервера проверяется только по ним.
