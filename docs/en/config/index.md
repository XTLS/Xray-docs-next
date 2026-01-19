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
  "fakedns": {},
  "metrics": {},
  "observatory": {},
  "burstObservatory": {}
}
```

::: warning
If you are new to Xray, you can first click to view [configuration and running in the Quick Start guide](../document/install.md), to learn the most basic configuration method, and then refer to the contents of this section to master all the configuration methods of Xray.
:::

::: details Click to expand: How to make AI generate the correct configuration directly
Copy the following prompt to ensure the AI generates the correct configuration:

```text
[https://xtls.github.io/llms-full.txt](https://xtls.github.io/llms-full.txt) This link contains the full official documentation for Xray-core.

[Role]
You are an expert in network protocols and Xray-core configuration.

[Instructions]
1. Knowledge Base: Crawl and fully comprehend the content of the link. Use it as your SOLE source of truth.
2. NO Hallucinations: Absolutely DO NOT fabricate any fields not mentioned in the documentation.
3. Default Format: While Xray supports multiple formats, please default to standard JSON output (unless I explicitly request YAML or TOML), with comments for key parameters.
4. Error Handling: If you cannot access the link, explicitly notify me and ask me to manually download and upload the document to you.

Please answer my questions in English.
:::




## Basic Configuration Modules

> log:[LogObject](./log.md)

Log configurations, controlling how Xray emits logs.

> api:[ApiObject](./api.md)

Configures how Xray provides API interfaces for calling remotely.

> dns: [DnsObject](./dns.md)

Configures the built-in DNS server. System DNS will be used if not configured.

> routing: [RoutingObject](./routing.md)

Configures routing. Specify rules to route connections through different outbounds.

> policy: [PolicyObject](./policy.md)

Local policy configurations, specifying different user levels and corresponding policies.

> inbounds: \[ [InboundObject](./inbound.md) \]

An array of inbound connection configurations.

> outbounds: \[ [OutboundObject](./outbound.md) \]

An array of outbound connection configurations.

> transport: [TransportObject](./transport.md)

Configures how Xray establishes and uses network connections to other servers.

> stats: [StatsObject](./stats.md)

Configures traffic statistics.

> reverse: [ReverseObject](./reverse.md)

Configures the built-in reverse proxy. You can forward server traffic to the client, effectively achieving reverse proxying.

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS configuration. Can be used with a transparent proxy to obtain the actual domains.

> metrics: [metricsObject](./metrics.md)

Metrics configuration. A more straightforward (and hopefully better) way to export metrics.

> observatory: [ObservatoryObject](./observatory.md#observatoryobject)

Background connection observation. Detect the connection status of outbound proxies.

> burstObservatory: [BurstObservatoryObject](./observatory.md#burstobservatoryobject)

Concurrent connection observation. Detect the connection status of outbound proxies.
```
