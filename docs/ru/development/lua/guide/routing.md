# Скрипты маршрутизации

Когда скрипт указан через [`routing.script`](../../../config/routing.md#routingobject), выбор исходящего подключения передаётся функции Lua `HandleRoute`.

## Минимальный пример

Следующий фрагмент конфигурации задаёт файл скрипта и настраивает исходящие подключения для прямого соединения и блокировки:

```json
{
  "routing": {
    "script": "routing.lua"
  },
  "outbounds": [
    { "tag": "direct", "protocol": "freedom" },
    { "tag": "block", "protocol": "blackhole" }
  ]
}
```

Сохраните `routing.lua`:

```lua
function HandleRoute(ctx)
    local sourceIPs = ctx:GetSourceIPs()
    if sourceIPs and #sourceIPs > 0
        and sourceIPs[1]:String() == "127.0.0.1" then
        return "block"
    end
    return "direct"
end
```

Скрипт читает IP-адрес источника через `ctx`. При адресе `127.0.0.1` он возвращает `block`, в остальных случаях — `direct`. Эти значения соответствуют `tag` исходящих подключений в конфигурации выше.

Этот фрагмент нужно объединить с полной конфигурацией. Правила поиска файла описаны в разделе [Пути к файлам скриптов](../environment.md#пути-к-фаилам-скриптов).

`HandleRoute` также может получать дополнительные параметры и возвращать имя правила и ошибку. Полное соглашение о вызове и поведение при ошибках описаны в [HandleRoute](../reference/hook-routing.md).

## Связь с конфигурацией маршрутизации

При включении скрипта маршрутизации `rules` и `domainStrategy` не действуют. Если скрипт не выбрал исходящее подключение или возникла ошибка, встроенные правила маршрутизации также не проверяются.

Настройка `balancers` остаётся доступной. Скрипт выбирает исходящее подключение через [`router:PickOutbound`](../reference/module-router.md#router-pickoutbound):

```lua
local router = require("xray.router")

function HandleRoute(ctx)
    local outboundTag, err = router:PickOutbound("balance")
    return outboundTag, "lua-balance", err
end
```

Замените `balance` в примере значением `tag` балансировщика, настроенного в `routing.balancers`.

## Пример: явный DNS-запрос для маршрутизации по IP

Следующий скрипт сначала обрабатывает трафик запросов к вышестоящим DNS-серверам, затем проверяет имеющиеся IP-адреса назначения запроса. При необходимости он явно разрешает домен и выбирает исходящее подключение по диапазонам частных адресов.

```json
{
  "dns": {
    "tag": "dns-query",
    "servers": ["1.1.1.1"]
  },
  "routing": {
    "script": "routing.lua"
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

```lua
local dns = require("xray.dns")
local geodata = require("xray.geodata")
local log = require("xray.log")
local privateIPMatcher = geodata.BuildIPMatcher("geoip:private")

function HandleRoute(ctx, inboundTag, sourcePort, targetPort,
    localPort, targetDomain, network, protocol, user,
    vlessRoute, skipDNSResolve)
    if skipDNSResolve or inboundTag == "dns-query" then
        return "direct", "lua-dns"
    end

    local ips = ctx:GetTargetIPs()
    if privateIPMatcher:AnyMatch(ips) then
        return "direct", "lua-private"
    end

    if targetDomain ~= "" then
        local resolved, ttl, err =
            dns.Query(targetDomain, true, true, false)
        if err ~= nil then
            log.Warning("Разрешение ", targetDomain, " завершилось ошибкой: ", err)
        elseif privateIPMatcher:AnyMatch(resolved) then
            return "direct", "lua-resolved-private"
        end
    end

    return "proxy", "lua-default"
end
```

Запросы к вышестоящим DNS-серверам в обычном режиме также проходят через маршрутизацию. В примере для запросов с `skipDNSResolve`, равным `true`, или `inboundTag`, равным `"dns-query"`, исходящее подключение выбирается сразу, чтобы повторный DNS-запрос не создал петлю.

Результат `dns.Query` используется только для принятия решения в скрипте. Он не меняет автоматически IP-адреса назначения в `ctx` или фактическую цель соединения. При ошибке разрешения пример выбирает `proxy`; при необходимости измените это поведение согласно своей политике.

Инициализация верхнего уровня и сохранение состояния скриптов маршрутизации описаны в разделе [Жизненный цикл пула](./lifecycle.md#жизненныи-цикл-пула).
