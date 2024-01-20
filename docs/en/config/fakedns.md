# FakeDNS

FakeDNS is used to obtain target domain names by forging DNS, which can reduce the delay in DNS queries and work with transparent proxies to obtain target domain names.

::: warning
FakeDNS may contaminate the local DNS and cause "network unreachable" after Xray is closed.
:::

## FakeDNSObject

`FakeDNSObject` corresponds to the `fakedns` item in the configuration file.

```json
{
  "ipPool": "198.18.0.0/16",
  "poolSize": 65535
}
```

`FakeDnsObject` can also be configured as an array containing multiple FakeIP Pools. When a DNS query request is received, FakeDNS returns a group of FakeIPs obtained by multiple FakeIP Pools at the same time.

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

FakeDNS will use the IP block specified by this option to allocate addresses.

> `poolSize`: int

Specifies the maximum number of domain name-IP mappings stored by FakeDNS. When the number of mappings exceeds this value, mappings will be eliminated according to the LRU rule. The default is 65535.

::: warning
`poolSize` must be less than or equal to the total number of addresses corresponding to `ipPool`.
:::

::: tip
If the `dns` item in the configuration file sets `fakedns`, but the configuration file does not set `FakeDNSObject`, Xray will initialize `FakeDNSObject` based on the `queryStrategy` of the DNS component.

When `queryStrategy` is set to `UseIP`, the initialized FakeIP Pool is equivalent to

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

When `queryStrategy` is set to `UseIPv4`, the initialized FakeIP Pool is equivalent to

```json
{
  "ipPool": "198.18.0.0/15",
  "poolSize": 65535
}
```

When `queryStrategy` is set to `UseIPv6`, the initialized FakeIP Pool is equivalent to

```json
{
  "ipPool": "fc00::/18",
  "poolSize": 65535
}
```

:::

### How to use?

FakeDNS is essentially a [DNS server](./dns.md#serverobject) that can be used in conjunction with any DNS rules.

Only by routing DNS queries to FakeDNS can it be effective.

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
        "type": "field",
        "inboundTag": ["dns-in"], // Intercept DNS traffic from DNS query inbound or from inbound traffic of transparent proxies.
        "port": 53,
        "outboundTag": "dns-out"
      }
    ]
  }
}
```

When external DNS requests enter the FakeDNS component, it will return IP addresses within its own `ipPool` as the virtual resolution results of the domain name, and record the mapping relationship between the domain name and the virtual resolution results.

In addition, you need to enable `Sniffing` in the **client** for incoming traffic that needs to be proxied, and use the `fakedns` target address reset.

```json
"sniffing": {
  "enabled": true,
  "destOverride": ["fakedns"], // Use "fakedns", or use it with other sniffer, or directly use "fakedns+others".
  "metadataOnly": false        // When this item is true, destOverride can only use fakedns.
},
```

::: warning
If the FakeIP is not correctly restored to the domain name, the server will not be accessible.
:::

### Using with other types of DNS

#### Coexistence with DNS shunting

When using DNS shunting, to give `fakedns` a higher priority, you need to add the same `domains` as other types of DNS.

```json
{
  "servers": [
    {
      "address": "fakedns",
      "domains": [
        // consistent with the content used in the shunt below
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

#### FakeDNS blacklist

If you do not want certain domain names to use FakeDNS, you can add `domains` configuration in other types of DNS configurations so that when the specified domain names are matched, other DNS servers have a higher priority than FakeDNS, thereby achieving the FakeDNS blacklist mechanism.

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

#### FakeDNS whitelist

If you only want certain domain names to use FakeDNS, you can add `domains` configuration to `fakedns` so that when the specified domain names are matched, `fakedns` has a higher priority than other DNS servers, thereby achieving the FakeDNS whitelist mechanism.

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
