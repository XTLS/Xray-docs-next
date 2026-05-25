# TLS

TLS — это обычный механизм защиты транспорта.

Он используется для настройки шифрования транспортного уровня, проверки сертификатов, отпечатков клиента и связанных параметров сертификата.

Поддерживается использование вместе с транспортами `RAW`, `XHTTP`, `mKCP`, `gRPC`, `WebSocket`, `HTTPUpgrade` и `Hysteria`.

## TLSObject

`TLSObject` соответствует полю `tlsSettings` в [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // пример для outbound, аналогично применимо к inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "security": "tls",
        // [!code focus:20]
        "tlsSettings": {
          "serverName": "xray.com",
          "verifyPeerCertByName": "",
          "rejectUnknownSni": false,
          "allowInsecure": false,
          "alpn": ["h2", "http/1.1"],
          "minVersion": "1.2",
          "maxVersion": "1.3",
          "cipherSuites": "Укажите нужные наборы шифров, разделяя их двоеточием",
          "certificates": [],
          "disableSystemRoot": false,
          "enableSessionResumption": false,
          "fingerprint": "",
          "pinnedPeerCertSha256": "",
          "curvePreferences": [""],
          "masterKeyLog": "",
          "echServerKeys": "",
          "echConfigList": "",
          "echSockopt": {}
        }
      }
    }
  ]
}
```

> `serverName`: string

Имя сервера. Значение должно присутствовать в SAN серверного сертификата. Это может быть доменное имя или IP-адрес. Если указано доменное имя, оно отправляется в расширении SNI внутри Client Hello. Для IP-адреса SNI не отправляется, потому что SNI не поддерживает IP. Для IPv6 используйте запись в `[]`.

Если поле пустое, Xray автоматически использует значение `address`, если это доменное имя.

Специальное значение `"FromMitM"` заставляет использовать SNI, извлеченный из TLS, расшифрованного входящим `dokodemo-door`.

> `verifyPeerCertByName`: string

Только для клиента. SNI, используемый при проверке сертификата. Можно указать несколько доменов через `,`; достаточно, чтобы хотя бы один SAN сертификата совпал с одним из них. Это поле переопределяет `serverName`, используемый для проверки, и нужно для специальных сценариев вроде domain fronting.

Специальное значение `"FromMitM"` дополнительно добавляет SNI, извлеченный из TLS, расшифрованного входящим `dokodemo-door`.

> `rejectUnknownSni`: bool

Если значение равно `true`, сервер отклоняет TLS-рукопожатие, если полученный SNI не соответствует домену сертификата. Значение по умолчанию — `false`.

> `alpn`: [string]

Массив строк, задающий значения ALPN при TLS-рукопожатии. Значение по умолчанию — `["h2", "http/1.1"]`.

Специальное значение `["FromMitM"]`, когда это единственный элемент массива, заставляет исходящий TLS использовать ALPN из TLS-соединения, расшифрованного входящим `dokodemo-door`.

> `minVersion`: string

`minVersion` — минимально допустимая версия TLS.

> `maxVersion`: string

`maxVersion` — максимально допустимая версия TLS.

> `cipherSuites`: string

`cipherSuites` задает список поддерживаемых наборов шифров, разделенных `:`.

Названия наборов шифров Go и их описание можно посмотреть [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L500) или [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
В большинстве случаев эти параметры не нужны и обычно не влияют на безопасность. Если их не задавать, Go выбирает их автоматически в зависимости от платформы. Если вы плохо понимаете, что делаете, лучше не настраивать их вручную.
:::

> `allowInsecure`: true | false

Разрешать ли небезопасные соединения. Только для клиента. Значение по умолчанию — `false`.

Если значение равно `true`, Xray не проверяет корректность TLS-сертификата удаленной стороны.

::: danger
~~По соображениям безопасности этот параметр не стоит использовать в реальных сценариях, иначе вы можете стать уязвимы для MITM-атак.~~

Этот параметр устарел. Вместо него используйте `pinnedPeerCertSha256`.
:::

> `disableSystemRoot`: true | false

Отключать ли встроенные корневые сертификаты операционной системы. Значение по умолчанию — `false`.

Если значение равно `true`, Xray использует при TLS-рукопожатии только сертификаты из `certificates`. Если `false`, используются только системные корневые сертификаты.

> `enableSessionResumption`: true | false

Включать ли возобновление сессии. По умолчанию эта функция выключена и используется только если и сервер, и клиент ее включили.

При успешном согласовании сертификаты не нужно повторно передавать во время рукопожатия. Это дает очень небольшой выигрыш по времени.

Это не TLS 0-RTT. `gotls` пока не поддерживает такую возможность, поэтому RTT TLS-рукопожатия не уменьшается.

> `fingerprint`: string

Этот параметр задает отпечаток `TLS Client Hello`. Значение по умолчанию — `chrome`. Чтобы вернуться к обычному Go TLS, укажите `unsafe`. При включении Xray через библиотеку uTLS **эмулирует** TLS-отпечаток или генерирует его случайно. Поддерживаются три способа настройки:

1. Отпечатки последних версий популярных браузеров:

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

2. Автоматическая генерация отпечатка при запуске Xray:

- `"random"`: случайно выбирается отпечаток одного из новых браузеров
- `"randomized"`: полностью случайный уникальный отпечаток с полной поддержкой TLS 1.3 и X25519

3. Нативные имена hello-профилей uTLS, например `"HelloRandomizedNoALPN"` или `"HelloChrome_106_Shuffle"`. Полный список см. в [uTLS](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434).

::: tip
Эта функция только **эмулирует** отпечаток `TLS Client Hello`. Остальное поведение и остальные отпечатки остаются такими же, как у Go. Если вам нужна более полная браузерная модель TLS, используйте [Browser Dialer](./websocket.md#browser-dialer).
:::

::: tip
При использовании этой функции некоторые TLS-параметры, влияющие на отпечаток, будут перезаписаны библиотекой uTLS и перестанут действовать.
Параметры, которые все равно передаются: `"serverName" "disableSystemRoot" "pinnedPeerCertSha256" "masterKeyLog"`.

Для ALPN действует особое поведение.

По умолчанию принудительно используется самый распространенный `h2,http/1.1`. Для транспортов WebSocket и HttpUpgrade по умолчанию используется `http/1.1`, иначе согласование `h2` приведет к невозможности подключения. При желании можно вручную установить `h2,http/1.1`, если вы уверены, что сервер поддерживает завершение рукопожатия с таким ALPN.

Если включен ECH, внешний ALPN всегда отображается как `h2,http/1.1`. Внутренний ALPN для WebSocket и HttpUpgrade принудительно устанавливается в `http/1.1`, чтобы рукопожатие могло завершиться; для остальных протоколов соблюдается заданный пользователем ALPN.
:::

> `pinnedPeerCertSha256`: string

Используется для явного задания SHA-256 хеша сертификата удаленной стороны. Используется hex-формат, регистр неважен, например `e8e2d387fdbffeb38e9c9065cf30a97ee23c0e3d32ee6f78ffae40966befccc9`. Можно перечислить несколько значений через `,`; проверка пройдет, если совпадет любое из них.

Этот формат совпадает с SHA-256 fingerprint в просмотрщике сертификатов Chrome и с форматом сертификатных отпечатков на crt.sh. Вычислить его можно командой `xray tls hash --cert <cert.pem>` или через `openssl x509 -noout -fingerprint -sha256 -in cert.pem`; формат OpenSSL с двоеточиями тоже поддерживается. Команда `xray tls ping` также выводит SHA-256 отпечаток удаленного сертификата.

Эта проверка заменяет обычную валидацию сертификата. Возможны два случая:

- Если ядро находит совпавший хеш у leaf-сертификата, проверка сразу считается успешной.
- Если совпавший хеш относится к CA-сертификату, корневому или промежуточному, ядро использует значение `serverName`, чтобы убедиться, что leaf-сертификат подписан именно этим CA.

> `certificates`: \[ [CertificateObject](#certificateobject) \]

Список сертификатов. Каждый элемент представляет один сертификат. Рекомендуется использовать полную цепочку.

::: tip
Если вы хотите получить оценку A или A+ в инструментах вроде ssllibs или myssl, см. [это обсуждение](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `curvePreferences`: [string]

Массив строк, задающий поддерживаемые кривые для ECDHE во время TLS-рукопожатия:

```text
CurveP256
CurveP384
CurveP521
X25519
X25519MLKEM768
SecP256r1MLKEM768*
SecP384r1MLKEM1024*
```

\*: uTLS не поддерживает эти кривые

Начиная с Go 1.26 значение по умолчанию включает все перечисленные кривые. Изменение порядка не заставляет клиента или сервер предпочитать конкретную кривую: фактический выбор происходит обычным механизмом согласования ключей.

> `masterKeyLog`: string

Путь к файлу `(Pre)-Master-Secret`, который можно использовать, например, в Wireshark для расшифровки TLS-соединений Xray.

> `echServerKeys`: string

Параметр только для сервера. Используется для включения Encrypted Client Hello на сервере.

Сгенерировать ECH Server Key и соответствующий Config можно командой `xray tls ech --serverName example.com`. `example.com` — это внешний SNI, который будет виден снаружи после шифрования настоящего SNI, и здесь можно использовать любое значение. В Server Key уже содержится ECHConfig. Если клиентский Config потерян, его можно заново получить через `xray tls ech -i "your server key"`. Публиковать его можно в HTTPS-записи DNS; формат см. [здесь](https://dns.google/query?name=encryptedsni.com&rr_type=HTTPS) или в RFC 9460.

Даже после настройки ECH сервер все равно принимает обычные не-ECH соединения.

> `echConfigList`: string

Параметр только для клиента. Задает ECHConfig. Непустое значение означает, что клиент включает Encrypted Client Hello. Поддерживаются два формата.

Первый — фиксированная строка ECHConfig, например:

`"AF7+DQBaAAAgACA51i3Ssu4wUMV4FNCc8iRX5J+YC4Bhigz9sacl2lCfSQAkAAEAAQABAAIAAQADAAIAAQACAAIAAgADAAMAAQADAAIAAwADAAtleGFtcGxlLmNvbQAA"`

Второй — запрос через DNS-сервер. Например, при использовании CDN можно получать ECHConfig динамически из HTTPS-записей. Если найден корректный ECH Config, Xray будет уважать TTL, который вернул сервер. Целью запроса становится заданный SNI или домен сервера, если SNI пустой и цель — доменное имя.

Базовый формат — `"udp://1.1.1.1"`, то есть получение ECHConfig через UDP DNS 1.1.1.1. Можно также использовать `"https://1.1.1.1/dns-query"` или `h2c://` для DoH или h2c. Во всех случаях можно явно указать порт, например `udp://1.1.1.1:53`. Если порт не указан, используется стандартный для протокола.

Также можно отдельно указать домен для поиска ECHConfig в форме `"example.com+https://1.1.1.1/dns-query"`. Тогда Xray принудительно использует ECHConfig из DNS-записей `example.com`. Это удобно, если вы хотите получать ECHConfig через DNS, но не хотите явно светить HTTPS-запросы к целевому домену.

> `echSockopt`: [SockoptObject](./sockopt.md#sockoptobject)

Настраивает низкоуровневые параметры сокета для соединения, которое используется при DNS-запросе ECH-записей.

### CertificateObject

```json
{
  "ocspStapling": 0,
  "oneTimeLoading": false,
  "usage": "encipherment",
  "buildChain": false,
  "certificateFile": "/path/to/certificate.crt",
  "keyFile": "/path/to/key.key",
  "certificate": [
    "--BEGIN CERTIFICATE--",
    "MIICwDCCAaigAwIBAgIRAO16JMdESAuHidFYJAR/7kAwDQYJKoZIhvcNAQELBQAw",
    "ADAeFw0xODA0MTAxMzU1MTdaFw0xODA0MTAxNTU1MTdaMAAwggEiMA0GCSqGSIb3",
    "DQEBAQUAA4IBDwAwggEKAoIBAQCs2PX0fFSCjOemmdm9UbOvcLctF94Ox4BpSfJ+",
    "3lJHwZbvnOFuo56WhQJWrclKoImp/c9veL1J4Bbtam3sW3APkZVEK9UxRQ57HQuw",
    "OzhV0FD20/0YELou85TwnkTw5l9GVCXT02NG+pGlYsFrxesUHpojdl8tIcn113M5",
    "pypgDPVmPeeORRf7nseMC6GhvXYM4txJPyenohwegl8DZ6OE5FkSVR5wFQtAhbON",
    "OAkIVVmw002K2J6pitPuJGOka9PxcCVWhko/W+JCGapcC7O74palwBUuXE1iH+Jp",
    "noPjGp4qE2ognW3WH/sgQ+rvo20eXb9Um1steaYY8xlxgBsXAgMBAAGjNTAzMA4G",
    "A1UdDwEB/wQEAwIFoDATBgNVHSUEDDAKBggrBgEFBQcDATAMBgNVHRMBAf8EAjAA",
    "MA0GCSqGSIb3DQEBCwUAA4IBAQBUd9sGKYemzwPnxtw/vzkV8Q32NILEMlPVqeJU",
    "7UxVgIODBV6A1b3tOUoktuhmgSSaQxjhYbFAVTD+LUglMUCxNbj56luBRlLLQWo+",
    "9BUhC/ow393tLmqKcB59qNcwbZER6XT5POYwcaKM75QVqhCJVHJNb1zSEE7Co7iO",
    "6wIan3lFyjBfYlBEz5vyRWQNIwKfdh5cK1yAu13xGENwmtlSTHiwbjBLXfk+0A/8",
    "r/2s+sCYUkGZHhj8xY7bJ1zg0FRalP5LrqY+r6BckT1QPDIQKYy615j1LpOtwZe/",
    "d4q7MD/dkzRDsch7t2cIjM/PYeMuzh87admSyL6hdtK0Nm/Q",
    "--END CERTIFICATE--"
  ],
  "key": [
    "--BEGIN RSA PRIVATE KEY--",
    "MIIEowIBAAKCAQEArNj19HxUgoznppnZvVGzr3C3LRfeDseAaUnyft5SR8GW75zh",
    "bqOeloUCVq3JSqCJqf3Pb3i9SeAW7Wpt7FtwD5GVRCvVMUUOex0LsDs4VdBQ9tP9",
    "GBC6LvOU8J5E8OZfRlQl09NjRvqRpWLBa8XrFB6aI3ZfLSHJ9ddzOacqYAz1Zj3n",
    "jkUX+57HjAuhob12DOLcST8np6IcHoJfA2ejhORZElUecBULQIWzjTgJCFVZsNNN",
    "itieqYrT7iRjpGvT8XAlVoZKP1viQhmqXAuzu+KWpcAVLlxNYh/iaZ6D4xqeKhNq",
    "IJ1t1h/7IEPq76NtHl2/VJtbLXmmGPMZcYAbFwIDAQABAoIBAFCgG4phfGIxK9Uw",
    "qrp+o9xQLYGhQnmOYb27OpwnRCYojSlT+mvLcqwvevnHsr9WxyA+PkZ3AYS2PLue",
    "C4xW0pzQgdn8wENtPOX8lHkuBocw1rNsCwDwvIguIuliSjI8o3CAy+xVDFgNhWap",
    "/CMzfQYziB7GlnrM6hH838iiy0dlv4I/HKk+3/YlSYQEvnFokTf7HxbDDmznkJTM",
    "aPKZ5qbnV+4AcQfcLYJ8QE0ViJ8dVZ7RLwIf7+SG0b0bqloti4+oQXqGtiESUwEW",
    "/Wzi7oyCbFJoPsFWp1P5+wD7jAGpAd9lPIwPahdr1wl6VwIx9W0XYjoZn71AEaw4",
    "bK4xUXECgYEA3g2o9WqyrhYSax3pGEdvV2qN0VQhw7Xe+jyy98CELOO2DNbB9QNJ",
    "8cSSU/PjkxQlgbOJc8DEprdMldN5xI/srlsbQWCj72wXxXnVnh991bI2clwt7oYi",
    "pcGZwzCrJyFL+QaZmYzLxkxYl1tCiiuqLm+EkjxCWKTX/kKEFb6rtnMCgYEAx0WR",
    "L8Uue3lXxhXRdBS5QRTBNklkSxtU+2yyXRpvFa7Qam+GghJs5RKfJ9lTvjfM/PxG",
    "3vhuBliWQOKQbm1ZGLbgGBM505EOP7DikUmH/kzKxIeRo4l64mioKdDwK/4CZtS7",
    "az0Lq3eS6bq11qL4mEdE6Gn/Y+sqB83GHZYju80CgYABFm4KbbBcW+1RKv9WSBtK",
    "gVIagV/89moWLa/uuLmtApyEqZSfn5mAHqdc0+f8c2/Pl9KHh50u99zfKv8AsHfH",
    "TtjuVAvZg10GcZdTQ/I41ruficYL0gpfZ3haVWWxNl+J47di4iapXPxeGWtVA+u8",
    "eH1cvgDRMFWCgE7nUFzE8wKBgGndUomfZtdgGrp4ouLZk6W4ogD2MpsYNSixkXyW",
    "64cIbV7uSvZVVZbJMtaXxb6bpIKOgBQ6xTEH5SMpenPAEgJoPVts816rhHdfwK5Q",
    "8zetklegckYAZtFbqmM0xjOI6bu5rqwFLWr1xo33jF0wDYPQ8RHMJkruB1FIB8V2",
    "GxvNAoGBAM4g2z8NTPMqX+8IBGkGgqmcYuRQxd3cs7LOSEjF9hPy1it2ZFe/yUKq",
    "ePa2E8osffK5LBkFzhyQb0WrGC9ijM9E6rv10gyuNjlwXdFJcdqVamxwPUBtxRJR",
    "cYTY2HRkJXDdtT0Bkc3josE6UUDvwMpO0CfAETQPto1tjNEDhQhT",
    "--END RSA PRIVATE KEY--"
  ]
}
```

По умолчанию серверные сертификаты перезагружаются каждые 3600 секунд, то есть раз в час.

> `ocspStapling`: number

Интервал обновления OCSP stapling в секундах. Значение по умолчанию — `0`. Любое ненулевое значение включает OCSP stapling и одновременно заменяет стандартный 3600-секундный интервал горячей перезагрузки сертификата.

> `oneTimeLoading`: true | false

Загрузка только один раз. Значение по умолчанию — `false`. Если установить `true`, отключаются и горячая перезагрузка сертификата, и OCSP stapling.

> `usage`: "encipherment" | "verify" | "issue"

Назначение сертификата. Значение по умолчанию — `"encipherment"`.

- `"encipherment"`: сертификат используется для TLS-аутентификации и шифрования
- `"verify"`: сертификат используется для проверки удаленных TLS-сертификатов; в этом случае он должен быть CA-сертификатом
- `"issue"`: сертификат используется для выпуска других сертификатов; в этом случае он тоже должен быть CA-сертификатом

::: tip TIP 1
В Windows самоподписанный CA-сертификат можно установить в системное хранилище и использовать для проверки удаленных TLS-сертификатов.
:::

::: tip TIP 2
Когда приходит новый запрос клиента и, например, указан `serverName` равный `"xray.com"`, Xray сначала ищет в списке сертификат, подходящий для `"xray.com"`. Если такого нет, используется любой сертификат с `usage: "issue"` для выпуска нового сертификата на `"xray.com"` сроком на один час, после чего этот сертификат добавляется в список для дальнейшего использования.
:::

::: tip TIP 3
Если одновременно заданы `certificateFile` и `certificate`, Xray предпочитает `certificateFile`. То же самое относится к `keyFile` и `key`.
:::

::: tip TIP 4
Если `usage` равно `"verify"`, поля `keyFile` и `key` могут быть пустыми.
:::

::: tip TIP 5
Самоподписанный CA-сертификат можно сгенерировать командой `xray tls cert`.
:::

::: tip TIP 6
Если у вас уже есть домен, бесплатный сторонний сертификат удобно получать через инструменты вроде [acme.sh](https://github.com/acmesh-official/acme.sh).
:::

> `buildChain`: true | false

Действует только если назначение сертификата — `issue`. Если установить `true`, CA-сертификат будет встроен в выпускаемую цепочку сертификатов.

::: tip TIP 1
Корневой сертификат не стоит встраивать в цепочку. Этот параметр уместен только если подписывающий CA является промежуточным сертификатом.
:::

> `certificateFile`: string

Путь к файлу сертификата, например к `.crt`, сгенерированному через OpenSSL.

> `certificate`: [string]

Массив строк с содержимым сертификата в формате, показанном выше. Используйте либо `certificate`, либо `certificateFile`.

> `keyFile`: string

Путь к файлу приватного ключа, например к `.key`, сгенерированному через OpenSSL. Ключи, защищенные паролем, сейчас не поддерживаются.

> `key`: [string]

Массив строк с содержимым приватного ключа в том же формате, что и в примере выше. Используйте либо `key`, либо `keyFile`.
