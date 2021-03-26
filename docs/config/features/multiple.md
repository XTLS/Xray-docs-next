# 多文件配置

Xray 程序支持使用多个配置文件。

多配置文件的主要作用在于分散不同作用模块配置，便于管理和维护。

该功能主要考虑是为了丰富 Xray 的生态链，比如对于 GUI 的客户端，一般只实现节点选择等固定的功能，对于太复杂的配置难以图形化实现；只需留一个 `confdir` 的自定义配置目录供配置复杂的功能；对于服务器的部署脚本，只需往 `confdir` 添加文件即可实现配置多种协议。

## 多文件启动

::: tip
启动信息中会提示依次读入的每个配置文件，留意启动信息是否符合你预设的顺序。
:::

```shell
$ xray run -confdir /etc/xray/confs
```

也可使用 `Xray.location.confdir` 或 `Xray_LOCATION_CONFDIR` 指定 `confdir`。

参数 `-confdir` 的作用优先于环境变量，如果参数指定了有效的目录则不再读取环境变量中的路径。

## 规则说明

### 普通对象（`{}`）

**在 json 的顶级对象当中，后者覆盖或补充前者。**

比如：

- base.json

```json
{
  "log": {},
  "api": {},
  "dns": {},
  "stats": {},
  "policy": {},
  "transport": {},
  "routing": {},
  "inbounds": []
}
```

- outbounds.json

```json
{
  "outbounds": []
}
```

以多配置启动 Xray：

```bash
$ xray run -confdir /etc/xray/confs
```

这两个配置文件的就等效于合成一起的整配置。当需要修改出口节点，只需要修改 `outbounds.json` 内容。

如果需要改编日志 log 的级别，也不需要改 `base.json`，只需后续增加一个配置：

- debuglog.json

```json
{
  "log": {
    "loglevel": "debug"
  }
}
```

启动顺序放置在 base 后，即可输出 debug 级别的日志

### 数组（`[]`）

在 json 配置中的`inbounds`和`outbounds`是数组结构，他们有特殊的规则：

- 当配置中的数组元素有 2 或以上，覆盖前者的 inbounds/oubounds；
- 当配置中的数组元素只有 1 个时，查找原有`tag`相同的元素进行覆盖；若无法找到：
  - 对于 inbounds，添加至最后（inbounds 内元素顺序无关）
  - 对于 outbounds，添加至最前（outbounds 默认首选出口）；但如果文件名含有 tail（大小写均可），添加至最后。

借助多配置，可以很方便为原有的配置添加不同协议的 inbound，而不必修改原有配置。

以下例子不是有效配置，只为展示上述规则。

- 000.json

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 1234
    }
  ]
}
```

- 001.json

```json
{
  "inbounds": [
    {
      "protocol": "http",
      "tag": "http"
    }
  ]
}
```

- 002.json

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 4321
    }
  ]
}
```

三个配置将会合成为：

```json
{
  "inbounds": [
    {
      "protocol": "socks",
      "tag": "socks",
      "port": 4321 // < 002顺序在000后，因此覆盖tag为socks的inbound端口为4321
    },
    {
      "protocol": "http",
      "tag": "http"
    }
  ]
}
```

## 推荐的多文件列表

执行：

```bash
for BASE in 00_log 01_api 02_dns 03_routing 04_policy 05_inbounds 06_outbounds 07_transport 08_stats 09_reverse; do echo '{}' > "/etc/Xray/$BASE.json"; done
```

或

```bash
for BASE in 00_log 01_api 02_dns 03_routing 04_policy 05_inbounds 06_outbounds 07_transport 08_stats 09_reverse; do echo '{}' > "/usr/local/etc/Xray/$BASE.json"; done
```

```bash
.
├── 00_log.json
├── 01_api.json
├── 02_dns.json
├── 03_routing.json
├── 04_policy.json
├── 05_inbounds.json
├── 06_outbounds.json
├── 07_transport.json
├── 08_stats.json
└── 09_reverse.json

0 directories, 10 files
```
