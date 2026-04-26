# 地理数据文件

用于按计划热重载地理数据文件，也可以在重载前下载新的 `.dat` 文件。适合不方便重启 Xray、又需要定期更新地理数据文件的场景。

低内存设备慎用。

## GeodataObject

```json
{
  "cron": "0 4 * * *",
  "outbound": "proxy",
  "assets": [
    { "url": "https://example.com/geoip.dat", "file": "geoip.dat" },
    { "url": "https://example.com/geosite.dat", "file": "geosite.dat" }
  ]
}
```

> `cron`: string

标准 5 段 cron 表达式，按 Xray 运行环境的本地时区执行。例如：

- `"0 4 * * *"`：每天 04:00 执行。
- `"30 3 * * 1"`：每周一 03:30 执行。

未设置时不会启用定时任务。如果上一次任务还没有结束，下一次触发会被跳过。

> `outbound`: string

下载 geodata 文件时使用的出站代理 `tag`。不指定的话走路由模块。

> `assets`: \[ [AssetObject](#assetobject) \]

需要下载并替换的 geodata 文件列表。

如果下载后的重载失败，本次下载替换的文件会整体回滚。

### AssetObject

```json
{
  "url": "https://example.com/geoip.dat",
  "file": "geoip.dat"
}
```

> `url`: string

资源文件的下载地址，必须是 HTTPS URL。

> `file`: string

写入的资源文件名，例如 `geoip.dat`、`geosite.dat`。

该文件会按 [资源文件路径](./features/env.md#资源文件路径) 解析，并且必须是资源目录内已经存在的普通文件；不支持绝对路径或跳出资源目录的路径。
