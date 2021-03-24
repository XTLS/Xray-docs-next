# 下载安装

## 平台支持


Xray 在以下平台中可用：

- Windows 7 及之后版本（x86 / amd64 / arm32）；
- macOS 10.10 Yosemite 及之后版本（amd64）；
- Linux 2.6.23 及之后版本（x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64）；
  - 包括但不限于 Debian 7 / 8、Ubuntu 12.04 / 14.04 及后续版本、CentOS 7 / 8、Arch Linux 等；
- FreeBSD (x86 / amd64)；
- OpenBSD (x86 / amd64)；
- Dragonfly BSD (amd64)；

## 下载 Xray


预编译的二进制 ZIP 格式压缩包可在 [Github Releases](https://github.com/xtls/Xray-core/releases) 中找到。

下载对应平台的压缩包，解压后即可使用。

## 验证安装包


Xray 提供两种验证方式：

- ZIP 压缩包的 SHA1 / SHA256 摘要
- 可复现构建：请参照 [编译 Xray](../development/build.html)

## Windows 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 Windows 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray.exe`，然后[通过命令行带参数运行](./command) 即可
- 通过 [Scoop](https://scoop.sh) 包管理器安装：Xray 已经被添加到 [Mochi](https://github.com/Qv2ray/mochi)。
- 通过 [Chocolatey](https://chocolatey.org) 包管理器安装：[Xray](https://chocolatey.org/packages/xray/1.3.1)，感谢 [Markson](https://chocolatey.org/profiles/markson_ho)

## macOS 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 macOS 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray`，然后[通过命令行带参数运行](./command) 即可
- 通过 [Homebrew](https://brew.sh) 包管理器安装：<Badge text="WIP" type="warning"/>

## Linux 安装方式

### 安装脚本

- Linux Script
  - [Xray-install](https://github.com/XTLS/Xray-install)
  - [Xray-script](https://github.com/kirin10000/Xray-script)

- One Click
  - [ProxySU](https://github.com/proxysu/ProxySU)
  - [Xray-agent](https://github.com/mack-a/Xray-agent)

- Magisk
  - [Xray4Magisk](https://github.com/CerteKim/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)


### Linux 发行版包管理器


Linux 发行版 Xray 包（可通过发行版相应的包管理器安装）：

- Debian <Badge text="WIP" type="warning"/>
- Arch Linux <Badge text="WIP" type="warning"/>

### Linuxbrew 包管理器 <Badge text="WIP" type="warning"/>

## Docker 安装方式

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)
- Xray-docker

### Docker image 的文件结构


- `/etc/xray/config.json`：配置文件
- `/usr/bin/xray`：Xray 主程序
- `/usr/local/share/xray/geoip.dat`：IP 数据文件
- `/usr/local/share/xray/geosite.dat`：域名数据文件

## 更多更多...

您可以点击 [传送至众多大佬集结区的任意门](../links) 获取更多资源

## FAQ <Badge text="WIP" type="warning"/>
