---
title: Nginx_TLS隧道隐藏指纹
---

# 客户端服务端构建 Nginx 隧道隐藏指纹

网路结构：

xray_client ---tcp--- nginx_client ---tcp_TLS--- nginx_sever ---tcp--- xray_server

## 编译 nginx --with-stream

在客户端及服务端均编译

`curl -O -L http://nginx.org/download/nginx-1.22.1.tar.gz`

`tar -zxvf nginx-1.22.1.tar.gz`

`cd nginx-1.22.1`

`apt install gcc make` //编译依赖 gcc 以及 make

`./configure --prefix=/usr/local/nginx --with-http_ssl_module --with-http_v2_module --with-stream --with-stream_ssl_module` //此步需要依赖一些库，根据报错安装相应 lib

`make && make install`

编译之后 nginx 文件夹位于 `/usr/local/nginx`

## 配置 nginx

编辑 nginx 配置文件 nginx.conf

`vim /usr/local/nginx/conf/nginx.conf`

服务端加入如下配置

服务器申请证书不再赘述，参考[白话文](https://xtls.github.io/document/level-0/ch06-certificates.html)

```
stream {
    server {
        listen 443 ssl;
        listen [::]:443 ssl;
        ssl_protocols TLSv1.3;
        ssl_certificate /path/to/cert/domain.crt; #crt文件位置
        ssl_certificate_key /path/to/cert/domain.key; #key文件位置
        proxy_pass unix:/dev/shm/vless.sock; #使用 domain socket
    }
}
```

::: warning 注意

stream 部分与 http 模块并列，客户端可删除 http 部分，服务端可删除或搭建网页伪装回落
:::

客户端加入如下配置

```
stream {
    server {
        listen 6666;
        listen [::]:6666;
        proxy_ssl on;
        proxy_ssl_protocols TLSv1.3;
        proxy_ssl_server_name on;
        proxy_ssl_name yourdomain.domain; #服务器域名
        proxy_pass ip:443; #服务器 ip 形如 proxy_pass 6.6.6.6:443; 或 proxy_pass [2401:0:0::1]:443;
    }
}
```

在 `/etc/systemd/system` 文件夹中创建 `nginx.service` 文件

`vim /etc/systemd/system/nginx.service`

写入如下

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

加入开机自启

`systemctl enable nginx`

## xray 配置

服务端 xray 配置

```
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

客户端 xray 配置，此处以旁路由透明代理为例

```
{
	"log": {
		"loglevel": "none"
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
				],
				"routeOnly": true
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

如果使用透明代理需要在 iptables 或 ip6tables 配置中加入

```
iptables -t mangle -A XRAY_MASK -d VSP_IPv4/32 -j RETURN
ip6tables -t mangle -A XRAY6_MASK -d VPS_IPv6/128 -j RETURN
```

## 客户端及服务端启动服务

`systemctl restart xray`

`systemctl restart nginx`

## 后记

客户端应该也是可以通过 domain socket 连接提高性能，但由于 xray outbound 不支持 ds 出站，想了半天没什么好的实现方法。如果 vnext 里支持 ds 就好了 (没有别的意思)。

从客户端 nginx 开始应该可以选择 http2 grpc ws 等传输方式。
