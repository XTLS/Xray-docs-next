# 连接观测

连接观测组件使用 HTTPing 的方式探测出站代理的连接状态。观测结果可以被其他组件使用，如负载均衡器。目前有 [observatory](#observatoryobject) （后台连接观测）和 [burstObservatory](#burstobservatoryobject) （突发连接观测）两种。按需选择其中之一就行。

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

一个字符串数组，其中每一个字符串将用于和出站代理标识的前缀匹配。在以下几个出站代理标识中：`[ "a", "ab", "c", "ba" ]`，`"subjectSelector": ["a"]` 将匹配到 `[ "a", "ab" ]`。

> `probeUrl`: string

用于探测出站代理连接状态的网址。

> `probeInterval`: string

发起探测的间隔。时间格式为数字 + 单位，比如 `"10s"`, `"2h45m"`，支持的时间单位有 `ns`, `us`, `ms`, `s`, `m`, `h`， 分别对应纳秒、微秒、毫秒、秒、分、时。

注意，由于请求间隔是固定的，隔段时间固定的请求可能会导致存在行为特征，使用自带多路复用的协议可以缓解问题。如果使用 reality + mux 探测目标必须是 http 协议否则会带来新的 TLS in TLS 特征。

> `enableConcurrency`: true | false

- `true` 并发探测全部匹配的出站代理，全部完成后暂停 `probeInterval` 设定的时间。
- `false` 逐个探测匹配的出站代理，每探测一个出站代理后暂停 `probeInterval` 设定的时间。

## BurstObservatoryObject

```json
{
  "subjectSelector": ["outbound"],
  "pingConfig": {}
}
```

> `subjectSelector`: \[ string \]

一个字符串数组，其中每一个字符串将用于和出站代理标识的前缀匹配。在以下几个出站代理标识中：`[ "a", "ab", "c", "ba" ]`，`"subjectSelector": ["a"]` 将匹配到 `[ "a", "ab" ]`。

> `pingConfig`: [PingConfigObject](#PingConfigObject)

### PingConfigObject

```json
{
  // 针对每个出站，在 10 分钟内探测 2 次，具体的探测时间点随机
  // 如果它们全部失败，那么将在 10 ~ 20 分钟内被标记为故障节点
  // 故障后只要有一次探测成功，将被标记为健康节点，最慢需要 10 分钟
  "destination": "https://connectivitycheck.gstatic.com/generate_204",
  "connectivity": "",
  "interval": "5m",
  "sampling": 2,
  "timeout": "30s"
}
```

> `destination`: string

用于探测出站代理连接状态的网址。这个网址应该返回 HTTP 204 成功状态码。

> `connectivity`: string

用于检测本地网络连通性的网址。这个网址应该返回 HTTP 204 成功状态码。

空字符串表示不检测本地网络连通性。

仅当 `destination` 探测失败时会执行此探测。这样在日志中能更清晰的体现出网络不通的原因。

注意：在透明代理模式下，此请求可能会被透明代理捕获再次进入 xray 进行路由（根据你的配置方式不同）。需要采用额外手段确保它不会被透明代理捕获，比如针对网址 IP 的绕过，又或者使用 cgroup, pid 路由等方式完全使 xray 的请求不会被捕获。或者你也可以挑选一个匹配直连规则的网址，放任此请求被透明代理捕获。

> `interval`: string

针对每个出站代理，预期的**平均**每次探测间隔。

时间格式为数字 + 单位，比如 `"10s"`, `"2h45m"`，支持的时间单位有 `ns`, `us`, `ms`, `s`, `m`, `h`， 分别对应纳秒、微秒、毫秒、秒、分、时。

> `sampling`: number

保留最近探测结果的数量。

> `timeout`: string

探测超时时间。格式和上面的 `interval` 相同。

::: tip
突发连接观测的工作原理是每间隔 `interval` \* `sampling`（下称探测周期），立即针对每个匹配到的出站分别调度探测任务，但是在每个任务的周期内随机时间执行探测，这意味着相较于 `observatory`（后台连接观测），本探测器的特征更不明显。但如果 interval 设置的过小，或者 sampling 过大导致频繁探测，那么特征会更明显。

`interval` 和 `sampling` 共同影响着故障转移和恢复的灵敏度。当一个节点持续探测失败，最快需要 1 个探测周期才能将节点标记为故障，最慢需要 2 个探测周期。从故障中恢复需要一次成功的探测，这取决于探测密度，最慢需要 1 个探测周期。
:::
