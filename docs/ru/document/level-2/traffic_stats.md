---
title: Статистика трафика
---

# Руководство по настройке статистики трафика

Ознакомьтесь с [руководством по статистике трафика](https://guide.v2fly.org/advanced/traffic.html).  
Эта статья адаптирует его для Xray (1.5.9+).

## Просмотр статистики трафика

Способ настройки такой же, как и для v2fly.
Просмотр статистики трафика - одна из функций командной строки Xray.  Порт api dokodemo-door, указанный в конфигурации, - это порт, используемый в параметре `--server`.

```bash
xray api statsquery --server=127.0.0.1:10085 # Просмотр всей статистики трафика
xray help api statsquery # statsquery - запрос соответствующих записей
xray help api stats # stats - запрос одной записи
```

Пример вывода:

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

## Обработка статистики трафика

Сохраните следующий скрипт в файл `traffic.sh` и предоставьте ему права на выполнение с помощью команды `chmod 755 traffic.sh`.  
Не забудьте изменить строку `_APISERVER`, указав правильный порт.

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


