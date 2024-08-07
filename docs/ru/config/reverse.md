# Обратный прокси

Обратный прокси позволяет перенаправлять трафик с сервера на клиент, то есть перенаправлять трафик в обратном направлении.

Принцип работы обратного прокси:

- Предположим, что на хосте A запущен веб-сервер, но у этого хоста нет публичного IP-адреса, и к нему нельзя получить доступ из Интернета.  
    У нас есть другой хост B с публичным IP-адресом.  
    Мы хотим использовать хост B в качестве шлюза и перенаправлять трафик с B на A.
- На хосте A настроен Xray, называемый `bridge`, и на хосте B также настроен Xray, называемый `portal`.
- `bridge` устанавливает соединение с `portal`.  
    Целевой адрес этого соединения можно настроить произвольно.  
    `portal` получает два типа соединений: соединения от `bridge` и соединения от пользователей из Интернета.  
    `portal` автоматически объединяет эти два типа соединений.  
    Таким образом, `bridge` может получать трафик из Интернета.
- После получения трафика из Интернета `bridge` перенаправляет его на веб-сервер на хосте A без изменений.  
    Конечно, для этого требуется настроить маршрутизацию.
- `bridge` выполняет динамическую балансировку нагрузки в зависимости от объема трафика.

::: tip
Обратный прокси по умолчанию использует [Mux](../../development/protocols/muxcool/).  
Не включайте Mux для исходящих подключений, используемых обратным прокси.
:::

::: warning
Функция обратного прокси находится в стадии тестирования и может работать некорректно.
:::

## ReverseObject

`ReverseObject` соответствует полю `reverse` в конфигурационном файле.

```json
{
  "reverse": {
    "bridges": [
      {
        "tag": "bridge",
        "domain": "test.xray.com"
      }
    ],
    "portals": [
      {
        "tag": "portal",
        "domain": "test.xray.com"
      }
    ]
  }
}
```

> `bridges`: \[[BridgeObject](#bridgeobject)\]

Массив, каждый элемент которого представляет собой `bridge`.  
Настройки каждого `bridge` определяются в [BridgeObject](#bridgeobject).

> `portals`: \[[PortalObject](#portalobject)\]

Массив, каждый элемент которого представляет собой `portal`.  
Настройки каждого `portal` определяются в [PortalObject](#bridgeobject).

### BridgeObject

```json
{
  "tag": "bridge",
  "domain": "test.xray.com"
}
```

> `tag`: string

Все соединения, исходящие от `bridge`, будут иметь этот тег.  
Его можно использовать для идентификации соединений в [настройках маршрутизации](./routing.md) с помощью `inboundTag`.

> `domain`: string

Доменное имя, которое `bridge` будет использовать для установления соединения с `portal`.  
Это доменное имя используется только для связи между `bridge` и `portal` и не должно существовать на самом деле.

### PortalObject

```json
{
  "tag": "portal",
  "domain": "test.xray.com"
}
```

> `tag`: string

Тег `portal`.  
Используйте `outboundTag` в [настройках маршрутизации](./routing.md), чтобы перенаправить трафик на этот `portal`.

> `domain`: string

Доменное имя.  
Когда `portal` получает трафик, если целевое доменное имя трафика совпадает с этим доменным именем, `portal` считает, что это соединение для связи с `bridge`.  
Весь остальной трафик считается трафиком, который нужно перенаправить.  
`portal` идентифицирует и объединяет эти два типа соединений.

::: tip
Один и тот же экземпляр Xray может выступать в роли `bridge`, `portal` или и того, и другого, в зависимости от сценария использования.
:::

## Примеры полных конфигураций

::: tip
Рекомендуется сначала запустить `bridge`, а затем `portal`.
:::

### Настройка bridge

`bridge` обычно требуется два исходящих подключения: одно для подключения к `portal`, а другое - для отправки фактического трафика.  
Другими словами, вам нужно использовать маршрутизацию, чтобы разделять эти два типа трафика.

Настройки обратного прокси:

```json
{
  "bridges": [
    {
      "tag": "bridge",
      "domain": "test.xray.com"
    }
  ]
}
```

Исходящие подключения:

```json
{
  "tag": "out",
  "protocol": "freedom",
  "settings": {
    "redirect": "127.0.0.1:80" // Перенаправить весь трафик на веб-сервер
  }
}
```

```json
{
  "protocol": "vmess",
  "settings": {
    "vnext": [
      {
        "address": "IP-адрес portal",
        "port": 1024,
        "users": [
          {
            "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
          }
        ]
      }
    ]
  },
  "tag": "interconn"
}
```

Настройки маршрутизации:

```json
{
  "rules": [
    {
      "type": "field",
      "inboundTag": ["bridge"],
      "domain": ["full:test.xray.com"],
      "outboundTag": "interconn"
    },
    {
      "type": "field",
      "inboundTag": ["bridge"],
      "outboundTag": "out"
    }
  ]
}
```

### Настройка portal

`portal` обычно требуется два входящих подключения: одно для приема соединений от `bridge`, а другое - для приема фактического трафика.  
Вам также нужно использовать маршрутизацию, чтобы разделять эти два типа трафика.

Настройки обратного прокси:

```json
{
  "portals": [
    {
      "tag": "portal",
      "domain": "test.xray.com" // Должно совпадать с настройками bridge
    }
  ]
}
```

Входящие подключения:

```json
{
  "tag": "external",
  "port": 80,
  "protocol": "dokodemo-door",
  "settings": {
    "address": "127.0.0.1",
    "port": 80,
    "network": "tcp"
  }
}
```

```json
{
  "port": 1024,
  "tag": "interconn",
  "protocol": "vmess",
  "settings": {
    "clients": [
      {
        "id": "5783a3e7-e373-51cd-8642-c83782b807c5"
      }
    ]
  }
}
```

Настройки маршрутизации:

```json
{
  "rules": [
    {
      "type": "field",
      "inboundTag": ["external"],
      "outboundTag": "portal"
    },
    {
      "type": "field",
      "inboundTag": ["interconn"],
      "outboundTag": "portal"
    }
  ]
}
```