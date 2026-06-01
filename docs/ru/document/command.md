# Командные аргументы

::: tip
Xray использует команды и аргументы в стиле Go.
:::

## Базовые команды

Вы можете запустить `xray help`, чтобы получить список всех базовых команд Xray, а также их описание и примеры использования.

```bash
Xray is a platform for building proxies.

Usage:

        xray <command> [arguments]

The commands are:

        run          Запустить Xray с конфигурацией
        version      Показать текущую версию Xray
        api          Вызвать API в процессе Xray
        convert      Конвертировать конфигурации
        tls          Инструменты TLS
        uuid         Сгенерировать UUIDv4 или UUIDv5 (VLESS)
        x25519       Сгенерировать ключевую пару для обмена ключами X25519 (REALITY, VLESS Encryption)
        wg           Сгенерировать ключевую пару для обмена ключами X25519 (WireGuard)
        mldsa65      Сгенерировать ключевую пару для постквантовой подписи ML-DSA-65 (REALITY)
        mlkem768     Сгенерировать ключевую пару для постквантового обмена ключами ML-KEM-768 (VLESS Encryption)
        vlessenc     Сгенерировать пару json для дешифрования/шифрования (VLESS Encryption)

Use "xray help <command>" for more information about a command.

```

### xray run

Запуск Xray с указанием одного или нескольких файлов конфигурации.

Использование:

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

- `-config=` / `-c=`: Указывает расположение используемого файла конфигурации.
- `-confdir=`: Указывает путь к папке, содержащей несколько файлов конфигурации. Все файлы конфигурации в этом каталоге будут [объединены автоматически](/ru/config/features/multiple.md).
- `-format=`: Задает формат файлов конфигурации.
- `-test`: Проверяет корректность файлов конфигурации.
- `-dump`: Выводит объединенный результат слияния нескольких файлов конфигурации.

::: tip
Помимо формата JSON по умолчанию, файлы конфигурации также могут быть в формате TOML или YAML. Если формат не указан явно, он определяется по расширению файла.
:::

:::: tip
`-config=` / `-c=` поддерживает не только локальные пути к файлам, но и стандартный ввод, а также удаленные адреса.

::: details Разверните, чтобы посмотреть поддерживаемые формы `-config` и примеры
`-config=` можно указывать несколько раз, чтобы задать несколько источников конфигурации. Например:

```bash
xray run -config base.json -config routing.json -config outbounds.yaml
```

Xray прочитает эти файлы конфигурации в порядке аргументов и [автоматически объединит их](/ru/config/features/multiple.md) в итоговую конфигурацию.

Помимо обычных абсолютных и относительных путей к локальным файлам, поддерживаются и следующие формы:

- `stdin:`: Чтение содержимого конфигурации из стандартного ввода. Это удобно при использовании конвейеров, перенаправления или когда конфигурация динамически генерируется другой программой. После завершения ввода вызывающая сторона должна закрыть поток стандартного ввода, иначе Xray продолжит ждать окончания ввода.
- URL, начинающиеся с `http://` или `https://`: Загрузка содержимого конфигурации с удаленного адреса. Префикс протокола должен быть записан строчными буквами. **Этот способ связан с рисками безопасности. Не используйте его, если вы не вполне понимаете, что делаете.**
- `http+unix://`: Чтение конфигурации через HTTP-запрос, отправленный через Unix Domain Socket, в формате вроде `http+unix:///path/to/socket.sock/api/endpoint`. Это удобно, если конфигурация динамически выдается локальным сервисом, который слушает только Unix-сокет.

Примеры:

```bash
# Чтение из локального файла
xray run -config ./config.json

# Чтение из стандартного ввода
cat config.json | xray run -config stdin:

# Чтение с удаленного адреса
xray run -config https://example.com/xray/config.json

# Чтение через HTTP-эндпоинт на Unix Domain Socket
xray run -config http+unix:///run/xray-config.sock/config.json
```

:::
::::

::: tip
Когда `-config` не указан, Xray последовательно попытается загрузить `config.json` из следующих путей:

- Рабочий каталог (Working Directory)
- Путь, указанный в переменной окружения `Xray.location.asset` в [переменных окружения](../config/features/env.md#Путь-к-файлам-ресурсов)
  :::

```bash
xray run -dump
```

Выводит результат слияния нескольких файлов конфигурации.

### xray version

Выводит информацию о версии Xray, версии Golang и т. д.

Использование:

```bash
xray version
```

### xray api

Вызов gRPC API Xray, который должен быть включен в файле конфигурации.

Использование:

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

Convert config to protobuf, or convert typedMessage to JSON

usage:

```bash
xray convert <command> [arguments]

The commands are:

        pb           Convert multiple json configs to protobuf
        json         Convert typedMessage to json
```

Sub-command `pb`

```bash
# Usage: xray convert pb [-outpbfile out.pb] [-debug] [-type] [json file] [json file] ...

# mix three config files to mix.pb
xray convert pb -outpbfile mix.pb c1.json c2.json c3.json

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

```bash
xray tls <command> [arguments]
```

```bash
        cert          Generate TLS certificates
        ping          Ping the domain with TLS handshake
        certChainHash Calculate TLS certificates hash.
```

### xray uuid

Генерация UUID.

Использование:

```bash
xray uuid [-i "example"]
```

### xray x25519

Генерация пары ключей x25519.

Использование:

```bash
xray x25519 [-i "(base64.RawURLEncoding)" --std-encoding ]
```

### xray wg

Генерация пары ключей curve25519 для WireGuard.

Использование:

```bash
xray wg [-i "(base64.StdEncoding)"]
```

::: tip
Если `-config` не указан, Xray попытается загрузить `config.json` из следующих мест:

- Рабочий каталог (Working Directory);
- Путь, указанный в переменной окружения `Xray.location.asset` (см. [Переменные окружения](../config/features/env.md#ресурсные-файлы)).
  :::

### xray mldsa65

Генерирует пару ключей для постквантовой подписи MLDSA-65, используемой в REALITY.

Использование:

```bash
xray mldsa65 [-i "seed (base64.StdEncoding)"]
```

### xray mlkem768

Генерирует пару ключей для постквантового обмена ключами ML-KEM-768, используемую в VLESS Encryption.

Использование:

```bash
xray mlkem768 [-i "seed (base64.StdEncoding)"]
```

### xray vlessenc

Генерирует содержимое опций `encryption`/`decryption`, которые могут быть непосредственно использованы в VLESS Encryption. В сгенерированной конфигурации достаточно использовать один из двух методов аутентификации: X25519 или ML-KEM-768, но сервер и клиент должны использовать один и тот же метод аутентификации. Обмен временными ключами остается постквантово безопасным, независимо от метода аутентификации.

Использование:

```bash
xray vlessenc
```
