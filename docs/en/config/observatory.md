# Observatory

The Observatory component uses HTTPing to probe the connection status of outbound proxies. The observation results can be used by other components, such as the Load Balancer. Currently, there are two types: [observatory](#observatoryobject) (Background Connection Observatory) and [burstObservatory](#burstobservatoryobject) (Burst Connection Observatory). Choose one according to your needs.

## ObservatoryObject

```json
{
  "subjectSelector": ["outbound"],
  "probeUrl": "https://www.google.com/generate_204",
  "probeInterval": "10s",
  "enableConcurrency": false
}
```

> `subjectSelector`: \[ string \]

An array of strings, where each string is used for prefix matching against outbound proxy tags. Given the following outbound proxy tags: `[ "a", "ab", "c", "ba" ]`, `"subjectSelector": ["a"]` will match `[ "a", "ab" ]`.

> `probeUrl`: string

The URL used to probe the connection status of the outbound proxy.

> `probeInterval`: string

The interval for initiating probes. The time format is number + unit, such as `"10s"`, `"2h45m"`. Supported time units are `ns`, `us`, `ms`, `s`, `m`, `h`, corresponding to nanoseconds, microseconds, milliseconds, seconds, minutes, and hours respectively.

Note that since the request interval is fixed, periodic fixed requests might lead to behavioral fingerprinting. Using protocols with multiplexing or enabling `mux` can alleviate this issue.

> `enableConcurrency`: true | false

- `true`: Probe all matched outbound proxies concurrently. Pauses for the time set in `probeInterval` after all are completed.
- `false`: Probe matched outbound proxies one by one. Pauses for the time set in `probeInterval` after each outbound proxy is probed.

## BurstObservatoryObject

```json
{
  "subjectSelector": ["outbound"],
  "pingConfig": {}
}
```

> `subjectSelector`: \[ string \]

An array of strings, where each string is used for prefix matching against outbound proxy tags. Given the following outbound proxy tags: `[ "a", "ab", "c", "ba" ]`, `"subjectSelector": ["a"]` will match `[ "a", "ab" ]`.

> `pingConfig`: [PingConfigObject](#pingconfigobject)

### PingConfigObject

```json
{
  // For each outbound, probe 2 times within 10 minutes; specific probe times are random.
  // If they all fail, it will be marked as a faulty node within 10 ~ 20 minutes.
  // After failure, a single successful probe will mark it as a healthy node; at slowest, it takes 10 minutes.
  "destination": "https://connectivitycheck.gstatic.com/generate_204",
  "connectivity": "",
  "interval": "5m",
  "sampling": 2,
  "timeout": "30s"
}
```

> `destination`: string

The URL used to probe the connection status of the outbound proxy. This URL should return an HTTP 204 success status code.

> `connectivity`: string

The URL used to check local network connectivity. This URL should return an HTTP 204 success status code.

An empty string indicates no local network connectivity check.

This probe is executed only when the `destination` probe fails. This makes the cause of network failure clearer in the logs.

Note: In transparent proxy mode, this request might be captured by the transparent proxy and re-enter Xray for routing (depending on your configuration). You need to use extra means to ensure it is not captured by the transparent proxy, such as bypassing based on the URL IP, or using cgroup/pid routing to completely prevent Xray's requests from being captured. Alternatively, you can choose a URL that matches a direct connection rule and allow this request to be captured by the transparent proxy.

> `interval`: string

The expected **average** probe interval for each outbound proxy.

The time format is number + unit, such as `"10s"`, `"2h45m"`. Supported time units are `ns`, `us`, `ms`, `s`, `m`, `h`, corresponding to nanoseconds, microseconds, milliseconds, seconds, minutes, and hours respectively.

> `sampling`: number

The number of recent probe results to keep.

> `timeout`: string

Probe timeout. Format is the same as `interval` above.

::: tip
The working principle of Burst Observatory is to immediately schedule probe tasks for each matched outbound at every `interval` * `sampling` (hereinafter referred to as the probe cycle). However, within each task's cycle, the probe is executed at a random time. This means compared to `observatory` (Background Connection Observatory), the fingerprint of this detector is less obvious. But if `interval` is set too small, or `sampling` is too large causing frequent probing, the fingerprint will be more obvious.

`interval` and `sampling` jointly affect the sensitivity of failover and recovery. When a node fails probes continuously, it takes at fastest 1 probe cycle to mark the node as faulty, and at slowest 2 probe cycles. Recovering from failure requires one successful probe, which depends on the probe density; at slowest, it takes 1 probe cycle.
:::
