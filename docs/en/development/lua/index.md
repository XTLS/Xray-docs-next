# Lua Scripts

Lua scripts provide a flexible way to extend Xray, implement custom functionality, and interact with the core.

## Getting Started

Start with [Runtime Environment and Script Loading](./environment.md) to learn about Lua support, module loading, and how script files are located.

## Writing Guides

Choose a guide for the functionality you need, start with the minimal example, and build your own script step by step:

| Guide                                 | Purpose                 | Contents                                                                           |
| ------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| [Routing Scripts](./guide/routing.md) | Customize routing rules | Outbound selection, load balancing, and IP-based routing after explicit resolution |
| [DNS Scripts](./guide/dns.md)         | Customize DNS queries   | Upstream selection, query fallback, and result filtering                           |
| [Noise Scripts](./guide/noise.md)     | Customize noise packets | Address-based differentiation, random lengths, and sending as multiple packets     |

The current routing, DNS, and noise scripts all use pooled instances. When writing scripts, read about the [pooled lifecycle](./guide/lifecycle.md#pooled-lifecycle) to understand top-level initialization and state retention.

## Reference

### Hook

A Hook is a Lua function that the core calls at a specific point. The script entry point determines the available Hooks and their calling conventions; one entry point can have multiple Hooks. Refer to the documentation for each entry point to find out which Hooks you need to implement.

The currently supported entry points and Hooks are listed below. See each Hook's reference page for parameters, return values, and failure behavior:

| Script entry point                                                                           | Hook                                       |
| -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `routing.script`                                                                             | [HandleRoute](./reference/hook-routing.md) |
| `dns.script`                                                                                 | [HandleDNSQuery](./reference/hook-dns.md)  |
| `script` in a finalmask [noise camouflage layer](../../config/transports/finalmask.md#noise) | [HandleNoise](./reference/hook-noise.md)   |

### Data Types

In addition to Lua's built-in types, Xray Lua uses types such as `net.IP`, Go slices, and `error`. See [Data Types](./reference/data-types.md) for their representation and use in Lua.

### Module API

Browse the module APIs by functionality:

| Module                                              | Purpose                                |
| --------------------------------------------------- | -------------------------------------- |
| [xray.router](./reference/module-router.md)         | Policy routing                         |
| [xray.dns](./reference/module-dns.md)               | Domain resolution                      |
| [xray.geodata](./reference/module-geodata.md)       | Domain and IP matching and filtering   |
| [xray.finalmask.noise](./reference/module-noise.md) | Generating the random data noise needs |
| [xray.log](./reference/module-log.md)               | Log output                             |
