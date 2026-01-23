# Multiple Configuration Files

Xray supports the use of multiple configuration files.

The main purpose of multiple configuration files is to disperse the configuration of different functional modules, facilitating management and maintenance.

This feature is designed mainly to enrich Xray's ecosystem. For example, GUI clients usually only implement fixed functions like node selection, making it difficult to graphically implement complex configurations. By leaving a custom configuration directory `confdir`, complex functions can be configured there. For server deployment scripts, simply adding files to `confdir` can achieve multi-protocol configuration.

## Multi-file Startup

::: tip
The startup log will indicate each configuration file read in sequence. Pay attention to whether the startup information matches your expected order. You can control the order by adding numeric prefixes to file names, such as `01_filename`, `02_filename`. The larger the number, the later it is sorted.
:::

```shell
$ xray run -confdir /etc/xray/confs
```

You can also use `Xray.location.confdir` or `Xray_LOCATION_CONFDIR` to specify `confdir`.

The `-confdir` parameter takes precedence over environment variables. If the parameter specifies a valid directory, the path in the environment variable will not be read.

## Rules Explanation

### Ordinary Objects (`{}`)

Top-level objects in later files overwrite or supplement those in earlier files.

### Arrays (`[]`)

`inbounds` and `outbounds` in JSON configuration are array structures, and they have special rules:

- Look for existing elements with the same `tag` and overwrite them; if not found:
  - For `inbounds`, append to the end (order within inbounds doesn't matter).
  - For `outbounds`, prepend to the beginning (the first outbound is the default); however, if the filename contains "tail" (case-insensitive), append to the end.

## Configuration Example

Assume there are the following three configuration files in the `confs` folder.

- 01.json

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "tag": "socks",
      "protocol": "socks",
      "listen": "0.0.0.0",
      "port": 8888
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    }
  ]
}
```

- 02.json

```json
{
  "log": {
    "loglevel": "debug"
  },
  "inbounds": [
    {
      "tag": "socks",
      "protocol": "socks",
      "listen": "127.0.0.1",
      "port": 1080
    }
  ],
  "outbounds": [
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ]
}
```

- 03_tail.json

```json
{
  "outbounds": [
    {
      "tag": "direct2",
      "protocol": "freedom"
    }
  ]
}
```

The three configurations will be merged as follows:

```json
{
  "log": {
    "loglevel": "debug" // Top-level object overwrites the former
  },
  "inbounds": [
    {
      "tag": "socks", // Overwrites the former when tag is the same
      "protocol": "socks",
      "listen": "127.0.0.1",
      "port": 1080
    }
  ],
  "outbounds": [
    {
      "tag": "block", // outbounds added to the front
      "protocol": "blackhole"
    },
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "direct2", // Filename of 03_tail.json contains 'tail' keyword, added to the end
      "protocol": "freedom"
    }
  ]
}
```

::: tip
You can use the `xray run -confdir=./confs -dump` command to view the merged configuration. However, since the core uses the Protobuf data format internally, the configuration format output by the `-dump` option will look different.
:::
