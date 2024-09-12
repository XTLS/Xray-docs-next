# Command Parameters

::: tip
Xray uses Go-style commands and parameters
:::

## Get Basic Commands

You can run `xray help`to get the most basic usage of all xray, as well as available commands and instructions.

```
Xray is a platform for building proxies.

Usage:

        xray <command> [arguments]

The commands are:

        run          Run Xray with config, the default command
        version      Show current version of Xray
        api          Call an API in an Xray process
        tls          TLS tools
        uuid         Generate UUIDv4 or UUIDv5
        x25519       Generate key pair for x25519 key exchange
        wg           Generate key pair for wireguard key exchange

Use "xray help <command>" for more information about a command.

```
### xray run

Specify one or more configuration files and run.

Usage:

```
 xray run [-c config.json] [-confdir dir]
```

```
Run Xray with config, the default command.

The -config=file, -c=file flags set the config files for
Xray. Multiple assign is accepted.

The -confdir=dir flag sets a dir with multiple json config

The -format=json flag sets the format of config files.
Default "json".

The -test flag tells Xray to test config files only,
without launching the server

The -dump flag tells Xray to print the merged config.
```
::: tip
Except from the default JSON format, config can also use TOML and YAML. It will automatically recognized from file extensions when the `-format` flag is not set.
:::

### xray version

Output Xray version, Golang version and other information.

Usage:

```
 xray version
```

### xray api

To call Xray's gRPC API, it needs to be enabled in the configuration file.

Usage:

```
xray api <command> [arguments]
```

```
        restartlogger Restart the logger
        stats         Get statistics
        statsquery    Query statistics
        statssys      Get system statistics
        adi           Add inbounds
        ado           Add outbounds
        rmi           Remove inbounds
        rmo           Remove outbounds
```

### xray convert

Convert config to protobuf, or convert typedMessage to JSON

usage:

```
xray convert <command> [arguments]

The commands are:

        pb           Convert multiple json configs to protobuf
        json         Convert typedMessage to json
```

Sub-command `pb`
```bash
# Usage: xray convert pb [-debug] [-type] [json file] [json file] ...

# mix three config files to mix.pb
xray convert pb c1.json c2.json c3.json > mix.pb

# Use -debug option to view the content of mix.pb
xray convert pb -debug mix.pb

# Start Xray-core with mix.pb
xray -c mix.pb

# Detailed usage
xray help convert pb
```

Sub-command JSON
```bash
# Usage: xray convert json [-type] [stdin:] [typedMessage file]

tmsg='{
  "type": "xray.proxy.shadowsocks.Account",
  "value": "CgMxMTEQBg=="
}'

echo ${tmsg} | xray convert json stdin:

# Outputs from above:
'{
  "cipherType": "AES_256_GCM",
  "password": "111"
}'

# Detailed usage
xray help convert json
```

### xray tls

Some tools related to TLS.

Usage:

```
xray tls <command> [arguments]
```

```
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

Generate UUID.

Usage:

```
xray uuid
```

### xray x25519
Generate x25519 key pair。

Usage:

```
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding]
```

### xray wg
Generate wireguard curve25519 key pair。

Usage:

```
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
When `-config` is not specified, Xray will try to load `config.json` from the following paths:

- Working Directory
- The path specified by `Xray.location.asset` in the [environment variable](../config/features/env.md).
  :::
