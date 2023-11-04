# 下载安装

## 平台支持

Xray 在以下平台中可用：

- Windows 7 及之后版本（x86 / amd64 / arm32 / arm64）；
- macOS 10.10 Yosemite 及之后版本（amd64 / arm64）；
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
- 可复现构建：请参照 [编译 Xray](../development/intro/compile.md)

## Windows 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 Windows 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray.exe`
  ，然后[通过命令行带参数运行](./command) 即可
- 通过 [Scoop](https://scoop.sh) 包管理器安装：Xray 已经被添加到 [Mochi](https://github.com/Qv2ray/mochi)。

## macOS 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 macOS 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray`
  ，然后[通过命令行带参数运行](./command.md) 即可
- 通过 [Homebrew](https://brew.sh) 包管理器安装：`brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) 感谢[@N4FA](https://github.com/N4FA)

## Linux 安装方式

### 安装脚本

- Linux Script

  - [Xray-install](https://github.com/XTLS/Xray-install)

* One Click

  - [Xray-script](https://github.com/kirin10000/Xray-script)
  - [ProxySU](https://github.com/proxysu/ProxySU)
  - [v2ray-agent](https://github.com/reeceyng/v2ray-agent) 感谢[@mack-a](https://github.com/mack-a) [@Reece](https://github.com/reeceyng)
  - [Xray-yes](https://github.com/jiuqi9997/Xray-yes)
  - [Xray-onekey](https://github.com/wulabing/Xray_onekey)

* Magisk
  - [Xray4Magisk](https://github.com/CerteKim/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)

### Arch Linux

#### Arch User Repository

需要使用 [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers)，以 [yay](https://github.com/Jguer/yay)
为例，可通过 `yay -S xray` 安装。

#### Arch Linux CN

首先添加 [Arch Linux CN 仓库](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/)，然后在 root 用户下使用 `pacman -S xray` 安装。

### Linuxbrew

Linuxbrew 包管理器的使用方式与 Homebrew 一致：`brew install xray`

### Debian <Badge text="WIP" type="warning"/>

### Gentoo

目前有三个第三方 Overlay 提供 Portage 安装脚本:

- [CHN-beta/touchfish-os](https://github.com/gentoo-mirror/touchfish-os/tree/master/net-proxy/Xray): 个人维护，适用于 systemD 系统
- [Gentoo-zh](https://github.com/microcai/gentoo-zh): 社区维护，适用于 systemD 系统
- [JuanCldCmt/Xray-Overlay](https://github.com/JuanCldCmt/Xray-Overlay)：个人维护，适用于 openRC 系统，同时使用 xray 用户组运行以提高安全性

使用 layman 或 eselect-repository 添加 Overlay 至本地，然后即可安装。

## Docker 安装方式

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)

### Docker image 的文件结构

- `/etc/xray/config.json`：配置文件
- `/usr/bin/xray`：Xray 主程序
- `/usr/share/xray/geoip.dat`：IP 数据文件
- `/usr/share/xray/geosite.dat`：域名数据文件

# 图形化客户端

- OpenWrt
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall)
  - [Hello World](https://github.com/jerrykuku/luci-app-vssr)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
  - [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))
- Windows
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) （该项目已冻结存档）
  - [Netch (NetFilter & TUN/TAP)](https://github.com/NetchX/Netch) （该项目已冻结存档）
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [Kitsunebi](https://github.com/rurirei/Kitsunebi/tree/release_xtls)
- iOS / macOS（使用 ARM 芯片）
  - [Shadowrocket](https://apps.apple.com/app/shadowrocket/id932747118)
  - [Stash](https://apps.apple.com/app/stash/id1596063349)
- macOS（X86 芯片 / ARM 芯片）
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) （该项目已冻结存档）
  - [V2RayXS](https://github.com/tzmax/V2RayXS)

# UUID 生成器

第三方的 UUID 生成器 [uuidgenerator.net](https://www.uuidgenerator.net)
