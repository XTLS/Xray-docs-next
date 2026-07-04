# Environment Variables

Xray provides the following environment variables to modify some underlying configurations of Xray.

## Resource File Path

- Name: `xray.location.asset` or `XRAY_LOCATION_ASSET`.
- Default value: Specific [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) directories or the same path as the Xray executable.

This environment variable specifies a folder location that should contain the `geoip.dat` and `geosite.dat` files.
If no variable value is specified, the program will look for resource files in the following order:

```text
./
/usr/local/share/xray
/usr/share/xray
```

## Configuration File Location

- Name: `xray.location.config` or `XRAY_LOCATION_CONFIG`.
- Default value: The same path as the Xray executable.

This environment variable specifies a folder location that should contain the `config.json` file.

## Multiple Configuration Directory

- Name: `xray.location.confdir` or `XRAY_LOCATION_CONFDIR`.
- Default value: `""`.

The `.json` files in this directory will be read in alphabetical order of their filenames as multiple configuration options.

This item has lower priority than the startup argument `confdir`.

## Strict JSON Parser

- Name: `xray.json.strict` or `XRAY_JSON_STRICT`.
- Default value: `false`.

By default, on startup Xray uses a custom JSON parser that strips comments and other non-standard characters from the configuration. If you are sure that your configuration file strictly conforms to the JSON standard (RFC 8259), you can enable this option to use the standard JSON parser, which is faster when working with large configurations.

## `env` in the Configuration File

The root of an Xray configuration file can contain an `env` object for selected runtime environment settings:

```jsonc
{
  "env": {
    "xray.location.asset": "/usr/local/share/xray",
    "xray.location.cert": "/usr/local/share/xray",
    "xray.ray.buffer.size": "0"
  }
}
```

All values in `env` are strings. Xray applies these values after the configuration file has been read and parsed, so this object is suitable for runtime resource paths and feature switches.

The root `env` object supports the following fields:

| Field                  | Description                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `xray.location.asset`  | Resource file directory, usually used for files such as `geoip.dat` and `geosite.dat`.      |
| `xray.location.cert`   | Certificate file directory.                                                                 |
| `xray.buf.readv`       | Controls read buffer related behavior.                                                      |
| `xray.buf.splice`      | Controls Freedom outbound splice related behavior.                                          |
| `xray.vmess.padding`   | Controls VMess outbound padding.                                                            |
| `xray.cone.disabled`   | Set to `"true"` to disable FullCone behavior.                                               |
| `xray.ray.buffer.size` | Default connection buffer size in MB; `"0"` means unlimited.                                |
| `xray.browser.dialer`  | Browser Dialer address, for example `"127.0.0.1:8080"`.                                     |
| `xray.xudp.show`       | Controls XUDP log output.                                                                   |
| `xray.xudp.basekey`    | XUDP base key, encoded as a 32-byte base64url key.                                          |
| `xray.tun.fd`          | TUN file descriptor passed by an external program, mainly for mobile or embedded scenarios. |

### Priority and Restrictions

- Process environment variables are read first; the root `env` object is applied after configuration parsing and overrides reloadable fields with the same name.
- When multiple configuration files are merged, later `env` fields override earlier fields with the same name.
- Unknown fields are ignored.
- Empty strings do not unset existing environment variable values.
- `xray.json.strict`, `xray.location.config`, and `xray.location.confdir` can only be provided through process environment variables. They cannot be set in the root `env` object.

These options are intended for users with special runtime integration needs.
