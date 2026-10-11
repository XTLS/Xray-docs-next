# Скрипты DNS

Когда скрипт указан через [`dns.script`](../../../config/dns.md#dnsobject), обработка встроенного DNS передаётся функции Lua `HandleDNSQuery`.

## Минимальный пример

Добавьте в существующую конфигурацию:

```json
{
  "dns": {
    "script": "dns.lua",
    "servers": ["1.1.1.1"]
  }
}
```

Сохраните `dns.lua`:

```lua
local dns = require("xray.dns")
local server = dns.Servers[1]

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return server:Query(domain, ipv4, ipv6, fake)
end
```

Этот фрагмент нужно объединить с полной конфигурацией. Правила поиска файла описаны в разделе [Пути к файлам скриптов](../environment.md#пути-к-фаилам-скриптов).

Пример передаёт параметры вышестоящему серверу без изменений и напрямую возвращает результат запроса. Полный список параметров, ограничения возвращаемых значений и поведение при ошибках описаны в [HandleDNSQuery](../reference/hook-dns.md).

## Связь с конфигурацией DNS

До передачи запроса скрипту по-прежнему выполняются проверка домена встроенным DNS, глобальные ограничения типов запросов и обработка Hosts. Если Hosts уже вернул допустимые IP-адреса или явно отклонил запрос, скрипт не вызывается. Если Hosts заменил домен, скрипт запрашивает заменённый домен.

При включении скрипта он управляет выбором вышестоящего сервера, поэтому `domains`, `skipFallback`, `finalQuery`, `disableFallback`, `disableFallbackIfMatch` и `enableParallelQuery` больше не имеют практического значения.

Для запроса к конкретному серверу используйте [`serverObj:Query`](../reference/module-dns.md#query). Настройки отдельного сервера, которые продолжают действовать, перечислены в описании этого API.

::: tip Совет
Если соответствие между серверами и правилами фильтрации постоянно, удобнее и быстрее настроить `expectedIPs` / `unexpectedIPs` напрямую. Можно также не задавать эти параметры и фильтровать результаты в Lua методами вроде [`ipMatcherObj:FilterIPs`](../reference/module-geodata.md#filterips), что даёт больше гибкости.
:::

## Пример: выбор сервера по домену и фильтрация результатов

Следующий пример выбирает вышестоящие серверы по категории домена и при необходимости фильтрует китайские IP-адреса. Для каждого сервера задаётся `id`, по которому скрипт выполняет запросы и выбирает резервный сервер:

```json
{
  "dns": {
    "script": "dns.lua",
    "tag": "dns-proxy",
    "servers": [
      { "id": "cf", "address": "1.1.1.1" },
      { "id": "google", "address": "8.8.8.8" },
      { "id": "cn114", "address": "114.114.114.114", "tag": "dns-direct" },
      { "id": "cn223", "address": "223.5.5.5", "tag": "dns-direct" },
      {
        "id": "google-ecs",
        "address": "8.8.8.8",
        "clientIp": "222.85.85.85"
      },
      {
        "id": "google-alt-ecs",
        "address": "8.8.4.4",
        "clientIp": "222.85.85.85"
      }
    ]
  },
  "routing": {
    "rules": [
      { "inboundTag": ["dns-direct"], "outboundTag": "direct" },
      { "inboundTag": ["dns-proxy"], "outboundTag": "proxy" }
    ]
  },
  "outbounds": [
    { "tag": "direct", "protocol": "freedom" },
    {
      "tag": "proxy",
      "protocol": "vless",
      "settings": {
        // ...
      }
    }
  ]
}
```

`dns-direct` и `dns-proxy` — входящие теги запросов к вышестоящим DNS-серверам. Правила маршрутизации выше выбирают для них прямое исходящее подключение `direct` и прокси VLESS `proxy` соответственно.

Скрипт сначала определяет порядок запросов по домену, затем последовательно опрашивает серверы. Если запрос завершился ошибкой или результат после фильтрации пуст, он пробует следующий сервер:

```lua
local geodata = require("xray.geodata")
local dns = require("xray.dns")
local servers = {}
for _, server in ipairs(dns.Servers) do
    servers[server.ID] = server
end

local googleDomainMatcher = geodata.BuildDomainMatcher("geosite:google")
local cnDomainMatcher = geodata.BuildDomainMatcher("geosite:cn")
local foreignDomainMatcher = geodata.BuildDomainMatcher("geosite:geolocation-!cn")
local cnIPMatcher = geodata.BuildIPMatcher("geoip:cn")

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    local queries
    if googleDomainMatcher:MatchAny(domain) then
        -- Использовать публичный DNS для доменов Google.
        queries = {{"cf"}, {"google"}}
    elseif cnDomainMatcher:MatchAny(domain) then
        -- Для китайских доменов сначала запросить прямой DNS, оставить китайские IP, затем перейти к DNS через прокси.
        queries = {
            {"cn114", "cn"}, {"cn223", "cn"}, {"cf"}, {"google"}
        }
    elseif foreignDomainMatcher:MatchAny(domain) then
        -- Для некитайских доменов сначала исключить китайские IP, затем попробовать запросы с ECS.
        queries = {
            {"cf", "non-cn"}, {"google", "non-cn"},
            {"google-ecs"}, {"google-alt-ecs"}
        }
    else
        -- Для доменов вне списков сначала искать китайские IP через ECS, затем перейти к обычному публичному DNS.
        queries = {
            {"google-ecs", "cn"}, {"google-alt-ecs", "cn"},
            {"cf"}, {"google"}
        }
    end

    local lastError = "Нет DNS-результатов, удовлетворяющих условиям"
    for _, query in ipairs(queries) do
        local ips, ttl, err =
            servers[query[1]]:Query(domain, ipv4, ipv6, fake)
        if err then
            lastError = err
        else
            if query[2] then
                local inCn, outsideCn = cnIPMatcher:FilterIPs(ips)
                if query[2] == "cn" then
                    ips = inCn
                else
                    ips = outsideCn
                end
            end
            if ips and #ips > 0 then
                return ips, ttl, nil
            end
        end
    end
    return nil, 0, lastError
end
```

Инициализация верхнего уровня и сохранение состояния скриптов DNS описаны в разделе [Жизненный цикл пула](./lifecycle.md#жизненныи-цикл-пула).
