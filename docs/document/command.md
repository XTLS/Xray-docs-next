# 命令参数

::: tip
Xray 使用 Go 风格的命令及参数
:::

## 获取基本命令

您可以运行 `xray help` 来获得所有 xray 最基础的用法, 以及可用的命令及说明。

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

指定一个或多个配置文件，并运行。

使用方法:

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

`-config=` / `-c=` 用于指定使用的配置文件的位置，支持多文件配置。
`-confdir=` 用于指定一个包含多个配置文件的文件夹。
`-format=` 用于指定使用的配置文件的格式。
`-test` 用于测试配置文件的合法性。
`-dump` 用于显示多文件配置文件合并之后的效果。
::: tip
配置文件除了默认的 JSON 格式外，也可以使用 TOML 和 YAML。在不指定格式的前提下会通过文件扩展名识别。
:::

::: tip
当 `-config` 没有指定时，Xray 将先后尝试从以下路径加载 `config.json` :

- 工作目录（Working Directory）
- [环境变量](../config/features/env.md#资源文件路径)中 `Xray.location.asset` 所指定的路径
  :::

```
 xray run -dump
```

用以输出多文件配置融合之后的结果。

### xray version

输出 Xray 版本、 Golang 版本等信息。

使用方法:

```
 xray version
```

### xray api

调用 Xray 的 gRPC API，需要在配置文件中开启。

使用方法:

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

把配置文件转换成 protobuf 或者把 typedMessage 转换成 JSON

使用方法：

```
xray convert <command> [arguments]

The commands are:

        pb           Convert multiple json configs to protobuf
        json         Convert typedMessage to json
```

`pb` 子命令使用示例：

```bash
# 用法：xray convert pb [-outpbfile out.pb] [-debug] [-type] [json file] [json file] ...

# 把三个配置合并成 mix.pb
xray convert pb -outpbfile mix.pb c1.json c2.json c3.json

# 使用 -debug 选项查看 mix.pb 的内容
xray convert pb -debug mix.pb

# 使用 mix.pb 启动 Xray-core
xray -c mix.pb

# 详细说明
xray help convert pb
```

json 子命令使用示例：

```bash
# 用法：xray convert json [-type] [stdin:] [typedMessage file]

tmsg='{
  "type": "xray.proxy.shadowsocks.Account",
  "value": "CgMxMTEQBg=="
}'

echo ${tmsg} | xray convert json stdin:

# 上面这个命令的输出结果是：
'{
  "cipherType": "AES_256_GCM",
  "password": "111"
}'

# 详细说明
xray help convert json
```

### xray tls

一些与 TLS 相关的工具。

使用方法:

```
xray tls <command> [arguments]
```

```
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

生成 UUID。

使用方法:

```
xray uuid [-i "example"]
```

### xray x25519

生成 x25519 密钥对。

使用方法:

```
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

生成 wireguard curve25519 密钥对。

使用方法:

```
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
当 `-config` 没有指定时，Xray 将先后尝试从以下路径加载 `config.json` :

- 工作目录（Working Directory）
- [环境变量](../config/features/env.md#资源文件路径)中 `Xray.location.asset` 所指定的路径
  :::

### xray mldsa65

生成用于 REALITY 的 MLDSA-65 后量子签名密钥对。

使用方法:

```
xray mldsa65 [-i "seed (base64.StdEncoding)"]
```

### xray mlkem768

生成用于 VLESS Encryption 的 ML-KEM-768 后量子密钥交换用密钥对。

使用方法:

```
xray mlkem768 [-i "seed (base64.StdEncoding)"]
```

### xray vlessenc

生成可以直接用于 VLESS Encryption 的 encryption/decryption 选项内容。生成配置中 X25519 以及 ML-KEM-768 两种认证方式选一种使用即可，但是服务端及客户端必须采用同一种认证方式。临时密钥交换仍后量子安全，不受认证方式影响。

使用方法:

```
xray vlessenc
```
