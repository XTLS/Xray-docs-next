# Транспорт

Транспорт (transport) - это способ, которым текущий узел Xray взаимодействует с другими узлами.

Транспорт определяет способ передачи данных.  Обычно оба конца сетевого подключения должны использовать одинаковый транспорт.  
Например, если один конец использует WebSocket, то другой конец также должен использовать WebSocket, иначе соединение не будет установлено.

Настройка транспорта (transport) состоит из двух частей:

1. ~~Глобальные настройки ([TransportObject](#transportobject)) (устарело)~~
2. Локальные настройки ([StreamSettingsObject](#streamsettingsobject)).

- Локальные настройки позволяют указать способ передачи данных для каждого отдельного входящего или исходящего подключения.
- Обычно клиент и сервер должны использовать одинаковый транспорт для соответствующих входящих и исходящих подключений.  
    Если в настройках указан тип транспорта, но не указаны конкретные параметры, будут использованы настройки из глобальной конфигурации.

<details>
<summary>Глобальные настройки</summary>


## TransportObject (устарело)

`TransportObject` соответствует полю `transport` в конфигурационном файле.

```json
{
  "transport": {
    "tcpSettings": {},
    "kcpSettings": {},
    "wsSettings": {},
    "httpSettings": {},
    "quicSettings": {},
    "dsSettings": {},
    "grpcSettings": {},
    "httpupgradeSettings": {}
  }
}
```

> `tcpSettings`: [TcpObject](./transports/tcp.md)

Настройки TCP-подключений.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Настройки mKCP-подключений.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Настройки WebSocket-подключений.

> `httpSettings`: [HttpObject](./transports/h2.md)

Настройки HTTP/2-подключений.

> `quicSettings`: [QuicObject](./transports/quic.md)

Настройки QUIC-подключений.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Настройки gRPC-подключений.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Настройки HTTPUpgrade-подключений.

> `splithttpSettings`: [SplitHttpObject](./transports/splithttp.md)

Настройки SplitHTTP-подключений.

> `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

Настройки Domain Socket-подключений.

</details>

## StreamSettingsObject

`StreamSettingsObject` соответствует полю `streamSettings` во входящем или исходящем подключении.  
Каждое входящее или исходящее подключение может иметь свои собственные настройки транспорта.

```json
{
  "network": "tcp",
  "security": "none",
  "tlsSettings": {},
  "tcpSettings": {},
  "kcpSettings": {},
  "wsSettings": {},
  "httpSettings": {},
  "quicSettings": {},
  "dsSettings": {},
  "grpcSettings": {},
  "httpupgradeSettings": {},
  "splithttpSettings": {},
  "sockopt": {
    "mark": 0,
    "tcpMaxSeg": 1440,
    "tcpFastOpen": false,
    "tproxy": "off",
    "domainStrategy": "AsIs",
    "dialerProxy": "",
    "acceptProxyProtocol": false,
    "tcpKeepAliveInterval": 0,
    "tcpKeepAliveIdle": 300,
    "tcpUserTimeout": 10000,
    "tcpCongestion": "bbr",
    "interface": "wg0",
    "v6only": false,
    "tcpWindowClamp": 600,
    "tcpMptcp": false,
    "tcpNoDelay": false,
    "customSockopt": []
  }
}
```

> `network`: "tcp" | "ws" | "h2" | "grpc" | "quic" | "kcp" | "httpupgrade" | "splithttp"

Тип транспорта, используемый для передачи данных.  
Значение по умолчанию - `"tcp"`.

::: tip
"h2" можно записать как "http", "grpc" - как "gun", "kcp" - как "mkcp".
:::

> `security`: "none" | "tls" | "reality"

Включить шифрование транспортного уровня.  
Доступные значения:

- `"none"` - без шифрования (значение по умолчанию).
- `"tls"` - использовать [TLS](https://ru.wikipedia.org/wiki/Transport_Layer_Security).
- `"reality"` - использовать REALITY.

> `tlsSettings`: [TLSObject](#tlsobject)

Настройки TLS.  
TLS предоставляется Golang.  
Обычно в результате согласования TLS используется TLS 1.3, DTLS не поддерживается.

> `realitySettings`: [RealityObject](#realityobject)

Настройки Reality.  
Reality - это оригинальная технология Xray.  
Reality обеспечивает более высокий уровень безопасности, чем TLS, и настраивается аналогично TLS.

::: tip
Reality - это самый безопасный на данный момент способ шифрования транспорта, и внешний трафик выглядит как обычный интернет-трафик.  
Включение Reality и настройка правильного режима управления потоком XTLS Vision может привести к увеличению производительности в несколько раз.
:::

> `tcpSettings`: [TcpObject](./transports/tcp.md)

Настройки TCP для текущего подключения, действуют только при использовании TCP.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Настройки mKCP для текущего подключения, действуют только при использовании mKCP.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Настройки WebSocket для текущего подключения, действуют только при использовании WebSocket.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `httpSettings`: [HttpObject](./transports/h2.md)

Настройки HTTP/2 для текущего подключения, действуют только при использовании HTTP/2.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `quicSettings`: [QUICObject](./transports/quic.md)

Настройки QUIC для текущего подключения, действуют только при использовании QUIC.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Настройки gRPC для текущего подключения, действуют только при использовании gRPC.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `dsSettings`: [DomainSocketObject](./transports/domainsocket.md)

Настройки Domain socket для текущего подключения, действуют только при использовании Domain socket.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Настройки HTTPUpgrade для текущего подключения, действуют только при использовании HTTPUpgrade.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `splithttpSettings`: [SplitHttpObject](./transports/splithttp.md)

Настройки SplitHTTP для текущего подключения, действуют только при использовании SplitHTTP.  
Настройки аналогичны глобальным настройкам, описанным выше.

> `sockopt`: [SockoptObject](#sockoptobject)

Настройки прозрачного прокси.

### TLSObject

```json
{
  "serverName": "xray.com",
  "rejectUnknownSni": false,
  "allowInsecure": false,
  "alpn": ["h2", "http/1.1"],
  "minVersion": "1.2",
  "maxVersion": "1.3",
  "cipherSuites": "список наборов шифров, разделенных двоеточиями",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertificateChainSha256": [""],
  "masterKeyLog": ""
}
```

> `serverName`: string

Доменное имя сертификата сервера.  
Используется, если соединение установлено по IP-адресу.

Если этот параметр не указан, автоматически используется значение из `address` (если это доменное имя).  
Это значение также используется для проверки действительности сертификата сервера.

::: tip
Как упомянуто выше, поскольку это значение также используется для проверки действительности сертификата сервера, если по какой-либо причине вам нужно указать значение, отличное от доменного имени в сертификате сервера, необходимо включить параметр `allowInsecure`, иначе проверка сертификата завершится неудачей.  
Из соображений безопасности мы не рекомендуем использовать этот метод постоянно.  
Если вам нужно безопасно подменить SNI, рассмотрите возможность использования REALITY.

В частности, если на клиенте указан IP-адрес, Xray не будет отправлять SNI.  
Чтобы использовать эту функцию, также необходимо включить `allowInsecure`.
:::

> `rejectUnknownSni`: bool

Если значение равно `true`, сервер отклонит рукопожатие TLS, если полученный SNI не совпадает с доменным именем в сертификате.  
Значение по умолчанию - `false`.

> `alpn`: \[ string \]

Массив строк, указывающий значения ALPN, используемые при рукопожатии TLS.  
Значение по умолчанию - `["h2", "http/1.1"]`.

> `minVersion`: string

Минимальная допустимая версия TLS.

> `maxVersion`: string

Максимальная допустимая версия TLS.

> `cipherSuites`: string

Список поддерживаемых наборов шифров, разделенных двоеточиями.

Список наборов шифров Golang и их описания можно найти [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L500) или [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
Эти два параметра не являются обязательными и обычно не влияют на безопасность.  
Если они не настроены, Golang автоматически выбирает их в зависимости от устройства.  
Если вы не знакомы с этими параметрами, не настраивайте их.  
Вы несете ответственность за любые проблемы, вызванные неправильной настройкой.
:::

> `allowInsecure`: true | false

Разрешить небезопасные соединения (только для клиентов).  
Значение по умолчанию - `false`.

Если значение равно `true`, Xray не будет проверять действительность сертификата TLS, предоставленного удаленным хостом.

::: danger
Из соображений безопасности не рекомендуется устанавливать этот параметр в `true` в реальных сценариях, так как это может сделать вас уязвимыми для атак типа "человек посередине".
:::

> `disableSystemRoot`: true | false

Отключить использование корневых сертификатов, предоставляемых операционной системой.  
Значение по умолчанию - `false`.

Если значение равно `true`, Xray будет использовать только сертификаты, указанные в `certificates`, для рукопожатия TLS.  
Если значение равно `false`, Xray будет использовать только корневые сертификаты, предоставляемые операционной системой, для рукопожатия TLS.

> `enableSessionResumption`: true | false

Если этот параметр установлен в `false`, расширение `session_ticket` не будет включено в ClientHello.  
Обычно программы на Golang не используют это расширение в ClientHello, поэтому рекомендуется оставить значение по умолчанию.  
Значение по умолчанию - `false`.

> `fingerprint`: string

Этот параметр используется для настройки отпечатка `TLS Client Hello`.  
Если значение пустое, эта функция отключена.  
Если эта функция включена, Xray будет **эмулировать** отпечаток `TLS` с помощью библиотеки uTLS или генерировать его случайным образом.  
Поддерживаются три способа настройки:

1. Отпечатки TLS последних версий популярных браузеров, включая:

- `"chrome"`
- `"firefox"`
- `"safari"`
- `"ios"`
- `"android"`
- `"edge"`
- `"360"`
- `"qq"`

2. Автоматическая генерация отпечатка при запуске Xray:

- `"random"`: случайный выбор из отпечатков последних версий браузеров.
- `"randomized"`: генерация полностью случайного уникального отпечатка (100% поддержка TLS 1.3 с использованием X25519).

3. Использование имен переменных отпечатков uTLS, например, `"HelloRandomizedNoALPN"`, `"HelloChrome_106_Shuffle"`.  
    Полный список см. в [библиотеке uTLS](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434).

::: tip
Эта функция только **эмулирует** отпечаток `TLS Client Hello`, поведение и другие отпечатки такие же, как у Golang.  
Если вам нужно более полно эмулировать отпечаток `TLS` и поведение браузера, используйте [Browser Dialer](./transports/websocket.md#browser-dialer).
:::

> `pinnedPeerCertificateChainSha256`: \[string\]

SHA256-хэш цепочки сертификатов удаленного сервера в стандартном формате кодировки.  
Соединение TLS будет успешно установлено, только если хэш цепочки сертификатов сервера совпадает с одним из значений в этом списке.

Если соединение не удалось установить из-за этой настройки, будет показан хэш цепочки сертификатов удаленного сервера.

::: danger
Не рекомендуется использовать этот способ для получения хэша цепочки сертификатов, так как в этом случае у вас не будет возможности проверить, является ли сертификат, предоставленный сервером, подлинным, и поэтому вы не можете гарантировать, что полученный хэш сертификата будет ожидаемым.
:::

::: tip
Если вам нужно получить хэш сертификата, запустите команду `xray tls certChainHash --cert <cert.pem>` в командной строке, где `<cert.pem>` - это путь к файлу сертификата.
:::

> `certificates`: \[ [CertificateObject](#certificateobject) \]

Список сертификатов, каждый элемент которого представляет собой сертификат (рекомендуется использовать fullchain).

::: tip
Если вам нужно получить оценку A/A+ в ssllibs или myssl, см. [здесь](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::

> `masterKeyLog` : string

Путь к файлу журнала (pre)-master-secret, который можно использовать для расшифровки TLS-соединений, отправляемых Xray, в таких программах, как Wireshark.  
Пока не поддерживается совместное использование с utls.  
Требуется Xray-Core v1.8.7.

### RealityObject

```json
{
  "show": false,
  "dest": "example.com:443",
  "xver": 0,
  "serverNames": ["example.com", "www.example.com"],
  "privateKey": "",
  "minClientVer": "",
  "maxClientVer": "",
  "maxTimeDiff": 0,
  "shortIds": ["", "0123456789abcdef"],
  "fingerprint": "chrome",
  "serverName": "",
  "publicKey": "",
  "shortId": "",
  "spiderX": ""
}
```

::: tip
Дополнительную информацию см. в проекте [REALITY](https://github.com/XTLS/REALITY).
:::

> `show`: true | false

Если значение равно `true`, выводить отладочную информацию.

::: tip
Настройки для **входящего** подключения (**сервер**).
:::

> `dest`: string

Обязательный параметр, формат такой же, как у `dest` в `fallbacks` для VLESS [dest](./features/fallback.md#fallbackobject).

::: warning
Для лучшей маскировки Xray **напрямую перенаправляет** трафик, не прошедший аутентификацию Reality (незаконные запросы Reality), на `dest`.  
Если IP-адрес сайта `dest` является особенным (например, сайт использует CDN CloudFlare), то ваш сервер будет действовать как переадресатор портов для CloudFlare, что может привести к утечке трафика после сканирования.  
Чтобы избежать этого, можно использовать Nginx или другие средства для фильтрации нежелательных SNI.
:::

> `xver`: number

Необязательный параметр, формат такой же, как у `xver` в `fallbacks` для VLESS [xver](./features/fallback.md#fallbackobject).

> `serverNames`: \[string\]

Обязательный параметр, список допустимых `serverName` для клиентов.  
Пока не поддерживаются подстановочные знаки \*.

Обычно это значение совпадает с `dest`.  
Фактически допустимыми значениями являются любые SNI, принимаемые сервером (в зависимости от конфигурации `dest`).  
В качестве ориентира можно использовать [SAN](https://ru.wikipedia.org/wiki/Subject_Alternative_Name) возвращаемого сертификата.

Может содержать пустое значение `""`, что означает прием подключений без SNI.

> `privateKey`: string

Обязательный параметр, сгенерируйте его, выполнив команду `./xray x25519`.

> `minClientVer`: string

Необязательный параметр, минимальная версия Xray на клиенте, формат: `x.y.z`.

> `maxClientVer`: string

Необязательный параметр, максимальная версия Xray на клиенте, формат: `x.y.z`.

> `maxTimeDiff`: number

Необязательный параметр, максимально допустимая разница во времени в миллисекундах.

> `shortIds`: \[string\]

Обязательный параметр, список допустимых `shortId` для клиентов, которые можно использовать для различения разных клиентов.

Состоит из символов от 0 до f, длина должна быть кратна 2, максимальная длина - 16.

Если список содержит пустое значение, `shortId` на клиенте может быть пустым.

::: tip
Настройки для **исходящего** подключения (**клиент**).
:::

> `serverName`: string

Одно из значений `serverNames` на сервере.

Если `serverNames` на сервере содержит пустое значение, на клиенте можно использовать `"serverName": "0.0.0.0"`, как и в TLS, для установления соединения без SNI.  
В отличие от TLS, в REALITY для использования этой функции не нужно включать параметр `allowInsecure`.  
При использовании этой функции убедитесь, что `dest` возвращает сертификат по умолчанию при приеме соединений без SNI.

> `fingerprint`: string

Обязательный параметр, такой же, как в [TLSObject](#tlsobject).

> `shortId`: string

Одно из значений `shortIds` на сервере.

Состоит из символов от 0 до f, длина должна быть кратна 2, максимальная длина - 16.

Если `shordIDs` на сервере содержит пустое значение, этот параметр на клиенте может быть пустым.

> `publicKey`: string

Обязательный параметр, открытый ключ, соответствующий закрытому ключу сервера.  
Сгенерируйте его с помощью команды `./xray x25519 -i "закрытый ключ сервера"`.

> `spiderX`: string

Начальный путь и параметры для краулера, рекомендуется использовать разные значения для каждого клиента.

#### CertificateObject

```json
{
  "ocspStapling": 3600,
  "oneTimeLoading": false,
  "usage": "encipherment",
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

> `ocspStapling`: number

Интервал обновления OCSP-стейплинга.  
Совпадает с интервалом перезагрузки сертификата.  
Единица измерения: секунды.  
Значение по умолчанию - `3600` (1 час).

> `oneTimeLoading`: true | false

Загрузить только один раз.  
Если значение равно `true`, функция перезагрузки сертификата и OCSP-стейплинга отключаются.

::: warning
Если значение равно `true`, OCSP-стейплинг будет отключен.
:::

> `usage`: "encipherment" | "verify" | "issue"

Назначение сертификата.  
Значение по умолчанию - `"encipherment"`.

- `"encipherment"`: сертификат используется для аутентификации и шифрования TLS.
- `"verify"`: сертификат используется для проверки сертификата удаленного TLS-сервера.  
    При использовании этого значения текущий сертификат должен быть сертификатом ЦС.
- `"issue"`: сертификат используется для выпуска других сертификатов.  
    При использовании этого значения текущий сертификат должен быть сертификатом ЦС.

::: tip Совет 1
В Windows можно установить самозаверяющий сертификат ЦС в систему, чтобы проверять сертификаты удаленных TLS-серверов.
:::

::: tip Совет 2
При получении нового запроса от клиента, если указанный `serverName` равен `"xray.com"`, Xray сначала ищет в списке сертификатов сертификат, который можно использовать для `"xray.com"`.  
Если подходящий сертификат не найден, Xray использует любой сертификат с `usage` = `"issue"` для выпуска нового сертификата для `"xray.com"` со сроком действия один час.  
Новый сертификат добавляется в список сертификатов для последующего использования.
:::

::: tip Совет 3
Если указаны и `certificateFile`, и `certificate`, Xray использует `certificateFile`.  
То же самое относится к `keyFile` и `key`.
:::

::: tip Совет 4
Если `usage` равен `"verify"`, `keyFile` и `key` могут быть пустыми.
:::

::: tip Совет 5
Можно сгенерировать самозаверяющий сертификат ЦС с помощью команды `xray tls cert`.
:::

::: tip Совет 6
Если у вас есть доменное имя, вы можете легко получить бесплатный сторонний сертификат с помощью таких инструментов, как [acme.sh](https://github.com/acmesh-official/acme.sh).
:::

> `certificateFile`: string

Путь к файлу сертификата, например, сертификат, сгенерированный OpenSSL, с расширением .crt.

> `certificate`: \[ string \]

Массив строк, представляющий содержимое сертификата, как показано в примере.  
`certificate` и `certificateFile` - взаимоисключающие параметры.

> `keyFile`: string

Путь к файлу ключа, например, ключ, сгенерированный OpenSSL, с расширением .key.  
В настоящее время не поддерживаются файлы ключей, защищенные паролем.

> `key`: \[ string \]

Массив строк, представляющий содержимое ключа, как показано в примере.  
`key` и `keyFile` - взаимоисключающие параметры.

### SockoptObject

```json
{
  "mark": 0,
  "tcpMaxSeg": 1440,
  "tcpFastOpen": false,
  "tproxy": "off",
  "domainStrategy": "AsIs",
  "dialerProxy": "",
  "acceptProxyProtocol": false,
  "tcpKeepAliveInterval": 0,
  "tcpKeepAliveIdle": 300,
  "tcpUserTimeout": 10000,
  "tcpcongestion": "bbr",
  "interface": "wg0",
  "V6Only": false,
  "tcpWindowClamp": 600,
  "tcpMptcp": false,
  "tcpNoDelay": false,
  "customSockopt": []
}
```

> `mark`: number

Целое число.  
Если значение не равно нулю, исходящее соединение будет помечено этим значением SO_MARK.

- Работает только в Linux.
- Требуются права CAP_NET_ADMIN.

> `tcpMaxSeg`: number

Устанавливает максимальный размер сегмента TCP (MSS).

> `tcpFastOpen`: true | false | number

Включить [TCP Fast Open](https://ru.wikipedia.org/wiki/TCP_Fast_Open) (TFO).

Если значение равно `true` или **положительному целому числу**, TFO включен.  
Если значение равно `false` или **отрицательному числу**, TFO принудительно отключен.  
Если этот параметр не указан или равен `0`, используются настройки системы по умолчанию.  
Может использоваться как для входящих, так и для исходящих подключений.

- Доступно только в следующих (или более поздних) версиях операционных систем:

  - Linux 3.16: требуется настроить параметр ядра `net.ipv4.tcp_fastopen`.  
      Этот параметр представляет собой битовую маску, где `0x1` означает, что TFO разрешен для клиентов, а `0x2` - для серверов.  
      Значение по умолчанию - `0x1`.  
      Если вы хотите включить TFO на сервере, установите значение этого параметра ядра в `0x3`.
  - ~~Windows 10 (1607)~~ (неправильная реализация).
  - Mac OS 10.11 / iOS 9 (требуется тестирование).
  - FreeBSD 10.3 (сервер) / 12.0 (клиент): необходимо установить параметры ядра `net.inet.tcp.fastopen.server_enabled` и `net.inet.tcp.fastopen.client_enabled` в `1`.  
      (Требуется тестирование.)

- Для входящих подключений указанное здесь **положительное целое число** представляет собой [максимальное количество ожидающих запросов на подключение TFO](https://tools.ietf.org/html/rfc7413#section-5.1).  
    **Обратите внимание, что не все операционные системы поддерживают эту настройку:**

  - Linux / FreeBSD: указанное здесь **положительное целое число** представляет собой максимальное значение, максимальное допустимое значение - 2147483647.  
      Если значение равно `true`, используется значение `256`.  
      Обратите внимание, что в Linux параметр `net.core.somaxconn` ограничивает максимальное      значение этого параметра.  
      Если значение превышает `somaxconn`, увеличьте `somaxconn`.
  - Mac OS: если значение равно `true` или **положительному целому числу**, это означает только, что TFO включен.  
      Максимальное значение нужно настроить отдельно с помощью параметра ядра `net.inet.tcp.fastopen_backlog`.
  - Windows: если значение равно `true` или **положительному целому числу**, это означает только, что TFO включен.

- Для исходящих подключений значение `true` или **положительное целое число** означает только, что TFO включен, во всех операционных системах.

> `tproxy`: "redirect" | "tproxy" | "off"

Включить прозрачное проксирование (только для Linux).

- `"redirect"`: использовать прозрачное проксирование в режиме Redirect.  
    Поддерживаются все TCP- и UDP-соединения на основе IPv4/6.
- `"tproxy"`: использовать прозрачное проксирование в режиме TProxy.  
    Поддерживаются все TCP- и UDP-соединения на основе IPv4/6.
- `"off"`: отключить прозрачное проксирование.

Для прозрачного проксирования требуются права root или `CAP\_NET\_ADMIN`.

::: danger
Если в [Dokodemo-door](./inbounds/dokodemo.md) параметр `followRedirect` установлен в `true`, а параметр `tproxy` в Sockopt не указан, значение `tproxy` в Sockopt будет установлено в `"redirect"`.
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"


В предыдущих версиях, когда Xray пытался установить системное соединение с использованием доменного имени, разрешение доменного имени выполнялось системой и не контролировалось Xray.  
Это приводило к таким проблемам, как [невозможность разрешения доменных имен в нестандартных средах Linux](https://github.com/v2ray/v2ray-core/issues/1909).  
Чтобы решить эту проблему, в Xray 1.3.1 был добавлен параметр `domainStrategy` в Sockopt, аналогичный параметру в Freedom.

Значение по умолчанию - `"AsIs"`.

При использовании доменного имени в качестве целевого адреса поведение Freedom зависит от значения этого параметра:

- `"AsIs"`: Xray будет использовать системный стек для установления соединения, приоритет и выбор IP-адреса зависят от настроек системы.
- При указании других значений будет использоваться [встроенный DNS-сервер](../dns.md) Xray-core для разрешения доменного имени.  
    Если `DnsObject` не настроен, будет использоваться системный DNS.  
    Если для домена найдено несколько подходящих IP-адресов, ядро случайным образом выберет один из них в качестве целевого IP-адреса.
- `"IPv4"` - попытаться использовать только IPv4 для подключения, `"IPv4v6"` - попытаться использовать IPv4 или IPv6, но для доменов с двумя стеками отдать предпочтение IPv4.  
    (То же самое относится к `IPv6v4`, не будем повторяться.)
- Если в настройках встроенного DNS указан параметр `"queryStrategy"`, фактическое поведение будет определяться пересечением этих двух параметров, будут разрешены только IP-адреса тех типов, которые указаны в обоих параметрах.  
    Например, если `"queryStrategy": "UseIPv4"` и `"domainStrategy": "UseIP"`, это фактически эквивалентно `"domainStrategy": "UseIPv4"`.
- Если используется значение, начинающееся с `"Use"`, и результат разрешения не соответствует требованиям (например, у домена есть только IPv4-адрес, но используется `UseIPv6`), Xray переключится на `AsIs`.
- Если используется значение, начинающееся с `"Force"`, и результат разрешения не соответствует требованиям, соединение не будет установлено.

::: tip Совет
При использовании режимов `"UseIP"` и `"ForceIP"` и указании `sendThrough` в [настройках исходящего подключения](../outbound.md#outboundobject) Freedom автоматически определит необходимый тип IP-адреса (IPv4 или IPv6) на основе значения `sendThrough`.  
Если вручную указан один тип IP-адреса (например, `UseIPv4`), но он не совпадает с локальным адресом, указанным в `sendThrough`, соединение не будет установлено.
:::

::: danger

Неправильная настройка этой функции может привести к бесконечному циклу.

Коротко говоря: для подключения к серверу нужно дождаться результата DNS-запроса, а для завершения DNS-запроса нужно подключиться к серверу.

> Тони: Что было раньше, курица или яйцо?

Подробное объяснение:

1. Условия возникновения: прокси-сервер (proxy.com), встроенный DNS-сервер, не локальный режим.
2. **Перед** установлением TCP-соединения с proxy.com Xray пытается разрешить proxy.com с помощью встроенного DNS-сервера.
3. Встроенный DNS-сервер устанавливает соединение с dns.com и отправляет запрос для получения IP-адреса proxy.com.
4. **Неправильные** правила маршрутизации приводят к тому, что proxy.com проксирует запрос, отправленный на шаге 3.
5. Xray пытается установить еще одно TCP-соединение с proxy.com.
6. Перед установлением соединения Xray пытается разрешить proxy.com с помощью встроенного DNS-сервера.
7. Встроенный DNS-сервер повторно использует соединение, установленное на шаге 3, и отправляет запрос.
8. Возникает проблема: установление соединения на шаге 3 ожидает результата запроса на шаге 7, а завершение запроса на шаге 7 ожидает полного установления соединения на шаге 3.
9. Игра окончена!

Решения:

- Изменить правила разделения трафика для встроенного DNS-сервера.
- Использовать Hosts.
- ~~Если вы все еще не знаете, как решить эту проблему, не используйте эту функцию.~~

Поэтому **не рекомендуется** неопытным пользователям использовать эту функцию без необходимости.
:::

> `dialerProxy`: ""

Тег исходящего прокси.  
Если значение не пустое, исходящие соединения будут устанавливаться через указанное исходящее подключение.  
Этот параметр можно использовать для цепочечной пересылки с поддержкой транспорта.

::: danger
Этот параметр несовместим с `ProxySettingsObject.Tag`.
:::

> `acceptProxyProtocol`: true | false

Только для входящих подключений.  
Указывает, следует ли принимать PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) используется для передачи реального IP-адреса и порта источника запроса.  
**Если вы не знакомы с ним, пропустите этот параметр.**

Распространенные обратные прокси (например, HAProxy, Nginx) можно настроить на отправку PROXY protocol, VLESS fallbacks xver также может отправлять его.

Если значение равно `true`, то после установления TCP-соединения на самом нижнем уровне отправитель запроса должен сначала отправить PROXY protocol v1 или v2, иначе соединение будет разорвано.

> `tcpKeepAliveInterval`: number

Интервал между отправкой пакетов TCP keep-alive в секундах.  ~~Работает только в Linux.~~

Это keep-alive-пакеты, отправляемые при ненормальном состоянии соединения (не получен ACK).

Если этот параметр не указан или равен 0, используется значение по умолчанию Golang.

::: tip
Если указать отрицательное значение, например `-1`, TCP keep-alive будет отключен.
:::

> `tcpKeepAliveIdle`: number

Порог простоя TCP-соединения в секундах.  
Keep-alive-пакеты будут отправляться, когда время простоя TCP-соединения достигнет этого порога.

Это keep-alive-пакеты, отправляемые при нормальном состоянии соединения.

Если этот параметр не указан или равен 0, используется значение по умолчанию Golang.

::: tip
Если указать отрицательное значение, например `-1`, TCP keep-alive будет отключен.
:::

> `tcpUserTimeout`: number

Измеряется в миллисекундах.  
Подробнее: https://github.com/grpc/proposal/blob/master/A18-tcp-user-timeout.md

> `tcpcongestion`: ""

Алгоритм управления перегрузкой TCP.  
Поддерживается только в Linux.  
Если этот параметр не указан, используется значение по умолчанию системы.

::: tip Распространенные алгоритмы

- bbr (рекомендуется)
- cubic
- reno

:::

::: tip
Выполните команду `sysctl net.ipv4.tcp_congestion_control`, чтобы узнать значение по умолчанию системы.
:::

> `interface`: ""

Имя сетевого интерфейса, к которому нужно привязаться.  
Поддерживается в Linux / iOS / Mac OS / Windows.<br>
Для iOS / Mac OS требуется Xray-core v1.8.6 или более поздней версии.<br>
Для Windows требуется Xray-core v1.8.7 или более поздней версии.

> `V6Only`: true | false

Если значение равно `true`, адрес `::` будет принимать только IPv6-соединения.  
Поддерживается только в Linux.

> `tcpWindowClamp`: number

Привязать размер рекламируемого окна к этому значению.  
Ядро выберет максимальное значение между этим значением и SOCK_MIN_RCVBUF/2.

> `tcpMptcp`: true | false

Новый параметр в Xray-core v1.8.6.<br>
Значение по умолчанию - `false`.  
Если значение равно `true`, включить [Multipath TCP](https://ru.wikipedia.org/wiki/Multipath_TCP).  
Этот параметр нужно включить как на сервере, так и на клиенте.  
В настоящее время поддерживается только в Linux, требуется ядро Linux версии 5.6 или выше.

> `tcpNoDelay`: true | false

Значение по умолчанию - `false`.  
Рекомендуется включать вместе с `"tcpMptcp": true`.

> `customSockopt`: []

Массив, позволяющий опытным пользователям указать любые необходимые параметры sockopt.  
Теоретически все настройки, связанные с подключением, описанные выше, можно настроить с помощью этого параметра.  
Вы также можете настроить другие параметры, доступные в Linux, но не добавленные в ядро, например, следующий пример эквивалентен `"tcpcongestion": "bbr"` в ядре.

Перед использованием убедитесь, что вы понимаете принципы программирования сокетов в Linux.

```json
"customSockopt": [
  {
    "type": "str",
    "level":"6",
    "opt": "13",
    "value": "bbr"
  }
]
```

> `type`: ""

Обязательный параметр, тип настройки, в настоящее время доступны `int` и `str`.

> `level`: ""

Необязательный параметр, уровень протокола, используемый для указания области действия.  
Значение по умолчанию - `6` (TCP).

> `opt`: ""

Название настраиваемого параметра в десятичном формате (в этом примере используется значение TCP_CONGESTION, которое равно 0xd в шестнадцатеричном формате и 13 в десятичном формате).

> `value`: ""

Значение, которое нужно установить.  
В этом примере используется значение `bbr`.

Если `type` равен `int`, значение должно быть десятичным числом.





