# Configuration File

> **This chapter will tell you all the details of Xray configuration. Mastering this content will allow you to unleash the greater power of Xray.**

## Overview

The configuration file for Xray is in JSON format. There is no difference in the configuration format between the client and the server; only the actual configuration content differs.
The format is as follows:

```json
{
  "vsersion": {},
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
If you are new to Xray, you can click to view [Configuration & Run in Quick Start](../document/install.md) first to learn the most basic configuration methods, and then check the content of this chapter to master all configuration methods of Xray.
:::

::: details Click to expand: Learn how to make AI write the correct configuration file directly
It is recommended to copy the following content and send it to the AI, which can significantly improve the usability of the generated configuration:

```text
[https://xtls.github.io/llms-full.txt](https://xtls.github.io/llms-full.txt) This link is the official full documentation of Xray-core.

【Role Setting】
You are an expert proficient in network protocols and Xray-core configuration.

【Task Requirements】
1. Knowledge Base: Please read and deeply understand the content of this link, and use it as the sole basis for answering questions and writing configurations.
2. No Hallucinations: Absolutely do not fabricate fields that do not exist in the documentation. If the documentation does not mention it, please tell me directly "Documentation does not mention".
3. Default Format: Although Xray supports multiple formats, please output standard JSON format configuration by default (unless I explicitly request YAML or TOML), and add key comments.
4. Exception Handling: If you cannot access this link, please inform me clearly and prompt me to manually download the documentation and upload it to you.
```

:::

## Basic Configuration Modules

> version

Optional. Controls the version on which this config can run. This prevents accidental running on unexpected client versions when sharing the config. The client will check if the current version matches this requirement at runtime.

```json
"version": {
    "min": "25.8.3",
    "max": ""
}
```

Both `min` and `max` are optional. Not setting them or leaving them empty means no restrictions. It does not need to be an actual existing version, as long as it complies with the Xray version syntax x.y.z.

25.8.3 is the version where Xray added this feature. Setting a version lower than this is meaningless (older versions will not check it).

> log:[LogObject](./log.md)

Log configuration, controls how Xray outputs logs.

> api:[ApiObject](./api.md)

Provides some API interfaces for remote calls.

> dns: [DnsObject](./dns.md)

Built-in DNS server. If this item is not configured, the system DNS settings are used.

> routing: [RoutingObject](./routing.md)

Routing function. You can set rules to divert data to be sent out from different outbounds.

> policy: [PolicyObject](./policy.md)

Local policy. You can set different user levels and corresponding policy settings.

> inbounds: \[ [InboundObject](./inbound.md) \]

An array. Each element is an inbound connection configuration.

> outbounds: \[ [OutboundObject](./outbound.md) \]

An array. Each element is an outbound connection configuration.

> transport: [TransportObject](./transport.md)

Used to configure how Xray establishes and uses network connections with other servers.

> stats: [StatsObject](./stats.md)

Used to configure traffic statistics.

> reverse: [ReverseObject](./reverse.md)

Reverse proxy. Can forward server-side traffic to the client, i.e., reverse traffic forwarding.

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS configuration. Can be used with transparent proxies to obtain the actual domain name.

> metrics: [metricsObject](./metrics.md)

Metrics configuration. A more direct (hopefully better) way to export statistics.

> observatory: [ObservatoryObject](./observatory.md#observatoryobject)

Background connection observatory. Detects the connection status of outbound proxies.

> burstObservatory: [BurstObservatoryObject](./observatory.md#burstobservatoryobject)

Burst connection observatory. Detects the connection status of outbound proxies.
