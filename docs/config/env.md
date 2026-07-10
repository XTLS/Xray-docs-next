# 环境配置

Xray 可以通过配置文件根部的 `env` 对象或进程环境变量设置运行环境。

## 配置文件中的 `env`

配置文件根部可以写入 `env` 对象：

```jsonc
{
  "env": {
    "XRAY_LOCATION_ASSET": "/usr/local/share/xray",
    "XRAY_LOCATION_CERT": "/usr/local/share/xray",
    "XRAY_RAY_BUFFER_SIZE": "0"
  }
}
```

`env` 的字段名和值都会按原样写入当前进程环境变量，且所有值都必须是字符串。字段不限于 Xray 定义的环境变量；Go 或其他依赖使用的环境变量也可以写入，但只有在应用 `env` 之后才读取该变量的代码会受到影响。

### 生效时机

- Xray 会先读取并合并全部配置文件，然后应用根 `env` 对象。
- `XRAY_LOCATION_ASSET`、`XRAY_LOCATION_CERT` 以及创建 Xray 实例时读取的运行时选项可以在根 `env` 中生效。
- 定位或解析当前配置文件时就需要的变量必须在 Xray 启动前设置。根 `env` 中的 `XRAY_LOCATION_CONFIG`、`XRAY_LOCATION_CONFDIR` 和 `XRAY_JSON_STRICT` 无法影响当前这次配置加载。
- 多配置文件合并时，后加载配置中完全相同的 key 会覆盖先前的值。
- 空字符串会把环境变量设置为空，但不会删除该环境变量。
- 根 `env` 修改的是进程全局环境，不提供实例级隔离，也不会在配置构建失败或实例停止时自动恢复。

## 配置加载前环境变量

以下三个变量必须在 Xray 读取配置前设置为进程环境变量，不能通过当前配置文件的根 `env` 设置。

### 配置文件位置

- 名称：`XRAY_LOCATION_CONFIG`。
- 默认值：和 Xray 文件同路径。

这个环境变量指定包含 `config.json` 的目录。

### 多配置目录

- 名称：`XRAY_LOCATION_CONFDIR`。
- 默认值：`""`。

这个目录内的 `.json` 文件会按文件名顺序读取。启动参数 `confdir` 的优先级高于该环境变量。

### 严格 JSON 解析器

- 名称：`XRAY_JSON_STRICT`。
- 默认值：`false`。

默认情况下，Xray 使用自定义 JSON 解析器剔除注释及其他非标准字符。配置文件严格遵循 JSON 标准（RFC 8259）时，可以启用此选项使用标准 JSON 解析器；对于几十 MB 以上的大型配置，解析速度可能有所提升。

## 资源路径环境变量

以下两个变量可以通过进程环境变量或配置文件根 `env` 设置。

### 资源文件路径

- 名称：`XRAY_LOCATION_ASSET`。
- 默认值：特定 [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) 目录或 Xray 文件同路径。

这个环境变量指定资源文件目录，其中通常包含 `geoip.dat` 和 `geosite.dat`。若未指定，程序会按以下顺序寻找资源文件：

```text
./
/usr/local/share/xray
/usr/share/xray
```

### 证书文件路径

- 名称：`XRAY_LOCATION_CERT`。
- 默认值：和 Xray 文件同路径。

这个环境变量指定相对证书文件的基础目录。

## 其他运行时环境变量

以下变量也可以通过进程环境变量或配置文件根 `env` 设置：

- `XRAY_BUF_READV`
- `XRAY_BUF_SPLICE`
- `XRAY_VMESS_PADDING`
- `XRAY_CONE_DISABLED`
- `XRAY_RAY_BUFFER_SIZE`
- `XRAY_BROWSER_DIALER`
- `XRAY_XUDP_SHOW`
- `XRAY_XUDP_BASEKEY`
- `XRAY_TUN_FD`

这些选项面向有特殊需求的用户，可以阅读源代码了解其具体用途。
