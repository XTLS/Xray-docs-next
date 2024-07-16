---
title: Перенаправление исходящего трафика
---

# Перенаправление трафика на основе fwmark или sendThrough

Направление определенного трафика через определенный выходной узел с помощью Xray для реализации "разделения" глобальной маршрутизации

## Введение

Я видел много прокси-серверов или VPN, которые перехватывают весь трафик, что приводит к неработоспособности Xray, если он установлен одновременно с ними.  Многие руководства, которые я находил, предлагали решать эту проблему путем разделения трафика на основе таблиц маршрутизации CIDR.  Это не очень элегантно, и если я хочу иметь возможность гибко переключаться между маршрутами и реализовывать разделение трафика по требованию, то есть ли лучший способ?  Да, есть!

С помощью fwmark или sendThrough/sockopt.interface в Xray и простой настройки таблицы маршрутизации можно добиться следующего:

1. Xray может направлять трафик с определенным тегом, доменным именем и т.д. через определенный интерфейс.  Если ваш интерфейс поддерживает dual-stack, вы можете указать IPv4 или IPv6.
2. Остальной трафик будет идти через исходный интерфейс IPv4 или IPv6.

Вот как это настроить (на примере Debian 10):

## 1. Установите прокси-сервер или VPN-клиент (например, Wireguard, IPsec и т.д.)

Обратитесь к официальной документации для получения инструкций по установке для вашей системы и программного обеспечения.

## 2. Отредактируйте конфигурационный файл VPN (на примере WireGuard)

Исходный файл:

```ini
[Interface]
PrivateKey = <PriKey>
Address = <IPv4>
Address = <IPv6>
DNS = 8.8.8.8
MTU = 1280
[Peer]
PublicKey = <Pubkey>
AllowedIPs = ::/0
AllowedIPs = 0.0.0.0/0
Endpoint = <EndpointIP>:<Port>
```

Добавьте следующие строки в раздел `[Interface]`:
```ini
Table = <table>
### fwmark
PostUP = ip rule add fwmark <mark> lookup <table>
PostDown = ip rule del fwmark <mark> lookup <table>
PostUP = ip -6 rule add fwmark <mark> lookup <table>
PostDown = ip -6 rule del fwmark <mark> lookup <table>
## sendThrough
PreUp = ip rule add from <IPv4> lookup <table>
PostDown = ip rule del from <IPv4> lookup <table>
PreUp = ip -6 rule add from <IPv6> lookup <table>
PostDown = ip -6 rule del from <IPv6> lookup <table>
## sockopt.interface
PreUp = ip rule add oif %i lookup <table>
PostDown = ip rule del oif %i lookup <table>
PreUp = ip -6 rule add oif %i lookup <table>
PostDown = ip -6 rule del oif %i lookup <table>
```
::: tip
- В этом конфигурационном файле объединены `fwmark`, `sendThrough` и `sockopt.interface`.
- Подключения, поступающие на этот интерфейс `%i`, с этого IP-адреса `<IPv4/6>` или помеченные `fwmark` как `<mark>`, 
- будут перенаправлены через WireGuard.
- `%i` - это заполнитель в конфигурационном файле WireGuard, который будет заменен на имя интерфейса во время запуска.
:::


Сохраните файл.

Рекомендуется установить:

::: warning
Если вы используете поле `DNS` в разделе `[Interface]`, то эта программа будет обязательной.
:::

```bash
apt install openresolv
```

## 3. Активируйте сетевой интерфейс WireGuard.

Загрузите модуль ядра:

```bash
modprobe wireguard
```

Проверьте, правильно ли загружен модуль WG:

```bash
lsmod | grep wireguard
```

## 4. Измените конфигурационный файл Xray-core.

```json
{
  "api": {
    "services": [
      "HandlerService",
      "LoggerService",
      "StatsService"
    ],
    "tag": "api"
  },
  "inbounds": [
    {
      "listen": "127.0.0.1",
      "port": <port>,
      "protocol": "dokodemo-door",
      "settings": {
        "address": "127.0.0.1"
      },
      "tag": "api"
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      }
      // Измените на UseIPv4 или UseIPv6 по вашему выбору
    },
    //            <--Выберите один из вариантов-->   Вариант 1: fwmark
    {
      "protocol": "freedom",
      "tag": "wg0",
      "streamSettings": {
        "sockopt": {
          "mark": <mark>
        }
      },
      "settings": {
        "domainStrategy": "UseIPv6"
      }
    }  // Трафик с меткой fwmark, равной <mark>, будет направлен через UseIPv6/UseIPv4.
    //            <--Выберите один из вариантов-->   Вариант 2: sendThrough
    {
      "tag": "wg0",
      "protocol": "freedom",
      "sendThrough": "your wg0 v4 address",
      // Измените на UseIPv4 или UseIPv6 по вашему выбору
      "settings": {
        "domainStrategy": "UseIPv4"
      }
      // Измените на UseIPv4 или UseIPv6 по вашему выбору
    },
    //            <--Выберите один из вариантов-->   Вариант 3: sockopt.interface
    {
      "tag": "wg0",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      },
      "streamSettings": {
        "sockopt": {
          "interface": "wg0"
        }
      }
    },
    //            <--Выберите один из вариантов-->   Конец
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
  ],
  "policy": {
    "system": {
      "statsInboundDownlink": true,
      "statsInboundUplink": true
    }
  },
  "routing": {
    "rules": [
      {
        "inboundTag": [
          "api"
        ],
        "outboundTag": "api",
        "type": "field"
      },
      {
        "type": "field",
        "outboundTag": "wg0",
        "inboundTag": [
          "<inboundTag>"
          // Укажите тег входящего подключения, определенный ранее в разделе inbound.
          // Здесь используется тег api, сгенерированный автоматически. Вы также можете добавить доменные имена и т.д.
        ]
      },
      {
        "outboundTag": "blocked",
        "protocol": [
          "bittorrent"
        ],
        "type": "field"
      }
    ]
  },
  "stats": {}
}
```

::: tip
Вы можете изменить "domainStrategy": "UseIPv6", чтобы управлять способом доступа для определенных пользователей.
По моим тестам, этот параметр имеет более высокий приоритет, чем gai.config в системе.
:::

## 5. Настройка системы

::: tip
Необходимо включить ip_forward в системе:
`sysctl -w net.ipv4.ip_forward=1`
`sysctl -w net.ipv6.conf.all.forwarding=1`
:::

## 6. Завершение настройки WireGuard

Запустите туннель:

```bash
wg-quick up wg0
```

Настройте автоматический запуск:

```bash
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
```

Проверьте IPv4/IPv6:

> На прокси-сервере выполните команду `curl ip-api.com -4/-6` / откройте в браузере сайт ip-api.com

## Послесловие

Цель этой статьи - показать, как избежать ненужных затрат трафика, переложив функции маршрутизации и разделения трафика на Xray.  Это позволяет избежать утомительной работы по обслуживанию таблиц маршрутизации и повышает технический уровень.

## Благодарности

[XTLS/Xray-core](https://github.com/XTLS/Xray-core); [v2fly/v2ray-core](https://github.com/v2fly/v2ray-core); [WireGuard](https://www.wireguard.com/); [@p3terx](https://p3terx.com/); @w; @Hiram; @Luminous; @Ln; @JackChou;

