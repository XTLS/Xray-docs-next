# Routing Hook

The core calls the global `HandleRoute` function in `routing.script` when selecting an outbound. See the [Routing Scripts guide](../guide/routing.md) for configuration and complete examples.

## API Index

| Category | Member                                  | Description                           |
| -------- | --------------------------------------- | ------------------------------------- |
| Hook     | [`HandleRoute(...)`](#handleroute)      | Select an outbound for a request      |
| Object   | [`routing.Context`](#routing-context)   | The current request's routing context |
| Method   | [`ctx:GetSourceIPs()`](#getsourceips)   | Get source IPs                        |
| Method   | [`ctx:GetTargetIPs()`](#gettargetips)   | Get target IPs                        |
| Method   | [`ctx:GetLocalIPs()`](#getlocalips)     | Get local IPs                         |
| Method   | [`ctx:GetAttributes()`](#getattributes) | Get request attributes                |

## Hook Interface

### HandleRoute(...)

```lua
function HandleRoute(ctx, inboundTag, sourcePort, targetPort,
    localPort, targetDomain, network, protocol, user,
    vlessRoute, skipDNSResolve)
    return outboundTag, ruleTag, err
end
```

Selects an outbound for the current request, optionally returning a rule name or an error.

#### Parameters

The core always passes all 11 parameters in the order shown above, and none is `nil`. You can omit unused trailing parameters from the function definition; this does not change the values passed by the core.

| Parameter        | Type                                  | Description                                                                                               | Empty and Default Values                                                                              |
| ---------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `ctx`            | [`routing.Context`](#routing-context) | Current request context                                                                                   | Always valid `userdata`                                                                               |
| `inboundTag`     | `string`                              | Inbound tag                                                                                               | `""` if the inbound has no tag or inbound information is unavailable                                  |
| `sourcePort`     | `number`                              | Source port, `0 .. 65535`                                                                                 | `0` if no valid source address is available                                                           |
| `targetPort`     | `number`                              | Target port, `0 .. 65535`                                                                                 | `0` if no valid target address is available                                                           |
| `localPort`      | `number`                              | Local port of the inbound connection, `0 .. 65535`                                                        | `0` if no valid local address is available                                                            |
| `targetDomain`   | `string`                              | The effective sniffed domain takes precedence over the connection's target domain; converted to lowercase | `""` if the target is an IP without an effective sniffed domain, or target information is unavailable |
| `network`        | `number`                              | Network type; compare with constants such as [`router.NetworkTCP`](./module-router.md#constants)          | `NetworkUnknown` (`0`) if outbound information is unavailable or the network type is unknown          |
| `protocol`       | `string`                              | Sniffed protocol                                                                                          | `""` if sniffed protocol information is unavailable                                                   |
| `user`           | `string`                              | User email                                                                                                | `""` if inbound or user information is unavailable, or no email is set                                |
| `vlessRoute`     | `number`                              | Routing value formed from bytes 7 and 8 of the VLESS UUID, `0 .. 65535`                                   | `0` if unavailable; the value itself may also be 0                                                    |
| `skipDNSResolve` | `boolean`                             | When `true`, DNS queries must be skipped to avoid loops                                                   | `false` if the flag or additional request information is unavailable                                  |

#### Return Values

| Return value  | Type                                                 | Description                                                |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| `outboundTag` | `string` or `nil`                                    | Outbound tag; `nil` or `""` means no outbound was selected |
| `ruleTag`     | `string` or `nil`                                    | Optional rule name; `nil`, omission, or `""` means no name |
| `err`         | [`error`](./data-types.md#error), `string`, or `nil` | Only `nil` means no error                                  |

#### Behavior

The core validates `err`, `outboundTag`, and `ruleTag` in that order, stopping at the first error. When `err` is non-`nil`, the first two values are ignored. When no outbound is selected, `ruleTag` is ignored.

On success, trailing `ruleTag` and `err` values may be omitted, for example `return "direct"`. An error must be in the third position, for example `return nil, nil, "routing failed"`; `return nil, "routing failed"` does not report an error.

| Script result                                                     | Core behavior                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Validation succeeds and `outboundTag` is non-empty                | Uses the corresponding outbound; closes the connection if the tag does not exist |
| No outbound selected                                              | Uses the default outbound                                                        |
| Returned error, invalid return-value type, or execution exception | Logs the error and tries the default outbound                                    |

The default outbound is the first outbound in the configuration; the connection is closed if no default outbound is available. To block traffic, explicitly return a configured [`blackhole`](../../../config/outbounds/blackhole.md) outbound tag instead of relying on this behavior with a nonexistent tag.

## Related Objects

### routing.Context

`routing.Context` represents the current request's routing context, accessed through the `ctx` parameter in `HandleRoute`.

| Property           | Description                                            |
| ------------------ | ------------------------------------------------------ |
| Underlying Go type | The `routing.Context` interface in `features/routing`  |
| Lua representation | `userdata`                                             |
| Obtained from      | The first argument passed by the core to `HandleRoute` |

All methods below take no additional parameters. See [Data Types](./data-types.md) for IP and slice operations.

#### GetSourceIPs

```lua
local ips = ctx:GetSourceIPs()
```

Gets the request's source IPs.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type                                            | Description                           |
| ------------ | ----------------------------------------------- | ------------------------------------- |
| `ips`        | [`[]net.IP`](./data-types.md#net-ip-1) or `nil` | IP list for the corresponding address |

**Behavior**

Returns `nil` if there is no inbound, the source address is invalid, or it is not an IP address.

#### GetTargetIPs

```lua
local ips = ctx:GetTargetIPs()
```

Gets the request's target IPs.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type                                            | Description                           |
| ------------ | ----------------------------------------------- | ------------------------------------- |
| `ips`        | [`[]net.IP`](./data-types.md#net-ip-1) or `nil` | IP list for the corresponding address |

**Behavior**

Returns `nil` if there is no outbound, the target address is invalid, or it is a domain name.

#### GetLocalIPs

```lua
local ips = ctx:GetLocalIPs()
```

Gets the local IPs of the inbound connection.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type                                            | Description                           |
| ------------ | ----------------------------------------------- | ------------------------------------- |
| `ips`        | [`[]net.IP`](./data-types.md#net-ip-1) or `nil` | IP list for the corresponding address |

**Behavior**

Returns `nil` if there is no inbound, the local address is invalid, or it is not an IP address.

#### GetAttributes

```lua
local attributes = ctx:GetAttributes()
```

Gets the current request's attributes.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type                | Description                    |
| ------------ | ------------------- | ------------------------------ |
| `attributes` | `map[string]string` | Always `userdata`; never `nil` |

**Behavior**

Read attributes with `attributes[key]`, where `key` must be a string. An existing key returns a string (possibly `""`); a missing key returns `nil`.

See the [`attrs`](../../../config/routing.md#ruleobject) field in the routing configuration for the meaning and use of attributes.

**Example**

```lua
local attributes = ctx:GetAttributes()
if attributes[":method"] == "GET" then
    return "direct", "lua-get"
end
```
