# 命令参数

::: tip
Xray 使用 Go 风格的命令及参数
:::

## 获取基本命令

您可以运行 `xray help` 来获得所有 xray 最基础的用法, 以及可用的命令及说明。

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

指定一个或多个配置文件，并运行。

使用方法:

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

- `-config=` / `-c=` 用于指定使用的配置文件的位置。
- `-confdir=` 用于指定一个含多个配置文件的文件夹，该目录下的所有配置文件会[自动合并](/config/features/multiple.md)。
- `-format=` 用于指定使用的配置文件的格式。
- `-test` 用于测试配置文件的合法性。
- `-dump` 用于显示多文件配置文件合并之后的效果。

::: tip
配置文件除了默认的 JSON 格式外，也可以使用 TOML 和 YAML。在不指定格式的前提下会通过文件扩展名识别。
:::

:::: tip
`-config=` / `-c=` 不仅支持本地文件路径，也支持标准输入和远程地址。

::: details 展开查看 `-config` 支持的形式与示例
`-config=` 可重复使用，以指定多个配置源。例如：

```bash
xray run -config base.json -config routing.json -config outbounds.yaml
```

Xray 会按参数顺序读取这些配置文件，并[自动合并](/config/features/multiple.md)为最终配置。

除了常见的本地文件绝对路径、相对路径外，还支持以下形式：

- `stdin:`：从标准输入读取配置内容。适合配合管道、重定向或由上层程序动态生成配置时使用。输入完成后，调用者必须关闭标准输入流，否则 Xray 会继续等待输入结束。
- 以 `http://` 或 `https://` 开头的 URL：从远程地址下载配置内容。协议名前缀必须使用小写。**此方式存在安全风险，除非你明确知道自己在做什么，否则不要轻易使用。**
- `http+unix://`：通过 Unix Domain Socket 发起 HTTP 请求并读取配置，格式形如 `http+unix:///path/to/socket.sock/api/endpoint`。适合配置由本机某个仅监听 Unix Socket 的服务动态提供时使用。

示例：

```bash
# 从本地文件读取
xray run -config ./config.json

# 从标准输入读取
cat config.json | xray run -config stdin:

# 从远程地址读取
xray run -config https://example.com/xray/config.json

# 通过 Unix Domain Socket 对应的 HTTP 接口读取
xray run -config http+unix:///run/xray-config.sock/config.json
```

:::
::::

::: tip
当 `-config` 没有指定时，Xray 将先后尝试从以下路径加载 `config.json` :

- 工作目录（Working Directory）
- [环境变量](../config/env.md#资源文件路径)中 `Xray.location.asset` 所指定的路径
  :::

```bash
xray run -dump
```

用以输出多文件配置融合之后的结果。

### xray version

输出 Xray 版本、 Golang 版本等信息。

使用方法:

```bash
xray version
```

### xray api

调用 Xray 的 gRPC API，需要在配置文件中开启。

使用方法:

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

把配置文件转换成 protobuf 或者把 typedMessage 转换成 JSON

使用方法：

```bash
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

```bash
xray tls <command> [arguments]
```

```bash
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

生成 UUID。

使用方法:

```bash
xray uuid [-i "example"]
```

### xray x25519

生成 x25519 密钥对。

使用方法:

```bash
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

生成 wireguard curve25519 密钥对。

使用方法:

```bash
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
当 `-config` 没有指定时，Xray 将先后尝试从以下路径加载 `config.json` :

- 工作目录（Working Directory）
- [环境变量](../config/env.md#资源文件路径)中 `Xray.location.asset` 所指定的路径
  :::

### xray mldsa65

生成用于 REALITY 的 MLDSA-65 后量子签名密钥对。

使用方法:

```bash
xray mldsa65 [-i "seed (base64.StdEncoding)"]
```

### xray mlkem768

生成用于 VLESS Encryption 的 ML-KEM-768 后量子密钥交换用密钥对。

使用方法:

```bash
xray mlkem768 [-i "seed (base64.StdEncoding)"]
```

### xray vlessenc

生成可以直接用于 VLESS Encryption 的 encryption/decryption 选项内容。生成配置中 X25519 以及 ML-KEM-768 两种认证方式选一种使用即可，但是服务端及客户端必须采用同一种认证方式。临时密钥交换仍后量子安全，不受认证方式影响。

使用方法:

```bash
xray vlessenc
```
