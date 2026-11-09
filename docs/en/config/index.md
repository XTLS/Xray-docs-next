# Configuration File

> **This chapter will tell you all the details of Xray configuration. Mastering this content will allow you to unleash the greater power of Xray.**

::: warning Version note
This documentation tracks the [latest version](https://github.com/XTLS/Xray-core/releases) (which may be a pre-release); most one-click scripts install the version GitHub marks as `Latest`, which is sometimes not the newest version, so some fields may be invalid or behave differently from what the documentation describes.
:::

## Overview

The configuration file for Xray is in JSON format. There is no difference in the configuration format between the client and the server; only the actual configuration content differs.
The format is as follows:

```json
{
  "env": {},
  "log": {},
  "api": {},
  "dns": {},
  "routing": {},
  "policy": {},
  "inbounds": [],
  "outbounds": [],
  "stats": {},
  "fakedns": {},
  "metrics": {},
  "observatory": {},
  "burstObservatory": {},
  "geodata": {},
  "version": {}
}
```

::: warning
If you are new to Xray, you can click to view [Configuration & Run in Quick Start](../document/install.md) first to learn the most basic configuration methods, and then check the content of this chapter to master all configuration methods of Xray.
:::

:::: tip Use AI to configure Xray more reliably
::: details Click to view a copyable prompt
Whether you want AI to generate a config directly or answer a specific configuration question,<br/>
**send it the prompt below at the very beginning of the conversation**:

```markdown
Please help me write, review, or understand Xray-core configurations. Keep answers concise and focus on solving my actual problem.

The following is the full official Xray-core documentation, containing the complete text of multiple chapters. Read the relevant chapters to verify configuration fields, values, and usage restrictions:
https://xtls.github.io/llms-full.txt
The documentation is in Chinese; answer in English unless I request another language, and keep configuration keys and literal values unchanged.
If necessary, clone the source code from https://github.com/XTLS/Xray-core.git to verify implementation details.

- The official documentation always covers only the newest Xray-core release, including pre-releases, and does not state which version it covers. Answer for the newest release by default and remind me of this, and do not equate it with the version GitHub marks as `Latest`; if I specify an older version, verify compatibility separately and state clearly when it cannot be confirmed.
- Ask any necessary questions together only when missing information affects configuration correctness, and state any other necessary assumptions explicitly.
- Do not invent fields, defaults, or compatibility claims, or directly reuse V2Ray or older Xray configurations. Mark anything you cannot confirm, and cite the relevant official documentation links or sections for key conclusions.
- When generating a configuration, provide a minimal complete example that meets my needs, using JSON syntax with a few `//` comments in English by default; if I request TOML or YAML, use that format.
- Use clear placeholders for addresses, UUIDs, keys, certificate paths, and other values I need to replace, and briefly explain the key settings and how to validate the configuration. State clearly if you have not actually run the validation.
```

:::
::::

## Basic Configuration Modules

> env: [EnvObject](./env.md)

Environment variables for modifying some underlying configurations of Xray.

> log: [LogObject](./log.md)

Log configuration, controls how Xray outputs logs.

> api: [ApiObject](./api.md)

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

> stats: [StatsObject](./stats.md)

Used to configure traffic statistics.

> fakedns: [FakeDnsObject](./fakedns.md)

FakeDNS configuration. Can be used with transparent proxies to obtain the actual domain name.

> metrics: [metricsObject](./metrics.md)

Metrics configuration. A more direct (hopefully better) way to export statistics.

> observatory: [ObservatoryObject](./observatory.md#observatoryobject)

Background connection observatory. Detects the connection status of outbound proxies.

> burstObservatory: [BurstObservatoryObject](./observatory.md#burstobservatoryobject)

Burst connection observatory. Detects the connection status of outbound proxies.

> geodata: [GeodataObject](./geodata.md)

Automatic update and hot reload for geodata files.

> version

Optional. Controls the version on which this config can run. This prevents accidental running on unexpected client versions when sharing the config. The client will check if the current version matches this requirement at runtime.

```json
{
  "version": {
    "min": "25.8.3",
    "max": ""
  }
}
```

Both `min` and `max` are optional. Not setting them or leaving them empty means no restrictions. It does not need to be an actual existing version, as long as it complies with the Xray version syntax x.y.z.

25.8.3 is the version where Xray added this feature. Setting a version lower than this is meaningless (older versions will not check it).
