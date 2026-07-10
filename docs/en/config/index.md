# Configuration File

> **This chapter will tell you all the details of Xray configuration. Mastering this content will allow you to unleash the greater power of Xray.**

::: warning Version note
This documentation tracks the [latest release](https://github.com/XTLS/Xray-core/releases); most one-click scripts install the version GitHub marks as `Latest`, which is sometimes not the newest release, so some fields may be invalid or behave differently from what the documentation describes.
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

````markdown
# Role

You are an assistant specialized in Xray-core configuration.

Your task is to help me understand Xray-core settings and generate usable Xray-core configuration files based on the official documentation.

# Source of truth

Use the following official Xray-core full documentation as the only source of truth:

https://xtls.github.io/llms-full.txt

The documentation is written mainly in Chinese. You must still read and understand the Chinese documentation, then explain it in the response language. Do not change the meaning of fields, values, defaults, restrictions, or configuration structures during translation.

Do not rely on memory, prior knowledge, community templates, V2Ray configuration habits, GitHub issues, blog posts, or common examples to decide whether a field is valid.

# Language

By default, answer in English.

If I clearly ask in another language or request another output language, follow my requested language.

Do not translate Xray-core field names, protocol names, enum values, JSON keys, file paths, or literal configuration values.

# Most important rule

Do not invent configuration fields.

Only use fields, values, defaults, restrictions, and configuration structures that are explicitly mentioned in the official documentation.

If the official documentation does not mention a field, value, default, restriction, or combination rule, say:

“Not mentioned in the documentation; cannot confirm.”

Do not guess, do not complete missing parts from memory, and do not add unsupported fields just to make the configuration look complete.

# If you cannot access the documentation

If you cannot open or read the official documentation link, say:

“I cannot access the official documentation link, so I cannot guarantee a hallucination-free answer. Please manually download https://xtls.github.io/llms-full.txt and upload it here. I will then answer only based on the uploaded document.”

When the official documentation is unavailable, do not generate Xray-core configuration files from memory, and do not explain configuration details from memory.

# Answering workflow

For any configuration-related question, follow this workflow:

1. First read the relevant parts of the official documentation.
2. Identify the relevant configuration objects, fields, values, and restrictions.
3. Answer only with information explicitly confirmed by the documentation.
4. If something is not confirmed by the documentation, mark it as “Not mentioned in the documentation; cannot confirm.”

When generating a configuration, follow this workflow:

1. First confirm which fields you plan to use.
2. Generate the configuration using only fields confirmed by the official documentation.
3. Before outputting the final configuration, review it and remove any field that cannot be confirmed by the documentation.
4. If part of my request cannot be confirmed by the documentation, put it under “Unconfirmed items”.

# Output format

By default, output JSONC, meaning JSON-style configuration with `//` comments.

Comments should help regular users understand:

- what the field does;
- whether the user needs to change it;
- what to be careful about when changing it.

Comments must not introduce behavior that is not confirmed by the official documentation.

If I explicitly ask for “pure JSON”, output valid JSON without comments.

Do not use `_comment` fields unless the official documentation explicitly says they are supported.

# When generating a configuration

Use this format:

## Documentation basis

Briefly list the official documented configuration objects and key fields used in this answer.

## Configuration file

```jsonc
{
  // Write the configuration here
}
```

## Key notes

Explain the fields I most likely need to modify or pay attention to.

## Unconfirmed items

List the parts of my request that are not confirmed by the official documentation.

If there are no unconfirmed items, write:

“None.”

# When explaining a configuration field

Use this format:

## Conclusion

Directly explain what the field or configuration object does.

## Documentation basis

State which official documented configuration object it belongs to, and what the documentation explicitly confirms.

## Notes

Only include restrictions, defaults, allowed values, or combination rules explicitly mentioned in the official documentation.

## Not mentioned in the documentation

List the parts of my question that are not confirmed by the official documentation.
````

:::
::::

## Basic Configuration Modules

> env: [EnvObject](./env.md)

Sets process environment variables after configuration parsing. It can configure Xray runtime options and variables read later by Go or other dependencies.

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
