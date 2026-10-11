# DNS Scripts

When a script is specified through [`dns.script`](../../../config/dns.md#dnsobject), Lua's `HandleDNSQuery` function takes over the built-in DNS processing flow.

## Minimal Example

Add the following to an existing configuration:

```json
{
  "dns": {
    "script": "dns.lua",
    "servers": ["1.1.1.1"]
  }
}
```

Save `dns.lua`:

```lua
local dns = require("xray.dns")
local server = dns.Servers[1]

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return server:Query(domain, ipv4, ipv6, fake)
end
```

Merge the fragment above into a complete configuration. See [Script File Paths](../environment.md#script-file-paths) for file lookup rules.

The example passes the parameters unchanged to the upstream and returns the query results directly. See [HandleDNSQuery](../reference/hook-dns.md) for the full parameters, return-value restrictions, and failure behavior.

## Relationship with DNS Configuration

Before a query reaches the script, the built-in DNS domain validation, global query-type restrictions, and Hosts processing still apply. The script is not called if Hosts has already supplied valid IPs or explicitly rejected the request. If Hosts replaces the domain, the script queries the replacement domain.

When the script is enabled, it controls upstream selection, so `domains`, `skipFallback`, `finalQuery`, `disableFallback`, `disableFallbackIfMatch`, and `enableParallelQuery` no longer have a practical effect.

Use [`serverObj:Query`](../reference/module-dns.md#query) to query a specific upstream. See that API for the server settings that still take effect.

::: tip
When the mapping between upstreams and filtering rules is fixed, configuring `expectedIPs` / `unexpectedIPs` directly is more convenient and efficient. You can also omit these settings and filter in Lua with methods such as [`ipMatcherObj:FilterIPs`](../reference/module-geodata.md#filterips) for greater flexibility.
:::

## Example: Domain-Based Upstream Selection and Result Filtering

The following example selects upstreams by domain category and filters Chinese IPs as needed. Each server is configured with an `id`, which the script uses for queries and fallback:

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

`dns-direct` and `dns-proxy` are inbound tags for DNS upstream queries. The routing rules above select the direct outbound `direct` and the VLESS proxy outbound `proxy`, respectively.

The script first chooses a query order based on the domain, then queries the upstreams one by one. If a query fails or its filtered result is empty, it tries the next server:

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
        -- Use public DNS for Google domains.
        queries = {{"cf"}, {"google"}}
    elseif cnDomainMatcher:MatchAny(domain) then
        -- For Chinese domains, query direct DNS, keep Chinese IPs, then fall back to proxied DNS.
        queries = {
            {"cn114", "cn"}, {"cn223", "cn"}, {"cf"}, {"google"}
        }
    elseif foreignDomainMatcher:MatchAny(domain) then
        -- For non-Chinese domains, exclude Chinese IPs first, then try queries with ECS.
        queries = {
            {"cf", "non-cn"}, {"google", "non-cn"},
            {"google-ecs"}, {"google-alt-ecs"}
        }
    else
        -- For unlisted domains, use ECS to look for Chinese IPs, then fall back to regular public DNS.
        queries = {
            {"google-ecs", "cn"}, {"google-alt-ecs", "cn"},
            {"cf"}, {"google"}
        }
    end

    local lastError = "No DNS result meets the conditions"
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

See [Pooled Lifecycle](./lifecycle.md#pooled-lifecycle) for top-level initialization and state retention in DNS scripts.
