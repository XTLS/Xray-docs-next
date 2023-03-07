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
