# Data Types

This page summarizes data types shared by the modules and explains how they are represented and used in Lua. Types specific to a module are documented on that module's page.

## net.IP

| Property           | Description               |
| ------------------ | ------------------------- |
| Underlying Go type | `net.IP`, `common/net.IP` |
| Lua representation | `userdata`                |

You usually do not need to compare individual `net.IP` values in Lua, especially on frequently executed paths. For IP matching, prefer [`IPMatcher`](./module-geodata.md#ipmatcher), which can directly handle the `net.IP` values returned by APIs.

If you need to manipulate IPs directly, remember that `net.IP` and IP address strings are different types. Use the following two methods for conversion and comparison:

### String

```lua
local text = ip:String()
```

Converts an IP to address text.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type     | Description                    |
| ------------ | -------- | ------------------------------ |
| `text`       | `string` | IP address string; never `nil` |

### Equal

```lua
local equal = ip:Equal(otherIP)
```

Checks whether two IPs are equal.

**Parameters**

| Parameter | Type                         | Description                                  |
| --------- | ---------------------------- | -------------------------------------------- |
| `otherIP` | [`net.IP`](#net-ip) or `nil` | The IP to compare; explicit `nil` is allowed |

**Return Values**

| Return value | Type      | Description                                     |
| ------------ | --------- | ----------------------------------------------- |
| `equal`      | `boolean` | `true` if equal, otherwise `false`; never `nil` |

**Behavior**

Comparing a valid IP with `nil` returns `false`.

**Example**

```lua
if ip ~= nil then
    local text = ip:String()
    local equal = ip:Equal(otherIP)
end
```

## slice

A Go slice is represented as `userdata` in Lua, retains its element type, and is indexed starting at **1**. The following two slice types share the same length, indexing, and iteration operations.

| Type                    | Lua representation | Element type        |
| ----------------------- | ------------------ | ------------------- |
| [`[]net.IP`](#net-ip-1) | `userdata`         | [`net.IP`](#net-ip) |
| [`[]uint32`](#uint32)   | `userdata`         | `number`            |

### []net.IP

Tip: For matching or filtering IP lists, prefer [`IPMatcher`](./module-geodata.md#ipmatcher), which can directly handle `[]net.IP`.

### []uint32

Elements are 32-bit unsigned integers in the range `0 .. 4294967295`.

### #values

```lua
local count = #values
```

Returns the number of elements in a slice.

**Return Values**

| Return value | Type     | Description                                    |
| ------------ | -------- | ---------------------------------------------- |
| `count`      | `number` | A non-negative integer; `0` for an empty slice |

**Behavior**

Lists returned by APIs may be `nil` or slices of length 0. `values` must be non-`nil` before these operations are used; checking only `if values then` does not tell you whether the list has elements.

### values[i]

```lua
local value = values[i]
```

Reads one element from a slice.

**Parameters**

| Parameter | Type     | Description                                              |
| --------- | -------- | -------------------------------------------------------- |
| `i`       | `number` | Required; must be an integer in the range `1 .. #values` |

**Return Values**

| Return value | Type                            | Description                                          |
| ------------ | ------------------------------- | ---------------------------------------------------- |
| `value`      | [`net.IP`](#net-ip) or `number` | An element of `[]net.IP` or `[]uint32`, respectively |

**Behavior**

Out-of-bounds access raises a Lua exception instead of returning `nil`. Avoid modifying slices returned by APIs directly.

**Example**

```lua
if ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```

### values()

```lua
for i, value in values() do
    -- Use index i and element value
end
```

Returns a slice iterator for a generic `for` loop, with indices starting at 1.

**Parameters**

No additional parameters.

**Return Values**

| Return value | Type       | Description                                     |
| ------------ | ---------- | ----------------------------------------------- |
| Iterator     | `function` | Provides each index and element, as shown above |

**Behavior**

Slices do not support `pairs` or `ipairs`; a numeric `for` loop can also be used.

**Example**

```lua
if ips ~= nil then
    for i = 1, #ips do
        local text = ips[i]:String()
    end

    for i, ip in ips() do
        local text = ip:String()
    end
end
```

## IP List Input

When passing an IP list to `IPMatcher`, you can use the following forms:

| Input form                   | Lua representation | Description                                                                           |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| [`[]net.IP`](#net-ip-1)      | `userdata`         | An IP list; empty slices are allowed                                                  |
| Array of [`net.IP`](#net-ip) | `table`            | Consecutive IPs starting at index 1; an empty array `{}` is allowed, but gaps are not |
| `nil`                        | `nil`              | Must be passed explicitly; see each method for its result                             |

IP address strings are not parsed into `net.IP`. An empty string `""` is not a valid IP list; passing it to `AnyMatch`, `Matches`, or `FilterIPs` raises a Lua exception.

## error

| Property           | Description                                 |
| ------------------ | ------------------------------------------- |
| Underlying Go type | `error`                                     |
| Lua representation | `userdata` for an error; `nil` for no error |

An API's `err` return value is `nil` when there is no error; otherwise it is an error object. An error object can be returned unchanged as a Hook's `err` value for the Xray core to handle.

**Hook Return Convention**

| Error value      | Meaning                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| `nil`            | No error                                                                               |
| Error `userdata` | Preserves the original error                                                           |
| `string`         | An error message supplied by the script; an empty string `""` still indicates an error |

String errors apply only to Hook return values. Xray APIs themselves return an error or `nil`. See the relevant Hook for validation and failure behavior.

**Logging Error Messages**

You cannot obtain a Go error object's message with `tostring(err)`. To log it, pass `err` directly to [`xray.log`](./module-log.md).

```lua
local log = require("xray.log")
local ips, ttl, err = serverObj:Query(domain, ipv4, ipv6, fake)
if err ~= nil then
    log.Warning("DNS query failed: ", err)
elseif ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```
