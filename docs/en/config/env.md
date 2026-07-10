# Environment Configuration

Xray can configure its runtime environment through the root `env` object or process environment variables.

## `env` in the Configuration File

The root of a configuration file can contain an `env` object:

```jsonc
{
  "env": {
    "XRAY_LOCATION_ASSET": "/usr/local/share/xray",
    "XRAY_LOCATION_CERT": "/usr/local/share/xray",
    "XRAY_RAY_BUFFER_SIZE": "0"
  }
}
```

Every key and value in `env` is written unchanged to the current process environment, and every value must be a string. Keys are not limited to environment variables defined by Xray. Go environment variables and variables used by other dependencies can also be set, but they only affect code that reads them after `env` is applied.

### When It Takes Effect

- Xray reads and merges all configuration files before applying the root `env` object.
- `XRAY_LOCATION_ASSET`, `XRAY_LOCATION_CERT`, and runtime options read while creating an Xray instance can take effect from the root `env` object.
- Variables required to locate or parse the current configuration must be set before Xray starts. `XRAY_LOCATION_CONFIG`, `XRAY_LOCATION_CONFDIR`, and `XRAY_JSON_STRICT` in the root `env` object cannot affect the current configuration load.
- When multiple configuration files are merged, an identical key in a later file overrides the earlier value.
- An empty string sets the environment variable to an empty value; it does not remove the variable.
- The root `env` object changes the process-wide environment. It provides no per-instance isolation and is not automatically restored when configuration building fails or an instance stops.

## Pre-Load Environment Variables

The following three variables must be set in the process environment before Xray reads the configuration. They cannot be supplied by the root `env` object in the current configuration.

### Configuration File Location

- Name: `XRAY_LOCATION_CONFIG`.
- Default value: The same path as the Xray executable.

This environment variable specifies the directory containing `config.json`.

### Multiple Configuration Directory

- Name: `XRAY_LOCATION_CONFDIR`.
- Default value: `""`.

The `.json` files in this directory are read in filename order. The `confdir` command-line argument has higher priority than this environment variable.

### Strict JSON Parser

- Name: `XRAY_JSON_STRICT`.
- Default value: `false`.

By default, Xray uses a custom JSON parser that removes comments and other non-standard characters. If the configuration strictly follows JSON (RFC 8259), this option enables the standard JSON parser and may improve parsing speed for very large configuration files.

## Resource Path Environment Variables

The following two variables can be set through either the process environment or the root `env` object.

### Resource File Path

- Name: `XRAY_LOCATION_ASSET`.
- Default value: Specific [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) directories or the same path as the Xray executable.

This environment variable specifies the resource directory, which usually contains `geoip.dat` and `geosite.dat`. If it is not set, Xray searches for resource files in this order:

```text
./
/usr/local/share/xray
/usr/share/xray
```

### Certificate File Path

- Name: `XRAY_LOCATION_CERT`.
- Default value: The same path as the Xray executable.

This environment variable specifies the base directory for relative certificate file paths.

## Other Runtime Environment Variables

The following variables can also be set through either the process environment or the root `env` object:

- `XRAY_BUF_READV`
- `XRAY_BUF_SPLICE`
- `XRAY_VMESS_PADDING`
- `XRAY_CONE_DISABLED`
- `XRAY_RAY_BUFFER_SIZE`
- `XRAY_BROWSER_DIALER`
- `XRAY_XUDP_SHOW`
- `XRAY_XUDP_BASEKEY`
- `XRAY_TUN_FD`

These options are intended for users with special requirements. Refer to the source code for their exact behavior.
