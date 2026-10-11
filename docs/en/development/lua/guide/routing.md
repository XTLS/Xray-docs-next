# Routing Scripts

When a script is specified through [`routing.script`](../../../config/routing.md#routingobject), Lua's `HandleRoute` function takes over outbound selection.

## Minimal Example

The following configuration fragment specifies the script file and configures direct and blackhole outbounds:

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

Save `routing.lua`:

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

The script reads the source IP through `ctx`. It returns `block` when the source IP is `127.0.0.1`, and `direct` otherwise, corresponding to the outbound `tag` values configured above.

Merge the fragment above into a complete configuration. See [Script File Paths](../environment.md#script-file-paths) for file lookup rules.

`HandleRoute` can also receive more parameters and return a rule name and an error. See [HandleRoute](../reference/hook-routing.md) for the full calling convention and failure behavior.

## Relationship with Routing Configuration

When a routing script is enabled, neither `rules` nor `domainStrategy` takes effect. If the script does not select an outbound or encounters an error, the built-in routing rules are not evaluated either.

You can still configure `balancers`. The script selects an outbound from a balancer through [`router:PickOutbound`](../reference/module-router.md#router-pickoutbound):

```lua
local router = require("xray.router")

function HandleRoute(ctx)
    local outboundTag, err = router:PickOutbound("balance")
    return outboundTag, "lua-balance", err
end
```

Replace `balance` in the example with the `tag` of a balancer configured in `routing.balancers`.

## Example: Explicit DNS Queries for IP-Based Routing

The following script first handles DNS upstream query traffic, then checks the request's existing target IPs. When needed, it explicitly resolves the domain, and selects an outbound based on private address ranges.

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
            log.Warning("Resolution of ", targetDomain, " failed: ", err)
        elseif privateIPMatcher:AnyMatch(resolved) then
            return "direct", "lua-resolved-private"
        end
    end

    return "proxy", "lua-default"
end
```

DNS upstream requests in normal mode also pass through routing. The example directly selects an outbound for requests where `skipDNSResolve` is `true` or `inboundTag` is `"dns-query"`, avoiding another DNS lookup that would create a loop.

The result of `dns.Query` is only used for decisions in the script. It does not automatically change the target IPs in `ctx` or the actual connection destination. The example selects `proxy` if resolution fails; adjust this to your own policy as needed.

See [Pooled Lifecycle](./lifecycle.md#pooled-lifecycle) for top-level initialization and state retention in routing scripts.
