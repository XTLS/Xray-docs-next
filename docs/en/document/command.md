# Command Line Parameters

::: tip
Xray uses Go-style commands and parameters.
:::

## Getting Basic Commands

You can run `xray help` to get the most basic usage of Xray, as well as available commands and descriptions.

```
Xray is a platform for building proxies.

Usage:

        xray <command> [arguments]

The commands are:

        run          Run Xray with config, the default command
        version      Show current version of Xray
        api          Call an API in an Xray process
        convert      Convert configs
        tls          TLS tools
        uuid         Generate UUIDv4 or UUIDv5 (VLESS)
        x25519       Generate key pair for X25519 key exchange (REALITY, VLESS Encryption)
        wg           Generate key pair for X25519 key exchange (WireGuard)
        mldsa65      Generate key pair for ML-DSA-65 post-quantum signature (REALITY)
        mlkem768     Generate key pair for ML-KEM-768 post-quantum key exchange (VLESS Encryption)
        vlessenc     Generate decryption/encryption json pair (VLESS Encryption)

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
Default "auto".

The -test flag tells Xray to test config files only,
without launching the server.

The -dump flag tells Xray to print the merged config.
```

`-config=` / `-c=` are used to specify the location of the configuration file(s) to use. Supports multi-file configuration.
`-confdir=` is used to specify a folder containing multiple configuration files.
`-format=` is used to specify the format of the configuration files.
`-test` is used to test the validity of the configuration files.
`-dump` is used to display the result after merging multiple configuration files.

::: tip
In addition to the default JSON format, configuration files can also use TOML and YAML. If no format is specified, it will be identified by the file extension.
:::

::: tip
When `-config` is not specified, Xray will attempt to load `config.json` from the following paths in order:

- Working Directory
- The path specified by `Xray.location.asset` in [Environment Variables](../config/features/env.md#resource-file-path)
:::

```
 xray run -dump
```

Used to output the result after merging multi-file configurations.

### xray version

Output Xray version, Golang version, and other information.

Usage:

```
 xray version
```

### xray api

Call Xray's gRPC API. Needs to be enabled in the configuration file.

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

Convert configuration files to protobuf or convert typedMessage to JSON.

Usage:

```
xray convert <command> [arguments]

The commands are:

        pb           Convert multiple json configs to protobuf
        json         Convert typedMessage to json
```

`pb` subcommand usage example:

```bash
# Usage: xray convert pb [-outpbfile out.pb] [-debug] [-type] [json file] [json file] ...

# Merge three configs into mix.pb
xray convert pb -outpbfile mix.pb c1.json c2.json c3.json

# Use -debug option to view the content of mix.pb
xray convert pb -debug mix.pb

# Start Xray-core using mix.pb
xray -c mix.pb

# Detailed instructions
xray help convert pb
```

`json` subcommand usage example:

```bash
# Usage: xray convert json [-type] [stdin:] [typedMessage file]

tmsg='{
  "type": "xray.proxy.shadowsocks.Account",
  "value": "CgMxMTEQBg=="
}'

echo ${tmsg} | xray convert json stdin:

# The output of the above command is:
'{
  "cipherType": "AES_256_GCM",
  "password": "111"
}'

# Detailed instructions
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
xray uuid [-i "example"]
```

### xray x25519

Generate x25519 key pair.

Usage:

```
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

Generate WireGuard curve25519 key pair.

Usage:

```
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
When `-config` is not specified, Xray will attempt to load `config.json` from the following paths in order:

- Working Directory
- The path specified by `Xray.location.asset` in [Environment Variables](../config/features/env.md#resource-file-path)
:::

### xray mldsa65

Generate MLDSA-65 post-quantum signature key pair for REALITY.

Usage:

```
xray mldsa65 [-i "seed (base64.StdEncoding)"]
```

### xray mlkem768

Generate ML-KEM-768 post-quantum key exchange key pair for VLESS Encryption.

Usage:

```
xray mlkem768 [-i "seed (base64.StdEncoding)"]
```

### xray vlessenc

Generate encryption/decryption option content that can be directly used for VLESS Encryption. In the generated configuration, you can use either X25519 or ML-KEM-768 authentication method, but the server and client must use the same authentication method. The ephemeral key exchange remains post-quantum secure regardless of the authentication method.

Usage:

```
xray vlessenc
```
