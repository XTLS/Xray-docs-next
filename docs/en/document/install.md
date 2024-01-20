# Download and Install

## Platform Support

- Xray is available on the following platforms:
  - Windows 7 and later (x86 / amd64 / arm32 / arm64);
  - macOS 10.10 Yosemite and later (amd64 / arm64);
  - Linux 2.6.23 and later (x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64);
    - Including but not limited to Debian 7 / 8, Ubuntu 12.04 / 14.04 and subsequent versions, CentOS 7 / 8, Arch Linux, etc.;
  - FreeBSD (x86 / amd64);
  - OpenBSD (x86 / amd64);
  - Dragonfly BSD (amd64);

## Download Xray

Precompiled binaries in ZIP format are available at [GitHub Releases](https://github.com/xtls/Xray-core/releases) found in.

Download the compressed package of the corresponding platform, and use it after decompression.

## Verify the Installation Package

Xray provides two verification methods:

- SHA1/SHA256 digest of the ZIP archive
- Reproducible build: Please refer to [Compile Xray](https://xtls.github.io/development/intro/compile.html)

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

  - [Xray-install](https://github.com/XTLS/Xray-install)

* One Click

  - [Xray-script](https://github.com/kirin10000/Xray-script)
  - [ProxySU](https://github.com/proxysu/ProxySU)
  - [Xray-agent](https://github.com/reeceyng/v2ray-agent) Thanks [@mack-a](https://github.com/mack-a) [@Reece](https://github.com/reeceyng)

* Magisk
  - [Xray4Magisk](https://github.com/CerteKim/Xray4Magisk)
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
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall)
  - [Hello World](https://github.com/jerrykuku/luci-app-vssr)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
  - [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))
- Windows
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) (This project has been and archived)
  - [Netch (NetFilter & TUN/TAP)](https://github.com/NetchX/Netch) (This project has been and archived)
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [Kitsunebi](https://github.com/rurirei/Kitsunebi/tree/release_xtls)
- iOS / macOS (ARM)
  - [Shadowrocket](https://apps.apple.com/app/shadowrocket/id932747118)
  - [Stash](https://apps.apple.com/app/stash/id1596063349)
- macOS (X86/ARM)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) (This project has been and archived)
  - [V2RayXS](https://github.com/tzmax/V2RayXS)

# UUID Generator

Third-party UUID generator [uuidgenerator.net](https://www.uuidgenerator.net)
