# Командные аргументы

::: tip
Xray использует команды и аргументы в стиле Go.
:::

## Базовые команды

Вы можете запустить `xray help`, чтобы получить список всех базовых команд Xray, а также их описание и примеры использования.

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

Запуск Xray с указанием одного или нескольких файлов конфигурации.

Использование:

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

`-config=` / `-c=`: Указывает путь к файлу конфигурации, поддерживается использование нескольких файлов.
`-confdir=`: Указывает путь к папке, содержащей несколько файлов конфигурации.
`-format=`: Задает формат файлов конфигурации.
`-test`: Проверяет корректность файлов конфигурации.
`-dump`: Выводит объединенный результат слияния нескольких файлов конфигурации.

::: tip
Помимо формата JSON по умолчанию, файлы конфигурации также могут быть в формате TOML или YAML. Если формат не указан явно, он определяется по расширению файла.
:::

```
 xray run -dump
```

Выводит результат слияния нескольких файлов конфигурации.

### xray version

Выводит информацию о версии Xray, версии Golang и т. д.

Использование:

```
 xray version
```

### xray api

Вызов gRPC API Xray, который должен быть включен в файле конфигурации.

Использование:

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

Инструменты для работы с TLS.

Использование:

```
xray tls <command> [arguments]
```

```
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

Генерация UUID.

Использование:

```
xray uuid [-i "example"]
```

### xray x25519

Генерация пары ключей x25519.

Использование:

```
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

Генерация пары ключей curve25519 для WireGuard.

Использование:

```
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
Если `-config` не указан, Xray попытается загрузить `config.json` из следующих мест:

- Рабочий каталог (Working Directory);
- Путь, указанный в переменной окружения `Xray.location.asset` (см. [Переменные окружения](../config/features/env.md#ресурсные-файлы)).
  :::


