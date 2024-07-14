---
title: Прозрачное проксирование TProxy (ipv4 и ipv6)
---

# Руководство по настройке прозрачного проксирования TProxy (ipv4 и ipv6)

Эта конфигурация основана на [Новом руководстве по V2Ray на русском языке - Прозрачное проксирование (TPROXY)](https://guide.v2fly.org/app/tproxy.html), [Руководстве по настройке прозрачного проксирования (TProxy)](https://xtls.github.io/document/level-2/tproxy.html#%E5%BC%80%E5%A7%8B%E4%B9%8B%E5%89%8D) и [Прозрачное проксирование: Исключение трафика Xray с помощью GID](https://xtls.github.io/document/level-2/iptables_gid.html). Она включает поддержку IPv6 для прозрачного проксирования и использует схему VLESS-TCP-XTLS-RPRX-Vision для обхода блокировок (рекомендуется использовать версии 1.7.2 и выше).

Настройка Xray не является основной темой данной статьи. Пользователи могут изменять ее в соответствии со своими потребностями. Подробную информацию можно найти в [примерах официальной документации](https://github.com/XTLS/Xray-examples) или в других отличных примерах, таких как [@chika0801](https://github.com/chika0801/Xray-examples) и [@lxhao61](https://github.com/lxhao61/integrated-examples).

::: warning Внимание

При использовании других конфигураций обратите особое внимание на часть `outbound` с тегом `proxy` в конфигурации клиента. Остальные части остаются неизменными.

Конфигурация сервера также должна быть изменена соответственно.
:::

Эта конфигурация предназначена для решения проблемы, когда такие сайты, как Netflix, которые по умолчанию используют IPv6, не могут быть проксированы через пограничный маршрутизатор, или когда требуется проксирование IPv6.

В данной статье используется сетевая структура с пограничным маршрутизатором с одним интерфейсом.

Все конфигурации, представленные в этой статье, были успешно протестированы в среде Arch Linux (Kernel: 6.0.10).  В других средах настройка аналогична.

Убедитесь, что установлены необходимые программы: `# sudo apt install iptables ip6tables` или `# sudo apt install nftables`.

Если на пограничном маршрутизаторе не установлена программа Xray, можно вручную скачать соответствующую версию Xray, например [Xray-linux-64.zip](https://github.com/XTLS/Xray-core/releases/download/v1.7.0/Xray-linux-64.zip), а затем скопировать файл [install-release.sh](https://github.com/XTLS/Xray-install/blob/main/install-release.sh) на пограничный маршрутизатор.  Предоставьте файлу права на выполнение `# chmod 700 install-release.sh` и запустите его с помощью команды `# ./install-release.sh --local Xray-linux-64.zip`.  Следуйте инструкциям для локальной установки.

## Настройка Xray

### Конфигурация клиента

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "tag": "all-in",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    },
    {
      "port": 10808,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls", "quic"]
      },
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      // Это исходящее подключение по умолчанию. Если модуль маршрутизации (routing) не найдет подходящего правила, трафик будет направлен через этот выходной узел proxy. 
      // Если вы хотите, чтобы трафик в Китай направлялся напрямую, переместите исходящее подключение direct на первое место в списке outbound. 
      // Если вы не понимаете, что это значит, просто пропустите этот комментарий.
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "yourdomain.domain", // Замените на ваше доменное имя, также можно использовать IPv4- или IPv6-адрес.
            "port": 443,
            "users": [
              {
                "id": "uuid", // Введите UUID, который можно сгенерировать, выполнив команду xray uuid в терминале. 
                // Также поддерживаются произвольные строки (https://xtls.github.io/config/inbounds/vless.html#clientobject).
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        },
        "network": "tcp",
        "security": "tls", // При использовании управления потоком xtls-rprx-vision здесь должно быть указано tls.
        "tlsSettings": {
          // При использовании управления потоком xtls-rprx-vision здесь должно быть указано tlsSettings.
          "allowInsecure": false,
          "serverName": "yourdomain.domain", // Замените на ваше доменное имя.
          "fingerprint": "chrome" // Рекомендуется сначала ознакомиться с разделом Release: https://github.com/XTLS/Xray-core/releases/tag/v1.7.3
        }
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "http"
        }
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    }
  ],
  "dns": {
    "hosts": {
      "domain:googleapis.cn": "googleapis.com",
      "dns.google": "8.8.8.8",
      "yourdomain.domain": "your VPS IP" // Если в разделе address исходящего подключения proxy указано доменное имя: 
      // для проксирования через IPv4 укажите IPv4-адрес VPS, для проксирования через IPv6 укажите IPv6-адрес VPS. 
      // Если в разделе address исходящего подключения proxy указан IP-адрес, эту строку можно удалить.
    },
    "servers": [
      "https://1.1.1.1/dns-query",
      {
        "address": "119.29.29.29",
        "domains": ["geosite:cn"],
        "expectIPs": ["geoip:cn"]
      },
      "https://dns.google/dns-query",
      "223.5.5.5",
      "localhost"
    ]
  },
  "routing": {
    "domainMatcher": "mph",
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "block"
      },
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 123,
        "network": "udp",
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 53,
        "network": "udp",
        "outboundTag": "dns-out"
      },
      {
        "type": "field",
        "ip": ["119.29.29.29", "223.5.5.5"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "protocol": ["bittorrent"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["geoip:private", "geoip:cn"], // Здесь можно добавить IP-адрес VPS, чтобы избежать проксирования трафика SSH.
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "domain": ["geosite:cn"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["1.1.1.1", "8.8.8.8"],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "domain": [
          "geosite:geolocation-!cn",
          "domain:googleapis.cn",
          "dns.google"
        ],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

### Конфигурация сервера

```json
{
  "log": {
    "loglevel": "warning"
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        // Блокировка китайских IP-адресов для повышения безопасности. 
        // Также можно направить китайский трафик через Warp, см. https://xtls.github.io/document/level-2/warp.html
        "type": "field",
        "ip": ["geoip:cn"],
        "outboundTag": "block"
      }
    ]
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "uuid", // Должен совпадать с UUID клиента.
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none",
        "fallbacks": [
          {
            "dest": 8080 // Резервный порт. Требуется настройка веб-сервера, см. документацию. Можно не указывать.
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "certificates": [
            {
              "certificateFile": "/etc/ssl/private/fullchain.crt",
              "keyFile": "/etc/ssl/private/crt.key" // Укажите пути к файлам fullchain.crt и cert.key, сгенерированным в соответствии с руководством (https://xtls.github.io/document/level-0/ch06-certificates.html#_6-4-%E6%AD%A3%E5%BC%8F%E8%AF%81%E4%B9%A6%E7%94%B3%E8%AF%B7).
            }
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ]
}
```

## Настройка Netfilter

### Настройка маршрутизации по политике

```bash
# Настройка маршрутизации по политике для IPv4
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Настройка маршрутизации по политике для IPv6
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# Прямое подключение через основной маршрутизатор
ip route add default via 192.168.31.1 # Укажите IPv4-адрес основного маршрутизатора. 
# Если используется метод 1 для настройки доступа к интернету на устройствах локальной сети, эту команду можно не выполнять.
ip -6 route add default via fd00:6868:6868::1 # Укажите IPv6-адрес основного маршрутизатора. 
# Если используется метод 1 для настройки доступа к интернету на устройствах локальной сети, эту команду можно не выполнять.

```

::: tip Использование

Скопируйте команды в терминал пограничного маршрутизатора и выполните их.
:::

::: tip О прямом подключении через основной маршрутизатор

Выполните команду `ip route show` на пограничном маршрутизаторе.  Если используется метод 1, то после `default via` должен быть указан IP-адрес основного маршрутизатора, ничего менять не нужно.  
Если используется метод 2, то после `default via` должен быть указан IP-адрес пограничного маршрутизатора.  В этом случае DNS-запросы для сайтов, к которым должно быть установлено прямое подключение, будут зацикливаться, что приведет к невозможности доступа к этим сайтам.  Поэтому необходимо указать IP-адрес основного маршрутизатора.
:::

Если в настройках маршрутизатора указан пограничный маршрутизатор в качестве шлюза по умолчанию (то есть используется метод 2 для настройки доступа к интернету на устройствах локальной сети), то необходимо выполнить команду `# Прямое подключение через основной маршрутизатор`.  
Кроме настройки через командную строку iproute2, можно использовать dhcpcd или systemctl-network для настройки статического IP-адреса.  
В качестве примера рассмотрим dhcpcd. Отредактируйте файл `/etc/dhcpcd.conf` и добавьте следующие строки в конец файла.  Измените IP-адреса в соответствии с вашей конфигурацией.  
`interface` - это имя сетевого интерфейса или беспроводного устройства, которое можно узнать с помощью команды `# ip link show`.

```
interface enp0s25
static ip_address=192.168.31.100/24
static ip6_address=fd00:6868:6868::8888/64
static routers=192.168.31.1
static domain_name_servers=192.168.31.1 fd00:6868:6868::1
```

После настройки статического IP-адреса и шлюза вам не нужно будет выполнять команду `# Прямое подключение через основной маршрутизатор` при каждой загрузке.

::: warning Внимание

Выберите одну из следующих конфигураций: nftables или iptables. Не используйте обе одновременно.
:::

### Использование iptables

В этой конфигурации IPv4 и IPv6 объединены в одном файле.

```bash
# Проксирование устройств локальной сети (IPv4)
iptables -t mangle -N XRAY
iptables -t mangle -A XRAY -d 127.0.0.1/32 -j RETURN
iptables -t mangle -A XRAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -j RETURN -m mark --mark 0xff
iptables -t mangle -A XRAY -p udp -j TPROXY --on-ip 127.0.0.1 --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-ip 127.0.0.1 --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -j XRAY

# Проксирование устройств локальной сети (IPv6)
ip6tables -t mangle -N XRAY6
ip6tables -t mangle -A XRAY6 -d ::1/128 -j RETURN
ip6tables -t mangle -A XRAY6 -d fe80::/10 -j RETURN
ip6tables -t mangle -A XRAY6 -d fd00::/8 -p tcp -j RETURN
ip6tables -t mangle -A XRAY6 -d fd00::/8 -p udp ! --dport 53 -j RETURN
ip6tables -t mangle -A XRAY6 -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-ip ::1 --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-ip ::1 --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6

# Проксирование хоста шлюза (IPv4)
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_MASK -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY_MASK -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A XRAY_MASK -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_MASK -j RETURN -m mark --mark 0xff
iptables -t mangle -A XRAY_MASK -p udp -j MARK --set-mark 1
iptables -t mangle -A XRAY_MASK -p tcp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j XRAY_MASK

# Проксирование хоста шлюза (IPv6)
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -d fe80::/10 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d fd00::/8 -p tcp -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d fd00::/8 -p udp ! --dport 53 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A XRAY6_MASK -p udp -j MARK --set-mark 1
ip6tables -t mangle -A XRAY6_MASK -p tcp -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -j XRAY6_MASK

# Создание правила DIVERT, чтобы избежать повторного прохождения пакетов с существующими подключениями через TPROXY, что теоретически повышает производительность (IPv4)
iptables -t mangle -N DIVERT
iptables -t mangle -A DIVERT -j MARK --set-mark 1
iptables -t mangle -A DIVERT -j ACCEPT
iptables -t mangle -I PREROUTING -p tcp -m socket -j DIVERT

# Создание правила DIVERT, чтобы избежать повторного прохождения пакетов с существующими подключениями через TPROXY, что теоретически повышает производительность (IPv6)
ip6tables -t mangle -N DIVERT
ip6tables -t mangle -A DIVERT -j MARK --set-mark 1
ip6tables -t mangle -A DIVERT -j ACCEPT
ip6tables -t mangle -I PREROUTING -p tcp -m socket -j DIVERT

```

::: tip Использование

Запишите приведенную выше конфигурацию в файл (например, `iptables.rules`), затем предоставьте файлу права на выполнение `# chmod 700 ./iptables.rules`.

Наконец, выполните файл от имени пользователя root: `# ./iptables.rules` или `# source iptables.rules`.
:::

### Использование nftables

В этой конфигурации IPv4 и IPv6 объединены.

```
#!/usr/sbin/nft -f

flush ruleset

table inet xray {
        chain prerouting {
                type filter hook prerouting priority filter; policy accept;
                ip daddr { 127.0.0.0/8, 224.0.0.0/4, 255.255.255.255 } return
                meta l4proto tcp ip daddr 192.168.0.0/16 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                ip6 daddr { ::1, fe80::/10 } return
                meta l4proto tcp ip6 daddr fd00::/8 return
                ip6 daddr fd00::/8 udp dport != 53 return
                meta mark 0x000000ff return
                meta l4proto { tcp, udp } meta mark set 0x00000001 tproxy ip to 127.0.0.1:12345 accept
                meta l4proto { tcp, udp } meta mark set 0x00000001 tproxy ip6 to [::1]:12345 accept
        }

        chain output {
                type route hook output priority filter; policy accept;
                ip daddr { 127.0.0.0/8, 224.0.0.0/4, 255.255.255.255 } return
                meta l4proto tcp ip daddr 192.168.0.0/16 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                ip6 daddr { ::1, fe80::/10 } return
                meta l4proto tcp ip6 daddr fd00::/8 return
                ip6 daddr fd00::/8 udp dport != 53 return
                meta mark 0x000000ff return
                meta l4proto { tcp, udp } meta mark set 0x00000001 accept
        }

        chain divert {
                type filter hook prerouting priority mangle; policy accept;
                meta l4proto tcp socket transparent 1 meta mark set 0x00000001 accept
        }
}

```

::: tip Использование

Запишите приведенную выше конфигурацию в файл (например, `nftables.rules`), затем предоставьте файлу права на выполнение `# chmod 700 ./nftables.rules`.

Наконец, выполните файл от имени пользователя root: `# ./nftables.rules` или `# source nftables.rules`.
:::

Адреса шлюза `192.168.0.0/16`, `fd00::/8` и т.д. можно получить с помощью команд `ip address | grep -w inet | awk '{print $2}'` и `ip address | grep -w inet6 | awk '{print $2}'` [ссылка](https://xtls.github.io/document/level-2/iptables_gid.html#_4-%E8%AE%BE%E7%BD%AE-iptables-%E8%A7%84%E5%88%99).

Или посмотреть в настройках сети Windows.

Или посмотреть в настройках интернета на маршрутизаторе.

Если префиксы `192.168`, `fd00:` совпадают, их можно не менять.  
Если они отличаются, например, `fc00:`, `fe00:` и т.д., замените их на соответствующие значения.  
Синтаксис можно найти в Google, например, `fc00::/7`, `fe00::/9`.

### Автоматический запуск конфигурации Netfilter при загрузке

Сначала убедитесь, что вы выполнили соответствующие команды Netfilter, описанные выше, и успешно протестировали настройку прозрачного проксирования, чтобы убедиться, что в дальнейшем будет сгенерирован правильный файл.

#### При использовании конфигурации iptables

1. Сохраните конфигурацию iptables в файлы `iptables.rulesv4` и `iptables.rulesv6` с помощью команд `# iptables-save > /root/iptables.rulesv4` и `# ip6tables-save > /root/iptables.rulesv6`.

2. Создайте файл с именем `tproxyrules.service` в каталоге `/etc/systemd/system/` и добавьте следующее содержимое:

```
[Unit]
Description=Tproxy rules

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/bin/sh -c 'until ping -c1 192.168.31.1; do sleep 1; done;'
ExecStart=/sbin/ip rule add fwmark 1 table 100 ; \
/sbin/ip -6 rule add fwmark 1 table 106 ; \
/sbin/ip route add local 0.0.0.0/0 dev lo table 100 ; \
/sbin/ip -6 route add local ::/0 dev lo table 106 ; \
/sbin/ip route add default via 192.168.31.1 ; \
/sbin/ip -6 route add default via fd00:6868:6868::1 ; \
/sbin/iptables-restore /root/iptables.rulesv4 ; \
/sbin/ip6tables-restore /root/iptables.rulesv6
ExecStop=/sbin/ip rule del fwmark 1 table 100 ; \
/sbin/ip -6 rule del fwmark 1 table 106 ; \
/sbin/ip route del local 0.0.0.0/0 dev lo table 100 ; \
/sbin/ip -6 route del local ::/0 dev lo table 106 ; \
/sbin/ip route del default via 192.168.31.1 ; \
/sbin/ip -6 route del default via fd00:6868:6868::1 ; \
/sbin/iptables -t mangle -F ; \
/sbin/ip6tables -t mangle -F

[Install]
WantedBy=multi-user.target
```

3. Выполните команду `systemctl enable tproxyrules`.

#### При использовании конфигурации nftables

1. Сохраните конфигурацию nftables в файл `nftables.rulesv46` с помощью команды `# nft list ruleset > /root/nftables.rulesv46`.

2. Создайте файл с именем `tproxyrules.service` в каталоге `/etc/systemd/system/` и добавьте следующее содержимое:

```
[Unit]
Description=Tproxy rules

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStartPre=/bin/sh -c 'until ping -c1 192.168.31.1; do sleep 1; done;'
ExecStart=/sbin/ip rule add fwmark 1 table 100 ; \
/sbin/ip -6 rule add fwmark 1 table 106 ; \
/sbin/ip route add local 0.0.0.0/0 dev lo table 100 ; \
/sbin/ip -6 route add local ::/0 dev lo table 106 ; \
/sbin/ip route add default via 192.168.31.1 ; \
/sbin/ip -6 route add default via fd00:6868:6868::1 ; \
/sbin/nft -f /root/nftables.rulesv46 ;
ExecStop=/sbin/ip rule del fwmark 1 table 100 ; \
/sbin/ip -6 rule del fwmark 1 table 106 ; \
/sbin/ip route del local 0.0.0.0/0 dev lo table 100 ; \
/sbin/ip -6 route del local ::/0 dev lo table 106 ; \
/sbin/ip route del default via 192.168.31.1 ; \
/sbin/ip -6 route del default via fd00:6868:6868::1 ; \
/sbin/nft flush ruleset

[Install]
WantedBy=multi-user.target
```

3. Выполните команду `systemctl enable tproxyrules`.

::: tip tproxyrules.service

Обратите внимание на IP-адрес основного маршрутизатора и измените его в соответствии с вашей конфигурацией.

Команда `ExecStartPre=/bin/sh -c 'until ping -c1 192.168.31.1; do sleep 1; done;'` гарантирует, что команды будут выполнены только после получения IP-адреса, иначе могут возникнуть странные ошибки.  IP-адрес - это адрес основного маршрутизатора, измените его в соответствии с вашей конфигурацией.
:::

::: warning Внимание

Если вы настроили статический IP-адрес и шлюз с помощью dhcpcd и т.д., удалите соответствующие строки `ip route add/del` из приведенных выше конфигураций.
:::

## Настройка доступа к интернету на устройствах локальной сети

Предположим, что IPv4- и IPv6-адреса пограничного маршрутизатора - `192.168.31.100` и `fd00:6868:6868::8866` соответственно. 
IP-адреса пограничного маршрутизатора можно узнать с помощью команды `ip add`.

### Метод 1

Есть два способа настроить доступ к интернету на устройствах локальной сети.  
Первый способ - настроить статический IP-адрес на каждом устройстве и указать IP-адрес пограничного маршрутизатора в качестве шлюза.  
Обратите внимание, что большинство мобильных устройств поддерживают только ручную настройку IPv4-шлюза и не поддерживают ручную настройку IPv6-шлюза, если не получены root-права и не выполнены соответствующие настройки.

В качестве примера рассмотрим устройство Windows.  
Можно сначала включить DHCP и записать автоматически назначенный IP-адрес для справки, а затем вручную настроить статический IP-адрес.

::: tip Настройка DNS

В этой конфигурации перехватывается DNS-трафик, поэтому DNS можно указать произвольно.

Рекомендуется указать IP-адрес пограничного маршрутизатора, чтобы избежать утечки DNS.
:::

<img width="231" alt="image" src="https://user-images.githubusercontent.com/110686480/208310266-632e36b9-a23b-4b90-aa28-583b50e87c66.png"> <img width="238" alt="image" src="https://user-images.githubusercontent.com/110686480/208309659-e3172218-ef27-4a94-a017-225f8e05b611.png">

### Метод 2

Второй способ настроить доступ к интернету на устройствах локальной сети - указать пограничный маршрутизатор в качестве шлюза в настройках маршрутизатора.  
Этот метод не требует настройки на каждом устройстве, подключенном к маршрутизатору, но обратите внимание, что некоторые маршрутизаторы не поддерживают настройку IPv6-шлюза, поэтому устройствам, которым требуется IPv6, необходимо вручную настроить IPv6 в соответствии с методом 1.

<img width="700" alt="image" src="https://user-images.githubusercontent.com/110686480/208310174-2245a890-eb6b-4341-899f-81c6ac8255ff.png">

## Результаты

После настройки в соответствии с вышеуказанными инструкциями устройства смогут получать доступ к интернету по IPv4 и IPv6.  
На тестовом сайте, например https://ipv6-test.com/, вы увидите следующие результаты (сайт должен быть проксирован, чтобы увидеть эти результаты):

<img width="700" alt="image" src="https://user-images.githubusercontent.com/110686480/208743723-f8a2751b-43d0-4353-9383-5ae0e00e9449.png">

## Заключение

В настоящее время IPv6 еще не получил широкого распространения, и 99% трафика, к которому мы обращаемся, по-прежнему приходится на IPv4.  
Многие провайдеры VPS