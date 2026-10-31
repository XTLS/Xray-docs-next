# Environment Variables

Environment variables are used to adjust some underlying Xray settings.

Environment variables can either be written to the current Xray process by the configuration file's `env` item after the configuration is read, or supplied through a shell or service manager before Xray starts.

## EnvObject

`EnvObject` corresponds to the `env` item in the configuration file. It is a mapping of environment variable names to values.

```json
{
  "env": {
    "XRAY_LOCATION_ASSET": "/usr/local/share/xray",
    "XRAY_BUF_READV": "true",
    "XRAY_RAY_BUFFER_SIZE": "2",
    "GODEBUG": "gctrace=1,schedtrace=1000,scheddetail=1"
    // ...
  }
}
```

> `environment variable name`: string

Both the environment variable name and its value must be strings. After Xray reads and merges all configuration files, it writes the entries in `env` to the current process environment before building its modules.

::: tip
When [multiple configuration files](./features/multiple.md) are used, their `env` items are merged by key. A duplicate key from a later file overrides the earlier value.

The `env` item sets the exact name written in the configuration and replaces an existing process variable with that exact name.
:::

::: warning
The `env` item takes effect only after the configuration files have been located, read, and merged. Some environment variables must be set through a shell or service manager before Xray starts, for example:

- `XRAY_JSON_STRICT`
- `XRAY_LOCATION_CONFIG`
- `XRAY_LOCATION_CONFDIR`
- `GOGC`
- `GOMEMLIMIT`
- `GOMAXPROCS`
- `GOTRACEBACK`

:::

## Setting Environment Variables Before Xray Starts

The following examples use a shell or service manager to set both the resource file path and the strict JSON parser:

::: code-group

```bash [Shell]
# Set the variables in the current shell and its child processes
export XRAY_LOCATION_ASSET=/usr/local/share/xray
export XRAY_JSON_STRICT=true

# Alternatively, set them for a single Xray invocation, separated by spaces
XRAY_LOCATION_ASSET=/usr/local/share/xray XRAY_JSON_STRICT=true xray run
```

```powershell [PowerShell]
# Set the variables in the current PowerShell session and its child processes
$env:XRAY_LOCATION_ASSET = "C:\Xray"
$env:XRAY_JSON_STRICT = "true"
```

```batch [CMD]
:: Set the variables in the current CMD session and its child processes
set "XRAY_LOCATION_ASSET=C:\Xray"
set "XRAY_JSON_STRICT=true"
```

```ini [systemd]
# Set the variables in the Xray service's [Service] section
[Service]
Environment="XRAY_LOCATION_ASSET=/usr/local/share/xray"
Environment="XRAY_JSON_STRICT=true"
```

:::

## Built-in Xray Variables

### Configuration File Location

- Name: `XRAY_LOCATION_CONFIG`.
- Default value: The directory containing the Xray executable.

This variable specifies the directory containing the `config.json` file.

Setting it in the configuration file's `env` item has no effect because Xray locates the configuration file before reading that item.

### Multiple Configuration Directory

- Name: `XRAY_LOCATION_CONFDIR`.
- Default value: `""`.

The `.json` files in this directory are read in filename order as multiple configuration files.

Setting it in the configuration file's `env` item has no effect because Xray locates the configuration directory before reading that item.

This item has lower priority than the `confdir` startup argument.

### Strict JSON Parser

- Name: `XRAY_JSON_STRICT`.
- Default value: `false`.

By default, Xray uses a custom JSON parser at startup. This parser strips comments and other non-standard characters from the configuration. If your configuration files strictly conform to the JSON standard (RFC 8259), you can enable this option to use the standard JSON parser, which can parse very large configurations faster.

Setting it in the configuration file's `env` item has no effect because Xray must select the JSON parser before it can read that item.

### Resource File Path

- Name: `XRAY_LOCATION_ASSET`.
- Default value: Specific [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) directories or the directory containing the Xray executable.

This variable specifies the directory containing the `geoip.dat` and `geosite.dat` files.
If it is not specified, the program looks for resource files in the following order:

```text
./
/usr/local/share/xray
/usr/share/xray
```

### Other Available Variables

- `XRAY_LOCATION_CERT`
- `XRAY_BUF_READV`
- `XRAY_BUF_SPLICE`
- `XRAY_VMESS_PADDING`
- `XRAY_CONE_DISABLED`
- `XRAY_RAY_BUFFER_SIZE`
- `XRAY_BROWSER_DIALER`
- `XRAY_XUDP_SHOW`
- `XRAY_XUDP_BASEKEY`
- `XRAY_TUN_FD`

These options are intended for specialized use cases. Refer to the source code for their exact behavior.
