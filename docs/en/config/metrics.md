# Metrics

A more direct (and hopefully better) way to export statistics.

## Relevant Configuration

Add `metrics` to the basic configuration:

```json
    "metrics": {
        "tag": "Metrics",
        "listen": "127.0.0.1:11111"
    }
```

> `tag`: string

The outbound proxy tag corresponding to metrics. You can access it by setting up a dokodemo-door inbound + routing rules that point the dokodemo-door to this outbound.

> `listen`: string

A simpler method: directly listen on an address and port to provide the service.

When setting this field, if `tag` is empty, it will automatically be set to `Metrics`. If neither (`tag` nor `listen`) is set, the core will fail to start.

## Usage

### pprof

Visit `http://127.0.0.1:11111/debug/pprof/` or use `go tool pprof` for debugging.

To report excessive memory usage/memory leak issues, please provide files from `/debug/pprof/heap` and `/debug/pprof/goroutine`.

### expvars

Visit `http://127.0.0.1:11111/debug/vars`

Variables included:

- `stats`: Includes all inbound, outbound, and user data.
- `observatory`: Includes observatory results.

For example, in [luci-app-xray](https://github.com/yichya/luci-app-xray), you can get output like this (standard expvar content like cmdline and memstats are omitted):

<details><summary>Click to view</summary><br>

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

To get better visualization output, you can use [Netdata](https://github.com/netdata/netdata) (with python.d plugin):

1. Edit the relevant configuration file (`sudo /etc/netdata/edit-config python.d/go_expvar.conf`).
2. Use the example configuration below:

<details><summary>Click to view</summary><br>

```yaml
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

You can get results similar to this:

![160428235-2988bf69-5d6c-41ec-8267-1bd512508aa8](https://github.com/chika0801/Xray-docs-next/assets/88967758/455e88ce-ced2-4593-a9fa-425bb293215b)
