# 环境变量

Xray 提供以下环境变量以供修改 Xray 的一些底层配置。

## XTLS 信息显示

### VLESS

- 名称：`xray.vless.xtls.show` 或 `XRAY_VLESS_XTLS_SHOW`。
- 默认值：`""`。

使用 VLESS 协议时,设置此环境变量为 true 时, 会在终端或日志中输出 XTLS 的相关信息.

::: tip
可打开此环境变量并根据是否有输出 XTLS 相关信息, 来确定 XTLS 是否成功被应用.
:::

### TROJAN

- 名称：`xray.trojan.xtls.show` 或 `XRAY_TROJAN_XTLS_SHOW`。
- 默认值：`""`。

使用 trojan 协议时, 设置此环境变量为 true 时, 会在终端或日志中输出 XTLS 的相关信息.

::: tip
可打开此环境变量并根据是否有输出 XTLS 相关信息, 来确定 XTLS 是否成功被应用.
:::

## 资源文件路径

- 名称：`xray.location.asset` 或 `XRAY_LOCATION_ASSET`。
- 默认值：和 Xray 文件同路径。

这个环境变量指定了一个文件夹位置，这个文件夹应当包含 geoip.dat 和 geosite.dat 文件。

## 配置文件位置

- 名称：`xray.location.config` 或 `XRAY_LOCATION_CONFIG`。
- 默认值：和 Xray 文件同路径。

这个环境变量指定了一个文件夹位置，这个文件夹应当包含 config.json 文件。

## 多配置目录

- 名称：`xray.location.confdir` 或 `XRAY_LOCATION_CONFDIR`。
- 默认值：`""`。

这个目录内的 `.json` 文件会按文件名顺序读取，作为多配置选项。
