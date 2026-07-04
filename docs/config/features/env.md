# 环境变量

Xray 提供以下环境变量以供修改 Xray 的一些底层配置。

## 资源文件路径

- 名称：`xray.location.asset` 或 `XRAY_LOCATION_ASSET`。
- 默认值：特定 [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) 目录或 Xray 文件同路径。

这个环境变量指定了一个文件夹位置，这个文件夹应当包含 geoip.dat 和 geosite.dat 文件。
若无指定变量值，程序将会按以下顺序寻找资源文件：

```text
./
/usr/local/share/xray
/usr/share/xray
```

## 配置文件位置

- 名称：`xray.location.config` 或 `XRAY_LOCATION_CONFIG`。
- 默认值：和 Xray 文件同路径。

这个环境变量指定了一个文件夹位置，这个文件夹应当包含 config.json 文件。

## 多配置目录

- 名称：`xray.location.confdir` 或 `XRAY_LOCATION_CONFDIR`。
- 默认值：`""`。

这个目录内的 `.json` 文件会按文件名顺序读取，作为多配置选项。

此项优先级低于启动参数 `confdir`。

## 严格 JSON 解析器

- 名称：`xray.json.strict` 或 `XRAY_JSON_STRICT`。
- 默认值：`false`。

默认情况下，Xray 在启动时会使用自定义的 JSON 解析器（该解析器会从配置中剔除注释及其他非标准字符）。如果你确认自己的配置文件严格遵循 JSON 标准（RFC8259），可以启用此选项以使用标准 JSON 解析器，在配置文件极大时（几十 MB 以上）可以提升其解析速度。

## 配置文件中的 `env`

Xray 配置文件根部可以写入 `env` 对象，用来设置部分运行时环境配置：

```jsonc
{
  "env": {
    "xray.location.asset": "/usr/local/share/xray",
    "xray.location.cert": "/usr/local/share/xray",
    "xray.ray.buffer.size": "0"
  }
}
```

`env` 中的值均为字符串。Xray 在读取并解析配置文件之后应用这些值，因此它适合配置运行时使用的资源路径和特性开关。

配置文件根 `env` 支持以下字段：

| 字段 | 说明 |
| --- | --- |
| `xray.location.asset` | 资源文件目录，通常用于 `geoip.dat`、`geosite.dat` 等文件。 |
| `xray.location.cert` | 证书文件目录。 |
| `xray.buf.readv` | 控制读取缓冲相关行为。 |
| `xray.buf.splice` | 控制 Freedom 出站 splice 相关行为。 |
| `xray.vmess.padding` | 控制 VMess 出站 padding。 |
| `xray.cone.disabled` | 设置为 `"true"` 时禁用 FullCone 行为。 |
| `xray.ray.buffer.size` | 默认连接缓冲大小，单位为 MB；`"0"` 表示不限制。 |
| `xray.browser.dialer` | Browser Dialer 地址，例如 `"127.0.0.1:8080"`。 |
| `xray.xudp.show` | 控制 XUDP 日志显示。 |
| `xray.xudp.basekey` | XUDP base key，使用 base64url 编码的 32 字节 key。 |
| `xray.tun.fd` | 外部程序传入的 TUN 文件描述符，主要用于移动端或嵌入式场景。 |

### 优先级和限制

- 进程环境变量会先读取；配置文件根 `env` 会在配置解析完成后应用，并覆盖同名的可运行时更新字段。
- 多配置文件合并时，后加载配置中的 `env` 字段会覆盖先前配置中的同名字段。
- 未知字段会被忽略。
- 空字符串不会取消已经存在的环境变量值。
- `xray.json.strict`、`xray.location.config`、`xray.location.confdir` 只能通过进程环境变量提供，不能写入配置文件根 `env`。
