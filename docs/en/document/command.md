# Command Line Parameters

::: tip
Xray uses Go-style commands and parameters.
:::

## Getting Basic Commands

You can run `xray help` to get the most basic usage of Xray, as well as available commands and descriptions.

```bash
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

```bash
xray run [-c config.json] [-confdir dir]
```

```bash
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

- `-config=` / `-c=` are used to specify the location of the configuration file(s) to use.
- `-confdir=` is used to specify a folder containing multiple configuration files. All configuration files in that directory will be [merged automatically](/en/config/features/multiple.md).
- `-format=` is used to specify the format of the configuration files.
- `-test` is used to test the validity of the configuration files.
- `-dump` is used to display the result after merging multiple configuration files.

::: tip
In addition to the default JSON format, configuration files can also use TOML and YAML. If no format is specified, it will be identified by the file extension.
:::

:::: tip
`-config=` / `-c=` supports not only local file paths, but also standard input and remote URLs.

::: details Expand to view supported `-config` forms and examples
`-config=` can be repeated to specify multiple configuration sources. For example:

```bash
xray run -config base.json -config routing.json -config outbounds.yaml
```

Xray reads these configuration files in argument order and [merges them automatically](/en/config/features/multiple.md) into the final configuration.

In addition to common local absolute and relative file paths, the following forms are also supported:

- `stdin:`: Read configuration content from standard input. This is useful when piping, redirecting, or generating configuration dynamically from another program. After the input is complete, the caller must close the standard input stream, otherwise Xray will continue waiting for the end of input.
- URLs starting with `http://` or `https://`: Download configuration content from a remote address. The protocol prefix must be lowercase. **This method carries security risks. Do not use it unless you clearly know what you are doing.**
- `http+unix://`: Read configuration over an HTTP request sent through a Unix Domain Socket, in a form such as `http+unix:///path/to/socket.sock/api/endpoint`. This is useful when configuration is provided dynamically by a local service that only listens on a Unix socket.

Examples:

```bash
# Read from a local file
xray run -config ./config.json

# Read from standard input
cat config.json | xray run -config stdin:

# Read from a remote URL
xray run -config https://example.com/xray/config.json

# Read through an HTTP endpoint on a Unix Domain Socket
xray run -config http+unix:///run/xray-config.sock/config.json
```

:::
::::

::: tip
When `-config` is not specified, Xray will attempt to load `config.json` from the following paths in order:

- Working Directory
- The path specified by `Xray.location.asset` in [Environment Variables](../config/features/env.md#resource-file-path)
  :::

```bash
xray run -dump
```

Used to output the result after merging multi-file configurations.

### xray version

Output Xray version, Golang version, and other information.

Usage:

```bash
xray version
```

### xray api

Call Xray's gRPC API. Needs to be enabled in the configuration file.

Usage:

```bash
xray api <command> [arguments]
```

```bash
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

```bash
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

```bash
xray tls <command> [arguments]
```

```bash
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

Generate UUID.

Usage:

```bash
xray uuid [-i "example"]
```

### xray x25519

Generate x25519 key pair.

Usage:

```bash
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

Generate WireGuard curve25519 key pair.

Usage:

```bash
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

```bash
xray mldsa65 [-i "seed (base64.StdEncoding)"]
```

### xray mlkem768

Generate ML-KEM-768 post-quantum key exchange key pair for VLESS Encryption.

Usage:

```bash
xray mlkem768 [-i "seed (base64.StdEncoding)"]
```

### xray vlessenc

Generate encryption/decryption option content that can be directly used for VLESS Encryption. In the generated configuration, you can use either X25519 or ML-KEM-768 authentication method, but the server and client must use the same authentication method. The ephemeral key exchange remains post-quantum secure regardless of the authentication method.

Usage:

```bash
xray vlessenc
```
