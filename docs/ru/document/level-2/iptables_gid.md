---
title: GID Прозрачное проксирование
---

# Прозрачное проксирование: Исключение трафика Xray с помощью GID

В существующих русскоязычных руководствах по прозрачному проксированию с использованием iptables (**[Новое руководство по V2Ray на русском языке - Прозрачное проксирование](https://guide.v2fly.org/app/transparent_proxy.html)**, **[Новое руководство по V2Ray на русском языке - Прозрачное проксирование (TPROXY)](https://guide.v2fly.org/app/tproxy.html)**, **[Руководство по настройке прозрачного проксирования (TProxy)](./tproxy)**)  исключение трафика Xray осуществляется с помощью меток. Исходящий трафик Xray помечается, а затем с помощью правил iptables трафик с соответствующей меткой направляется напрямую, минуя Xray и предотвращая зацикливание.

У такого подхода есть несколько недостатков:

1. **[Необъяснимый трафик попадает в цепочку PREROUTING](https://github.com/v2ray/v2ray-core/issues/2621)**

2. Android использует собственный механизм меток, поэтому данный метод не применим к Android

Предлагаемый в данном руководстве подход не требует использования меток, теоретически обеспечивая более высокую производительность и избегая описанных выше проблем.

## Идея

Tproxy трафик может приниматься только пользователями с правами root (uid==0) или CAP_NET_ADMIN.

Правила iptables позволяют разделять трафик на основе UID (идентификатор пользователя) и GID (идентификатор группы).

Запустим Xray от имени пользователя с uid==0 и gid!=0 и настроим правила iptables, чтобы исключить трафик с этим GID, избегая проксирования трафика Xray.

## Настройка

### 1. Предварительная подготовка

**Android**

1. На устройстве должны быть получены root-права.
2. Установите **[busybox](https://play.google.com/store/apps/details?id=stericson.busybox)**.
3. Наличие терминала для выполнения команд, например, adb shell, Termux и т.д.

**Другие Linux системы**

Необходимо наличие sudo, модуля tproxy для iptables и модуля extra.

Обычно все это уже установлено в системе, для OpenWRT выполните:

```bash
opkg install sudo iptables-mod-tproxy iptables-mod-extra
```

Также могут понадобиться следующие зависимости для OpenWRT, их отсутствие может помешать запуску Xray:

```bash
opkg install libopenssl ca-certificates
```

### 2. Добавление пользователя (пропустите для Android)

Android не поддерживает файл /etc/passwd для управления пользователями, пропустите этот шаг и перейдите к следующему.

```bash
grep -qw xray_tproxy /etc/passwd || echo "xray_tproxy:x:0:23333:::" >> /etc/passwd
```

Где xray_tproxy - имя пользователя, 0 - UID, 23333 - GID. Имя пользователя и GID можно задать произвольно, UID должен быть равен 0.
Проверьте, успешно ли добавлен пользователь, выполнив:

```bash
sudo -u xray_tproxy id
```

В результате должен отобразиться UID 0 и GID 23333.

### 3. Настройка запуска Xray и правил iptables

Внесите изменения в существующие русскоязычные руководства по прозрачному проксированию с использованием iptables (**[Новое руководство по V2Ray на русском языке - Прозрачное проксирование](https://guide.v2fly.org/app/transparent_proxy.html)**, **[Новое руководство по V2Ray на русском языке - Прозрачное проксирование (TPROXY)](https://guide.v2fly.org/app/tproxy.html)**, **[Руководство по настройке прозрачного проксирования (TProxy)](./tproxy)**):

1. Измените конфигурационный файл JSON, удалив все, что связано с метками.

2. Измените правила iptables, удалив все, что связано с метками, и добавьте опцию "-m owner ! --gid-owner 23333" в цепочку OUTPUT перед применением правила XRAY_SELF.

Например:

```bash
iptables -t mangle -A OUTPUT -j XRAY_SELF
```

Замените на:

```bash
iptables -t mangle -A OUTPUT -m owner ! --gid-owner 23333 -j XRAY_SELF
```

3. Измените способ запуска Xray, чтобы он запускался от имени пользователя с UID 0 и GID 23333, см. [здесь](#3-настройка-максимального-количества-открытых-файлов-и-запуск-клиента-xray).

## Ниже приведен пример полной настройки глобального проксирования с использованием TPROXY

### 1. Выполните [предварительную подготовку](#1-предварительная-подготовка) и [добавление пользователя](#2-добавление-пользователя-пропустите-для-android).

### 2. Подготовьте конфигурационный файл Xray.

Настройте произвольную дверь Xray для прослушивания порта 12345, включите followRedirect и tproxy, sniffing не требуется:

```json
{
  "inbounds": [
    {
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
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
      // Конфигурация вашего сервера
    }
  ]
}
```

### 3. Настройка максимального количества открытых файлов и запуск клиента Xray

О проблеме "too many open files" см.: **[Проблема too many open files](https://guide.v2fly.org/app/tproxy.html#решение-проблемы-too-many-open-files)**

В настоящее время при установке сервера Xray с помощью официального скрипта максимальное количество открытых файлов настраивается автоматически, никаких дополнительных действий не требуется.

**Android**

```bash
ulimit -SHn 1000000
setuidgid 0:23333 "команда запуска Xray"&
```

**Другие Linux системы**

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy "команда запуска Xray"&
```

Например:

```bash
ulimit -SHn 1000000
sudo -u xray_tproxy xray -c /etc/xray/config.json &
```

_Первая команда:_

Изменяет максимальное количество открытых файлов, действует только в текущем терминале, необходимо выполнять перед каждым запуском Xray. Эта команда устанавливает максимальное количество открытых файлов для клиента.

_Вторая команда:_

Запускает клиент Xray от имени пользователя с UID 0 и GID, отличным от 0. Символ & в конце команды означает запуск в фоновом режиме.

**Проверка настройки максимального количества открытых файлов**

```bash
cat /proc/PID Xray/limits
```

Найдите строку "Max open files", значение должно соответствовать установленному вами. PID процесса Xray можно узнать, выполнив команду `ps`, `ps -aux`, `ps -a` или `pidof xray`.

Проверьте как сервер, так и клиент.

### 4. Настройка правил iptables

**Проксирование IPv4**

```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Проксирование устройств локальной сети
iptables -t mangle -N XRAY
#  "Сегмент IPv4-сети шлюза" можно получить, выполнив команду "ip address | grep -w inet | awk '{print $2}'", как правило, их несколько
iptables -t mangle -A XRAY -d Сегмент IPv4-сети шлюза 1 -j RETURN
iptables -t mangle -A XRAY -d Сегмент IPv4-сети шлюза 2 -j RETURN
...

# Прямое подключение для многоадресных адресов/адресов класса E/широковещательных адресов
iptables -t mangle -A XRAY -d 224.0.0.0/3 -j RETURN

# Если шлюз является основным маршрутизатором, добавьте эту строку, см.: https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables-прозрачное-проксирование-другие-замечания
# "Диапазон LAN-адресов IPv4 шлюза" можно получить, выполнив команду "ip address | grep -w "inet" | awk '{print $2}'", это будет один из адресов
iptables -t mangle -A XRAY ! -s Диапазон LAN-адресов IPv4 шлюза -j RETURN

# Пометить TCP-трафик меткой 1 и перенаправить на порт 12345
# Трафик будет приниматься произвольной дверью Xray только при наличии метки 1
iptables -t mangle -A XRAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A XRAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
# Применить правило
iptables -t mangle -A PREROUTING -j XRAY

# Проксирование хоста шлюза
iptables -t mangle -N XRAY_MASK
iptables -t mangle -A XRAY_MASK -m owner --gid-owner 23333 -j RETURN
iptables -t mangle -A XRAY_MASK -d Сегмент IPv4-сети шлюза 1 -j RETURN
iptables -t mangle -A XRAY_MASK -d Сегмент IPv4-сети шлюза 2 -j RETURN
...
iptables -t mangle -A XRAY_MASK -d 224.0.0.0/3 -j RETURN
iptables -t mangle -A XRAY_MASK -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -p tcp -j XRAY_MASK
iptables -t mangle -A OUTPUT -p udp -j XRAY_MASK
```

**Проксирование IPv6 (необязательно)**

```bash
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# Проксирование устройств локальной сети
ip6tables -t mangle -N XRAY6
#  "Сегмент IPv6-сети шлюза" можно получить, выполнив команду "ip address | grep -w inet6 | awk '{print $2}'".
ip6tables -t mangle -A XRAY6 -d Сегмент IPv6-сети шлюза 1 -j RETURN
ip6tables -t mangle -A XRAY6 -d Сегмент IPv6-сети шлюза 2 -j RETURN
...

# Если шлюз является основным маршрутизатором, добавьте эту строку, см.: https://xtls.github.io/documents/level-2/transparent_proxy/transparent_proxy.md#iptables-прозрачное-проксирование-другие-замечания
# "Диапазон LAN-адресов IPv6 шлюза" можно получить, выполнив команду "ip address | grep -w "inet6" | awk '{print $2}'", это будет один из адресов
ip6tables -t mangle -A XRAY6 ! -s Диапазон LAN-адресов IPv6 шлюза -j RETURN

ip6tables -t mangle -A XRAY6 -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A XRAY6 -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j XRAY6

# Проксирование хоста шлюза
ip6tables -t mangle -N XRAY6_MASK
ip6tables -t mangle -A XRAY6_MASK -m owner --gid-owner 23333 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d Сегмент IPv6-сети шлюза 1 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d Сегмент IPv6-сети шлюза 2 -j RETURN
...
ip6tables -t mangle -A XRAY6_MASK -j MARK --set-mark 1
ip6tables -t mangle -A OUTPUT -p tcp -j XRAY6_MASK
ip6tables -t mangle -A OUTPUT -p udp -j XRAY6_MASK
```

