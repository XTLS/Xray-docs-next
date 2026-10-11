# DNS Hook

The core calls the global `HandleDNSQuery` function in `dns.script` during built-in DNS queries. See the [DNS Scripts guide](../guide/dns.md) for configuration and complete examples.

## API Index

| Category | Member                                   | Description        |
| -------- | ---------------------------------------- | ------------------ |
| Hook     | [`HandleDNSQuery(...)`](#handlednsquery) | Handle DNS queries |

## Hook Interface

### HandleDNSQuery(...)

```lua
function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return ips, ttl, err
end
```

Handles one DNS query, returning an IP slice, TTL, or error.

#### Parameters

The core always passes all four parameters, and none is `nil`.

| Parameter | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| `domain`  | `string`  | Domain to query; non-empty and lowercase  |
| `ipv4`    | `boolean` | Whether IPv4 address queries are allowed  |
| `ipv6`    | `boolean` | Whether IPv6 address queries are allowed  |
| `fake`    | `boolean` | Whether FakeDNS is allowed for this query |

`ipv4` and `ipv6` are already restricted by the global [`queryStrategy`](../../../config/dns.md#dnsobject); at least one is `true`. Normally, pass these three boolean parameters unchanged when querying an upstream.

#### Return Values

| Return value | Type                                                 | Description                                                                          |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ips`        | [`[]net.IP`](./data-types.md#net-ip-1) or `nil`      | Query results; must be a slice, not a Lua array                                      |
| `ttl`        | `number` or `nil`                                    | TTL in seconds; when `err == nil`, must be an integer in the range `0 .. 4294967295` |
| `err`        | [`error`](./data-types.md#error), `string`, or `nil` | Only `nil` means no error                                                            |

#### Behavior

The core validates `err`, `ttl`, and `ips` in that order, stopping at the first error. When `err` is non-`nil`, the other two values are ignored. When there is no error, a valid TTL must be provided even if the IP result is empty.

To return an empty response, use `return nil, 0, nil`. An error belongs in the third position, for example `return nil, nil, "query failed"`.

| Script result                                                     | Core behavior                      |
| ----------------------------------------------------------------- | ---------------------------------- |
| Validation succeeds and `ips` is non-empty                        | Query succeeds                     |
| `err == nil`, valid TTL, but `ips` is `nil` or an empty slice     | Query fails with an empty response |
| Returned error, invalid return-value type, or execution exception | Query fails                        |

#### Example

You can forward all three return values from [`serverObj:Query`](./module-dns.md#query) directly:

```lua
local dns = require("xray.dns")
local serverObj = dns.Servers[1]

function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return serverObj:Query(domain, ipv4, ipv6, fake)
end
```
