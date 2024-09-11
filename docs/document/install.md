# 下载安装

## 平台支持

Xray 在以下平台中可用：

- Windows 7 及之后版本（x86 / amd64 / arm32 / arm64）；
  - Windows 7 中使用 1.8.4、1.8.6 的常规版本以及 1.8.18 以后的 ```win7``` 版本需要系统安装有 **KB4474419** 更新方可使用；推荐同时安装  KB4490628 以便联网后接受后续的操作系统安全更新。
- macOS 10.10 Yosemite 及之后版本（amd64 / arm64）；
- Linux 2.6.23 及之后版本（x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64）；
  - 包括但不限于 Debian 7 / 8、Ubuntu 12.04 / 14.04 及后续版本、CentOS 7 / 8、Arch Linux 等；
- FreeBSD (x86 / amd64)；
- OpenBSD (x86 / amd64)；

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

  - [XTLS/Xray-install](https://github.com/XTLS/Xray-install) （**官方脚本**）
  - [tempest](https://github.com/team-cloudchaser/tempest) （支持 [`systemd`](https://systemd.io) 以及 [OpenRC](https://github.com/OpenRC/openrc); 仅限 Linux 下使用）

* One Click

  - [Xray-REALITY](https://github.com/zxcvos/Xray-script), [xray-reality](https://github.com/sajjaddg/xray-reality), [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)
  - [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey), [XTool](https://github.com/LordPenguin666/XTool)
  - [v2ray-agent](https://github.com/mack-a/v2ray-agent), [Xray_onekey](https://github.com/wulabing/Xray_onekey), [ProxySU](https://github.com/proxysu/ProxySU)

* Magisk
  - [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)
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
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall), [PassWall 2](https://github.com/xiaorouji/openwrt-passwall2)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
  - [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))
- Windows
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Furious](https://github.com/LorenEteval/Furious)
  - [Invisible Man - Xray](https://github.com/InvisibleManVPN/InvisibleMan-XRayClient)
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [X-flutter](https://github.com/XTLS/X-flutter)
  - [SaeedDev94/Xray](https://github.com/SaeedDev94/Xray)
- iOS & macOS arm64
  - [FoXray](https://apps.apple.com/app/foxray/id6448898396)
  - [Streisand](https://apps.apple.com/app/streisand/id6450534064)
- macOS arm64 & x64
  - [V2rayU](https://github.com/yanue/V2rayU)
  - [V2RayXS](https://github.com/tzmax/V2RayXS)
  - [Furious](https://github.com/LorenEteval/Furious)
  - [FoXray](https://apps.apple.com/app/foxray/id6448898396)
- Linux
  - [v2rayA](https://github.com/v2rayA/v2rayA)
  - [Furious](https://github.com/LorenEteval/Furious)

# UUID 生成器

第三方的 UUID 生成器 [uuidgenerator.net](https://www.uuidgenerator.net)
