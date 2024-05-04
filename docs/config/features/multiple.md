# 多文件配置

Xray 程序支持使用多个配置文件。

多配置文件的主要作用在于分散不同作用模块配置，便于管理和维护。

该功能主要考虑是为了丰富 Xray 的生态链，比如对于 GUI 的客户端，一般只实现节点选择等固定的功能，对于太复杂的配置难以图形化实现；只需留一个 `confdir` 的自定义配置目录供配置复杂的功能；对于服务器的部署脚本，只需往 `confdir` 添加文件即可实现配置多种协议。

## 多文件启动

::: tip
启动信息中会提示依次读入的每个配置文件，留意启动信息是否符合你预设的顺序。可以在每个文件名前面增加前缀数字的方式控制顺序。如 `01_文件名`, `02_文件名`，数字越大排序越靠后。
:::

```shell
$ xray run -confdir /etc/xray/confs
```

也可使用 `Xray.location.confdir` 或 `Xray_LOCATION_CONFDIR` 指定 `confdir`。

参数 `-confdir` 的作用优先于环境变量，如果参数指定了有效的目录则不再读取环境变量中的路径。

## 规则说明

### 普通对象（`{}`）

顶级对象后者覆盖或补充前者

### 数组（`[]`）

在 json 配置中的 `inbounds` 和 `outbounds` 是数组结构，他们有特殊的规则：

- 查找原有 `tag` 相同的元素进行覆盖；若无法找到：
  - 对于 inbounds，添加至最后（inbounds 内元素顺序无关）
  - 对于 outbounds，添加至最前（outbounds 默认首选出口）；但如果文件名含有 tail（大小写均可），添加至最后。

## 配置例子

假设 `confs` 文件夹下有以下三个配置文件。

- 01.json

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "tag": "socks",
      "protocol": "socks",
      "listen": "0.0.0.0",
      "port": 8888
    }
  ],
  "outbounds": [
    {
      "tag": "direct",
      "protocol": "freedom"
    }
  ]
}
```

- 02.json

```json
{
  "log": {
    "loglevel": "debug"
  },
  "inbounds": [
    {
      "tag": "socks",
      "protocol": "socks",
      "listen": "127.0.0.1",
      "port": 1080
    }
  ],
  "outbounds": [
    {
      "tag": "block",
      "protocol": "blackhole"
    }
  ]
}
```

- 03_tail.json

```json
{
  "outbounds": [
    {
      "tag": "direct2",
      "protocol": "freedom"
    }
  ]
}
```

三个配置将会合并为：

```json
{
  "log": {
    "loglevel": "debug"  // 顶级对象覆盖前者
  },
  "inbounds": [
    {
      "tag": "socks", // tag 相同时覆盖前者
      "protocol": "socks",
      "listen": "127.0.0.1",
      "port": 1080 
    }
  ],
  "outbounds": [
    {
      "tag": "block",  // outbounds 添加至最前
      "protocol": "blackhole"
    },
    {
      "tag": "direct",
      "protocol": "freedom"
    },
    {
      "tag": "direct2", // 03_tail.json 文件名中包含 tail 关键字，添加至最后
      "protocol": "freedom"
    }
  ]
}
```

::: tip
可以使用 `xray run -confdir=./confs -dump` 命令查看合并后的配置。但是因为 core 内部使用 protobuf 数据格式，所以 `-dump` 选项输出的配置格式会有所不同。
:::
