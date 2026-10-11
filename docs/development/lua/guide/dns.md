# DNS 脚本

通过 [`dns.script`](../../../config/dns.md#dnsobject) 指定脚本后，内置 DNS 处理流程由 Lua 的 `HandleDNSQuery` 函数接管。

## 最小示例

在已有配置中加入：

```json
{
  "dns": {
    "script": "dns.lua",
    "servers": ["1.1.1.1"]
  }
}
```

保存 `dns.lua`：

```lua
local dns = require("xray.dns")
local server = dns.Servers[1]

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return server:Query(domain, ipv4, ipv6, fake)
end
```

上面的配置片段需要合并到完整配置中。文件定位规则见[脚本文件路径](../environment.md#脚本文件路径)。

示例将参数原样传给上游，并直接返回查询结果。完整参数、返回值限制及失败行为见 [HandleDNSQuery](../reference/hook-dns.md)。

## 与 DNS 配置的关系

查询到达脚本前，仍经过内置 DNS 的域名检查、全局查询类型限制和 Hosts 处理。Hosts 已给出有效 IP 或明确拒绝请求时，不调用脚本；Hosts 替换域名时，脚本查询替换后的域名。

启用脚本后，上游选择由脚本控制，因此 `domains`、`skipFallback`、`finalQuery`、`disableFallback`、`disableFallbackIfMatch` 和 `enableParallelQuery` 不再有实际意义。

查询指定上游使用 [`serverObj:Query`](../reference/module-dns.md#query)；单台服务器仍生效的配置项见该 API。

::: tip 小提示
上游与过滤规则的对应关系不变时，直接配置 `expectedIPs` / `unexpectedIPs` 更方便快捷；也可以不配置这两项，交给 Lua 使用 [`ipMatcherObj:FilterIPs`](../reference/module-geodata.md#filterips) 等方法自行过滤，更灵活。
:::

## 示例：按域名分流并过滤解析结果

下面的示例按域名分类选择上游，并按需要过滤中国 IP。为服务器配置 `id`，脚本按标识查询和回退：

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

`dns-direct`、`dns-proxy` 是 DNS 上游查询的入站标识，通过上面的路由规则分别选择直连出站 `direct` 和 VLESS 代理出站 `proxy`。

脚本先按域名选择查询顺序，再逐个查询上游；查询失败或过滤后为空时，尝试下一台服务器：

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
        -- Google 域名使用公共 DNS。
        queries = {{"cf"}, {"google"}}
    elseif cnDomainMatcher:MatchAny(domain) then
        -- 中国域名先查直连 DNS，只保留中国 IP，再回退到代理 DNS。
        queries = {
            {"cn114", "cn"}, {"cn223", "cn"}, {"cf"}, {"google"}
        }
    elseif foreignDomainMatcher:MatchAny(domain) then
        -- 非中国域名先排除中国 IP，再尝试带 ECS 的查询。
        queries = {
            {"cf", "non-cn"}, {"google", "non-cn"},
            {"google-ecs"}, {"google-alt-ecs"}
        }
    else
        -- 未收录域名先通过 ECS 寻找中国 IP，再回退到普通公共 DNS。
        queries = {
            {"google-ecs", "cn"}, {"google-alt-ecs", "cn"},
            {"cf"}, {"google"}
        }
    end

    local lastError = "没有符合条件的 DNS 结果"
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

DNS 脚本的顶层初始化和状态保留见[池化生命周期](./lifecycle.md#池化生命周期)。
