# HTTP

HTTP protocol.

::: danger
**The HTTP protocol does not encrypt transmission, so it is not suitable for transmission over the public internet. It makes it easier to become a "zombie" (bot) used for attacks.**
:::

::: tip
`http` can only proxy the TCP protocol; UDP-based protocols cannot pass through.
:::

## OutboundConfigurationObject

```json
{
  "address": "192.168.108.1",
  "port": 3128,
  "user": "my-username",
  "pass": "my-password",
  "level": 0,
  "email": "love@xray.com",
  "headers": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36",
    "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2"
  }
}
```

::: tip
Currently, `security` and `tlsSettings` in `streamSettings` are effective in the HTTP outbound protocol.
:::

> `address`: string

HTTP proxy server address. Required.

> `port`: int

HTTP proxy server port. Required.

> `user`: string

Username, string type. Required if the remote server requires authentication; otherwise, do not include this item.

> `pass`: string

Password, string type. Required if the remote server requires authentication; otherwise, do not include this item.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level. Optional if the remote server requires authentication; otherwise, do not include this item.

The value of `userLevel` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, the default is 0.

> `email`: string

Email address, used to identify the user. Optional if the remote server requires authentication; otherwise, do not include this item.

> `headers`: map{ string, string }

HTTP headers, a map of key-value pairs. Each key represents the name of an HTTP header. All key-value pairs will be attached to every request.
