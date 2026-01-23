# Blackhole

Blackhole is an outbound data protocol that blocks all outbound data. When used in conjunction with [Routing Configuration](../routing.md), it can achieve the effect of blocking access to certain websites.

## OutboundConfigurationObject

```json
{
  "response": {
    "type": "none"
  }
}
```

> `response`: [ResponseObject](#responseobject)

Configures the response data of the Blackhole.

After receiving data to be forwarded, Blackhole will send the specified response data, then close the connection. The data to be forwarded will be discarded.
If this item is not specified, Blackhole will close the connection immediately.

### ResponseObject

```json
{
  "type": "none"
}
```

> `type`: "http" | "none"

When `type` is `"none"` (default value), Blackhole will close the connection immediately.

When `type` is `"http"`, Blackhole will send back a simple HTTP 403 response packet, then close the connection.
