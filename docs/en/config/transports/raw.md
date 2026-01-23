# RAW

Renamed from the former TCP transport layer (as the original name was ambiguous), the outbound RAW transport layer directly sends TCP or UDP data wrapped by the proxy protocol. The core does not use other transport layers (such as [XHTTP](https://github.com/XTLS/Xray-core/discussions/4113)) to carry its traffic.

It can be combined with various protocols in multiple modes.

## RawObject

`RawObject` corresponds to the `rawSettings` item in transport configuration.

```json
{
  "acceptProxyProtocol": false,
  "header": {
    "type": "none"
  }
}
```

> `acceptProxyProtocol`: true | false

Only used for inbound; indicates whether to accept PROXY protocol.

[PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is dedicated to passing the real source IP and port of the request. **If you don't know what it is, please ignore this item for now.**

Common reverse proxy software (such as HAProxy, Nginx) can be configured to send it. VLESS fallbacks xver can also send it.

When set to `true`, after the underlying TCP connection is established, the requester must send PROXY protocol v1 or v2 first; otherwise, the connection will be closed.

Default value is `false`.

> `header`: [NoneHeaderObject](#noneheaderobject) | [HttpHeaderobject](#httpheaderobject)

Packet header obfuscation settings. Default value is `NoneHeaderObject`.

::: tip
HTTP obfuscation cannot be traffic-split by other HTTP servers (like Nginx), but can be split by VLESS fallbacks path.
:::

### NoneHeaderObject

No obfuscation.

```json
{
  "type": "none"
}
```

> `type`: "none"

Specifies no obfuscation.

### HttpHeaderObject

HTTP obfuscation configuration must be configured on the corresponding inbound and outbound connections simultaneously, and the content must be consistent.

```json
{
  "type": "http",
  "request": {},
  "response": {}
}
```

> `type`: "http"

Specifies HTTP obfuscation.

> `request`: [HTTPRequestObject](#httprequestobject)

HTTP Request.

> `response`: [HTTPResponseObject](#httpresponseobject)

HTTP Response.

#### HTTPRequestObject

```json
{
  "version": "1.1",
  "method": "GET",
  "path": ["/"],
  "headers": {
    "Host": ["www.baidu.com", "www.bing.com"],
    "User-Agent": [
      "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
    ],
    "Accept-Encoding": ["gzip, deflate"],
    "Connection": ["keep-alive"],
    "Pragma": "no-cache"
  }
}
```

> `version`: string

HTTP version. Default value is `"1.1"`.

> `method`: string

HTTP method. Default value is `"GET"`.

> `path`: \[ string \]

Path, an array of strings. Default value is `["/"]`. When there are multiple values, one is randomly selected for each request.

> `headers`: map{ string, \[ string \]}

HTTP headers. A key-value pair, where each key represents the name of an HTTP header, and the corresponding value is an array.

All keys will be attached to every request, and one corresponding value will be randomly selected. See the example above for default values.

#### HTTPResponseObject

```json
{
  "version": "1.1",
  "status": "200",
  "reason": "OK",
  "headers": {
    "Content-Type": ["application/octet-stream", "video/mpeg"],
    "Transfer-Encoding": ["chunked"],
    "Connection": ["keep-alive"],
    "Pragma": "no-cache"
  }
}
```

> `version`: string

HTTP version. Default value is `"1.1"`.

> `status`: string

HTTP status code. Default value is `"200"`.

> `reason`: string

HTTP status reason phrase. Default value is `"OK"`.

> `headers`: map {string, \[ string \]}

HTTP headers. A key-value pair, where each key represents the name of an HTTP header, and the corresponding value is an array.

All keys will be attached to every request, and one corresponding value will be randomly selected. See the example above for default values.
