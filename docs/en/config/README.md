---
title: Configurations
lang: en-US
---

> **This section will tell you all the details of Xray configuration. By mastering these contents, Xray will unleash its full power in your hands.**

## Overview

The configuration file of Xray is in JSON format, and the configuration format for the client and server is the same, except for the actual configuration content. It takes the following form:

```json
{
  "log": {},
  "api": {},
  "dns": {},
  "routing": {},
  "policy": {},
  "inbounds": [],
  "outbounds": [],
  "transport": {},
  "stats": {},
  "reverse": {},
  "fakedns": {}
}
```

::: warning
If you are new to Xray, you can first click to view [configuration and running in the Quick Start guide](../document/install.md), to learn the most basic configuration method, and then refer to the contents of this section to master all the configuration methods of Xray.
:::

## Basic Configuration Modules

> log:[LogObject](./log.md)

Log configuration, which controls the way Xray outputs logs.

> api:[ApiObject](./api.md)

Provides some API interfaces for remote calls.

> dns: [DnsObject](./dns.md)

Built-in DNS server. If this item is not configured, the system's DNS settings will be used.

> routing: [RoutingObject](./routing.md)

Routing function. You can set rules to route data to different outbounds.

> policy: [PolicyObject](./policy.md)

Local policy, which can set different user levels and corresponding policy settings.

> inbounds: \[ [InboundObject](./inbound.md) \]

An array, with each element being an inbound connection configuration.

> outbounds: \[ [OutboundObject](./outbound.md) \]

An array, with each element being an outbound connection configuration.

> transport: [TransportObject](./transport.md)

Used to configure the way Xray establishes and uses network connections with other servers.

> stats: [StatsObject](./stats.md)

Used to configure traffic data statistics.

> reverse: [ReverseObject](./reverse.md)

Reverse proxy. You can forward server-side traffic to the client, that is, reverse traffic forwarding.

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS configuration. It can be used with transparent proxy to obtain the actual domain name.

> metrics: [metricsObject](./metrics.md)

Metrics configuration. A more straightforward (and hopefully better) way to export metrics.