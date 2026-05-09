# 下载安装

## 平台支持

官方 Release 支持以下平台

| 平台    | 最低版本                                                        | 架构                                                                |
| :------ | :-------------------------------------------------------------- | :------------------------------------------------------------------ |
| Windows | 7 及之后版本 <sup><a href="#platform-note-1">[1]</a></sup>      | x86 / amd64 / arm32 / arm64                                         |
| macOS   | 10.10 Yosemite 及之后版本                                       | amd64 / arm64                                                       |
| Linux   | 2.6.23 及之后版本 <sup><a href="#platform-note-2">[2]</a></sup> | x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64 |
| FreeBSD | -                                                               | x86 / amd64                                                         |
| OpenBSD | -                                                               | x86 / amd64                                                         |

<small id="platform-note-1">[1] Windows 7 中使用 1.8.4、1.8.6 的常规版本以及 1.8.18 以后的 `win7` 版本，需要系统安装 **KB4474419**；推荐同时安装 KB4490628 以便联网后接受后续操作系统安全更新。从 v25 开始，在 Windows 7 上运行 `win7` 版本只需安装 SP1 即可正常运行，但对联网系统仍强烈建议安装后续操作系统安全更新。</small>

<small id="platform-note-2">[2] 包括但不限于 Debian 7 / 8、Ubuntu 12.04 / 14.04 及后续版本、CentOS 7 / 8、Arch Linux 等。</small>

## 下载 Xray

预编译的二进制 ZIP 格式压缩包可在 [Github Releases](https://github.com/xtls/Xray-core/releases) 中找到。

下载对应平台的压缩包，解压后即可使用。

## 验证安装包

Xray 提供两种验证方式：

- ZIP 压缩包的 SHA1 / SHA256 摘要
- 可复现构建：请参照 [编译 Xray](../development/intro/compile.md)

## Windows 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 Windows 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray.exe`，然后[通过命令行带参数运行](./command) 即可

## macOS 安装方式

- 在 [Github Releases](https://github.com/xtls/Xray-core/releases) 下载适用于 macOS 平台的 ZIP 压缩包，解压后可得到可执行文件 `xray`
  ，然后[通过命令行带参数运行](./command.md) 即可
- 通过 [Homebrew](https://brew.sh) 包管理器安装：`brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) 感谢[@N4FA](https://github.com/N4FA)

## Linux 安装方式

### 安装脚本与项目

| 类型         | 项目                                                                  | 说明                                                                                 |
| :----------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| Linux Script | [XTLS/Xray-install](https://github.com/XTLS/Xray-install)（**官方**） | 官方维护的 Linux 安装脚本                                                            |
| Linux Script | [tempest](https://github.com/team-cloudchaser/tempest)                | 支持 [`Systemd`](https://systemd.io) 与 [`OpenRC`](https://github.com/OpenRC/openrc) |
| One Click    | [Xray-REALITY](https://github.com/zxcvos/Xray-script)                 | 一键安装方案                                                                         |
| One Click    | [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)              | 一键安装方案                                                                         |
| One Click    | [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey)  | 一键安装方案                                                                         |
| One Click    | [v2ray-agent](https://github.com/mack-a/v2ray-agent)                  | 一键安装方案                                                                         |
| One Click    | [ProxySU](https://github.com/proxysu/ProxySU)                         | 一键安装方案                                                                         |
| Magisk       | [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)         | 适用于 Magisk 环境                                                                   |
| Magisk       | [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)          | 适用于 Magisk 环境                                                                   |

### 包管理器与发行版仓库

| 方式                 | 项目                                                                            | 说明                                                                       |
| :------------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------- |
| Arch User Repository | [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers)                 | 以 [yay](https://github.com/Jguer/yay) 为例，可通过 `yay -S xray` 安装     |
| Arch Linux CN        | [Arch Linux CN 仓库](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/) | 添加仓库后，在 root 用户下使用 `pacman -S xray` 安装                       |
| Linuxbrew            | [Homebrew](https://brew.sh)                                                     | 用法与 Homebrew 一致：`brew install xray`                                  |
| Gentoo Portage       | [Gentoo-zh](https://github.com/microcai/gentoo-zh)                              | 适用于 Systemd 系统；使用 layman 或 eselect-repository 添加 Overlay 后安装 |

## Docker 安装方式

目前提供两种不同风格的 Docker 映像：

- [ghcr.io/xtls/xray-core](https://ghcr.io/xtls/xray-core)（**官方**）<br>
  无 root 权限、无 shell 环境、支持更多的架构。由官方库编译并构建支持追溯。牺牲了便利性来追求更极端的安全性
  ::: details 文件结构
  - `/usr/local/bin/xray`：Xray 主程序（拥有者是 root:root、文件权限 755）
  - `/usr/local/etc/xray/`：配置文件目录（挂载点）（拥有者是 root:root、目录权限 755、文件权限 644）
    - 00_log.json
    - 01_api.json
    - 02_dns.json
    - 03_routing.json
    - 04_policy.json
    - 05_inbounds.json
    - 06_outbounds.json
    - 07_stats.json
    - 08_fakedns.json
    - 09_metrics.json
    - 10_observatory.json
    - 11_geodata.json
    - 99_version.json
  - `/usr/local/share/xray/`：资源文件目录，存放了 Loyalsoldier 版本地理位置数据文件（权限同上）
    - geoip.dat
    - geosite.dat
  - `/var/log/xray/`：日志文件目录（挂载点）（目录拥有者是 root:root、权限 755；文件拥有者是 65532:65532、权限 600）
    - access.log
    - error.log

  :::

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)<br>
  有 root 权限、有 shell 环境、兼容所有 Alpine 支持的架构。由私人服务器 dl.lamp.sh 编译并构建。使用起来更便捷
  ::: details 文件结构
  - `/usr/bin/xray`：Xray 主程序
  - `/etc/xray/config.json`：单一配置文件（其所在目录为挂载点）
  - `/usr/share/xray/`：资源文件目录，存放了 v2fly 版本地理位置数据文件
    - geoip.dat
    - geosite.dat

  :::

## 第三方图形化客户端

| 平台                     | 项目                                                                                                                                              |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| OpenWrt                  | [PassWall](https://github.com/Openwrt-Passwall/openwrt-passwall)                                                                                  |
| OpenWrt                  | [PassWall 2](https://github.com/Openwrt-Passwall/openwrt-passwall2)                                                                               |
| OpenWrt                  | [ShadowSocksR Plus+](https://github.com/fw876/helloworld)                                                                                         |
| OpenWrt                  | [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))                                 |
| Asuswrt-Merlin           | [XRAYUI](https://github.com/DanielLavrushin/asuswrt-merlin-xrayui)                                                                                |
| Windows                  | [v2rayA](https://github.com/v2rayA/v2rayA)                                                                                                        |
| Windows                  | [v2rayN](https://github.com/2dust/v2rayN)                                                                                                         |
| Windows                  | [Furious](https://github.com/LorenEteval/Furious)                                                                                                 |
| Windows                  | [Invisible Man - Xray](https://github.com/InvisibleManVPN/InvisibleMan-XRayClient)                                                                |
| Windows                  | [AnyPortal](https://github.com/AnyPortal/AnyPortal)                                                                                               |
| Android                  | [v2rayNG](https://github.com/2dust/v2rayNG)                                                                                                       |
| Android                  | [X-flutter](https://github.com/XTLS/X-flutter)                                                                                                    |
| Android                  | [SaeedDev94/Xray](https://github.com/SaeedDev94/Xray)                                                                                             |
| Android                  | [SimpleXray](https://github.com/lhear/SimpleXray)                                                                                                 |
| Android                  | [AnyPortal](https://github.com/AnyPortal/AnyPortal)                                                                                               |
| iOS / macOS arm64 / tvOS | [Happ](https://apps.apple.com/app/happ-proxy-utility/id6504287215) ([tvOS](https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274)) |
| iOS / macOS arm64 / tvOS | [FoXray](https://apps.apple.com/app/foxray/id6448898396)                                                                                          |
| iOS / macOS arm64 / tvOS | [Streisand](https://apps.apple.com/app/streisand/id6450534064)                                                                                    |
| macOS arm64 / x64        | [Happ](https://apps.apple.com/app/happ-proxy-utility/id6504287215)                                                                                |
| macOS arm64 / x64        | [v2rayA](https://github.com/v2rayA/v2rayA)                                                                                                        |
| macOS arm64 / x64        | [v2rayN](https://github.com/2dust/v2rayN)                                                                                                         |
| macOS arm64 / x64        | [V2rayU](https://github.com/yanue/V2rayU)                                                                                                         |
| macOS arm64 / x64        | [V2RayXS](https://github.com/tzmax/V2RayXS)                                                                                                       |
| macOS arm64 / x64        | [Furious](https://github.com/LorenEteval/Furious)                                                                                                 |
| macOS arm64 / x64        | [OneXray](https://github.com/OneXray/OneXray)                                                                                                     |
| macOS arm64 / x64        | [GoXRay](https://github.com/goxray/desktop)                                                                                                       |
| macOS arm64 / x64        | [AnyPortal](https://github.com/AnyPortal/AnyPortal)                                                                                               |
| Linux                    | [v2rayA](https://github.com/v2rayA/v2rayA)                                                                                                        |
| Linux                    | [v2rayN](https://github.com/2dust/v2rayN)                                                                                                         |
| Linux                    | [Furious](https://github.com/LorenEteval/Furious)                                                                                                 |
| Linux                    | [GorzRay](https://github.com/ketetefid/GorzRay)                                                                                                   |
| Linux                    | [GoXRay](https://github.com/goxray/desktop)                                                                                                       |
| Linux                    | [AnyPortal](https://github.com/AnyPortal/AnyPortal)                                                                                               |

## UUID 生成器

第三方的 UUID 生成器 [uuidgenerator.net](https://www.uuidgenerator.net)
