# Download and Install

## Platform Support

Official Releases support the following platforms

| Platform                                              | Architectures                                                       |
| :---------------------------------------------------- | :------------------------------------------------------------------ |
| Windows <sup><a href="#platform-note-1">[1]</a></sup> | x86 / amd64 / arm32 / arm64                                         |
| macOS                                                 | amd64 / arm64                                                       |
| Linux                                                 | x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64 |
| FreeBSD                                               | x86 / amd64                                                         |
| OpenBSD                                               | x86 / amd64                                                         |

<small id="platform-note-1">[1] Windows 7 is no longer officially supported by golang. Xray uses a patched go to provide separately published builds for it; Windows 7 users should use the releases with the `-win7` suffix.</small>

Xray actively keeps up with golang versions. For minimum OS version support other than win7, please refer to the latest go release notes corresponding to the time of release.

Builds for amd64 v2/v3 etc. are not provided as some similar projects do, because testing showed no significant performance improvement, and many critical functions already use runtime detection to automatically use extended instruction sets.

## Download Xray

Precompiled binary ZIP archives are available in [Github Releases](https://github.com/xtls/Xray-core/releases).

Download the archive for your platform and extract it to start using Xray.

## Verify Installation Packages

Xray provides two verification methods:

- SHA1 / SHA256 digests for ZIP archives
- Reproducible builds: please refer to [Compile Xray](../development/intro/compile.md)

## Windows Installation

- Download the ZIP archive for Windows from [Github Releases](https://github.com/xtls/Xray-core/releases). After extracting it, you will get the executable file `xray.exe`, which you can then [run with command-line arguments](./command)

## macOS Installation

- Download the ZIP archive for macOS from [Github Releases](https://github.com/xtls/Xray-core/releases). After extracting it, you will get the executable file `xray`, which you can then [run with command-line arguments](./command.md)
- Install via the [Homebrew](https://brew.sh) package manager: `brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) thanks to [@N4FA](https://github.com/N4FA)

## Linux Installation

### Installation Scripts and Projects

| Type         | Project                                                                  | Description                                                                               |
| :----------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| Linux Script | [XTLS/Xray-install](https://github.com/XTLS/Xray-install) (**Official**) | Officially maintained Linux installation script                                           |
| Linux Script | [tempest](https://github.com/team-cloudchaser/tempest)                   | Supports [`Systemd`](https://systemd.io) and [`OpenRC`](https://github.com/OpenRC/openrc) |
| One Click    | [Xray-REALITY](https://github.com/zxcvos/Xray-script)                    | One-click installation solution                                                           |
| One Click    | [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)                 | One-click installation solution                                                           |
| One Click    | [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey)     | One-click installation solution                                                           |
| One Click    | [v2ray-agent](https://github.com/mack-a/v2ray-agent)                     | One-click installation solution                                                           |
| One Click    | [ProxySU](https://github.com/proxysu/ProxySU)                            | One-click installation solution                                                           |
| Magisk       | [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)            | For Magisk environments                                                                   |
| Magisk       | [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)             | For Magisk environments                                                                   |

### Package Managers and Distribution Repositories

| Method               | Project                                                                               | Description                                                                                      |
| :------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------- |
| Arch User Repository | [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers)                       | Taking [yay](https://github.com/Jguer/yay) as an example, install with `yay -S xray`             |
| Arch Linux CN        | [Arch Linux CN repository](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/) | After adding the repository, install with `pacman -S xray` as root                               |
| Linuxbrew            | [Homebrew](https://brew.sh)                                                           | Usage is the same as Homebrew: `brew install xray`                                               |
| Gentoo Portage       | [Gentoo-zh](https://github.com/microcai/gentoo-zh)                                    | Suitable for Systemd systems; install after adding the Overlay with layman or eselect-repository |

## Docker Installation

Two different styles of Docker images are currently provided:

- [ghcr.io/xtls/xray-core](https://ghcr.io/xtls/xray-core) (**Official**)<br>
  No root privileges, no shell environment, and support for more architectures. It is compiled and built from the official repository with traceability support. It sacrifices convenience in pursuit of more extreme security.
  ::: details File Structure
  - `/usr/local/bin/xray`: Xray main program (owner: `root:root`, file permissions: `755`)
  - `/usr/local/etc/xray/`: Configuration file directory (mount point) (owner: `root:root`, directory permissions: `755`, file permissions: `644`)
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
  - `/usr/local/share/xray/`: Resource file directory containing Loyalsoldier geolocation data files (owner: `65532:65532`, directory permissions: `755`, file permissions: `644`)
    - geoip.dat
    - geosite.dat
  - `/var/log/xray/`: Log file directory (mount point) (directory owner: `root:root`, permissions: `755`; file owner: `65532:65532`, permissions: `600`)
    - access.log
    - error.log

  :::

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)<br>
  Has root privileges, includes a shell environment, and is compatible with all architectures supported by Alpine. It is compiled and built by the private server `dl.lamp.sh`. More convenient to use.
  ::: details File Structure
  - `/usr/bin/xray`: Xray main program
  - `/etc/xray/config.json`: Single configuration file (its parent directory is a mount point)
  - `/usr/share/xray/`: Resource file directory containing v2fly geolocation data files
    - geoip.dat
    - geosite.dat

  :::

## Third-Party Graphical Clients

| Platform                 | Project                                                                                                                                           |
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

## UUID Generator

Third-party UUID generator: [uuidgenerator.net](https://www.uuidgenerator.net)
