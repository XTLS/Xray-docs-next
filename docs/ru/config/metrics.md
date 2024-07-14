# Метрики

Более простой (и, надеюсь, лучший) способ экспорта статистики.

## Связанные настройки

Можно добавить входящее подключение `metrics` в раздел `inbounds`:

```json
    "inbounds": [
        {
            "listen": "127.0.0.1",
            "port": 11111,
            "protocol": "dokodemo-door",
            "settings": {
                "address": "127.0.0.1"
            },
            "tag": "metrics_in"
        }
    ]
```

Добавьте правило маршрутизации для входящего подключения `metrics` в раздел `routing`:

```json
    "routing": {
        "rules": [
            {
                "type": "field",
                "inboundTag": [
                    "metrics_in"
                ],
                "outboundTag": "metrics_out"
            }
        ]
    }
```

Добавьте `metrics` в основные настройки:

```json
    "metrics": {
        "tag": "metrics_out"
    }
```

## Использование

### pprof

Откройте `http://127.0.0.1:11111/debug/pprof/` или используйте утилиту `go tool pprof`, чтобы начать профилирование или просмотреть запущенные горутины.

### expvars

Откройте `http://127.0.0.1:11111/debug/vars`.

Экспортируемые переменные включают:
* `stats` - статистика по входящим, исходящим подключениям и пользователям.
* `observatory` - результаты мониторинга.

Например, с помощью [luci-app-xray](https://github.com/yichya/luci-app-xray) вы, скорее всего, получите результат, подобный этому (стандартные переменные expvar, такие как `cmdline` и `memstats`, опущены):

<details><summary>Показать</summary><br>

```json
{
    "observatory": {
        "tcp_outbound": {
            "alive": true,
            "delay": 782,
            "outbound_tag": "tcp_outbound",
            "last_seen_time": 1648477189,
            "last_try_time": 1648477189
        },
        "udp_outbound": {
            "alive": true,
            "delay": 779,
            "outbound_tag": "udp_outbound",
            "last_seen_time": 1648477191,
            "last_try_time": 1648477191
        }
    },
    "stats": {
        "inbound": {
            "api": {
                "downlink": 0,
                "uplink": 0
            },
            "dns_server_inbound_5300": {
                "downlink": 14286,
                "uplink": 5857
            },
            "http_inbound": {
                "downlink": 74460,
                "uplink": 10231
            },
            "https_inbound": {
                "downlink": 0,
                "uplink": 0
            },
            "metrics": {
                "downlink": 6327,
                "uplink": 1347
            },
            "socks_inbound": {
                "downlink": 19925615,
                "uplink": 5512
            },
            "tproxy_tcp_inbound": {
                "downlink": 4739161,
                "uplink": 1568869
            },
            "tproxy_udp_inbound": {
                "downlink": 0,
                "uplink": 2608142
            }
        },
        "outbound": {
            "blackhole_outbound": {
                "downlink": 0,
                "uplink": 0
            },
            "direct": {
                "downlink": 97714548,
                "uplink": 3234617
            },
            "dns_server_outbound": {
                "downlink": 7116,
                "uplink": 2229
            },
            "manual_tproxy_outbound_tcp_1": {
                "downlink": 0,
                "uplink": 0
            },
            "manual_tproxy_outbound_udp_1": {
                "downlink": 0,
                "uplink": 0
            },
            "tcp_outbound": {
                "downlink": 23873238,
                "uplink": 1049595
            },
            "udp_outbound": {
                "downlink": 639282,
                "uplink": 74634
            }
        },
        "user": {}
    }
}
```
</details>

Чтобы лучше визуализировать эти данные, можно использовать [Netdata](https://github.com/netdata/netdata) (с плагином python.d):

1. Отредактируйте соответствующий файл конфигурации (`sudo /etc/netdata/edit-config python.d/go_expvar.conf`).
2. Используйте следующий файл конфигурации в качестве примера:

<details><summary>Показать</summary><br>

```
xray:
  name: 'xray'
  update_every: 2
  url: 'http://127.0.0.1:11111/debug/vars'
  collect_memstats: false
  extra_charts:
     - id: 'inbounds'
       options:
         name: 'inbounds'
         title: 'Xray System Inbounds'
         units: bytes
         family: xray
         context: xray.inbounds
         chart_type: line
       lines:
         - expvar_key: stats.inbound.tproxy_tcp_inbound.downlink
           id: 'tcp.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.tproxy_udp_inbound.downlink
           id: 'udp.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.http_inbound.downlink
           id: 'http.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.https_inbound.downlink
           id: 'https.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.socks_inbound.downlink
           id: 'socks.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.tproxy_tcp_inbound.uplink
           id: 'tcp.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.tproxy_udp_inbound.uplink
           id: 'udp.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.http_inbound.uplink
           id: 'http.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.https_inbound.uplink
           id: 'https.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.inbound.socks_inbound.uplink
           id: 'socks.uplink'
           algorithm: incremental
           expvar_type: int
     - id: 'outbounds'
       options:
         name: 'outbounds'
         title: 'Xray System Outbounds'
         units: bytes
         family: xray
         context: xray.outbounds
         chart_type: line
       lines:
         - expvar_key: stats.outbound.tcp_outbound.downlink
           id: 'tcp.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.outbound.udp_outbound.downlink
           id: 'udp.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.outbound.direct.downlink
           id: 'direct.downlink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.outbound.tcp_outbound.uplink
           id: 'tcp.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.outbound.udp_outbound.uplink
           id: 'udp.uplink'
           algorithm: incremental
           expvar_type: int
         - expvar_key: stats.outbound.direct.uplink
           id: 'direct.uplink'
           algorithm: incremental
           expvar_type: int
     - id: 'observatory'
       options:
         name: 'observatory'
         title: 'Xray Observatory Metrics'
         units: milliseconds
         family: xray
         context: xray.observatory
         chart_type: line
       lines:
         - expvar_key: observatory.tcp_outbound.delay
           id: tcp
           expvar_type: int
         - expvar_key: observatory.udp_outbound.delay
           id: udp
           expvar_type: int
```
</details>

И вы получите красивый график, подобный этому:

![160428235-2988bf69-5d6c-41ec-8267-1bd512508aa8](https://github.com/chika0801/Xray-docs-next/assets/88967758/455e88ce-ced2-4593-a9fa-425bb293215b)

### Дополнительно

Возможно, лучше использовать пустой объект `stats` в конфигурационном файле, чем добавлять `metrics`?

**Изменение:** удалены настройки, связанные с Prometheus, и добавлено использование expvars.




