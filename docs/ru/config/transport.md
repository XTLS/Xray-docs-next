# Способы передачи (uTLS, REALITY)

Способ передачи (transport) — это способ взаимодействия текущего узла Xray с другими узлами.

Транспорт определяет способ передачи данных. Обычно оба конца сетевого подключения должны использовать одинаковый транспорт.
Например, если один конец использует WebSocket, то другой конец также должен использовать WebSocket, иначе соединение не будет установлено.


## StreamSettingsObject

`StreamSettingsObject` соответствует элементу `streamSettings` во входящем или исходящем подключении. Для каждого входящего или исходящего подключения можно настроить различные параметры передачи, и можно использовать `streamSettings` для настройки некоторых параметров передачи.

```json
{
  "network": "raw",
  "security": "none",
  "tlsSettings": {},
  "realitySettings": {},
  "rawSettings": {},
  "kcpSettings": {},
  "wsSettings": {},
  "httpSettings": {},
  "grpcSettings": {},
  "httpupgradeSettings": {},
  "xhttpSettings": {},
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
    "tcpNoDelay": false
  }
}
```

> `network`: "raw" | "ws" | "h2" | "grpc" | "kcp" | "httpupgrade" | "xhttp"

Тип способа передачи, используемого потоком данных соединения, по умолчанию `"raw"`
::: tip
**Начиная с версии v24.9.30**, для более точного отражения фактического поведения, тип передачи `tcp` был переименован в `raw`. Для обеспечения совместимости `"network": "raw"` и `"network": "tcp"`, `rawSettings` и `tcpSettings` являются синонимами.
:::

::: tip
"h2" можно записать как "http", "grpc" можно записать как "gun", "kcp" можно записать как "mkcp".
:::

> `security`: "none" | "tls" | "reality"

Включено ли шифрование транспортного уровня, поддерживаемые опции:

- `"none"` означает отсутствие шифрования (значение по умолчанию)
- `"tls"` означает использование [TLS](https://ru.wikipedia.org/wiki/Протокол_защиты_транспортного_уровня).
- `"reality"` означает использование REALITY.

> `tlsSettings`: [TLSObject](#tlsobject)

Конфигурация TLS. TLS предоставляется Golang, обычно результатом согласования TLS является использование TLS 1.3, DTLS не поддерживается.

> `realitySettings`: [RealityObject](#realityobject)

Конфигурация Reality. Reality — это оригинальная технология Xray. Reality обеспечивает более высокий уровень безопасности, чем TLS, и настраивается так же, как TLS.

::: tip
Reality — это самое безопасное на данный момент решение для шифрования передачи данных, и внешний вид трафика такой же, как и при обычном просмотре веб-страниц. Включение Reality и настройка подходящего режима управления потоком XTLS Vision может повысить производительность в несколько раз или даже в десятки раз.
:::

> `rawSettings`: [RawObject](./transports/raw.md)

Конфигурация TCP для текущего соединения, действительна только если это соединение использует TCP.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Конфигурация mKCP для текущего соединения, действительна только если это соединение использует mKCP.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Конфигурация WebSocket для текущего соединения, действительна только если это соединение использует WebSocket.

> `httpSettings`: [HttpObject](./transports/http.md)

Конфигурация HTTP для текущего соединения, действительна только если это соединение использует HTTP.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Конфигурация gRPC для текущего соединения, действительна только если это соединение использует gRPC.

> `httpupgradeSettings`: [HttpUpgradeObject](./transports/httpupgrade.md)

Конфигурация HTTPUpgrade для текущего соединения, действительна только если это соединение использует HTTPUpgrade.

> `xhttpSettings`: [XHttpObject](./transports/splithttp.md)

Конфигурация XHTTP для текущего соединения, действительна только если это соединение использует XHTTP.

> `sockopt`: [SockoptObject](#sockoptobject)

Конкретные настройки, связанные с прозрачным проксированием.

### TLSObject

```json
{
  "serverName": "xray.com",
  "rejectUnknownSni": false,
  "allowInsecure": false,
  "alpn": ["h2", "http/1.1"],
  "minVersion": "1.2",
  "maxVersion": "1.3",
  "cipherSuites": "Здесь укажите названия необходимых вам наборов шифров, разделяя их двоеточиями",
  "certificates": [],
  "disableSystemRoot": false,
  "enableSessionResumption": false,
  "fingerprint": "",
  "pinnedPeerCertificateChainSha256": [""],
  "curvePreferences": [""],
  "masterKeyLog": ""
}
```

> `serverName`: string

Указывает доменное имя сертификата сервера, полезно, когда соединение устанавливается по IP-адресу.

Если оставить пустым, автоматически используется значение из адреса (если это доменное имя), это значение также используется для проверки действительности сертификата сервера.

::: tip
Как упоминалось выше, поскольку это значение также используется для проверки действительности сертификата сервера, если вы измените его на доменное имя, отличное от доменного имени сертификата сервера, необходимо включить `allowInsecure`, иначе произойдет сбой проверки сертификата. Из соображений безопасности мы не рекомендуем использовать этот метод в течение длительного времени. Если вам нужно безопасно подделать SNI, рассмотрите возможность использования REALITY.

В частности, если клиент устанавливает его в IP-адрес, Xray не будет отправлять SNI, и для использования этой функции также необходимо включить `allowInsecure`.
:::

> `rejectUnknownSni`: bool

Если значение равно `true`, то сервер отклонит рукопожатие TLS, если полученный SNI не соответствует доменному имени сертификата. По умолчанию равно `false`.

> `alpn`: \[ string \]

Массив строк, указывающий значения ALPN, указанные во время рукопожатия TLS. Значение по умолчанию: `["h2", "http/1.1"]`.

> `minVersion`: string

`minVersion` — это минимально допустимая версия TLS.

> `maxVersion`: string

`maxVersion` — это максимально допустимая версия TLS.

> `cipherSuites`: string

`CipherSuites` используется для настройки списка поддерживаемых наборов шифров, разделенных двоеточиями.

Вы можете найти список наборов шифров Golang и их описания [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L500) или [здесь](https://golang.org/src/crypto/tls/cipher_suites.go#L44).

::: danger
Эти два параметра конфигурации не являются обязательными и обычно не влияют на безопасность. Если они не настроены, Golang автоматически выберет их в зависимости от устройства. Если вы не знакомы с ними, пожалуйста, не настраивайте эти параметры, вы несете ответственность за проблемы, вызванные неправильным заполнением.
:::

> `allowInsecure`: true | false

Разрешить ли небезопасные соединения (только для клиента). Значение по умолчанию: `false`.

Если значение равно `true`, то Xray не будет проверять действительность сертификата TLS, предоставленного удаленным хостом.

::: danger
Из соображений безопасности этот параметр не следует устанавливать в значение `true` в реальных сценариях, иначе вы можете подвергнуться атаке типа «человек посередине».
:::

> `disableSystemRoot`: true | false

Отключить ли корневые сертификаты операционной системы. Значение по умолчанию: `false`.

Если значение равно `true`, то Xray будет использовать только сертификаты, указанные в `certificates`, для рукопожатия TLS. Если значение равно `false`, то Xray будет использовать только корневые сертификаты операционной системы для рукопожатия TLS.

> `enableSessionResumption`: true | false

Если этот параметр установлен в `false`, то в ClientHello не будет расширения `session_ticket`. Как правило, программы на языке Go не используют это расширение в ClientHello, поэтому рекомендуется оставить значение по умолчанию. Значение по умолчанию: `false`.

> `fingerprint` : string

Этот параметр используется для настройки указанного отпечатка `TLS Client Hello`. Если значение пустое, эта функция отключена. При включении Xray будет **эмулировать** отпечаток `TLS` через библиотеку uTLS или генерировать его случайным образом. Поддерживаются три режима настройки:

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

- `"random"`: случайный выбор из новых версий браузеров.
- `"randomized"`: полная случайная генерация уникального отпечатка (100% поддержка TLS 1.3 с использованием X25519)

3. Использование имени переменной отпечатка uTLS, например, `"HelloRandomizedNoALPN"` `"HelloChrome_106_Shuffle"`. Полный список см. в [библиотеке uTLS](https://github.com/refraction-networking/utls/blob/master/u_common.go#L434).

::: tip
Эта функция только **эмулирует** отпечаток `TLS Client Hello`, поведение и другие отпечатки такие же, как у Golang. Если вам нужна более полная эмуляция отпечатка и поведения браузера `TLS`, используйте [Browser Dialer](./transports/websocket.md#browser-dialer).
:::

::: tip
При использовании этой функции некоторые параметры TLS, влияющие на отпечаток TLS, будут переопределены библиотекой utls и не будут действовать, например, ALPN.
Передаваемые параметры:
`"serverName" "allowInsecure" "disableSystemRoot" "pinnedPeerCertificateChainSha256" "masterKeyLog"`
:::

> `pinnedPeerCertificateChainSha256`: \[string\]

Используется для указания хэша SHA256 цепочки сертификатов удаленного сервера с использованием стандартного формата кодировки. Соединение TLS может быть успешно установлено только в том случае, если хэш цепочки сертификатов сервера соответствует одному из значений, указанных в настройке.

Если соединение не удалось установить из-за этой конфигурации, будет отображен хэш сертификата удаленного сервера.

**Примечание:** Проверка будет выполняться только после успешной проверки сертификата на действительность. Например, если используется самоподписанный сертификат и он указан здесь, то при неудачной проверке сертификата ядро сразу разорвет соединение и не будет выполнять эту проверку. В подобных случаях можно рассмотреть включение параметра `allowInsecure`, чтобы пропустить проверку подписи, что позволит системе работать корректно.

::: danger
Не рекомендуется использовать этот способ для получения хэша цепочки сертификатов, так как в этом случае не будет возможности проверить, является ли сертификат, предоставленный сервером в данный момент, подлинным, и, следовательно, не гарантируется, что полученный хэш сертификата является ожидаемым.
:::

::: tip
Если вам нужно получить хэш сертификата, запустите `xray tls certChainHash --cert <cert.pem>` из командной строки, где `<cert.pem>` следует заменить на фактический путь к файлу сертификата.
:::

> `certificates`: \[ [CertificateObject](#certificateobject) \]

Список сертификатов, каждый элемент которого представляет собой сертификат (рекомендуется fullchain).

::: tip
Если вам нужно получить оценку A/A+ в ssllibs или myssl,
пожалуйста, обратитесь к [этому](https://github.com/XTLS/Xray-core/discussions/56#discussioncomment-215600).
:::
> `curvePreferences`: \[ string \]  

Массив строк, задающий предпочтительные кривые для выполнения ECDHE во время TLS-рукопожатия. Список поддерживаемых кривых приведён ниже (регистр не имеет значения):  
CurveP256  
CurveP384  
CurveP521  
X25519  
x25519Kyber768Draft00  

Например, установка значения `"curvePreferences":["x25519Kyber768Draft00"]` позволяет включить экспериментальный алгоритм. Поскольку этот алгоритм находится на стадии черновика, данное поле может измениться в любой момент.

> `masterKeyLog` : string

Путь к файлу журнала (Pre)-Master-Secret, который можно использовать для расшифровки TLS-соединений, отправляемых Xray, с помощью Wireshark и других программ, пока не поддерживается для использования с utls.

### RealityObject

```json
{
  "show": false,
  "target": "example.com:443",
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

> `show` : true | false

Если значение равно `true`, выводить отладочную информацию.

::: tip
Ниже приведена конфигурация для **входящего** подключения (**сервера**).
:::

> `target` : string

Обязательный параметр, формат такой же, как у [dest](./features/fallback.md#fallbackobject) в VLESS `fallbacks`.

::: warning
Из соображений маскировки Xray будет **непосредственно перенаправлять** трафик с неудачной аутентификацией (недопустимый запрос REALITY) на `dest`.
Если IP-адрес сайта `dest` особый (например, сайт использует CloudFlare CDN), это равносильно тому, что ваш сервер действует как port forward для CloudFlare, что может привести к злоупотреблению.
Чтобы этого избежать, можно рассмотреть возможность использования Nginx и других методов для фильтрации нежелательных SNI.
:::

> `xver` : number

Необязательный параметр, формат такой же, как у [xver](./features/fallback.md#fallbackobject) в VLESS `fallbacks`.

> `serverNames` : \[string\]

Обязательный параметр, список доступных `serverName` для клиента, подстановочные знаки \* пока не поддерживаются.

Обычно он совпадает с `dest`, фактическое допустимое значение — это любой SNI, принимаемый сервером (в зависимости от конфигурации `dest`), в качестве справки можно использовать [SAN](https://ru.wikipedia.org/wiki/Subject_Alternative_Name) возвращаемого сертификата.

Может содержать пустое значение ```""```, что означает принятие соединений без SNI.

> `privateKey` : string

Обязательный параметр, генерируется с помощью команды `./xray x25519`.

> `minClientVer` : string

Необязательный параметр, минимальная версия Xray клиента, формат: `x.y.z`.

> `maxClientVer` : string

Необязательный параметр, максимальная версия Xray клиента, формат: `x.y.z`.

> `maxTimeDiff` : number

Необязательный параметр, максимально допустимая разница во времени в миллисекундах.

> `shortIds` : \[string\]

Обязательный параметр, список доступных `shortId` для клиента, можно использовать для различения разных клиентов.

Требования к формату см. в `shortId`.

Если содержит пустое значение, `shortId` клиента может быть пустым.

::: tip
Ниже приведена конфигурация для **исходящего** подключения (**клиента**).
:::

> `serverName` : string

Один из `serverNames` сервера.

Если `serverNames` сервера содержит пустое значение, то, как и в случае с TLS, клиент может использовать ```"serverName": "0.0.0.0"``` для установления соединения без SNI. В отличие от TLS, REALITY не требует и не имеет опции разрешения небезопасных соединений для этой функции. При использовании этой функции убедитесь, что `dest` возвращает сертификат по умолчанию при принятии соединений без SNI.

> `fingerprint` : string

Обязательный параметр, такой же, как в [TLSObject](#tlsobject).

> `shortId` : string

Один из `shortIds` сервера.

Длина — 8 байт, то есть 16 шестнадцатеричных цифр (0-f), может быть меньше 16, ядро автоматически добавит 0 в конец, но количество цифр должно быть **четным** (потому что один байт состоит из 2 шестнадцатеричных цифр).

Например, `aa1234` будет автоматически дополнено до `aa12340000000000`, а `aaa1234` приведет к ошибке.

0 также является четным числом, поэтому, если `shordIDs` сервера содержит пустое значение `""`, клиент также может быть пустым.

> `publicKey` : string

Обязательный параметр, открытый ключ, соответствующий закрытому ключу сервера. Генерируется с помощью команды `./xray x25519 -i "закрытый_ключ_сервера"`.

> `spiderX` : string

Начальный путь и параметры для краулера, рекомендуется использовать разные для каждого клиента.

#### CertificateObject

```json
{
  "ocspStapling": 3600,
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

> `ocspStapling`: number

Интервал обновления OCSP-скрепления, совпадает с интервалом перезагрузки сертификата. Единица измерения: секунды. Значение по умолчанию: `3600`, то есть один час.

> `oneTimeLoading`: true | false

Загружать только один раз. Если значение равно `true`, то функция горячей перезагрузки сертификата и функция OCSP-скрепления будут отключены.
::: warning
Если значение равно `true`, то OCSP-скрепление будет отключено.
:::

> `usage`: "encipherment" | "verify" | "issue"

Использование сертификата, значение по умолчанию: `"encipherment"`.

- `"encipherment"`: сертификат используется для аутентификации и шифрования TLS.
- `"verify"`: сертификат используется для проверки сертификата удаленного TLS. При использовании этого значения текущий сертификат должен быть сертификатом ЦС.
- `"issue"`: сертификат используется для выпуска других сертификатов. При использовании этого значения текущий сертификат должен быть сертификатом ЦС.

::: tip СОВЕТ 1
В Windows вы можете установить самоподписанный сертификат ЦС в систему, чтобы проверить сертификат удаленного TLS.
:::

::: tip СОВЕТ 2
Когда поступает новый запрос от клиента, предполагая, что указанный `serverName` равен `"xray.com"`, Xray сначала ищет в списке сертификатов сертификат, который можно использовать для `"xray.com"`, и, если он не найден, использует любой сертификат с `usage`, равным `"issue"`, для выпуска сертификата, подходящего для `"xray.com"`, со сроком действия один час. Новый сертификат будет добавлен в список сертификатов для последующего использования.
:::

::: tip СОВЕТ 3
Если одновременно указаны `certificateFile` и `certificate`, Xray отдает приоритет `certificateFile`. То же самое касается `keyFile` и `key`.
:::

::: tip СОВЕТ 4
Когда `usage` равно `"verify"`, то `keyFile` и `key` могут быть пустыми.
:::

::: tip СОВЕТ 5
Используйте `xray tls cert` для генерации самоподписанного сертификата ЦС.
:::

::: tip СОВЕТ 6
Если у вас уже есть доменное имя, вы можете использовать инструменты для удобного получения бесплатных сторонних сертификатов, например, [acme.sh](https://github.com/acmesh-official/acme.sh).
:::

> `buildChain`: true | false

Вступает в силу только при использовании сертификата `"issue"`, если значение равно `true`, то сертификат ЦС будет встроен в цепочку сертификатов при выпуске сертификата.

::: tip СОВЕТ 1
Не следует встраивать корневой сертификат в цепочку сертификатов. Этот параметр следует включать только при подписании сертификата ЦС в качестве промежуточного сертификата.
:::

> `certificateFile`: string

Путь к файлу сертификата, например, сгенерированному с помощью OpenSSL, с расширением .crt.

> `certificate`: \[ string \]

Массив строк, представляющий содержимое сертификата, формат см. в примере. Используйте либо `certificate`, либо `certificateFile`.

> `keyFile`: string

Путь к файлу ключа, например, сгенерированному с помощью OpenSSL, с расширением .key. В настоящее время не поддерживаются файлы ключей, защищенные паролем.

> `key`: \[ string \]

Массив строк, представляющий содержимое ключа, формат см. в примере. Используйте либо `key`, либо `keyFile`.

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

Целое число. Если значение не равно нулю, то исходящее соединение помечается этим значением с помощью SO_MARK.

- Работает только в Linux.
- Требуются права CAP_NET_ADMIN.

> `tcpMaxSeg`: number

Используется для установки максимального сегмента TCP-пакета (Maximum Segment Size).

> `tcpFastOpen`: true | false | number

Включить  [TCP Fast Open](https://ru.wikipedia.org/wiki/TCP_Fast_Open).

Если значение равно `true` или **положительному целому числу**, то TFO включается; если значение равно `false` или **отрицательному числу**, то TFO принудительно отключается; если параметр отсутствует или равен `0`, то используются настройки системы по умолчанию. Можно использовать как для входящих, так и для исходящих подключений.

- Доступно только в следующих (или более новых) версиях операционных систем:

    - Linux 3.16: требуется настройка параметра ядра `net.ipv4.tcp_fastopen`, который представляет собой битовую маску, где `0x1` означает, что клиент может включать TFO, а `0x2` означает, что сервер может включать TFO; значение по умолчанию — `0x1`, если серверу необходимо включить TFO, установите значение этого параметра ядра в `0x3`.
    - ~~Windows 10 (1607)~~ (реализовано неправильно)
    - Mac OS 10.11 / iOS 9 (требуется тестирование)
    - FreeBSD 10.3 (Server) / 12.0 (Client): необходимо установить параметры ядра `net.inet.tcp.fastopen.server_enabled` и `net.inet.tcp.fastopen.client_enabled` в значение `1`. (Требуется тестирование)

- Для входящих подключений установленное здесь **положительное целое число** представляет собой [максимальное количество ожидающих запросов на подключение TFO](https://tools.ietf.org/html/rfc7413#section-5.1), **обратите внимание, что не все операционные системы поддерживают эту настройку**:

    - Linux / FreeBSD: установленное здесь **положительное целое число** представляет собой максимальное значение, максимально допустимое значение — 2147483647, если установлено значение `true`, то используется значение `256`; обратите внимание, что в Linux `net.core.somaxconn` ограничивает максимальное значение, если оно превышает `somaxconn`, то необходимо также увеличить `somaxconn`.
    - Mac OS: если здесь установлено значение `true` или **положительное целое число**, это означает только включение TFO, максимальное значение необходимо установить отдельно с помощью параметра ядра `net.inet.tcp.fastopen_backlog`.
    - Windows: если здесь установлено значение `true` или **положительное целое число**, это означает только включение TFO.

- Для исходящих подключений установка значения `true` или **положительного целого числа** в любой операционной системе означает только включение TFO.

> `tproxy`: "redirect" | "tproxy" | "off"

Включить ли прозрачное проксирование (только для Linux).

- `"redirect"`: использовать прозрачное проксирование в режиме перенаправления. Поддерживаются все TCP-соединения на основе IPv4/6.
- `"tproxy"`: использовать прозрачное проксирование в режиме TProxy. Поддерживаются все TCP- и UDP-соединения на основе IPv4/6.
- `"off"`: отключить прозрачное проксирование.

Для прозрачного проксирования требуются права root или `CAP\_NET\_ADMIN`.

::: danger
Если в [Dokodemo-door](./inbounds/dokodemo.md) указано `followRedirect: true` и `tproxy` в настройках Sockopt пуст, то значение `tproxy` в настройках Sockopt будет установлено в `"redirect"`.
:::

> `domainStrategy`: "AsIs"<br>
> "UseIP" | "UseIPv6v4" | "UseIPv6" | "UseIPv4v6" | "UseIPv4"<br>
> "ForceIP" | "ForceIPv6v4" | "ForceIPv6" | "ForceIPv4v6" | "ForceIPv4"


В предыдущих версиях, когда Xray пытался установить системное соединение с использованием доменного имени, разрешение доменного имени выполнялось системой и не контролировалось Xray. Это приводило к таким проблемам, как [невозможность разрешить доменные имена в нестандартных средах Linux](https://github.com/v2ray/v2ray-core/issues/1909). Для решения этой проблемы в Xray 1.3.1 в Sockopt был добавлен параметр `domainStrategy` в разделе Freedom.

Значение по умолчанию: `"AsIs"`.

Если целевой адрес представлен доменным именем, можно настроить соответствующее значение. Поведение Freedom в зависимости от настройки следующее:

- При использовании `"AsIs"` Xray будет напрямую использовать встроенную функцию `Dial` из Go для установления соединения, с фиксированным приоритетом, заданным по умолчанию в RFC6724 (игнорируя такие настройки, как `gai.conf`). *(Простыми словами: IPv6 будет использоваться с приоритетом.)*
- При использовании другого значения будет применен [встроенный DNS-сервер](../dns.md) Xray-core для разрешения доменного имени.  
  Если объект `DNSObject` отсутствует, будет использоваться системный DNS. Если существует несколько подходящих IP-адресов, ядро выберет один из них случайным образом.
- `"IPv4"` означает попытку установить соединение, используя только IPv4,  
  `"IPv4v6"` означает попытку соединения с использованием IPv4 или IPv6, но для доменов с двойным стеком будет использоваться IPv4.  
  *(Если поменять местами v4 и v6, логика остается аналогичной)*
- Если во встроенном DNS установлен параметр `"queryStrategy"`, то фактическое поведение будет комбинацией с этим параметром, и будут разрешаться только типы IP-адресов, присутствующие в обоих параметрах. Например:  
 `"queryStrategy": "UseIPv4"` и `"domainStrategy": "UseIP"` фактически эквивалентны `"domainStrategy": "UseIPv4"`.

