---
title: Создание TLS-туннеля с помощью Nginx или Haproxy для скрытия отпечатков
---

Nginx или Haproxy реализуют HTTPS-туннели, туннели HTTP/2 over HTTPS, туннели WebSocket over HTTP/2 over HTTPS, туннели gRPC over HTTP/2 over HTTPS, а также туннели gRPC over HTTP/2 over HTTPS с двусторонней аутентификацией по самозаверяющему сертификату.

# Создание HTTPS-туннеля с помощью Nginx на стороне клиента и сервера для скрытия отпечатков

Сетевая структура:

xray_client ---tcp--- nginx_client ---HTTPS--- nginx_sever ---tcp--- xray_server

## Компиляция nginx с поддержкой --with-stream

Выполните компиляцию как на клиенте, так и на сервере.

`curl -O -L http://nginx.org/download/nginx-1.22.1.tar.gz`

`tar -zxvf nginx-1.22.1.tar.gz`

`cd nginx-1.22.1`

`apt install gcc make` // Для компиляции требуются gcc и make

`./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_v2_module --with-stream --with-stream_ssl_module` // На этом шаге могут потребоваться дополнительные библиотеки, установите их в соответствии с сообщениями об ошибках.

`make && make install`

После компиляции папка nginx будет находиться в `/usr/local/nginx`.

## Настройка nginx

Отредактируйте конфигурационный файл nginx.conf.

`vim /usr/local/nginx/conf/nginx.conf`

Добавьте следующую конфигурацию на стороне сервера.

Получение сертификата для сервера не рассматривается в данном руководстве. Обратитесь к [документации](../level-0/ch06-certificates.md).

```
stream {
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        ssl_protocols TLSv1.3;
        ssl_certificate /path/to/cert/domain.crt; # Путь к файлу crt
        ssl_certificate_key /path/to/cert/domain.key; # Путь к файлу key
        proxy_pass unix:/dev/shm/vless.sock; # Использование доменного сокета
    }
}
```

::: warning Внимание

Раздел stream находится на одном уровне с модулем http. Клиент может удалить раздел http, а сервер может удалить его или настроить веб-сайт для маскировки.
:::

Добавьте следующую конфигурацию на стороне клиента.

```
stream {
    server {
        listen 6666;
        listen [::]:6666;
        proxy_ssl on;
        proxy_ssl_protocols TLSv1.3;
        proxy_ssl_server_name on;
        proxy_ssl_name yourdomain.domain; # Доменное имя сервера
        proxy_pass ip:443; # IP-адрес сервера, например, proxy_pass 6.6.6.6:443; или proxy_pass [2401:0:0::1]:443;
    }
}
```

Создайте файл `nginx.service` в папке `/etc/systemd/system`.

`vim /etc/systemd/system/nginx.service`

Добавьте следующий текст:

```
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
After=xray.service

[Service]
Type=forking
ExecStartPre=/usr/local/nginx/sbin/nginx -t
ExecStart=/usr/local/nginx/sbin/nginx
ExecReload=/usr/local/nginx/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Добавьте автоматический запуск при загрузке системы.

`systemctl enable nginx`

## Настройка Xray

Конфигурация Xray на стороне сервера:

```json
{
  "log": {
    "loglevel": "none"
  },
  "inbounds": [
    {
      "listen": "/dev/shm/vless.sock,0666",
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "uuid"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp"
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

Конфигурация Xray на стороне клиента (в данном примере используется прозрачное проксирование пограничного маршрутизатора):

```json
{
  "log": {
    "loglevel": "none"
  },
  "dns": {
    "servers": [
      "1.1.1.1",
      {
        "address": "119.29.29.29",
        "domains": [
          "geosite:cn"
        ],
        "expectIP": [
          "geoip:cn"
        ]
      }
    ],
    "disableFallback": true,
    "disableFallbackIfMatch": true
  },
  "inbounds": [
    {
      "tag": "tproxy-in",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy",
          "mark": 255
        }
      }
    },
    {
      "tag": "http",
      "port": 10808,
      "listen": "127.0.0.1",
      "protocol": "http",
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "tag": "nginxtls",
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "127.0.0.1",
            "port": 6666,
            "users": [
              {
                "id": "uuid",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        },
        "network": "tcp"
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
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
    }
  ],
  "routing": {
    "domainMatcher": "mph",
    "domainStrategy": "AsIs",
    "rules": [
      {
        "type": "field",
        "domain": [
          "geosite:category-ads-all"
        ],
        "outboundTag": "block"
      },
      {
        "type": "field",
        "port": 123,
        "network": "udp",
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": [
          "1.1.1.1"
        ],
        "outboundTag": "proxy"
      },
      {
        "type": "field",
        "domain": [
          "geosite:cn"
        ],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "protocol": [
          "bittorrent"
        ],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": [
          "geoip:private"
        ],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "inboundTag": [
          "tproxy-in"
        ],
        "outboundTag": "nginxtls"
      }
    ]
  }
}
```

При использовании прозрачного проксирования необходимо добавить следующие правила в конфигурацию iptables или ip6tables:

```
# Настройка маршрутизации по политике для IPv4
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Настройка маршрутизации по политике для IPv6
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# Прямое подключение для IP-адреса VPS
iptables -t mangle -A XRAY_MASK -d VSP_IPv4/32 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d VPS_IPv6/128 -j RETURN
```

## Запуск сервисов на клиенте и сервере

`systemctl restart xray`

`systemctl restart nginx`

## Завершение

# Создание HTTPS-туннеля с помощью Haproxy на стороне клиента и сервера для скрытия отпечатков

Установка Haproxy:

`pacman -Su haproxy` или `apt install haproxy`

Haproxy требует OpenSSL для обработки SSL. Проверьте версию OpenSSL и при необходимости установите или обновите ее.

## HTTPS-туннель

Haproxy может легко реализовать HTTPS-туннель, как и описанный выше Nginx.

Сетевая структура:

xray_client ---tcp--- haproxy_client ---HTTPS--- haproxy_sever ---tcp--- xray_server

### Конфигурация haproxy_client (удалите комментарии перед запуском):

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Принудительное использование TLS 1.3 для туннеля
    ssl-default-server-options ssl-min-ver TLSv1.3

defaults
    log global
    mode tcp
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend xray
    bind 127.0.0.1:6666 # Прослушивание порта 6666 на локальном хосте
    default_backend tunnel

backend tunnel
    server tunnel www.example.com:443 ssl verify none sni req.hdr(host) alpn h2,http/1.1
    # Можно использовать доменное имя или IP-адрес. При использовании доменного имени рекомендуется указать IP-адрес в файле hosts, чтобы сократить время разрешения имени.
    # alpn используется для согласования с сервером. Если на стороне сервера установлено alpn h2,http1.1, то клиент может указать h2 для подключения по HTTP/2 или http1.1 для подключения по HTTP.
    # Рекомендуется указывать h2 в обоих случаях.
```

### Конфигурация haproxy_server (удалите комментарии перед запуском):

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Указание наборов шифров и минимальной версии SSL 1.2 для повышения безопасности
    ssl-default-bind-ciphers ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    log global
    mode tcp
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend tls-in
    bind :::443 ssl crt /path/to/pem alpn h2,http/1.1 # Haproxy использует pem для расшифровки SSL. Файл pem можно получить с помощью команды cat www.example.com.crt www.example.com.key > www.example.com.pem
    default_backend xray
    tcp-request inspect-delay 5s
    tcp-request content accept if HTTP
    use_backend web if HTTP

backend xray
    server xray /dev/shm/vless.sock # Поддерживаются абстрактные сокеты: "abns@vless.sock" и loopback: 127.0.0.1:6666

backend web
    server web /dev/shm/h1h2c.sock # Перенаправление на веб-сайт
```

### Настройка Xray

Аналогично разделу Nginx: простейшая конфигурация TCP, совместимая с любым протоколом. Рекомендуется использовать VLESS+TCP без дополнительного шифрования. Обратитесь к документации или другим примерам.

## WebSocket over HTTP/2

Haproxy поддерживает h2c как для входящих, так и для исходящих подключений HTTP/2.

Однако в документации Xray по HTTP/2 говорится:

“В соответствии с рекомендациями по HTTP/2, клиент и сервер должны одновременно включать TLS для корректной работы этого метода передачи... В текущей версии HTTP/2 для входящих подключений (сервер) не требуется настройка TLS.”

То есть для входящих подключений можно использовать h2c, но для исходящих подключений h2c не поддерживается. Поэтому невозможно использовать схему xray_client ---h2c--- haproxy_client ---HTTP/2+TLS--- haproxy_sever ---h2c--- xray_server.

Однако можно обойти это ограничение, используя WebSocket. Haproxy поддерживает ws over HTTP/2.

Тогда сетевая структура будет выглядеть следующим образом: xray_client ---ws--- haproxy_client ---ws over HTTP/2 over HTTPS--- haproxy_sever ---ws--- xray_server.

### Конфигурация haproxy_client:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Настройка производительности HTTP/2. Эти параметры можно изменять при возникновении проблем с производительностью HTTP/2.
    # Дополнительные настройки см. в разделе tune.h2 документации Haproxy: https://docs.haproxy.org/2.7/configuration.html
    tune.h2.initial-window-size 536870912 # Начальный размер окна, рекомендуется настроить, значение по умолчанию - 65536 байт.
    # При резком увеличении трафика может потребоваться время на загрузку, рекомендуется настраивать в зависимости от скорости интернета.
    tune.h2.max-concurrent-streams 512 # Количество одновременных потоков, можно настроить при необходимости, значение по умолчанию - 100.
    # Обычно не требуется изменять (не рекомендуется официальной документацией).

    ssl-default-server-options ssl-min-ver TLSv1.3

defaults
    log global
    mode http
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend xray
    bind 127.0.0.1:6666
    default_backend tunnel

backend tunnel
    server tunnel www.example.com:443 ssl verify none sni req.hdr(host) ws h2 alpn h2
    # ws over HTTP/2
```

### Конфигурация haproxy_server:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Настройка производительности HTTP/2 (необязательно, но рекомендуется).
    tune.h2.initial-window-size 536870912
    tune.h2.max-concurrent-streams 512

    ssl-default-bind-ciphers ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    log global
    mode http
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend tls-in
    bind :::443 ssl crt /path/to/pem alpn h2,http/1.1
    use_backend xray if { ssl_fc_alpn -i h2 } { path_beg /tunnel }
    use_backend server1 if { ssl_fc_alpn -i h2 } { path_beg /path1 }
    use_backend server2 if { ssl_fc_alpn -i h2 } { path_beg /path2 }
    use_backend server3 if { ssl_fc_alpn -i h2 } { path_beg /path3 }
    default_backend web
    # Haproxy в режиме http может разделять трафик на основе пути.

backend xray
    server xray abns@vless.sock ws h1

backend server1
    server server1 abns@server1.sock ws h1

backend server2
    server server2 abns@server2.sock ws h1

backend server3
    server server3 abns@server3.sock ws h1

backend web
    server web /dev/shm/h1h2c.sock
```

### Настройка Xray

Простая конфигурация WebSocket, TLS не требуется. Пример конфигурации см. в документации Xray.
Параметр "path" можно использовать для разделения трафика на стороне сервера Haproxy (клиент также может разделять трафик с помощью Haproxy, принцип аналогичен, см. конфигурацию разделения трафика на стороне сервера).

## gRPC over HTTP/2

Хотя двусторонний h2c невозможен, gRPC не требует обязательного использования TLS.

Сетевая структура: xray_client ---gRPC h2c--- haproxy_client ---gRPC over HTTP/2 over HTTPS--- haproxy_sever ---gRPC h2c--- xray_server

### Конфигурация haproxy_client:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    tune.h2.initial-window-size 536870912
    tune.h2.max-concurrent-streams 512

    ssl-default-server-options ssl-min-ver TLSv1.3

defaults
    log global
    mode http
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend xray
    bind 127.0.0.1:6666 proto h2 # Укажите proto h2 для использования h2c
    default_backend tunnel

backend tunnel
    server tunnel www.example.com:443 ssl verify none sni req.hdr(host) alpn h2
```

### Конфигурация haproxy_server:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    tune.h2.initial-window-size 536870912
    tune.h2.max-concurrent-streams 512

    ssl-default-bind-ciphers ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    log global
    mode http
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend tls-in
    bind :::443 ssl crt /path/to/pem alpn h2,http/1.1
    use_backend xray if { ssl_fc_alpn -i h2 } { path_beg /tunnel } # "serviceName", настроенное в gRPC Xray, можно использовать для разделения трафика в Haproxy с помощью пути.
    # Для удобства использования "multiMode" используйте параметр path_beg для сопоставления пути.
    use_backend server1 if { ssl_fc_alpn -i h2 } { path_beg /path1 }
    use_backend server2 if { ssl_fc_alpn -i h2 } { path_beg /path2 }
    use_backend server3 if { ssl_fc_alpn -i h2 } { path_beg /path3 }
    default_backend web

backend xray
    server xray abns@vless.sock proto h2

backend server1
    server server1 abns@server1.sock proto h2

backend server2
    server server2 abns@server2.sock proto h2

backend server3
    server server3 abns@server3.sock proto h2

backend web
    server web /dev/shm/h1h2c.sock
```

### Настройка Xray

Простая конфигурация gRPC, TLS не требуется. Конфигурация см. в документации.
Параметр serviceName можно использовать для разделения трафика.

# Двусторонняя аутентификация Haproxy с использованием самозаверяющего сертификата (пример gRPC)

Здесь используется двусторонняя аутентификация по самозаверяющему сертификату для повышения безопасности туннеля (это немного увеличивает задержку, но с gRPC это не так заметно). Сервер обрабатывает как доверенные, так и самозаверяющие сертификаты и разделяет трафик на поддельный веб-сайт и туннель.

www.example.com - доменное имя поддельного веб-сайта с доверенным сертификатом (например, сертификат, полученный в соответствии с документацией).

tunnel.example.com - доменное имя с самозаверяющим сертификатом.
Самозаверяющий сертификат можно создать, например, с помощью инструкции https://learn.microsoft.com/ru-ru/azure/application-gateway/self-signed-certificates.

Корневой сертификат: ca.crt, сертификат сервера: server.crt, ключ сервера: server.key.

Необходимо создать как минимум файл server.pem, который клиент может использовать для двусторонней аутентификации.
Также можно создать два сертификата - client и server - для двусторонней аутентификации.

Необходимо подготовить файл fullchain.crt для аутентификации (cat server.crt ca.crt > fullchain.crt) и server.pem (cat server.crt server.key ca.crt > server.pem) для расшифровки.

### Конфигурация haproxy_client:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    tune.h2.initial-window-size 536870912
    tune.h2.max-concurrent-streams 512

    ssl-default-server-options ssl-min-ver TLSv1.3

defaults
    log global
    mode http
    timeout connect 5s
    timeout client 300s
    timeout server 300s

frontend xray
    bind 127.0.0.1:6666 proto h2
    default_backend tunnel

backend tunnel
    server tunnel tunnel.example.com:443 tfo allow-0rtt ssl crt /path/to/client.pem verify required ca-file /path/to/fullchain.crt sni str(tunnel.example.com) alpn h2
    # Доменное имя можно настроить произвольно, оно должно совпадать с самозаверяющим сертификатом.
    # Укажите IP-адрес в файле hosts.
    # Параметр str в sni устанавливает SNI, который используется сервером для идентификации.
```

### Конфигурация haproxy_server:

```
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    tune.h2.initial-window-size 536870912
    tune.h2.max-concurrent-streams 512

    ssl-default-bind-ciphers ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-GCM-SHA256
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2

defaults
    log global
    mode http
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend tls-in
    bind :::443 tfo allow-0rtt ssl crt /path/to/server.pem verify optional ca-file /path/to/fullchain.crt crt /path/to/www.example.com.pem alpn h2,http/1.1
    use_backend xray if { ssl_fc_sni tunnel.example.com } { ssl_c_used } { ssl_fc_alpn -i h2 } { path_beg /tunnel }
    use_backend server1 if { ssl_fc_sni atunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path2 }
    use_backend server2 if { ssl_fc_sni btunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path3 }
    use_backend server3 if { ssl_fc_sni ctunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path4 }
    default_backend web
    # Haproxy поддерживает несколько файлов pem для расшифровки.
    # Разделение трафика можно выполнять на основе SNI или пути, доступны различные способы.
    # Дополнительные сведения об ACL см. в документации Haproxy.

backend xray
    server xray abns@vless.sock proto h2

backend server1
    server server1 abns@server1.sock proto h2

backend server2
    server server2 abns@server2.sock proto h2

backend server3
    server server3 abns@server3.sock proto h2

backend web
    server web /dev/shm/h1h2c.sock
```

### Настройка Xray

Простая конфигурация gRPC, TLS не требуется. Конфигурация см. в документации.
Параметр serviceName можно использовать для разделения трафика.
