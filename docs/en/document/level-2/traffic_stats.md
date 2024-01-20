---
title: 流量统计
---

# 流量统计配置教程

请熟悉[流量统计 白话文教程](https://guide.v2fly.org/advanced/traffic.html)，本文在其基础上适配了 Xray（1.5.9+）。

## 查看流量信息

配置方法与 v2fly 一致。
查看流量信息是 xray 命令行的其中一个功能。配置内设置的 api dokodemo-door 端口，即为 `--server` 参数的端口。

```bash
xray api statsquery --server=127.0.0.1:10085 #查看所有流量
xray help api statsquery #statsquery 查询匹配的记录
xray help api stats #stats 查询一个记录
```

输出例子：

```json
{
  "stat": [
    {
      "name": "inbound>>>vmess-quic>>>traffic>>>downlink",
      "value": "1176"
    },
    {
      "name": "user>>>love@example.com>>>traffic>>>downlink",
      "value": "2040"
    },
    {
      "name": "inbound>>>api>>>traffic>>>uplink",
      "value": "14247"
    },
    {
      "name": "user>>>love@example.com>>>traffic>>>uplink",
      "value": "2520"
    },
    {
      "name": "inbound>>>api>>>traffic>>>downlink",
      "value": "87618"
    },
    {
      "name": "outbound>>>direct>>>traffic>>>downlink",
      "value": "0"
    },
    {
      "name": "inbound>>>vmess-quic>>>traffic>>>uplink",
      "value": "1691"
    },
    {
      "name": "outbound>>>direct>>>traffic>>>uplink",
      "value": "0"
    }
  ]
}
```

## 流量信息的处理

把以下脚本保存到 `traffic.sh`，注意使用 `chmod 755 traffic.sh` 授予执行权限。注意调整修改 `_APISERVER` 一行的连接具体的端口参数。

```bash
#!/bin/bash

_APISERVER=127.0.0.1:10085
_XRAY=/usr/local/bin/xray

apidata () {
    local ARGS=
    if [[ $1 == "reset" ]]; then
      ARGS="-reset=true"
    fi
    $_XRAY api statsquery --server=$_APISERVER "${ARGS}" \
    | awk '{
        if (match($1, /"name":/)) {
            f=1; gsub(/^"|link"|,$/, "", $2);
            split($2, p,  ">>>");
            printf "%s:%s->%s\t", p[1],p[2],p[4];
        }
        else if (match($1, /"value":/) && f){
          f = 0;
          gsub(/"/, "", $2);
          printf "%.0f\n", $2;
        }
        else if (match($0, /}/) && f) { f = 0; print 0; }
    }'
}

print_sum() {
    local DATA="$1"
    local PREFIX="$2"
    local SORTED=$(echo "$DATA" | grep "^${PREFIX}" | sort -r)
    local SUM=$(echo "$SORTED" | awk '
        /->up/{us+=$2}
        /->down/{ds+=$2}
        END{
            printf "SUM->up:\t%.0f\nSUM->down:\t%.0f\nSUM->TOTAL:\t%.0f\n", us, ds, us+ds;
        }')
    echo -e "${SORTED}\n${SUM}" \
    | numfmt --field=2 --suffix=B --to=iec \
    | column -t
}

DATA=$(apidata $1)
echo "------------Inbound----------"
print_sum "$DATA" "inbound"
echo "-----------------------------"
echo "------------Outbound----------"
print_sum "$DATA" "outbound"
echo "-----------------------------"
echo
echo "-------------User------------"
print_sum "$DATA" "user"
echo "-----------------------------"
```
