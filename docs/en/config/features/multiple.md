# Multi-file configuration

The Xray program supports the use of multiple configuration files.

The main purpose of using multiple configuration files is to distribute different module configurations, making it easier to manage and maintain.

This feature is mainly designed to enrich the Xray ecosystem. For example, for GUI-based clients, only fixed functions such as node selection are usually implemented, and complex configurations are difficult to implement graphically. By leaving a custom `confdir` configuration directory for complex functions, server deployment scripts can simply add files to `confdir` to implement multiple protocol configurations.

## Multi-file startup

::: tip
The startup information will indicate each configuration file being read in sequence. Please pay attention to whether the startup information matches the order you have set.
:::

```shell
$ xray run -confdir /etc/xray/confs
```

You can also use `Xray.location.confdir` or `Xray_LOCATION_CONFDIR` to specify the `confdir`.

The `-confdir` parameter takes precedence over the environment variable. If a valid directory is specified by the parameter, the path in the environment variable will not be read.

## Rule Explanation

### Normal Objects（`{}`）

**In the top-level object of `JSON`, the latter overrides or supplements the former.**

For example：

- base.json

```json
{
  "log": {},
  "api": {},
  "dns": {},
  "stats": {},
  "policy": {},
  "transport": {},
  "routing": {},
  "inbounds": []
}
```

- outbounds.json

```json
{
  "outbounds": []
}
```

When starting Xray with multiple configurations, use the following command:

```bash
$ xray run -confdir /etc/xray/confs
```

These two configuration files are equivalent to a single combined configuration. If you need to modify the outbound nodes, simply modify the content of `outbounds.json`.

If you need to change the log level for debugging purposes, there is no need to modify `base.json`. You can add an additional configuration file:

- debuglog.json

```json
{
  "log": {
    "loglevel": "debug"
  }
}
```

Start the program in sequence after `base.json` to output logs at the debug level.

### Arrays（`[]`）

In the JSON configuration, `inbounds` and `outbounds` are array structures with special rules:

- When there are two or more elements in the array, the latter overrides the former for `inbounds`/`outbounds`.
- When there is only one element in the array, it searches for an existing element with the same `tag` to override. If it cannot be found:
  - For `inbounds`, add it to the end (the order of elements in `inbounds` is irrelevant).
  - For `outbounds`, add it to the beginning (the default first-choice outbound). However, if the filename contains "tail" (case-insensitive), add it to the end.

With multiple configurations, it is easy to add inbound for different protocols to the original configuration without modifying the original configuration.

The following example is not a valid configuration but is provided to demonstrate the above rules.

- 000.json

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 1234
    }
  ]
}
```

- 001.json

```json
{
  "inbounds": [
    {
      "protocol": "http",
      "tag": "http"
    }
  ]
}
```

- 002.json

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 4321
    }
  ]
}
```

The three configurations will be combined into:

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 4321 // < 002顺序在000后，因此覆盖tag为socks的inbound端口为4321
    },
    {
      "protocol": "http",
      "tag": "http"
    }
  ]
}
```

## Recommended Multi-file List

Execute：

```bash
for BASE in 00_log 01_api 02_dns 03_routing 04_policy 05_inbounds 06_outbounds 07_transport 08_stats 09_reverse; do echo '{}' > "/etc/Xray/$BASE.json"; done
```

or

```bash
for BASE in 00_log 01_api 02_dns 03_routing 04_policy 05_inbounds 06_outbounds 07_transport 08_stats 09_reverse; do echo '{}' > "/usr/local/etc/Xray/$BASE.json"; done
```

```bash
.
├── 00_log.json
├── 01_api.json
├── 02_dns.json
├── 03_routing.json
├── 04_policy.json
├── 05_inbounds.json
├── 06_outbounds.json
├── 07_transport.json
├── 08_stats.json
└── 09_reverse.json

0 directories, 10 files
```
