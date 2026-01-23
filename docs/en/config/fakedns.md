# FakeDNS

FakeDNS obtains target domain names by forging DNS responses. It can reduce latency during DNS queries and assist transparent proxies in acquiring target domain names.

::: warning
FakeDNS may pollute the local DNS cache, causing "no network access" after Xray is closed.
:::

## FakeDNSObject

`FakeDNSObject` corresponds to the `fakedns` item in the configuration file.

```json
{
  "ipPool": "198.18.0.0/16",
  "poolSize": 65535
}
```

`FakeDnsObject` can also be configured as an array containing multiple FakeIP Pools. When a DNS query request is received, FakeDNS will return a set of FakeIPs derived from multiple FakeIP Pools simultaneously.

```json
[
  {
    "ipPool": "198.18.0.0/15",
    "poolSize": 65535
  },
  {
    "ipPool": "fc00::/18",
    "poolSize": 65535
  }
]
```

> `ipPool`: CIDR

FakeDNS will allocate addresses using the IP block specified in this option.

> `poolSize`: int

Specifies the maximum number of Domain-IP mappings stored by FakeDNS. When the number of mappings exceeds this value, mappings will be evicted according to LRU rules. Default is 65535.

::: warning
`poolSize` must be less than or equal to the total number of addresses in the `ipPool`.
:::

::: tip
If `fakedns` is set in the `dns` item of the configuration file but `FakeDnsObject` is not configured, Xray will initialize `FakeDnsObject` based on the `queryStrategy` of the DNS component.

When `queryStrategy` is `UseIP`, the initialized FakeIP Pool is equivalent to:

```json
[
  {
    "ipPool": "198.18.0.0/15",
    "poolSize": 32768
  },
  {
    "ipPool": "fc00::/18",
    "poolSize": 32768
  }
]
```

When `queryStrategy` is `UseIPv4`, the initialized FakeIP Pool is equivalent to:

```json
{
  "ipPool": "198.18.0.0/15",
  "poolSize": 65535
}
```

When `queryStrategy` is `UseIPv6`, the initialized FakeIP Pool is equivalent to:

```json
{
  "ipPool": "fc00::/18",
  "poolSize": 65535
}
```

:::

### How to use?

FakeDNS is essentially a [DNS Server](./dns.md#serverobject) that can be used in conjunction with any DNS rules.

It only works when DNS queries are routed to FakeDNS.

```json
{
  "dns": {
    "servers": [
      "fakedns", // fakedns comes first
      "8.8.8.8"
    ]
  },
  "outbounds": [
    {
      "protocol": "dns",
      "tag": "dns-out"
    }
  ],
  "routing": {
    "rules": [
      {
        "inboundTag": ["dns-in"], // Hijack DNS traffic from DNS query entry points, or hijack DNS traffic from transparent proxy inbounds.
        "port": 53,
        "outboundTag": "dns-out"
      }
    ]
  }
}
```

When an external DNS request enters the FakeDNS component, it returns an IP address within its `ipPool` as the fictitious resolution result for the domain and records the mapping between the domain and the fictitious IP.

Additionally, you need to enable `Sniffing` on the inbound of the **client** that receives traffic to be proxied, and use `fakedns` for destination address resetting.

```json
"sniffing": {
  "enabled": true,
  "destOverride": ["fakedns"], // Use "fakedns", or combine with other sniffers
  "metadataOnly": false        // When this is true, destOverride can only use fakedns
}
```

::: warning
If the FakeIP is not correctly reverted to the domain name, connection to the server will fail.
:::

### Using with other DNS types

#### Coexisting with DNS Routing

When using DNS routing (traffic splitting), to ensure `fakedns` has high priority, you need to add the same `domains` to it as you would for other DNS types.

```json
{
  "servers": [
    {
      "address": "fakedns",
      "domains": [
        // Consistent with the content used for routing below
        "geosite:cn",
        "domain:example.com"
      ]
    },
    {
      "address": "1.2.3.4",
      "domains": ["geosite:cn"],
      "expectIPs": ["geoip:cn"]
    },
    {
      "address": "1.1.1.1",
      "domains": ["domain:example.com"]
    },
    "8.8.8.8"
  ]
}
```

#### FakeDNS Blacklist

If you do not want certain domains to use FakeDNS, you can add `domains` configuration to other types of DNS servers. This gives other DNS servers higher priority than FakeDNS when matching specific domains, thereby implementing a FakeDNS blacklist mechanism.

```json
{
  "servers": [
    "fakedns",
    {
      "address": "1.2.3.4",
      "domains": ["domain:do-not-use-fakedns.com"]
    }
  ]
}
```

#### FakeDNS Whitelist

If you want only certain domains to use FakeDNS, you can add `domains` configuration to `fakedns`. This gives `fakedns` higher priority than other DNS servers when matching specific domains, thereby implementing a FakeDNS whitelist mechanism.

```json
{
  "servers": [
    "1.2.3.4",
    {
      "address": "fakedns",
      "domains": ["domain:only-this-use-fakedns.com"]
    }
  ]
}
```
