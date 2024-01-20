# Environment Variables

Xray provides the following environment variables for modifying some of its underlying configurations.

## Xray Asset Location

- Name：`xray.location.asset` or `XRAY_LOCATION_ASSET`。
- Default value：specified [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) directory or the same path as the Xray file.

This environment variable specifies a folder location that should contain the `geoip.dat` and `geosite.dat` files. If no variable value is specified, the program will search for resource files in the following order:

```
./
/usr/local/share/xray
/usr/share/xray
```

## Configuration File Location

- Name：`xray.location.config` or `XRAY_LOCATION_CONFIG`。
- Default value: Same path as the Xray file.

This environment variable specifies a folder location that should contain the `config.json` file.

## Multiple Configuration Directories

- Name：`xray.location.confdir` or `XRAY_LOCATION_CONFDIR`。
- Default value：`""`。

The `.json` files in this directory will be read in alphabetical order by filename and used as options for multiple configurations.
