# Environment Variables

Xray provides the following environment variables to modify some underlying configurations of Xray.

## Resource File Path

- Name: `xray.location.asset` or `XRAY_LOCATION_ASSET`.
- Default value: Specific [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) directories or the same path as the Xray executable.

This environment variable specifies a folder location that should contain the `geoip.dat` and `geosite.dat` files.
If no variable value is specified, the program will look for resource files in the following order:

```
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

## Other Available Configurations

- xray.location.plugin
- xray.location.tool
- xray.location.cert

- xray.buf.readv
- xray.buf.splice
- xray.vmess.padding
- xray.cone.disabled

- xray.ray.buffer.size
- xray.browser.dialer
- xray.xudp.show
- xray.xudp.basekey

These options are open to users with special needs; you can read the source code to discover their usage. ~PR Welcome~
