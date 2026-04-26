# Geodata Files

Reloads geodata files on a schedule, and can download new `.dat` files before reloading. It is intended for cases where restarting Xray is inconvenient but geodata still needs periodic updates.

Use with caution on low-memory devices.

## GeodataObject

```json
{
  "cron": "0 4 * * *",
  "outbound": "proxy",
  "assets": [
    { "url": "https://example.com/geoip.dat", "file": "geoip.dat" },
    { "url": "https://example.com/geosite.dat", "file": "geosite.dat" }
  ]
}
```

> `cron`: string

A standard 5-field cron expression, evaluated in the local time zone of the Xray runtime environment. For example:

- `"0 4 * * *"`: run every day at 04:00.
- `"30 3 * * 1"`: run every Monday at 03:30.

If omitted, the scheduled task is not enabled. If the previous task is still running, the next trigger is skipped.

> `outbound`: string

The outbound proxy `tag` used when downloading geodata files. If omitted, downloads go through the routing module.

> `assets`: \[ [AssetObject](#assetobject) \]

The list of geodata files to download and replace.

If reloading fails after the download, all files replaced by this update are rolled back together.

### AssetObject

```json
{
  "url": "https://example.com/geoip.dat",
  "file": "geoip.dat"
}
```

> `url`: string

The resource download URL. It must be an HTTPS URL.

> `file`: string

The resource filename to write, such as `geoip.dat` or `geosite.dat`.

The file is resolved using the [Resource File Path](./features/env.md#resource-file-path). It must be an existing regular file inside the resource directory; absolute paths and paths escaping the resource directory are not supported.
