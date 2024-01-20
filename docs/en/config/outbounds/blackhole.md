# Blackhole

Blackhole is an outbound data protocol that blocks all outbound data. When used in conjunction with [routing configurations](../routing.md), it can be used to block access to certain websites.

## OutboundConfigurationObject

```json
{
  "response": {
    "type": "none"
  }
}
```

> `response`: [ResponseObject](#responseobject)

Configures the response data for the blackhole.

After receiving the data to be forwarded, the blackhole will send the specified response data and then close the connection. The data to be forwarded will be discarded. If this field is not specified, the blackhole will simply close the connection.

### ResponseObject

```json
{
  "type": "none"
}
```

> `type`: "http" | "none"

When `type` is set to `"none"` (default value), the blackhole will simply close the connection.

When `type` is set to `"http"`, the blackhole will send a simple HTTP 403 packet as the response and then close the connection.
