# DNS

DNS is an outbound protocol used for intercepting and forwarding DNS queries.

This outbound protocol can only handle DNS traffic, including queries based on UDP and TCP protocols. Other types of traffic will result in an error.

When handling DNS queries, this outbound protocol will forward IP queries (A and AAAA) to the built-in [DNS server](../dns.md). Other types of query traffic will be forwarded to their original destination addresses.

## OutboundConfigurationObject

```json
{
  "network": "tcp",
  "address": "1.1.1.1",
  "port": 53,
  "nonIPQuery": "drop"
}
```

> `network`: "tcp" | "udp"

Modifies the transport layer protocol for DNS traffic. The possible values are `"tcp"` and `"udp"`. When not specified, the original transport method will be retained.

> `address`: address

Modifies the DNS server address. When not specified, the original address specified in the source will be retained.

> `port`: number

Modifies the DNS server port. When not specified, the original port specified in the source will be retained.

> `nonIPQuery`: string

Control non IP queries (neither A or AAAA), `"drop"` this request or `"skip"` processing in DNS module，the request will be forwarded to target. By default is `"drop"`.

## DNS Configuration Example <Badge text="WIP" type="warning"/>
