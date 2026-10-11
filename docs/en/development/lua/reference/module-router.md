# xray.router

Provides constants and helpers for [routing scripts](../guide/routing.md). See [Routing Hook](./hook-routing.md) for request parameters and context.

```lua
local router = require("xray.router")
```

## API Index

| Category | Member                                                     | Description                                         |
| -------- | ---------------------------------------------------------- | --------------------------------------------------- |
| Constant | [`router.NetworkUnknown`](#constants)                      | Unknown network                                     |
| Constant | [`router.NetworkTCP`](#constants)                          | TCP                                                 |
| Constant | [`router.NetworkUDP`](#constants)                          | UDP                                                 |
| Constant | [`router.NetworkUNIX`](#constants)                         | UNIX                                                |
| Constant | [`router.LocalOS`](#constants)                             | Runtime platform                                    |
| Function | [`router:PickOutbound(balancerTag)`](#router-pickoutbound) | Select an outbound through a balancer               |
| Function | [`router.FindProcess(ctx)`](#router-findprocess)           | Find the process associated with a local connection |

## Constants

| Name                    | Type     | Value / Description                                                         |
| ----------------------- | -------- | --------------------------------------------------------------------------- |
| `router.NetworkUnknown` | `number` | `0`, unknown network                                                        |
| `router.NetworkTCP`     | `number` | `2`, TCP                                                                    |
| `router.NetworkUDP`     | `number` | `3`, UDP                                                                    |
| `router.NetworkUNIX`    | `number` | `4`, UNIX                                                                   |
| `router.LocalOS`        | `string` | Current runtime platform, for example `"windows"`, `"linux"`, or `"darwin"` |

Compare the [Routing Hook](./hook-routing.md#handleroute)'s `network` parameter with the network constants:

```lua
if network == router.NetworkUDP then
    return "direct", "lua-udp"
end
```

## Functions

### router:PickOutbound

```lua
local outboundTag, err = router:PickOutbound(balancerTag)
```

Selects an outbound through the specified balancer.

**Parameters**

| Parameter     | Type     | Description / Requirements                                                                                       |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `balancerTag` | `string` | The `tag` of the balancer to use, configured in [`routing.balancers`](../../../config/routing.md#balancerobject) |

**Return Values**

| Return value  | Type                                      | Description                                         |
| ------------- | ----------------------------------------- | --------------------------------------------------- |
| `outboundTag` | `string` or `nil`                         | On success, the selected outbound's non-empty `tag` |
| `err`         | [`error`](./data-types.md#error) or `nil` | `nil` indicates success                             |

**Behavior**

A string must be passed explicitly; otherwise a Lua exception is raised. An empty string `""` looks up an empty `tag`.

Check `err` before using the result. If the balancer does not exist, returns `nil, err`; if it exists but selects no outbound, returns `"", err`. When the configured `fallbackTag` takes effect, returns that outbound tag and `nil`.

**Example**

The following uses the balancer with `tag` `"proxy-pool"` and passes on the result according to the [Routing Hook's return-value convention](./hook-routing.md#return-values):

```lua
local outboundTag, err = router:PickOutbound("proxy-pool")
return outboundTag, "lua-balance", err
```

See the [Routing Scripts guide](../guide/routing.md#relationship-with-routing-configuration) for a complete example.

### router.FindProcess

```lua
local pid, name, path, err = router.FindProcess(ctx)
```

Finds the process on the local machine associated with the current connection.

**Parameters**

| Parameter | Type                                                   | Description / Requirements                          |
| --------- | ------------------------------------------------------ | --------------------------------------------------- |
| `ctx`     | [`routing.Context`](./hook-routing.md#routing-context) | Current request context, passed to the Routing Hook |

**Return Values**

| Return value | Type                                      | Description                            |
| ------------ | ----------------------------------------- | -------------------------------------- |
| `pid`        | `number`                                  | Process ID; usually `0` if unavailable |
| `name`       | `string`                                  | Process name; `""` if unavailable      |
| `path`       | `string`                                  | Executable path; `""` if unavailable   |
| `err`        | [`error`](./data-types.md#error) or `nil` | `nil` indicates success                |

**Behavior**

A valid routing context must be passed explicitly; otherwise a Lua exception is raised. Returns an error if there is no source IP, the network type is not TCP/UDP, lookup fails, or the platform is unsupported.

`pid`, `name`, and `path` are never `nil`, but may retain partial information on failure; check `err` before using them. If there is no source IP or the network type is unsupported, returns `0, "", "", err`; otherwise returns the platform lookup results unchanged.

The lookup uses the first source IP and source port. If target IPs are available, it also passes the first target IP and target port. The platform lookup implementation determines the exact matching behavior.

Lookup capabilities depend on the platform and permissions. Windows, Linux, and macOS provide built-in implementations. Android requires the runtime environment to register a lookup implementation, and even successful results may have no name or path. iOS and other unsupported platforms return an error.

**Example**

```lua
local pid, name, path, err = router.FindProcess(ctx)
if err == nil and name == "curl" then
    return "direct", "lua-process"
end
```
