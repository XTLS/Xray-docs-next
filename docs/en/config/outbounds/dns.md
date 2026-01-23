# DNS

DNS is an outbound protocol, mainly used to intercept and forward DNS queries.

This outbound protocol can only receive DNS traffic (including queries based on UDP and TCP protocols); other types of traffic will cause errors.

When processing DNS queries, this outbound protocol forwards IP queries (i.e., A and AAAA) to the built-in [DNS server](../dns.md). For other types of query traffic, see `nonIPQuery` below.

## OutboundConfigurationObject

```json
{
  "network": "tcp",
  "address": "1.1.1.1",
  "port": 53,
  "nonIPQuery": "drop",
  "blockTypes": []
}
```

> `network`: "tcp" | "udp"

Modifies the transport layer protocol for DNS traffic. Optional values are `"tcp"` and `"udp"`. When unspecified, the source transport method remains unchanged.

> `address`: address

Modifies the DNS server address. When unspecified, the address specified in the source remains unchanged.

> `port`: number

Modifies the DNS server port. When unspecified, the port specified in the source remains unchanged.

> `nonIPQuery`: string

Controls non-IP queries (non-A and non-AAAA). `"drop"` means discard; `"skip"` means it is not processed by the built-in DNS server and is forwarded to the destination; `"reject"` returns a DNS reject response, explicitly refusing the request immediately. Compared to `"drop"`, this avoids applications waiting too long for a DNS response until timeout.

The default value is `"reject"`.

> `blockTypes`: array

An integer array used to block query types listed in the array. For example, `"blockTypes": [65,28]` means blocking type 65 (HTTPS) and 28 (AAAA). Common uses include blocking type 65 to prevent browsers from initiating ECH.

Since `nonIPQuery` drops all non-A and non-AAAA queries by default, this option requires `nonIPQuery` to be set to `skip` to take further effect on other types. Of course, you can also use it solely to block A or AAAA (IPv4/IPv6 queries), but this is highly discouraged. It is recommended to configure `queryStrategy` in the built-in DNS settings for relevant content instead.

Note: When using `blockTypes` to block only A or AAAA, if `nonIPQuery` is set to `reject`, the blocking method will also be to return a DNS reject response instead of dropping.

## DNS Configuration Examples <Badge text="WIP" type="warning"/>
