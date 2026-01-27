# Download and Install

## Platform Support

Xray is available on the following platforms:

- Windows 7 and later (x86 / amd64 / arm32 / arm64);
  - To use regular versions 1.8.4, 1.8.6, and `win7` versions after 1.8.18 on Windows 7, the system must have the **KB4474419** update installed; it is recommended to also install KB4490628 to receive subsequent operating system security updates after connecting to the internet.
  - Starting from v25, running the `win7` version on Windows 7 only requires SP1 to function normally, but installing subsequent OS security updates is still strongly recommended for networked systems.
- macOS 10.10 Yosemite and later (amd64 / arm64);
- Linux 2.6.23 and later (x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64);
  - Including but not limited to Debian 7 / 8, Ubuntu 12.04 / 14.04 and later, CentOS 7 / 8, Arch Linux, etc.;
- FreeBSD (x86 / amd64);
- OpenBSD (x86 / amd64);

## Download Xray

Pre-compiled binary ZIP archives can be found in [Github Releases](https://github.com/xtls/Xray-core/releases).

Download the archive for your platform, extract it, and it is ready to use.

## Verify Installation Packages

Xray provides two verification methods:

- SHA1 / SHA256 digests of the ZIP archive.
- Reproducible Builds: Please refer to [Compiling Xray](../development/intro/compile.md).

## Windows Installation

- Download the ZIP archive for the Windows platform from [Github Releases](https://github.com/xtls/Xray-core/releases). After extraction, you will get the executable file `xray.exe`. You can then [run it via the command line with parameters](./command).
- Install via [Scoop](https://scoop.sh) package manager: Xray has been added to [Mochi](https://github.com/Qv2ray/mochi).

## macOS Installation

- Download the ZIP archive for the macOS platform from [Github Releases](https://github.com/xtls/Xray-core/releases). After extraction, you will get the executable file `xray`. You can then [run it via the command line with parameters](./command.md).
- Install via [Homebrew](https://brew.sh) package manager: `brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) thanks to [@N4FA](https://github.com/N4FA).

## Linux Installation

### Installation Scripts

- Linux Script
  - [XTLS/Xray-install](https://github.com/XTLS/Xray-install) (**Official Script**)
  - [tempest](https://github.com/team-cloudchaser/tempest) (Supports [`systemd`](https://systemd.io) and [OpenRC](https://github.com/OpenRC/openrc); Linux only)

- One Click
  - [Xray-REALITY](https://github.com/zxcvos/Xray-script), [xray-reality](https://github.com/sajjaddg/xray-reality), [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)
  - [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey), [XTool](https://github.com/LordPenguin666/XTool)
  - [v2ray-agent](https://github.com/mack-a/v2ray-agent), [Xray_onekey](https://github.com/wulabing/Xray_onekey), [ProxySU](https://github.com/proxysu/ProxySU)

- Magisk
  - [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)

### Arch Linux

#### Arch User Repository

Requires [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers). Taking [yay](https://github.com/Jguer/yay) as an example, you can install via `yay -S xray`.

#### Arch Linux CN

First add the [Arch Linux CN repository](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/), then install using `pacman -S xray` under the root user.

### Linuxbrew

The usage of the Linuxbrew package manager is consistent with Homebrew: `brew install xray`

### Debian

The **unofficial** Debian packages for [XRay Core](https://github.com/XTLS/Xray-core), [XRay Examples](https://github.com/XTLS/Xray-examples) as shared knowledge base, and automatically updated [GeoIP database](https://github.com/Loyalsoldier/v2ray-rules-dat) by [`LoyalSoldier`](https://github.com/Loyalsoldier) are available in the dedicated [Ubuntu PPA](https://launchpad.net/~twdragon/+archive/ubuntu/xray), also together with the packages for [GoXRay](https://github.com/goxray) GUI and CLI clients for Linux. The repository publishes auto-updated packages on a weekly update basis. All the source packages are built automatically on GitHub Action CI agent servers, and the dedicated build scenarios are all totally open sourced in the [dedicated CI repository](https://github.com/twdragon/xray-debian-pkg).

The Debian package repository is hosted on [Ubuntu Launchpad](https://launchpad.net) with all its isolated autobuild environment features. It utilises [Golang Backports](https://launchpad.net/~longsleep/+archive/ubuntu/golang-backports) the independent Golang packaging pipeline by `Simon Eisenmann` to build the binaries. It supplies the following package names:

- `xray-server` - the kernel package, provides the **XRay Core** server of the latest version available, together with the ready-to use `systemd` maintenance infrastructure.
- `xray-examples` - the set of configuration examples, provided as is from the official repository, installed into `/usr/share/xray` XDG directory.
- `xray-geoip` - the GeoIP database for XRay geographic routing rules. The files are installed and updates within `/usr/share/xray/geeoip`.
- `goxray-gui`, `goxray-cli` - the packages containing software clients compatible with XRay.

#### Installation from PPA

```bash
sudo add-apt-repository ppa:twdragon/xray
sudo apt update
sudo apt install xray-server
```
or, on an older Ubuntu:
```bash
# Change UBUNTU_CODENAME accordingly
# Add the corresponding Ubuntu GPG signing key to your keyring:
# https://keyserver.ubuntu.com/pks/lookup?fingerprint=on&op=index&search=0xC8F2828A240FDFC55B8CAE25E2F2445F17F6E584
sudo UBUNTU_CODENAME="focal" echo -e "deb https://ppa.launchpadcontent.net/twdragon/xray/ubuntu ${UBUNTU_CODENAME} main\ndeb-src https://ppa.launchpadcontent.net/twdragon/xray/ubuntu ${UBUNTU_CODENAME} main" > /etc/apt/sources.list.d/xray.list
sudo apt update
sudo apt install xray-server
```

#### Distro Compatibility

Despite the repositories are built and hosted over the Ubuntu infrastructure, `xray-server`, `xray-examples`, and `xray-geoip` packages could be installed freely also on the generic **Debian** Linux distribution of the same binary architecture, as the server itself is a statically linked standalone executable. The packages' control sequences intentionally don't mention `systemd` package, so it should be possible to install them on Debian. The compatibility of the `goxray-*` packages was not tested and it is impossible to ensure it as they depend from the external Ubuntu runtime libraries.

### Gentoo

Currently, three third-party Overlays provide Portage installation scripts:

- [CHN-beta/touchfish-os](https://github.com/gentoo-mirror/touchfish-os/tree/master/net-proxy/Xray): Personally maintained, suitable for systemD systems.
- [Gentoo-zh](https://github.com/microcai/gentoo-zh): Community maintained, suitable for systemD systems.
- [JuanCldCmt/Xray-Overlay](https://github.com/JuanCldCmt/Xray-Overlay): Personally maintained, suitable for openRC systems; runs with the xray user group to improve security.

Use layman or eselect-repository to add the Overlay locally, then install.

## Docker Installation

Currently, two different styles of Docker images are provided:

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray): Has root privileges, has shell environment, compatible with all Alpine-supported architectures. Compiled and built by private server dl.lamp.sh. More convenient to use.
- [ghcr.io/xtls/xray-core](https://ghcr.io/xtls/xray-core): No root privileges, no shell environment, supports more architectures. Compiled and built by the official repository supporting traceability. Sacrifices convenience for more extreme security.

### Docker Image File Structure

teddysun/xray version image:

- `/usr/bin/xray`: Xray main program
- `/etc/xray/config.json`: Single configuration file (its directory is a mount point)
- `/usr/share/xray/`: Resource file directory, stores v2fly version geolocation data files
  - geoip.dat
  - geosite.dat

ghcr.io/xtls/xray-core version image:

- `/usr/local/bin/xray`: Xray main program (Owner is root:root, file permissions 755)
- `/usr/local/etc/xray/`: Configuration file directory (Mount point) (Owner is root:root, directory permissions 755, file permissions 644)
  - 00_log.json
  - 01_api.json
  - 02_dns.json
  - 03_routing.json
  - 04_policy.json
  - 05_inbounds.json
  - 06_outbounds.json
  - 07_transport.json
  - 08_stats.json
  - 09_reverse.json
- `/usr/local/share/xray/`: Resource file directory, stores Loyalsoldier version geolocation data files (Permissions same as above)
  - geoip.dat
  - geosite.dat
- `/var/log/xray/`: Log file directory (Mount point) (Directory owner is root:root, permissions 755; File owner is 65532:65532, permissions 600)
  - access.log
  - error.log

# Graphical Clients

- OpenWrt
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall), [PassWall 2](https://github.com/xiaorouji/openwrt-passwall2)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
  - [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))
- Asuswrt-Merlin
  - [XRAYUI](https://github.com/DanielLavrushin/asuswrt-merlin-xrayui)
- Windows
  - [v2rayA](https://github.com/v2rayA/v2rayA)
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Furious](https://github.com/LorenEteval/Furious)
  - [Invisible Man - Xray](https://github.com/InvisibleManVPN/InvisibleMan-XRayClient)
  - [AnyPortal](https://github.com/AnyPortal/AnyPortal)
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [X-flutter](https://github.com/XTLS/X-flutter)
  - [SaeedDev94/Xray](https://github.com/SaeedDev94/Xray)
  - [SimpleXray](https://github.com/lhear/SimpleXray)
  - [AnyPortal](https://github.com/AnyPortal/AnyPortal)
- iOS & macOS arm64 & tvOS
  - [Happ](https://apps.apple.com/app/happ-proxy-utility/id6504287215) ([tvOS](https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274))
  - [FoXray](https://apps.apple.com/app/foxray/id6448898396)
  - [Streisand](https://apps.apple.com/app/streisand/id6450534064)
- macOS arm64 & x64
  - [Happ](https://apps.apple.com/app/happ-proxy-utility/id6504287215)
  - [v2rayA](https://github.com/v2rayA/v2rayA)
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [V2rayU](https://github.com/yanue/V2rayU)
  - [V2RayXS](https://github.com/tzmax/V2RayXS)
  - [Furious](https://github.com/LorenEteval/Furious)
  - [OneXray](https://github.com/OneXray/OneXray)
  - [GoXRay](https://github.com/goxray/desktop)
  - [AnyPortal](https://github.com/AnyPortal/AnyPortal)
- Linux
  - [v2rayA](https://github.com/v2rayA/v2rayA)
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Furious](https://github.com/LorenEteval/Furious)
  - [GorzRay](https://github.com/ketetefid/GorzRay)
  - [GoXRay](https://github.com/goxray/desktop)
  - [AnyPortal](https://github.com/AnyPortal/AnyPortal)

## UUID Generator

Third-party UUID generator: [uuidgenerator.net](https://www.uuidgenerator.net)
