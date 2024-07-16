---
title: Прозрачное проксирование TProxy
---

# Руководство по настройке прозрачного проксирования (TProxy)

Эта конфигурация основана на [Новом руководстве по V2Ray на русском языке - Прозрачное проксирование (TPROXY)](https://guide.v2fly.org/app/tproxy.html) с добавлением новых функций Xray, использованием схемы VLESS + XTLS Vision и изменением режима разделения трафика с проксирования по умолчанию на прямое подключение по умолчанию. Пользователи должны настроить конфигурацию в соответствии со своими потребностями.

Все конфигурации, представленные в этой статье, были успешно протестированы в средах Raspberry Pi 2B и Ubuntu 20.04.  При использовании в других средах вам может потребоваться изменить конфигурацию.

## Перед началом работы

Убедитесь, что на вашем устройстве есть доступное сетевое подключение, сервер настроен, а клиент установлен.

Обратите внимание, что многие руководства по настройке прозрачного проксирования предлагают включить переадресацию IP в системе Linux, но это может привести к снижению производительности Splice.  Дополнительную информацию см. в статье [Расследование снижения производительности Splice до уровня ниже, чем Direct](https://github.com/XTLS/Xray-core/discussions/59).

Хочу добавить, что многие руководства по настройке прозрачного проксирования используют Netfilter для разделения трафика, отправляя прямой трафик напрямую, минуя Xray.  В этом случае необходимо включить переадресацию IP.  
Другие руководства, например это, направляют весь трафик через Xray, где он разделяется модулем маршрутизации Xray.  В этом случае переадресацию IP включать не нужно.

## Настройка Xray

Для лучшего разделения трафика замените файл правил маршрутизации по умолчанию на [Loyalsoldier/v2ray-rules-dat](https://github.com/Loyalsoldier/v2ray-rules-dat), иначе Xray-core не сможет загрузить эту конфигурацию.

```bash
sudo curl -oL /usr/local/share/xray/geoip.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat
sudo curl -oL /usr/local/share/xray/geosite.dat https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat
```

```json
{
  "log": {
    "loglevel": "warning",
    "error": "/var/log/xray/error.log",
    "access": "/var/log/xray/access.log"
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
        "destOverride": ["http", "tls"]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv4"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 2
        }
      }
    },
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "домен сервера",
            "port": 443,
            "users": [
              {
                "id": "UUID",
                "flow": "xtls-rprx-vision",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "xtls",
        "sockopt": {
          "mark": 2
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
      "settings": {
        "address": "8.8.8.8"
      },
      "proxySettings": {
        "tag": "proxy"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 2
        }
      }
    }
  ],
  "dns": {
    "hosts": {
      "домен сервера": "IP-адрес сервера"
    },
    "servers": [
      {
        "address": "119.29.29.29",
        "port": 53,
        "domains": ["geosite:cn"],
        "expectIPs": ["geoip:cn"]
      },
      {
        "address": "223.5.5.5",
        "port": 53,
        "domains": ["geosite:cn"],
        "expectIPs": ["geoip:cn"]
      },
      "8.8.8.8",
      "1.1.1.1",
      "https+local://doh.dns.sb/dns-query"
    ]
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "inboundTag": ["all-in"],
        "port": 53,
        "outboundTag": "dns-out"
      },
      {
        "type": "field",
        "ip": ["8.8.8.8", "1.1.1.1"],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "block"
      },
      {
        "type": "field",
        "domain": ["geosite:geolocation-!cn"],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "ip": ["geoip:telegram"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

::: tip Совет
Эта конфигурация перехватывает весь трафик, направляемый на порт 53, для решения проблемы загрязнения DNS, поэтому адрес DNS-сервера на клиенте и на самом устройстве можно настроить произвольно.
:::

## Настройка маршрутизации по политике

```
sudo ip route add local default dev lo table 100 # Добавить таблицу маршрутизации 100
sudo ip rule add fwmark 1 table 100 # Добавить правило для таблицы маршрутизации 100
```

## Настройка Netfilter

::: warning Внимание
Выберите одну из следующих конфигураций: nftables или iptables. Не используйте обе одновременно.
:::

<Tabs title="netfilter">

<Tab title="nftables1">

```nftables
#!/usr/sbin/nft -f

flush ruleset

define RESERVED_IP = {
    10.0.0.0/8,
    100.64.0.0/10,
    127.0.0.0/8,
    169.254.0.0/16,
    172.16.0.0/12,
    192.0.0.0/24,
    224.0.0.0/4,
    240.0.0.0/4,
    255.255.255.255/32
}

table ip xray {
        chain prerouting {
                type filter hook prerouting priority mangle; policy accept;
                ip daddr $RESERVED_IP return
                ip daddr 192.168.0.0/16 tcp dport != 53 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                ip protocol tcp tproxy to 127.0.0.1:12345 meta mark set 1
                ip protocol udp tproxy to 127.0.0.1:12345 meta mark set 1
        }
        chain output {
                type route hook output priority mangle; policy accept;
                ip daddr $RESERVED_IP return
                ip daddr 192.168.0.0/16 tcp dport != 53 return
                ip daddr 192.168.0.0/16 udp dport != 53 return
                meta mark 2 return
                ip protocol tcp meta mark set 1
                ip protocol udp meta mark set 1
        }
}
```

::: tip Использование

Запишите приведенную выше конфигурацию в файл (например, `nft.conf`), затем предоставьте файлу права на выполнение и выполните его от имени пользователя root ( `# ./nft.conf` ).
:::

</Tab>

<Tab title="iptables1">

```bash
iptables -t mangle -N XRAY
iptables -t mangle -A XRAY -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY -d 100.64.0.0/10 -j RETURN
iptables -t mangle -A XRAY -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY -d 169.254.0.0/16 -j RETURN
iptables -t mangle -A XRAY -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A XRAY -d 192.0.0.0/24 -j RETURN
iptables -t mangle -A XRAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 240.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p tcp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -j XRAY

iptables -t mangle -N XRAY_SELF
iptables -t mangle -A XRAY_SELF -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY_SELF -d 100.64.0.0/10 -j RETURN
iptables -t mangle -A XRAY_SELF -d 127.0.0.0/8 -j RETURN
iptables -t mangle -A XRAY_SELF -d 169.254.0.0/16 -j RETURN
iptables -t mangle -A XRAY_SELF -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.0.0.0/24 -j RETURN
iptables -t mangle -A XRAY_SELF -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_SELF -d 240.0.0.0/4 -j RETURN
iptables -t mangle -A XRAY_SELF -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.168.0.0/16 -p tcp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_SELF -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN
iptables -t mangle -A XRAY_SELF -m mark --mark 2 -j RETURN
iptables -t mangle -A XRAY_SELF -p tcp -j MARK --set-mark 1
iptables -t mangle -A XRAY_SELF -p udp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j XRAY_SELF
```

</Tab>

</Tabs>

После завершения настройки измените шлюз по умолчанию на других устройствах в локальной сети на IP-адрес этого устройства, и они смогут использовать VPN.  После того, как вы проверите, что все работает правильно на других хостах и на самом устройстве, перейдите к следующему шагу.

## Настройка автозагрузки и сохранения конфигурации

<br/>

<Tabs title="netfilter2">

<Tab title="nftables2">

Сначала переместите отредактированный файл конфигурации nftables в каталог `/etc` и переименуйте его в `nftables.conf`.  
Затем отредактируйте файл `/lib/systemd/system/nftables.service`.

```ini
[Unit]
Description=nftables
Documentation=man:nft(8) http://wiki.nftables.org
Wants=network-pre.target
Before=network-pre.target shutdown.target
Conflicts=shutdown.target
DefaultDependencies=no

[Service]
Type=oneshot
RemainAfterExit=yes
StandardInput=null
ProtectSystem=full
ProtectHome=true
ExecStart=/usr/sbin/nft -f /etc/nftables.conf ; /usr/sbin/ip route add local default dev lo table 100 ; /usr/sbin/ip rule add fwmark 1 table 100
ExecReload=/usr/sbin/nft -f /etc/nftables.conf
ExecStop=/usr/sbin/nft flush ruleset ; /usr/sbin/ip route del local default dev lo table 100 ; /usr/sbin/ip rule del table 100

[Install]
WantedBy=sysinit.target
```

Наконец, выполните команду `systemctl enable nftables`.

</Tab>

<Tab title="iptables2">

Для сохранения конфигурации iptables рекомендуется установить пакет `iptables-persistent`.

Во время установки вам будет предложено сохранить конфигурацию.  
Если вы уже записали конфигурацию iptables в систему, выберите "Да".  
Если вы еще не записали конфигурацию, это не проблема. После установки запишите конфигурацию и выполните команду `netfilter-persistent save` (требуются права root).

Затем отредактируйте файл `/lib/systemd/system/netfilter-persistent.service`.

```ini
[Unit]
Description=netfilter persistent configuration
DefaultDependencies=no
Wants=network-pre.target systemd-modules-load.service local-fs.target
Before=network-pre.target shutdown.target
After=systemd-modules-load.service local-fs.target
Conflicts=shutdown.target
Documentation=man:netfilter-persistent(8)

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/sbin/netfilter-persistent start ; /usr/sbin/ip route add local default dev lo table 100 ; /usr/sbin/ip rule add fwmark 1 table 100
ExecStop=/usr/sbin/netfilter-persistent stop ; /usr/sbin/ip route flush dev lo table 100 ; /usr/sbin/ip rule del table 100

[Install]
WantedBy=multi-user.target
```

</Tab>

</Tabs>


