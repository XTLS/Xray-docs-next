# 环境变量

Xray 提供以下环境变量以供修改 Xray 的一些底层配置。

## 资源文件路径

- 名称：`xray.location.asset` 或 `XRAY_LOCATION_ASSET`。
- 默认值：特定 [FHS](https://en.wikipedia.org/wiki/Filesystem_Hierarchy_Standard) 目录或 Xray 文件同路径。

这个环境变量指定了一个文件夹位置，这个文件夹应当包含 geoip.dat 和 geosite.dat 文件。
若无指定变量值，程序将会按以下顺序寻找资源文件：

```
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

## 其它可用的配置

- xray.location.plugin
- xray.location.tool
- xray.location.cert

- xray.buf.readv
- xray.buf.splice
- xray.vmess.padding
- xray.cone.disabled

- xray.ray.buffer.size
- xray.browser.dialer
- xray.xudp.show
- xray.xudp.basekey

这些选项对有特殊需求的用户开放，您可以阅读源代码来发现其用途。~PR Welcome~
