# FinalMask

FinalMask добавляет последний слой маскировки после того, как ядро уже обработало защиту транспорта, включая TLS и REALITY.

Он используется для разных вариантов TCP- и UDP-маскировки, а также для настройки параметров QUIC.

## FinalMaskObject

`FinalMaskObject` соответствует полю `finalmask` в [`StreamSettingsObject`](../transport.md#streamsettingsobject).

```json
{
  // пример для outbound, аналогично применимо к inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        "finalmask": {
          // [!code focus:30]
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

> `tcp[n].type`: header-custom | fragment | sudoku

Первый элемент массива является самым внешним слоем маскировки.

Используется вместе с `raw`, `httpupgrade`, `websocket`, `grpc` и `xhttp`.

`header-custom`:

`fragment`:

`sudoku`:

> `tcp[n].settings`: header-custom | fragment | sudoku

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

`clients[n][m].rand`: добавить заданное число случайных байт. Несовместимо с `packet`.

`clients[n][m].randRange`: диапазон значений случайных байт. По умолчанию `0-255`.

`clients[n][m].type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию — `array`.

`clients[n][m].packet`: добавить фиксированные данные. Несовместимо с `rand`.

### fragment

```json
{
  "packets": "tlshello",
  "length": "100-200",
  "delay": "10-20",
  "maxSplit": "3-6"
}
```

### sudoku

```json
{
  "password": "",
  "ascii": "",

  "customTable": "", // в upstream документации поле называется custom_table
  "customTables": [""], // в upstream документации поле называется custom_tables

  "paddingMin": 0, // в upstream документации поле называется padding_min
  "paddingMax": 0 // в upstream документации поле называется padding_max
}
```

Смысл этих полей описан в [upstream-документации](https://github.com/SUDOKU-ASCII/sudoku/blob/main/configs/README.md).

> `udp[n].type`: header-custom | header-dns | header-dtls | header-srtp | header-utp | header-wechat | header-wireguard | mkcp-original | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

Первый элемент массива является самым внешним слоем маскировки.

Используется вместе с `raw` UDP, `kcp`, `hysteria` и `xhttp` H3.

`header-custom`: всегда добавляется как объединенный заголовок пакета.

`header-dns`: старая DNS-маскировка mKCP. В некоторых кампусных сетях DNS-запросы разрешены до авторизации, поэтому этот режим добавляет DNS-заголовок к KCP.

`header-dtls`: старая DTLS-маскировка mKCP. Имитирует пакеты DTLS 1.2. Дополнительных настроек нет.

`header-srtp`: старая SRTP-маскировка mKCP. Похожа на трафик видеозвонков вроде FaceTime. Дополнительных настроек нет.

`header-utp`: старая uTP-маскировка mKCP. Похожа на BitTorrent-трафик. Дополнительных настроек нет.

`header-wechat`: старая маскировка под WeChat Video из mKCP. Дополнительных настроек нет.

`header-wireguard`: старая WireGuard-маскировка mKCP. Выглядит как пакеты WireGuard, хотя реальным протоколом WireGuard не является. Дополнительных настроек нет.

`mkcp-original`: простая обфускация, которая раньше была значением по умолчанию в mKCP. Может понадобиться для подключения к старым mKCP-серверам. Дополнительных настроек нет.

`mkcp-aes128gcm`: старый режим `seed` в mKCP. Использует AES-128-GCM для обфускации.

`noise`: шум, отправляемый перед реальной полезной нагрузкой.

`salamander`: обфускация Salamander из Hysteria2.

`sudoku`:

`xdns`: передает данные через DNS-запросы по схеме, похожей на DNSTT. Для переноса полезной нагрузки выполняются обычные DNS TXT-запросы.

Из-за технических ограничений эффективный MTU очень маленький, поэтому QUIC здесь непрактичен. Рекомендуется сочетать режим с mKCP. Рекомендуемые MTU — 130 на клиенте и 900 на сервере.

Так как запросы являются стандартными DNS-запросами, их может пересылать любой UDP DNS-сервер, хотя эффективность будет низкой.

Для использования этого режима сервер должен слушать порт 53, прокси-протокол должен указывать целью DNS-сервер вроде `8.8.8.8:53`, а вы должны владеть доменом `domain` и направить его NS-запись на сервер.

Например, если у вас есть `example.com`, можно создать A-запись вроде `a.example.com`, указывающую на IP сервера, затем NS-запись вроде `t.example.com`, указывающую на `t.example.com`, и использовать `t.example.com` как рабочий домен. A-запись не должна быть поддоменом NS-записи.

`xicmp`: требует как минимум `CAP_NET_RAW`, должен быть самым внешним слоем, то есть первым элементом массива, и несовместим с `udpHop` и `dialerProxy`.

> `udp[n].settings`: header-custom | header-dns | mkcp-aes128gcm | noise | salamander | sudoku | xdns | xicmp

### header-custom

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

`client[n].rand`: добавить заданное число случайных байт. Несовместимо с `packet`.

`client[n].randRange`: диапазон значений случайных байт. По умолчанию `0-255`.

`client[n].type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию — `array`.

`client[n].packet`: добавить фиксированные данные. Несовместимо с `rand`.

### header-dns

```json
{
  "domain": "www.example.com"
}
```

### mkcp-aes128gcm

```json
{
  "password": "your-password"
}
```

### noise

```json
{
  "reset": 0,
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

`noise[n].rand`: добавить случайные байты или случайное число байт. Несовместимо с `packet`.

`noise[n].randRange`: диапазон значений случайных байт. По умолчанию `0-255`.

`noise[n].type`: тип `packet`. Поддерживаются `array`, `str`, `hex` и `base64`. Значение по умолчанию — `array`.

`noise[n].packet`: добавить фиксированные данные. Несовместимо с `rand`.

`noise[n].delay`: задержка в миллисекундах. После отправки одного элемента шума Xray ждет указанное время перед следующим.

### salamander

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

Здесь действуют те же значения, что и в TCP-версии.

### xdns

```json
{
  "domain": "www.example.com"
}
```

### xicmp

```json
{
  "listenIp": "0.0.0.0",
  "id": 0
}
```

`listenIp`: IP-адрес, на котором выполняется прослушивание.

`id`: если несколько клиентов используют один IP, серверу рекомендуется оставлять здесь `0`.

> `quicParams`: [quicParamsObject](#quicParams)

### quicParams

```json
{
  "congestion": "force-brutal",
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
```

Используется для настройки параметров QUIC в XHTTP H3 и Hysteria.

> `congestion`: reno | bbr | brutal | force-brutal

Алгоритм управления перегрузкой. В Hysteria по умолчанию используется `brutal`, в XHTTP H3 — `bbr`.

`reno` и `bbr` — обычные известные алгоритмы.

`brutal` согласует фиксированную скорость отправки пакетов с другой стороной или откатывается к BBR. Поддерживается только в Hysteria, потому что у XHTTP нет механизма согласования.

`force-brutal` работает так же, как `brutal`, но принудительно использует фиксированную исходящую скорость из `brutalUp`, игнорируя переговоры с другой стороной.

> `debug`: false | true

Включает логирование для реализаций `bbr` и `brutal`.

> `brutalUp`: string

> `brutalDown`: string

Ограничения исходящей и входящей скорости. Значение по умолчанию — `0`.

Формат дружелюбный: поддерживаются записи вроде `1000000`, `100kb`, `20 mb`, `100 mbps`, `1g`, `1 tbps`. Регистр неважен, пробелы необязательны. Если единицы измерения не указаны, используется `bps`. Значение не может быть ниже 65535 bps.

Переговоры работают так же, как у Hysteria Brutal:

Серверное значение ограничивает максимальную скорость режима Brutal, которую клиент может выбрать. `0` означает отсутствие ограничения со стороны сервера.

Если на клиенте указано `0`, используется режим BBR. Если значение не нулевое, используется Brutal-режим, но он все равно ограничивается серверной стороной.

Не забывайте про относительность направлений: серверный upload — это клиентский download, а серверный download — это клиентский upload.

> `udpHop`: {"ports": string, "interval": number}

Настройка прыжков по UDP-портам.

`ports` задает диапазон портов. Это может быть одиночная строка вроде `"1234"`, диапазон вроде `"1145-1919"` или несколько сегментов через запятую, например `11,13,15-17`.

`interval` — интервал переключения портов в секундах. Минимум — 5, значение по умолчанию — 30 секунд.

> `initStreamReceiveWindow`: number

> `maxStreamReceiveWindow`: number

> `initConnectionReceiveWindow`: number

> `maxConnectionReceiveWindow`: number

Это низкоуровневые параметры QUIC-окон. **Не меняйте их, если не понимаете точно, что делаете.** Если менять их все же нужно, рекомендуется сохранять соотношение окна потока и окна соединения на уровне 2:5.

> `maxIdleTimeout`: number

Максимальный таймаут простоя в секундах. Это время, после которого сервер закроет соединение, если не получает данные от клиента. Допустимый диапазон — от 4 до 120 секунд. Значение по умолчанию — 30 секунд.

> `keepAlivePeriod`: number

Интервал QUIC KeepAlive в секундах. Допустимый диапазон — от 2 до 60 секунд. По умолчанию выключено.

> `disablePathMTUDiscovery`: bool

Отключать ли Path MTU Discovery.

Во многих других реализациях на системах вне Linux, Windows и Darwin этот режим отключается принудительно, тогда как Xray не делает этого автоматически. Если ваша ОС не входит в эти три, возможно, придется отключить его вручную.

> `maxIncomingStreams`: number

Только для сервера. Если параметр задан, он не должен быть меньше `8`.
