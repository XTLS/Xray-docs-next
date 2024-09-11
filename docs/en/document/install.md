# Download and Install

## Platform Support

- Xray is available on the following platforms:
  - Windows 7 and later (x86 / amd64 / arm32 / arm64);
    - If you need to use these version (1.8.18 and later marked with ```win7```, 1.8.6, 1.8.4) in Windows 7, operating system update **KB4474419** is required. For better Internet security, it is recommended to install KB4490628 to acquire later operating system updates from Windows Update.
  - macOS 10.10 Yosemite and later (amd64 / arm64);
  - Linux 2.6.23 and later (x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64);
    - Including but not limited to Debian 7 / 8, Ubuntu 12.04 / 14.04 and subsequent versions, CentOS 7 / 8, Arch Linux, etc.;
  - FreeBSD (x86 / amd64);
  - OpenBSD (x86 / amd64);

## Download Xray

Precompiled binaries in ZIP format are available at [GitHub Releases](https://github.com/xtls/Xray-core/releases) found in.

Download the compressed package of the corresponding platform, and use it after decompression.

## Verify the Installation Package

Xray provides two verification methods:

- SHA1/SHA256 digest of the ZIP archive
- Reproducible build: Please refer to [Compile Xray](../development/intro/compile.html)

## Install on Windows

- Download the ZIP archive suitable for the Windows platform on [Github Releases](https://github.com/xtls/Xray-core/releases). After decompression, you can get an executable file `xray.exe`, and then run it with [parameters](./command) through the command line.
- By [Scoop](https://scoop.sh/) Package manager installation: Xray has been added to [Mochi](https://github.com/Qv2ray/mochi).

## Install on macOS

- Download the ZIP archive suitable for the macOS platform on [Github Releases](https://github.com/xtls/Xray-core/releases). After decompression, you can get an executable file `xray`, and then run it with [parameters](./command) through the command line.
- By [Homebrew](https://brew.sh/) Package manager installation: `brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray): Thanks [@N4FA](https://github.com/N4FA)

## Install on Linux

### Install Script

- Linux Script

  - [XTLS/Xray-install](https://github.com/XTLS/Xray-install) (**Official**)
  - [tempest](https://github.com/team-cloudchaser/tempest) (supports [`systemd`](https://systemd.io) and [OpenRC](https://github.com/OpenRC/openrc); Linux-only)

* One Click

  - [Xray-REALITY](https://github.com/zxcvos/Xray-script), [xray-reality](https://github.com/sajjaddg/xray-reality), [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)
  - [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey), [XTool](https://github.com/LordPenguin666/XTool)
  - [v2ray-agent](https://github.com/mack-a/v2ray-agent), [Xray_onekey](https://github.com/wulabing/Xray_onekey), [ProxySU](https://github.com/proxysu/ProxySU)

* Magisk
  - [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)

### Arch Linux

#### Arch User Repository

Need to use [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers), [yay](https://github.com/Jguer/yay) as an example, it can be installed via `yay -S xray`.

#### Arch Linux CN

First add [Arch Linux CN](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/) repository, and then use the root user `pacman -S xray`to install.

### Linuxbrew

The Linuxbrew package manager is used in the same way as Homebrew: `brew install xray`

### Debian <Badge text="WIP" type="warning"/>

## Install via Docker

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)

### The File Structure of the Docker Image

- `/etc/xray/config.json`: configuration file
- `/usr/bin/xray`: Xray main program
- `/usr/local/share/xray/geoip.dat`: IP data file
- `/usr/local/share/xray/geosite.dat`: domain name data file

# GUI Client

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

# UUID Generator

Third-party UUID generator [uuidgenerator.net](https://www.uuidgenerator.net)
