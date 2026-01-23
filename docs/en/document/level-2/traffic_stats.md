# Traffic Statistics Configuration Tutorial

Please familiarize yourself with the [Traffic Statistics Plain Language Guide](https://guide.v2fly.org/advanced/traffic.html). This article adapts those concepts for Xray (1.5.9+).

## Viewing Traffic Information

The configuration method is consistent with v2fly.
Viewing traffic information is one of the features of the xray command line. The `api dokodemo-door` port set in the configuration corresponds to the port for the `--server` parameter.

```bash
xray api statsquery --server=127.0.0.1:10085 # View all traffic statistics
xray help api statsquery # statsquery queries matching records
xray help api stats # stats queries a single record
```

Output example:

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

## Processing Traffic Information

Save the following script to `traffic.sh`, and remember to use `chmod 755 traffic.sh` to grant execution permissions. Pay attention to adjusting the specific port parameter in the `_APISERVER` line.

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
