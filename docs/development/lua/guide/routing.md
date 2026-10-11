# 路由脚本

通过 [`routing.script`](../../../config/routing.md#routingobject) 指定脚本后，路由选择由 Lua 的 `HandleRoute` 函数接管。

## 最小示例

下面的配置片段指定脚本文件，并配置直连和黑洞出站：

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

保存 `routing.lua`：

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

脚本通过 `ctx` 读取源 IP。源 IP 为 `127.0.0.1` 时返回 `block`，其余情况返回 `direct`，分别对应上面配置中的出站 `tag`。

上面的配置片段需要合并到完整配置中。文件定位规则见[脚本文件路径](../environment.md#脚本文件路径)。

`HandleRoute` 还可以接收更多参数，并返回规则名称和错误；完整调用约定及失败行为见 [HandleRoute](../reference/hook-routing.md)。

## 与路由配置的关系

启用路由脚本后，`rules` 和 `domainStrategy` 均不生效。脚本未选中出站或发生错误时，也不会继续匹配内置路由规则。

`balancers` 仍可配置，脚本通过 [`router:PickOutbound`](../reference/module-router.md#router-pickoutbound) 选择其中的出站：

```lua
local router = require("xray.router")

function HandleRoute(ctx)
    local outboundTag, err = router:PickOutbound("balance")
    return outboundTag, "lua-balance", err
end
```

将示例中的 `balance` 换成 `routing.balancers` 中已配置的负载均衡器的 `tag` 值。

## 示例：主动查询 DNS 后按 IP 分流

下面的脚本先处理 DNS 上游查询流量，然后检查请求已有的目标 IP，必要时主动解析域名，再按私有地址范围选择出站。

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
            log.Warning("解析 ", targetDomain, " 失败：", err)
        elseif privateIPMatcher:AnyMatch(resolved) then
            return "direct", "lua-resolved-private"
        end
    end

    return "proxy", "lua-default"
end
```

普通模式的 DNS 上游请求也会进入路由。示例对 `skipDNSResolve` 为 `true` 或 `inboundTag` 为 `"dns-query"` 的请求直接选择出站，避免再次发起 DNS 解析而形成回环。

`dns.Query` 的结果只用于脚本判断，不会自动改写 `ctx` 的目标 IP 或实际连接目标。示例在解析失败时选择 `proxy`；可以按需要调整为自己的策略。

路由脚本的顶层初始化和状态保留见[池化生命周期](./lifecycle.md#池化生命周期)。
