# xray.dns

Provides interfaces for DNS queries and upstream server access.

```lua
local dns = require("xray.dns")
```

## API Index

| Category | Member                                                | Description                        |
| -------- | ----------------------------------------------------- | ---------------------------------- |
| Function | [`dns.Query(domain, ipv4, ipv6, fake)`](#dns-query)   | Query through Xray's DNS client    |
| Field    | [`dns.Servers`](#dns-servers)                         | Upstream server array              |
| Object   | [`serverObj`](#server)                                | A single DNS upstream server       |
| Field    | [`serverObj.ID`](#id)                                 | Server identifier                  |
| Method   | [`serverObj:Query(domain, ipv4, ipv6, fake)`](#query) | Query a specific upstream directly |

## Functions

### dns.Query

```lua
local ips, ttl, err = dns.Query(domain, ipv4, ipv6, fake)
```

Queries a domain through Xray's DNS client. Unavailable in the DNS Hook, because the script takes over that very query flow.

**Parameters**

| Parameter | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| `domain`  | `string`  | Domain to query                  |
| `ipv4`    | `boolean` | Whether IPv4 queries are allowed |
| `ipv6`    | `boolean` | Whether IPv6 queries are allowed |
| `fake`    | `boolean` | Whether FakeDNS is allowed       |

**Return Values**

| Return value | Type                                            | Description                                                 |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| `ips`        | [`[]net.IP`](./data-types.md#net-ip-1) or `nil` | Query results                                               |
| `ttl`        | `number`                                        | TTL in seconds, in the range `0 .. 4294967295`; never `nil` |
| `err`        | [`error`](./data-types.md#error) or `nil`       | Query error; `nil` means no error                           |

**Behavior**

All four parameters must be passed explicitly with the correct types; otherwise a Lua exception is raised.

The query follows the client's global query-type restrictions, Hosts, and upstream configuration. If a [DNS script](../guide/dns.md) is configured, the query is also handled by that script. System DNS is used if built-in DNS is not configured.

Returns a non-empty IP slice on success; returns `nil, 0, err` if the query fails or no address is available.

**Example**

```lua
local ips, ttl, err = dns.Query("example.com", true, true, false)
if err == nil and ips ~= nil and #ips > 0 then
    local firstIP = ips[1]:String()
end
```

## Fields

### dns.Servers

```lua
local servers = dns.Servers
```

| Name          | Type    | Description                                                             |
| ------------- | ------- | ----------------------------------------------------------------------- |
| `dns.Servers` | `table` | Array of [`serverObj`](#server), indexed from 1, in configuration order |

When built-in DNS is used, the list contains the configured upstreams. If DNS or upstream servers are not configured, the list contains only `localhost` (system DNS).

Use `ipairs` to iterate over the list; `servers[i]` is `nil` for an out-of-range index.

**Example**

```lua
for _, serverObj in ipairs(dns.Servers) do
    local id = serverObj.ID
end
```

## Objects

### server

`serverObj` represents a DNS upstream server, including its identifier and query method.

| Property           | Description                                       |
| ------------------ | ------------------------------------------------- |
| Go implementation  | `luaDNSServer` in `app/dns`                       |
| Lua representation | `table`                                           |
| Obtained from      | An array element of [`dns.Servers`](#dns-servers) |

#### ID

```lua
local id = serverObj.ID
```

| Name           | Type     | Description                                                                                           |
| -------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `serverObj.ID` | `string` | The `id` field in the [DNS server configuration](../../../config/dns.md#dnsserverobject); never `nil` |

If `id` is omitted, it is `""`, including for servers configured as strings. The automatically added system DNS upstream has ID `"localhost"`.

If you need to distinguish servers by ID, configure unique values yourself; the core does not check for duplicates.

#### Query

```lua
local ips, ttl, err = serverObj:Query(domain, ipv4, ipv6, fake)
```

Queries the upstream represented by `serverObj`.

**Parameters and Return Values**

Parameter requirements and return-value types are the same as for [`dns.Query`](#dns-query).

**Behavior**

A normally configured upstream returns a non-empty IP slice, TTL, and `nil` on success. If the query fails, no address meets the conditions, or FakeDNS is queried with `fake == false`, returns `nil, 0, err`.

Queries this server directly, bypassing global Hosts and the DNS script. The server's own `queryStrategy`, cache, `timeoutMs`, `clientIP`, `tag`, and `expectedIPs` / `unexpectedIPs` with their corresponding `actPrior` / `actUnprior` settings still take effect.

**Example**

Return the first upstream's query result directly from the DNS Hook:

```lua
function HandleDNSQuery(domain, ipv4, ipv6, fake)
    return dns.Servers[1]:Query(domain, ipv4, ipv6, fake)
end
```
