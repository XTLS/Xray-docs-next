# TCP

TCP (Transmission Control Protocol) is currently one of the recommended transport protocols

It can be combined with various protocols in multiple ways.

## TcpObject

`TcpObject` corresponds to the `tcpSettings` item in the Transport Protocol.

```json
{
  "acceptProxyProtocol": false,
  "header": {
    "type": "none"
  }
}
```

> `acceptProxyProtocol`: true | false

Only used for inbound, indicating whether to accept the PROXY protocol.

The [PROXY protocol](https://www.haproxy.org/download/2.2/doc/proxy-protocol.txt) is used to transmit the real source IP and port of the request. **If you are not familiar with it, please ignore this item.**

Common reverse proxy software (such as HAProxy and Nginx) can be configured to send it, and VLESS fallbacks xver can also send it.

When filled in as `true`, after the underlying TCP connection is established, the requesting party must first send PROXY protocol v1 or v2, otherwise the connection will be closed.

The default value is `false`

> `header`: [NoneHeaderObject](#noneheaderobject) | [HttpHeaderobject](#httpheaderobject)

Packet header obfuscation settings, the default value is `NoneHeaderObject`

::: tip
HTTP obfuscation cannot be proxied by other HTTP servers (such as Nginx), but it can be proxied by VLESS fallbacks path.
:::

### NoneHeaderObject

No header obfuscation

```json
{
  "type": "none"
}
```

> `type`: "none"

Disable header obfuscation.

### HttpHeaderObject

HTTP header obfuscation. The configuration must be the same between connecting inbound and outbound.

```json
{
  "type": "http",
  "request": {},
  "response": {}
}
```

> `type`: "http"

Enable HTTP header obfuscation.

> `request`: [HTTPRequestObject](#httprequestobject)

HTTP request template.

> `response`: [HTTPResponseObject](#httpresponseobject)

HTTP response template.

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

HTTP version, the default value is `"1.1"`

> `method`: string

The HTTP method, the default value is `"GET"`

> `path`: \[ string \]

paths, an array of strings. The default value is `["/"]`. When there are multiple values, a value is chosen randomly for each request.

> `headers`: map{ string, \[ string \]}

HTTP header, a key-value pair, each key represents the name of an HTTP header, and the corresponding value is an array.

Each request will include all the keys and randomly select a corresponding value. Please refer to the **default values** shown in the example above.

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

HTTP version, default is `"1.1"`

> `status`: string

HTTP status, default is `"200"`

> `reason`: string

HTTP status description, default value is `"OK"`

> `headers`: map {string, \[ string \]}

HTTP header, a key-value pair, each key represents the name of an HTTP header, and the corresponding value is an array.

Each request will include all the keys and randomly select a corresponding value. Please refer to the **default values** shown in the example above.
