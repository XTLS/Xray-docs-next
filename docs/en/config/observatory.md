# Connection Monitoring

The connection monitoring component uses HTTPing to detect the connection
status of outbound proxies. The monitoring results can be used by other
components, such as load balancers. There are currently two options:
[observatory](#observatoryobject) (background connection monitoring) and
[burstObservatory](#burstobservatoryobject) (concurrent connection monitoring).
You can choose one of them as needed.

## ObservatoryObject
```json
{
  "subjectSelector":[
    "outbound"
  ],
  "probeUrl": "https://www.google.com/generate_204",
  "probeInterval": "10s",
  "enableConcurrency": false
}
```

> `subjectSelector`: \[ string \]

An array of strings, where each string is used to match the prefix of outbound proxy identifiers. Among the following outbound proxy identifiers: `["a", "ab", "c", "ba"]`, `"subjectSelector": ["a"]` will match `["a", "ab"]`.

> `probeUrl`: string

The URL used to detect the connection status of the outbound proxy.

> `probeInterval`: string

The interval at which probes are initiated. The time format is a number followed by a unit, such as `"10s"`, `"2h45m"`. Supported time units include `ns`, `us`, `ms`, `s`, `m`, `h`, corresponding to nanoseconds, microseconds, milliseconds, seconds, minutes, and hours, respectively.

> `enableConcurrency`: true | false

- `true`: Concurrently probe all matching outbound proxies, then pause for the time set by `probeInterval`.
- `false`: Probe each matching outbound proxy one by one, pausing for the time set by `probeInterval` after probing each one.

## BurstObservatoryObject
```json
{
  "subjectSelector":[
    "outbound"
  ],
  "pingConfig": {}
}
```

> `subjectSelector`: \[ string \]

An array of strings, where each string is used to match the prefix of outbound proxy identifiers. Among the following outbound proxy identifiers: `["a", "ab", "c", "ba"]`, `"subjectSelector": ["a"]` will match `["a", "ab"]`.

> `pingConfig`: [PingConfigObject](#PingConfigObject)


### PingConfigObject
```json
{
  "destination": "https://connectivitycheck.gstatic.com/generate_204",
  "connectivity": "",
  "interval": "1h",
  "sampling": 3,
  "timeout": "30s"
}
```

> `destination`: string

The URL used to detect the connection status of the outbound proxy. This URL should return an HTTP 204 success status code.

> `connectivity`: string

The URL used to check local network connectivity. An empty string means that local network connectivity is not checked.

> `interval`: string

Within the specified time, probe all matching outbound proxies, probing each proxy `sampling + 1` times. The time format is a number followed by a unit, such as `"10s"`, `"2h45m"`. Supported time units include `ns`, `us`, `ms`, `s`, `m`, `h`, corresponding to nanoseconds, microseconds, milliseconds, seconds, minutes, and hours, respectively.

> `sampling`: number

The number of recent probe results to retain.

> `timeout`: string

The probe timeout period. The format is the same as the `interval` above.
