# FinalMask

FinalMask добавляет последний слой маскировки после того, как ядро уже обработало шифрование транспортного уровня, включая TLS и REALITY.

Его можно использовать для разных видов маскировки TCP- и UDP-трафика, а также для настройки параметров QUIC.

## FinalMaskObject

`FinalMaskObject` соответствует полю `finalmask` в [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // пример для outbound, аналогично применимо к inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        // [!code focus:33]
        "finalmask": {
          "tcp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "udp": [
            {
              "type": "",
              "settings": {}
            }
          ],
          "quicParams": {
            "congestion": "force-brutal",
            "bbrProfile": "standard",
            "debug": false,
            "brutalUp": "60 mbps",
            "brutalDown": 0,
            "udpHop": {
              "ports": "20000-50000",
              "interval": "5-10"
            },
            "initStreamReceiveWindow": 8388608,
            "maxStreamReceiveWindow": 8388608,
            "initConnectionReceiveWindow": 20971520,
            "maxConnectionReceiveWindow": 20971520,
            "maxIdleTimeout": 30,
            "keepAlivePeriod": 0,
            "disablePathMTUDiscovery": false,
            "maxIncomingStreams": 1024
          }
        }
      }
    }
  ]
}
```

## TCPMask

Массив для маскировки TCP-трафика, исходящего из ядра. Первый элемент массива является самым внешним слоем маскировки.

```json
{
  "finalmask": {
    // [!code focus:6]
    "tcp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: header-custom | fragment | sudoku

Тип этого слоя маскировки.

> `settings`: header-custom | fragment | sudoku

Конкретные настройки для этого типа маскировки. Поля каждого типа приведены ниже.

### header-custom

```json
{
  "clients": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ],
  "servers": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ],
  "errors": [
    [
      {
        "delay": 0,
        "rand": 0,
        "randRange": "0-255",
        "type": "",
        "packet": []
      }
    ]
  ]
}
```

`clients[n][m].delay`: задержка в миллисекундах. Если значение равно `0`, данные отправляются слитно с предыдущим пакетом.

`clients[n][m].rand`: добавляет указанное количество случайных байтов. Несовместимо с `packet`.

`clients[n][m].randRange`: диапазон значений случайных байтов. По умолчанию `0-255`.

`clients[n][m].type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию - `array`.

`clients[n][m].packet`: добавляет фиксированные данные. Несовместимо с `rand`.

### fragment

```json
{
  "packets": "tlshello",
  "length": "100-200",
  "delay": "10-20",
  "maxSplit": "3-6"
}
```

Управляет исходящей TCP-фрагментацией. В некоторых случаях это может обмануть системы цензуры, например помочь обойти SNI-блоклисты.

`"length"`, `"delay"` и `"maxSplit"` имеют тип [Int32Range](../../development/intro/guide.md#int32range).

`"packets"`: поддерживаются два режима фрагментации. `"1-3"` разрезает TCP-поток и применяется к 1-й, 2-й и 3-й операциям записи клиента. `"tlshello"` фрагментирует пакет TLS-рукопожатия.

`"length"`: длина фрагмента в байтах. Не может быть `0`.

`"delay"`: интервал между фрагментами в миллисекундах.

Если значение равно `0` и задано `"packets": "tlshello"`, фрагментированный Client Hello будет отправлен в одном TCP-пакете, если его исходный размер не превышает MSS или MTU и система не фрагментирует его автоматически.

`"maxSplit"`: максимальное количество фрагментов. Ограничивает, на сколько частей можно разделить один пакет. `0` означает без ограничений.

### sudoku

```json
{
  "password": "",
  "ascii": "",

  "customTable": "", // в upstream-документации поле называется custom_table
  "customTables": [""], // в upstream-документации поле называется custom_tables

  "paddingMin": 0, // в upstream-документации поле называется padding_min
  "paddingMax": 0 // в upstream-документации поле называется padding_max
}
```

Значение этих полей см. в [upstream-документации](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.md).

## UDPMask

Массив для маскировки UDP-трафика, исходящего из ядра. Первый элемент массива является самым внешним слоем маскировки.

```json
{
  "finalmask": {
    // [!code focus:6]
    "udp": [
      {
        "type": "",
        "settings": {}
      }
    ]
  }
}
```

> `type`: header-custom | header-dns | header-dtls | header-srtp | header-utp | header-wechat | header-wireguard | mkcp-original | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

Тип этого слоя маскировки.

> `settings`: header-custom | header-dns | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

Конкретные настройки для этого типа маскировки. Поля каждого типа приведены ниже.

### header-custom

Всегда объединяется с заголовком пакета.

```json
{
  "client": [
    {
      "rand": 0,
      "randRange": "0-255",
      "type": "",
      "packet": []
    }
  ],
  "server": [
    {
      "rand": 0,
      "randRange": "0-255",
      "type": "",
      "packet": []
    }
  ]
}
```

`client[n].rand`: добавляет указанное количество случайных байтов. Несовместимо с `packet`.

`client[n].randRange`: диапазон значений случайных байтов. По умолчанию `0-255`.

`client[n].type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию - `array`.

`client[n].packet`: добавляет фиксированные данные. Несовместимо с `rand`.

### mkcp-legacy

```json
{
  "header": "", // dns dtls srtp utp wechat wireguard
  "value": "" // password domain
}
```

`header`: empty for original & aes128gcm

`value`: empty for original

### noise

Шум, отправляемый перед реальными данными.

```json
{
  "reset": "30-60",
  "noise": [
    {
      "rand": "1-8192",
      "randRange": "0-255",
      "type": "",
      "packet": [],
      "delay": "10-20"
    }
  ]
}
```

`reset`: значение типа [Int32Range](../../development/intro/guide.md#int32range) в секундах. После отправки шума состояние сбрасывается через указанное время, и шум можно снова отправить на тот же адрес. `0` означает не сбрасывать, то есть отправить только один раз.

`rand`: добавляет случайные байты или случайные байты заданной длины. Несовместимо с `packet`.

`randRange`: диапазон значений случайных байтов. По умолчанию `0-255`.

`type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию - `array`.

`packet`: добавляет фиксированные данные. Несовместимо с `rand`.

`delay`: задержка в миллисекундах. После отправки одного элемента шума Xray ждёт указанное время перед отправкой следующего.

### salamander

Обфускация Salamander. Используется в Hysteria2.

```json
{
  "password": "your-password"
}
```

### sudoku

```json
{
  "password": "",
  "ascii": "",

  "customTable": "",
  "customTables": [""],

  "paddingMin": 0,
  "paddingMax": 0
}
```

Значения те же, что и в TCP-версии.

### xdns

Использует DNS-запросы для передачи данных, подобно DNSTT. Для переноса полезной нагрузки выполняются стандартные DNS-запросы; поддерживаются типы TXT, A и AAAA.

Из-за технических ограничений эффективный MTU очень мал, QUIC использовать нельзя, поэтому рекомендуется сочетать этот режим с mKCP. Рекомендуемые значения MTU: на клиенте 130; на сервере 900 для TXT, который почти передаёт исходные байты, для AAAA разумно уменьшить значение примерно до половины или ниже, а для A - примерно до одной восьмой или ниже. Теоретическая эффективность кодирования различается, а реальные значения зависят от того, сколько AAAA- или A-записей промежуточные форвардеры готовы терпеть в ответах.

Поскольку выполняются стандартные запросы, они могут пересылаться через любой UDP DNS-сервер, хотя эффективность может быть очень низкой.

Чтобы использовать эту функцию, сервер должен слушать порт 53, затем прокси-протокол должен указывать на DNS-сервер, например `8.8.8.8:53`, и у вас должен быть домен из `domains`, после чего его NS-запись нужно направить на сервер.

Например, если у вас есть `example.com`, задайте A-запись `a.example.com`, указывающую на IP сервера, затем задайте NS-запись `t.example.com`, указывающую на `t.example.com`, и используйте `t.example.com`. Хост, используемый в A-записи, не должен быть поддоменом хоста, используемого в NS-записи.

```json
{
  "domains": ["t.example.com"],
  "resolvers": ["t.example.com+udp://8.8.8.8:53"]
}
```

`domains`: используется на стороне сервера. Список доменов. Поддерживает указание типа запроса в формате `domain:method`, где `method` может быть `txt`, `a` или `aaaa`. Если `method` не указан, тип запроса не ограничивается.

`resolvers`: используется на стороне клиента. Список DNS-резолверов. Формат: `domain[:method]+udp://server:port`, где `method` может быть `txt` по умолчанию, `a` или `aaaa`.

Хотя бы одно из `domains` и `resolvers` должно быть заполнено.

### xicmp

```json
{
  "dgram": false, // optional
  "ips": [] // optional
}
```

`dgram`: Более низкие права доступа, только на стороне клиента (Linux, Mac, iOS)

`ips`: ips

### realm

Самодельный https://github.com/apernet/hysteria-realm-server

```json
{
  "url": "realm://public@xxx/your-realm-name",
  "stunServers": [
    "stun.nextcloud.com:3478",
    "global.stun.twilio.com:3478"
  ],
  "tlsConfig": {} // optional
}
```

`url`: realm[+http]://token@host[:port]/id

`stunServers`: Для предсказания портов NAT используется несколько адресов IPv4/IPv6

`tlsConfig`: То же, что tlsSettings

Для регистрации сбоев соединения требуется уровень отладки. К возможным факторам, способствующим возникновению проблем, относятся поставщик STUN, поставщик Realm и пакеты данных, влияющие на рукопожатие QUIC (вероятность крайне низка)

## quicParams

```json
{
  "finalmask": {
    // [!code focus:19]
    "quicParams": {
      "congestion": "force-brutal",
      "bbrProfile": "standard",
      "debug": false,
      "brutalUp": "60 mbps",
      "brutalDown": 0,
      "udpHop": {
        "ports": "20000-50000",
        "interval": "5-10"
      },
      "initStreamReceiveWindow": 8388608,
      "maxStreamReceiveWindow": 8388608,
      "initConnectionReceiveWindow": 20971520,
      "maxConnectionReceiveWindow": 20971520,
      "maxIdleTimeout": 30,
      "keepAlivePeriod": 0,
      "disablePathMTUDiscovery": false,
      "maxIncomingStreams": 1024
    }
  }
}
```

Используется для настройки параметров QUIC в XHTTP H3 и Hysteria.

> `congestion`: reno | bbr | brutal | force-brutal

Алгоритм управления перегрузкой. В Hysteria по умолчанию используется `brutal`, а в XHTTP H3 - `bbr`.

`reno` и `bbr` - известные алгоритмы.

`brutal`: согласует с другой стороной фиксированную скорость отправки пакетов или откатывается к BBR.

`force-brutal`: то же, что и `brutal`, но принудительно использует для исходящего трафика фиксированную скорость отправки из `brutalUp`, игнорируя согласование с другой стороной.

Обратите внимание: XHTTP H3 не может использовать режим `brutal`, потому что у него нет механизма согласования, но поддерживает `force-brutal`, которому согласование не требуется.

> `bbrProfile`: conservative | standard | aggressive

Когда для QUIC выбран алгоритм BBR, этот параметр управляет BBR-профилем. Значение по умолчанию - `standard`. `conservative` немного осторожнее, `aggressive` немного агрессивнее.

> `debug`: false | true

Включает логи для управления перегрузкой `bbr` и `brutal`.

> `brutalUp`: string

> `brutalDown`: string

Ограничения скорости загрузки и отдачи. Значение по умолчанию - `0`.

Формат удобен для пользователя и поддерживает разные распространённые записи битрейта, включая `1000000`, `100kb`, `20 mb`, `100 mbps`, `1g` и `1 tbps`. Регистр не важен, пробелы между значением и единицей можно ставить или не ставить, а если единица не указана, по умолчанию используется `bps`. Значение не может быть меньше 65535 bps.

Поведение согласования такое же, как в Hysteria Brutal:

Значение на стороне сервера ограничивает максимальную скорость режима Brutal, которую может выбрать клиент. `0` означает, что сервер не ограничивает клиента.

Если на стороне клиента указано `0`, используется режим BBR. Если значение не нулевое, используется режим Brutal и он всё равно ограничивается значением на стороне сервера.

Помните, что направления относительны: исходящая скорость сервера соответствует входящей скорости клиента, а входящая скорость сервера - исходящей скорости клиента.

> `udpHop`: {"ports": string, "interval": number}

Настройка прыжков по UDP-портам.

`ports` задаёт диапазон портов. Это может быть строка с одним числом, например `"1234"`, или диапазон, например `"1145-1919"` для портов с 1145 по 1919. Можно использовать запятые для разбиения на сегменты, например `11,13,15-17`.

`interval` - интервал прыжков по портам в секундах. Минимум `5`, значение по умолчанию - `30` секунд.

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

Это четыре конкретных параметра QUIC-окон. **Не меняйте их, если вы не понимаете, что делаете.** Если менять всё же нужно, рекомендуется сохранять соотношение окна приёма потока и окна приёма соединения как 2:5.

> `maxIdleTimeout`: number

Максимальный таймаут простоя в секундах. Это время, после которого сервер закроет соединение, если не получает никаких данных от клиента. Допустимый диапазон - от 4 до 120 секунд. Значение по умолчанию - `30` секунд.

> `keepAlivePeriod`: number

Интервал QUIC KeepAlive в секундах. Допустимый диапазон - от 2 до 60 секунд. По умолчанию отключено.

> `disablePathMTUDiscovery`: bool

Отключать ли Path MTU Discovery.

В других реализациях этот режим принудительно отключается на системах, отличных от Linux, Windows и Darwin, тогда как Xray не делает этого автоматически. Если ваша ОС не входит в `linux`, `windows` или `darwin`, возможно, вам придётся отключить его вручную.

> `maxIncomingStreams`: number

Параметр стороны сервера. Если задан, он не должен быть меньше `8`.
