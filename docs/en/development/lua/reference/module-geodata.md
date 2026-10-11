# xray.geodata

Provides rule-based matching for domains and IPs.

```lua
local geodata = require("xray.geodata")
```

## API Index

| Category | Member                                                           | Description                              |
| -------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Function | [`geodata.BuildDomainMatcher(...)`](#geodata-builddomainmatcher) | Create a `DomainMatcher`                 |
| Function | [`geodata.BuildIPMatcher(...)`](#geodata-buildipmatcher)         | Create an `IPMatcher`                    |
| Object   | [`DomainMatcher`](#domainmatcher)                                | Domain matcher                           |
| Method   | [`domainMatcherObj:MatchAny(domain)`](#matchany)                 | Check whether a domain matches any rule  |
| Method   | [`domainMatcherObj:Match(domain)`](#match)                       | Get the indices of matching domain rules |
| Object   | [`IPMatcher`](#ipmatcher)                                        | IP matcher                               |
| Method   | [`ipMatcherObj:Match(ip)`](#match-1)                             | Match a single IP                        |
| Method   | [`ipMatcherObj:AnyMatch(ips)`](#anymatch)                        | Check whether any IP matches             |
| Method   | [`ipMatcherObj:Matches(ips)`](#matches)                          | Check whether the entire IP list matches |
| Method   | [`ipMatcherObj:FilterIPs(ips)`](#filterips)                      | Separate matching and non-matching IPs   |
| Method   | [`ipMatcherObj:SetReverse(reverse)`](#setreverse)                | Set the reverse flag                     |
| Method   | [`ipMatcherObj:ToggleReverse()`](#togglereverse)                 | Toggle the reverse flag                  |

## Functions

### geodata.BuildDomainMatcher

```lua
local domainMatcherObj = geodata.BuildDomainMatcher(rule1, rule2, ...)
```

Creates a [`DomainMatcher`](#domainmatcher) from domain rules.

**Parameters**

| Parameter           | Type     | Description / Requirements                              |
| ------------------- | -------- | ------------------------------------------------------- |
| `rule1, rule2, ...` | `string` | Required; at least one domain rule, passed individually |

**Return Values**

| Return value       | Type                              | Description               |
| ------------------ | --------------------------------- | ------------------------- |
| `domainMatcherObj` | [`DomainMatcher`](#domainmatcher) | A domain matcher instance |

**Behavior**

Raises a Lua exception if no rules are supplied, an argument has the wrong type, or rule parsing, resource loading, or construction fails.

Supports `domain:`, `full:`, `keyword:`, `regexp:`, `dotless:`, `geosite:`, and `ext:` (also written as `ext-domain:` / `ext-site:`). See [routing domain rules](../../../config/routing.md#ruleobject) for the formats. GeoSite files are loaded from the [resource directory](../../../config/env.md#resource-file-path).

Strings without a prefix use `domain:` rules by default.

Except for regular expressions, rules are converted to lowercase during construction.

**Example**

```lua
local sitesObj = geodata.BuildDomainMatcher(
    "example.com", "full:other.example"
)
```

### geodata.BuildIPMatcher

```lua
local ipMatcherObj = geodata.BuildIPMatcher(rule1, rule2, ...)
```

Creates an [`IPMatcher`](#ipmatcher) from IP rules.

**Parameters**

| Parameter           | Type     | Description / Requirements                          |
| ------------------- | -------- | --------------------------------------------------- |
| `rule1, rule2, ...` | `string` | Required; at least one IP rule, passed individually |

**Return Values**

| Return value   | Type                      | Description            |
| -------------- | ------------------------- | ---------------------- |
| `ipMatcherObj` | [`IPMatcher`](#ipmatcher) | An IP matcher instance |

**Behavior**

Raises a Lua exception if no rules are supplied, an argument has the wrong type, a rule is an empty string, or rule parsing, resource loading, or construction fails.

Supports IPs, CIDR, `geoip:`, `ext:` (also written as `ext-ip:`), and `!` reverse rules. See [routing IP rules](../../../config/routing.md#ruleobject) for how rules are combined. GeoIP files are loaded from the [resource directory](../../../config/env.md#resource-file-path).

**Example**

```lua
local privateIPsObj = geodata.BuildIPMatcher(
    "10.0.0.0/8", "192.168.0.0/16", "fc00::/7"
)
```

## Objects

### DomainMatcher

| Property           | Description                                                                          |
| ------------------ | ------------------------------------------------------------------------------------ |
| Underlying Go type | An implementation of the `geodata.DomainMatcher` interface                           |
| Lua representation | `userdata`                                                                           |
| Obtained from      | The return value of [`geodata.BuildDomainMatcher(...)`](#geodata-builddomainmatcher) |

**Common Conventions**

Matching methods take one domain string. `nil`, omitted arguments, incorrect types, or an incorrect argument count raise a Lua exception.

The input domain is not automatically converted to lowercase; the script must do this as needed.

#### MatchAny

```lua
local matched = domainMatcherObj:MatchAny(domain)
```

Checks whether a domain matches at least one rule.

**Parameters**

| Parameter | Type     | Description / Requirements |
| --------- | -------- | -------------------------- |
| `domain`  | `string` | Required; domain to match  |

**Return Values**

| Return value | Type      | Description                          |
| ------------ | --------- | ------------------------------------ |
| `matched`    | `boolean` | `true` if matched, otherwise `false` |

**Example**

```lua
local matched = sitesObj:MatchAny("www.example.com")
```

#### Match

```lua
local indices = domainMatcherObj:Match(domain)
```

Gets the indices of rules matched by the domain.

**Parameters**

| Parameter | Type     | Description / Requirements |
| --------- | -------- | -------------------------- |
| `domain`  | `string` | Required; domain to match  |

**Return Values**

| Return value | Type                                          | Description                                                            |
| ------------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| `indices`    | [`[]uint32`](./data-types.md#uint32) or `nil` | Matching rule indices; `nil` or a slice of length 0 if nothing matches |

**Behavior**

Rule indices start at **0** and correspond to the order of rules supplied during construction. Result order is not guaranteed, and duplicate indices may occur. Entries expanded from GeoSite retain the index of their parent rule.

If you store the same rules in a Lua array, use `rules[ruleNumber + 1]` to get the original rule. See [Data Types](./data-types.md#slice) for slice access.

**Example**

```lua
local indices = sitesObj:Match("www.example.com")
if indices ~= nil then
    for i = 1, #indices do
        local ruleNumber = indices[i]
    end
end
```

### IPMatcher

| Property           | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| Underlying Go type | An implementation of the `geodata.IPMatcher` interface                       |
| Lua representation | `userdata`                                                                   |
| Obtained from      | The return value of [`geodata.BuildIPMatcher(...)`](#geodata-buildipmatcher) |

**Common Conventions**

For a single IP, use [`net.IP`](./data-types.md#net-ip). For matching or filtering lists, see [IP List Input](./data-types.md#ip-list-input). IP address strings are not automatically parsed into `net.IP`.

Matching and filtering methods all accept explicit `nil`. Omitted arguments, incorrect types, or an incorrect argument count raise a Lua exception.

#### Match

```lua
local matched = ipMatcherObj:Match(ip)
```

Checks whether a single IP matches the rules.

**Parameters**

| Parameter | Type                                        | Description / Requirements          |
| --------- | ------------------------------------------- | ----------------------------------- |
| `ip`      | [`net.IP`](./data-types.md#net-ip) or `nil` | Required; must be passed explicitly |

**Return Values**

| Return value | Type      | Description                                                      |
| ------------ | --------- | ---------------------------------------------------------------- |
| `matched`    | `boolean` | `true` if a valid IP matches; `false` for `nil` or an invalid IP |

**Behavior**

Passing `""` or an empty table `{}` is treated as an empty IP and returns `false`. Strings are not parsed as IP address text.

#### AnyMatch

```lua
local matched = ipMatcherObj:AnyMatch(ips)
```

Checks whether at least one valid IP matches the rules.

**Parameters**

| Parameter | Type                                           | Description / Requirements                            |
| --------- | ---------------------------------------------- | ----------------------------------------------------- |
| `ips`     | [IP List Input](./data-types.md#ip-list-input) | Required; must be passed explicitly; `nil` is allowed |

**Return Values**

| Return value | Type      | Description                                                                            |
| ------------ | --------- | -------------------------------------------------------------------------------------- |
| `matched`    | `boolean` | `true` if at least one valid IP matches; `false` for `nil`, an empty list, or no match |

#### Matches

```lua
local matched = ipMatcherObj:Matches(ips)
```

Checks whether the entire IP list matches the rules.

**Parameters**

| Parameter | Type                                           | Description / Requirements                            |
| --------- | ---------------------------------------------- | ----------------------------------------------------- |
| `ips`     | [IP List Input](./data-types.md#ip-list-input) | Required; must be passed explicitly; `nil` is allowed |

**Return Values**

| Return value | Type      | Description                                                                                                                   |
| ------------ | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `matched`    | `boolean` | `true` if the entire list meets the matching requirements; `false` for `nil`, an empty list, or a list containing invalid IPs |

**Behavior**

Combined rules may contain multiple internal matchers. A single internal matcher must match the entire list.

For example, with `geodata.BuildIPMatcher("192.168.1.0/24", "geoip:us")`, a list containing both `192.168.1.1` and `8.8.8.8` makes `Matches` return `false`: the first IP matches the custom CIDR, and the second matches `geoip:us`, but these belong to different internal matchers, and neither matches the entire list.

If you only need to check whether any address matches, use [`AnyMatch`](#anymatch).

#### FilterIPs

```lua
local matched, unmatched = ipMatcherObj:FilterIPs(ips)
```

Separates valid IPs into matching and non-matching groups.

**Parameters**

| Parameter | Type                                           | Description / Requirements                            |
| --------- | ---------------------------------------------- | ----------------------------------------------------- |
| `ips`     | [IP List Input](./data-types.md#ip-list-input) | Required; must be passed explicitly; `nil` is allowed |

**Return Values**

| Return value | Type                                   | Description                   |
| ------------ | -------------------------------------- | ----------------------------- |
| `matched`    | [`[]net.IP`](./data-types.md#net-ip-1) | Matching IPs; never `nil`     |
| `unmatched`  | [`[]net.IP`](./data-types.md#net-ip-1) | Non-matching IPs; never `nil` |

**Behavior**

A group with no results is an empty slice. For `nil`, an empty list, or a list containing only invalid IPs, both groups are empty slices.

Invalid IPs are discarded, and result order is not guaranteed to match the input order.

#### SetReverse

```lua
ipMatcherObj:SetReverse(reverse)
```

Sets the reverse flag on each internal matcher.

**Parameters**

| Parameter | Type      | Description / Requirements                                     |
| --------- | --------- | -------------------------------------------------------------- |
| `reverse` | `boolean` | Required; `true` enables reverse matching, `false` disables it |

**Return Values**

No return values.

**Behavior**

`nil`, omission, or an incorrect type raises a Lua exception. This operation overrides each internal matcher's existing reverse flag, including flags specified with `!` in rules. Reverse matching applies only to address families present in the original rules and does not match invalid IPs.

The resulting reverse state is stored in the current matcher object. If later Hook calls reuse that object, the modified state remains in effect. See [State in Pooled Instances](../guide/lifecycle.md#state-in-pooled-instances).

**Example**

Reversing `10.0.0.0/8` matches valid IPv4 addresses outside that range:

```lua
local ipMatcherObj = geodata.BuildIPMatcher("10.0.0.0/8")
ipMatcherObj:SetReverse(true)
```

#### ToggleReverse

```lua
ipMatcherObj:ToggleReverse()
```

Toggles the reverse flag on each internal matcher.

**Parameters**

No additional parameters.

**Return Values**

No return values.

**Behavior**

Each internal matcher in combined rules toggles its own reverse flag. This is not equivalent to logically negating the combined result.
The resulting reverse state is stored in the current matcher object. If later Hook calls reuse that object, the modified state remains in effect. See [State in Pooled Instances](../guide/lifecycle.md#state-in-pooled-instances).
