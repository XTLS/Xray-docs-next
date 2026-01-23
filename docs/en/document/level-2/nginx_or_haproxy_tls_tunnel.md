---
title: Using Nginx or HAProxy to Build TLS Tunnels to Hide Fingerprints
---

HTTPS tunnels, HTTP/2 over HTTPS tunnels, WebSocket over HTTP/2 over HTTPS tunnels, gRPC over HTTP/2 over HTTPS tunnels implemented via Nginx or HAProxy, and gRPC over HTTP/2 over HTTPS tunnels with self-signed certificate mutual authentication.

# Building HTTPS Tunnels with Nginx on Client & Server to Hide Fingerprints

Network Structure:

xray_client ---tcp--- nginx_client ---HTTPS--- nginx_sever ---tcp--- xray_server

## Compile Nginx --with-stream

Compile on both the client and the server.

`curl -O -L http://nginx.org/download/nginx-1.22.1.tar.gz`

`tar -zxvf nginx-1.22.1.tar.gz`

`cd nginx-1.22.1`

`apt install gcc make` // Install compilation dependencies: gcc and make

`./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_v2_module --with-stream --with-stream_ssl_module` // This step requires some libraries; install the corresponding libs based on any errors reported.

`make && make install`

After compilation, the nginx folder is located at `/usr/local/nginx`.

## Configure Nginx

Edit the nginx configuration file `nginx.conf`.

`vim /usr/local/nginx/conf/nginx.conf`

Add the following configuration to the **Server**:

(I won't go into detail about applying for server certificates; refer to the [Plain Language Guide](../level-0/ch06-certificates.md)).

```nginx
stream {
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        ssl_protocols TLSv1.3;
        ssl_certificate /path/to/cert/domain.crt; # Location of crt file
        ssl_certificate_key /path/to/cert/domain.key; # Location of key file
        proxy_pass unix:/dev/shm/vless.sock; # Use domain socket
    }
}
```

::: warning Note
The `stream` section is parallel to the `http` module. On the client side, you can delete the `http` section. On the server side, you can delete it or set up a web page fallback for camouflage.
:::

Add the following configuration to the **Client**:

```nginx
stream {
    server {
        listen 6666;
        listen [::]:6666;
        proxy_ssl on;
        proxy_ssl_protocols TLSv1.3;
        proxy_ssl_server_name on;
        proxy_ssl_name yourdomain.domain; # Server domain name
        proxy_pass ip:443; # Server IP, e.g., proxy_pass 6.6.6.6:443; or proxy_pass [2401:0:0::1]:443;
    }
}
```

Create the `nginx.service` file in the `/etc/systemd/system` directory.

`vim /etc/systemd/system/nginx.service`

Write the following:

```ini
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

Enable auto-start on boot:

`systemctl enable nginx`

## Xray Configuration

**Server-side** Xray Configuration:

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
        "destOverride": ["http", "tls"]
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

**Client-side** Xray Configuration (Taking transparent proxy on a side-router/gateway as an example):

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
        "domains": ["geosite:cn"],
        "expectIP": ["geoip:cn"]
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
        "destOverride": ["http", "tls"]
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
        "destOverride": ["http", "tls"]
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
        "domain": ["geosite:category-ads-all"],
        "outboundTag": "block"
      },
      {
        "port": 123,
        "network": "udp",
        "outboundTag": "direct"
      },
      {
        "ip": ["1.1.1.1"],
        "outboundTag": "proxy"
      },
      {
        "domain": ["geosite:cn"],
        "outboundTag": "direct"
      },
      {
        "protocol": ["bittorrent"],
        "outboundTag": "direct"
      },
      {
        "ip": ["geoip:private"],
        "outboundTag": "direct"
      },
      {
        "inboundTag": ["tproxy-in"],
        "outboundTag": "nginxtls"
      }
    ]
  }
}
```

If using transparent proxy, you need to add the following to the `iptables` or `ip6tables` configuration:

```bash
# Set policy routing v4
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

# Set policy routing v6
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# VPS IP Direct Connection
iptables -t mangle -A XRAY_MASK -d VSP_IPv4/32 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d VPS_IPv6/128 -j RETURN
```

## Start Services on Client & Server

`systemctl restart xray`

`systemctl restart nginx`

## Conclusion

# Building HTTPS Tunnels with Dual-End HAProxy to Hide Fingerprints

Install HAProxy:

`pacman -Su haproxy` or `apt install haproxy`

HAProxy requires OpenSSL support to handle SSL. Check the OpenSSL version and install or update it if necessary.

## HTTPS Tunnel

The Nginx HTTPS tunnel described above can also be easily achieved with HAProxy.

Network Structure:

xray_client ---tcp--- haproxy_client ---HTTPS--- haproxy_sever ---tcp--- xray_server

### haproxy_client Configuration (Uncomment before running)

```haproxy
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Force tunnel to use TLS 1.3
    ssl-default-server-options ssl-min-ver TLSv1.3

defaults
    log global
    mode tcp
    timeout connect 5s
    timeout client  300s
    timeout server  300s

frontend xray
    bind 127.0.0.1:6666 # Listen on local port 6666
    default_backend tunnel

backend tunnel
    server tunnel [www.example.com:443](https://www.example.com:443) ssl verify none sni req.hdr(host) alpn h2,http/1.1
    # Domain or IP are both fine. If using a domain, it's recommended to specify the IP in hosts to reduce resolution time.
    # alpn negotiates with the server. If the server side is alpn h2,http1.1:
    # Specifying h2 on the client means the tunnel connects via HTTP2.
    # Specifying http1.1 means HTTP. It is recommended to prioritize h2 on both ends.
```

### haproxy_server Configuration (Uncomment before running)

```haproxy
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Specify cipher suites and set minimum SSL version to 1.2 to increase authenticity
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
    bind :::443 ssl crt /path/to/pem alpn h2,http/1.1 # haproxy uses pem for ssl decryption. pem is obtained by: cat [www.example.com](https://www.example.com).crt [www.example.com](https://www.example.com).key > [www.example.com](https://www.example.com).pem
    default_backend xray
    tcp-request inspect-delay 5s
    tcp-request content accept if HTTP
    use_backend web if HTTP

backend xray
    server xray /dev/shm/vless.sock # Supports abstract format: "abns@vless.sock"; loopback method: 127.0.0.1:6666

backend web
    server web /dev/shm/h1h2c.sock # Fallback to web page
```

### Xray Configuration

Same as the Nginx section above: Simplest TCP configuration. It works with any protocol. It is recommended to use VLESS+TCP without extra encryption. Refer to the documentation or other examples.

## WebSocket over HTTP/2

HAProxy supports inbound and outbound HTTP/2 h2c.

However, quoting the Xray documentation on HTTP/2:

"According to HTTP/2 recommendations, both the client and server must enable TLS to use this transport method normally... The current version of HTTP/2 transport does not enforce TLS configuration for inbound (server side)."

This means inbound can use h2c, but outbound does not support h2c. Therefore, you cannot use: `xray_client ---h2c--- haproxy_client ---HTTP/2+TLS--- haproxy_sever ---h2c--- xray_server`.

However, we can use a trick with WS (WebSocket). HAProxy supports WS over HTTP/2.

So the network structure is: `xray_client ---ws--- haproxy_client ---ws over HTTP/2 over HTTPS--- haproxy_sever ---ws--- xray_server`.

### haproxy_client Configuration

```haproxy
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Adjust HTTP/2 performance. Set relevant items when encountering HTTP/2 performance issues. For more settings, see the tune.h2 section of the Haproxy documentation [https://docs.haproxy.org/2.7/configuration.html](https://docs.haproxy.org/2.7/configuration.html)
    tune.h2.initial-window-size 536870912 # Initial window size. Recommended to set. Default is 65536 bytes. Larger values may require some load time during traffic bursts. Adjust based on network speed.
    tune.h2.max-concurrent-streams 512 # Number of multiplexed streams. Set as needed. Default is 100. Generally no need to set (official recommendation is not to change).

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
    server tunnel [www.example.com:443](https://www.example.com:443) ssl verify none sni req.hdr(host) ws h2 alpn h2
    # ws over HTTP/2
```

### haproxy_server Configuration

```haproxy
global
    log /dev/log local0 alert
    log /dev/log local1 alert
    stats socket /dev/shm/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user root
    group root
    daemon

    # Configured on client is enough, configuring on server is also fine
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
    # haproxy using http mode can route based on path

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

### Xray Configuration

A simple WebSocket configuration is sufficient. No TLS required. See Xray documentation examples. Configuration of "path" can be used for server-side HAProxy routing (if the client has routing needs, it can also be done via client-side HAProxy; the principle is similar, refer to the server-side path routing configuration).

## gRPC over HTTP/2

Although dual-end h2c doesn't work, gRPC does not mandate TLS, so we can go straight ahead.

Network Structure: `xray_client ---gRPC h2c--- haproxy_client ---gRPC over HTTP/2 over HTTPS--- haproxy_sever ---gRPC h2c--- xray_server`

### haproxy_client Configuration

```haproxy
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
    bind 127.0.0.1:6666 proto h2 # Specify proto h2 to use h2c
    default_backend tunnel

backend tunnel
    server tunnel [www.example.com:443](https://www.example.com:443) ssl verify none sni req.hdr(host) alpn h2
```

### haproxy_server Configuration

```haproxy
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
    use_backend xray if { ssl_fc_alpn -i h2 } { path_beg /tunnel } # The "serviceName" configured in xray gRPC can be used for routing in haproxy via path. For convenience when using "multiMode", use the path_beg parameter to match the path.
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

### Xray Configuration

Simple gRPC configuration, no TLS needed. See documentation for configuration. The configured `serviceName` can be used for routing.

# HAProxy Using Self-Signed Certificates for Mutual Authentication (gRPC Example)

Here, we use self-signed certificates with mutual authentication (mTLS) to strengthen tunnel security (at the cost of a little latency, though not very noticeable with gRPC). The server handles both trusted certificates and self-signed certificates simultaneously, and routes traffic for the camouflage site and tunnel traffic accordingly.

Where `www.example.com` is the trusted certificate for the camouflage site (like certificates applied for in the Plain Language Guide).

`tunnel.example.com` is the URL for the self-signed certificate. For self-signed certificates, refer to: <https://learn.microsoft.com/en-us/azure/application-gateway/self-signed-certificates>

Root certificate: `ca.crt`; Server certificate: `server.crt`; Server key: `server.key`.

You need to generate at least one `server.pem`. The client can use this same certificate for mutual authentication; or generate two certificates, one for client and one for server, for mutual authentication.

Prepare `fullchain.crt` for verification (`cat server.crt ca.crt > fullchain.crt`) and `server.pem` (`cat server.crt server.key ca.crt > server.pem`) for decryption.

### haproxy_client Configuration

```haproxy
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
    # The URL is custom, just keep it consistent with the self-signed certificate. Configure IP resolution in hosts. Set sni with `sni str()` for server-side identification.
```

### haproxy_server Configuration

```haproxy
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
    bind :::443 tfo allow-0rtt ssl crt /path/to/server.pem verify optional ca-file /path/to/fullchain.crt crt /path/to/[www.example.com](https://www.example.com).pem alpn h2,http/1.1
    use_backend xray if { ssl_fc_sni tunnel.example.com } { ssl_c_used } { ssl_fc_alpn -i h2 } { path_beg /tunnel }
    use_backend server1 if { ssl_fc_sni atunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path2 }
    use_backend server2 if { ssl_fc_sni btunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path3 }
    use_backend server3 if { ssl_fc_sni ctunnel.example.com } { ssl_c_used }  { ssl_fc_alpn -i h2 } { path_beg /path4 }
    default_backend web
    # Haproxy supports multiple pem decryptions
    # Can route based on different client SNIs, or based on path. Various methods available. See Haproxy docs for more ACLs.

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

### Xray Configuration

Simple gRPC configuration, no TLS needed. See documentation for configuration. The configured `serviceName` can be used for routing.
