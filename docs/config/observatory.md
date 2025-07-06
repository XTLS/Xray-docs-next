# 连接观测

连接观测组件使用 HTTPing 的方式探测出站代理的连接状态。观测结果可以被其他组件使用，如负载均衡器。目前有 [observatory](#observatoryobject) （后台连接观测）和 [burstObservatory](#burstobservatoryobject) （突发连接观测）两种。按需选择其中之一就行，理论上 `burstObservatory` 特征更不明显。

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
  "destination": "https://connectivitycheck.gstatic.com/generate_204",
  "connectivity": "",
  "interval": "1h",
  "sampling": 3,
  "timeout": "30s"
}
```

> `destination`: string

用于探测出站代理连接状态的网址。这个网址应该返回 HTTP 204 成功状态码。

> `connectivity`: string

用于检测本地网络连通性的网址。这个网址应该返回 HTTP 204 成功状态码。空字符串表示不检测本地网络连通性。

仅当 `destination` 探测失败时会执行此探测。这样在日志中能更清晰的体现出网络不通的原因。

注意：在透明代理模式下，此请求会重入 xray 进行路由，因此必须精挑细选网址，确保它匹配直连规则。

> `interval`: string

在指定时间内探测全部匹配的出站代理，每个出站代理探测 sampling + 1 次。时间格式为数字 + 单位，比如 `"10s"`, `"2h45m"`，支持的时间单位有 `ns`, `us`, `ms`, `s`, `m`, `h`， 分别对应纳秒、微秒、毫秒、秒、分、时。

注意：具体的探测时间是随机的！原理是每间隔 interval，立即并发调度所有出站的探测任务，但是在每个任务生命周期内随机时间执行探测，这意味着相较于 `observatory`（后台连接观测），本探测器的特征更不明显。但是如果 interval 设置的过小，或者 sampling 过大导致频繁探测，那么特征仍然会很明显。

> `sampling`: number

保留最近探测结果的数量。

> `timeout`: string

探测超时时间。格式和上面的 `interval` 相同。
