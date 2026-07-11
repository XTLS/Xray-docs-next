# 环境变量

环境变量用于调整 Xray 的一些底层配置。

环境变量既可以由配置文件中的 `env` 配置块在配置读取后写入当前 Xray 进程，也可以在启动 Xray 前通过 Shell 或服务管理器提供。

## EnvObject

`EnvObject` 对应配置文件的 `env` 项，其内容为环境变量名称与值的映射。

```json
{
  "env": {
    "XRAY_LOCATION_ASSET": "/usr/local/share/xray",
    "XRAY_BUF_READV": "true",
    "XRAY_RAY_BUFFER_SIZE": "2",
    "GODEBUG": "gctrace=1,schedtrace=1000,scheddetail=1"
    // ...
  }
}
```

> `环境变量名称`: string

环境变量的名称和值都必须是字符串。Xray 读取并合并所有配置文件后，会在构建各模块前将 `env` 中的项目写入当前进程的环境变量。

::: tip
使用[多文件配置](./features/multiple.md)时，各文件中的 `env` 配置块会按键合并，后加载的同名键覆盖先前的值。

`env` 配置块会按所写名称设置变量；如果进程环境中已经存在完全相同的名称，其值会被覆盖。
:::

::: warning
`env` 配置块只能在配置文件完成定位、读取与合并后生效。一些环境变量必须在启动 Xray 前通过 Shell 或服务管理器设置，例如：

- `XRAY_JSON_STRICT`
- `XRAY_LOCATION_CONFIG`
- `XRAY_LOCATION_CONFDIR`
- `GOGC`
- `GOMEMLIMIT`
- `GOMAXPROCS`
- `GOTRACEBACK`

:::

## 在 Xray 启动前设置环境变量

以下示例演示如何通过 Shell 或服务管理器同时设置资源文件路径和严格 JSON 解析器：

::: code-group

```bash [Shell]
# 在当前 Shell 及由它启动的子进程中设置
export XRAY_LOCATION_ASSET=/usr/local/share/xray
export XRAY_JSON_STRICT=true

# 也可以仅为单次 Xray 启动设置，多个变量之间使用空格分隔
XRAY_LOCATION_ASSET=/usr/local/share/xray XRAY_JSON_STRICT=true xray run
```

```powershell [PowerShell]
# 在当前 PowerShell 及由它启动的子进程中设置
$env:XRAY_LOCATION_ASSET = "C:\Xray"
$env:XRAY_JSON_STRICT = "true"
```

```batch [CMD]
:: 在当前 CMD 及由它启动的子进程中设置
set "XRAY_LOCATION_ASSET=C:\Xray"
set "XRAY_JSON_STRICT=true"
```

```ini [systemd]
# 在 Xray 服务的 [Service] 段中设置
[Service]
Environment="XRAY_LOCATION_ASSET=/usr/local/share/xray"
Environment="XRAY_JSON_STRICT=true"
```

:::

## Xray 内置变量

### 配置文件位置

- 名称：`XRAY_LOCATION_CONFIG`。
- 默认值：Xray 可执行文件所在目录。

这个变量指定包含 `config.json` 文件的目录。

写入 `env` 配置块无效，因为 Xray 在读取该配置块之前就已经完成了配置文件定位。

### 多配置目录

- 名称：`XRAY_LOCATION_CONFDIR`。
- 默认值：`""`。

这个目录内的 `.json` 文件会按文件名顺序读取，作为多文件配置。

写入 `env` 配置块无效，因为 Xray 在读取该配置块之前就已经完成了配置目录定位。

此项优先级低于启动参数 `confdir`。

### 严格 JSON 解析器

- 名称：`XRAY_JSON_STRICT`。
- 默认值：`false`。

默认情况下，Xray 在启动时会使用自定义 JSON 解析器，该解析器会从配置中剔除注释及其他非标准字符。如果你确认自己的配置文件严格遵循 JSON 标准（RFC 8259），可以启用此选项以使用标准 JSON 解析器，在配置文件极大时（几十 MB 以上）可以提升其解析速度。

写入 `env` 配置块无效，因为 Xray 必须先选择 JSON 解析器才能读取该配置块。

### 资源文件路径

- 名称：`XRAY_LOCATION_ASSET`。
- 默认值：特定 [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) 目录或 Xray 可执行文件所在目录。

这个变量指定包含 `geoip.dat` 和 `geosite.dat` 文件的目录。
若未指定，程序将按以下顺序寻找资源文件：

```text
./
/usr/local/share/xray
/usr/share/xray
```

### 其它可用变量

- `XRAY_LOCATION_CERT`
- `XRAY_BUF_READV`
- `XRAY_BUF_SPLICE`
- `XRAY_VMESS_PADDING`
- `XRAY_CONE_DISABLED`
- `XRAY_RAY_BUFFER_SIZE`
- `XRAY_BROWSER_DIALER`
- `XRAY_XUDP_SHOW`
- `XRAY_XUDP_BASEKEY`
- `XRAY_TUN_FD`

这些选项用于特殊需求。你可以阅读源代码以了解其具体用途。
