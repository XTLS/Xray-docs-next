# Metrics

更直接（希望更好）的统计导出方式。

## 相关配置

在基础配置中增加 metrics

```json
    "metrics": {
        "tag": "Metrics",
        "listen": "127.0.0.1:11111"
    }
```

> `tag`: string

metrics 对应的出站代理 tag, 通过设置任意门入站+路由将任意门指向此出站即可通过该任意门访问。

> `listen`: string

更简单的方法，直接监听一个地址端口提供服务。

设置该字段时若 tag 为空会自动设置为 `Metrics`, 如果二者均未设置核心会启动失败。

## 使用方法

### pprof

访问 `http://127.0.0.1:11111/debug/pprof/` 或者使用 go tool pprof 进行调试。

反馈内存占用过多/内存泄露问题需要提供 `/debug/pprof/heap` 和 `/debug/pprof/goroutine` 的文件

### expvars

访问 `http://127.0.0.1:11111/debug/vars`

包含的变量:

- `stats` 包括所有的 inbound outbound user 数据
- `observatory` 包含了 observatory 观测结果

例如在 [luci-app-xray](https://github.com/yichya/luci-app-xray) 你可以得到这样的输出 (省略了 cmdline 和 memstats 等标准expvar内容)

<details><summary>点击查看</summary><br>

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

为了得到更好的可视化输出, 可以使用 [Netdata](https://github.com/netdata/netdata) (with python.d plugin):

1. 编辑相关配置文件 (`sudo /etc/netdata/edit-config python.d/go_expvar.conf`)
2. 使用下面这样的实力配置:

<details><summary>点击查看</summary><br>

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

你可以得到类似这样的结果:

![160428235-2988bf69-5d6c-41ec-8267-1bd512508aa8](https://github.com/chika0801/Xray-docs-next/assets/88967758/455e88ce-ced2-4593-a9fa-425bb293215b)
