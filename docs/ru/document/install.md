# Загрузка и установка

## Поддерживаемые платформы

Xray доступен на следующих платформах:

- Windows 7 и выше (x86 / amd64 / arm32 / arm64);
- macOS 10.10 Yosemite и выше (amd64 / arm64);
- Linux 2.6.23 и выше (x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64);
  - Включая, но не ограничиваясь: Debian 7 / 8, Ubuntu 12.04 / 14.04 и выше, CentOS 7 / 8, Arch Linux и др.;
- FreeBSD (x86 / amd64);
- OpenBSD (x86 / amd64);
- Dragonfly BSD (amd64);

## Загрузка Xray

Предварительно скомпилированные ZIP-архивы с двоичными файлами можно найти в [Github Releases](https://github.com/xtls/Xray-core/releases).

Скачайте архив для своей платформы, распакуйте его и можете использовать.

## Проверка установочного пакета

Xray предлагает два способа проверки:

- SHA1 / SHA256 хэш-сумма ZIP-архива;
- Воспроизводимая сборка: см. [Сборка Xray](../development/intro/compile.md).

## Установка на Windows

- Скачайте ZIP-архив для Windows на [Github Releases](https://github.com/xtls/Xray-core/releases), распакуйте его, чтобы получить исполняемый файл `xray.exe`, а затем [запустите его из командной строки с параметрами](./command).
- Установите с помощью менеджера пакетов [Scoop](https://scoop.sh): Xray был добавлен в [Mochi](https://github.com/Qv2ray/mochi).

## Установка на macOS

- Скачайте ZIP-архив для macOS на [Github Releases](https://github.com/xtls/Xray-core/releases), распакуйте его, чтобы получить исполняемый файл `xray`, а затем [запустите его из командной строки с параметрами](./command.md).
- Установите с помощью менеджера пакетов [Homebrew](https://brew.sh): `brew install xray`.
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) Спасибо, [@N4FA](https://github.com/N4FA)!

## Установка на Linux

### Установочные скрипты

- Linux Script

  - [Xray-install](https://github.com/XTLS/Xray-install)

* One Click

  - [Xray-script](https://github.com/kirin10000/Xray-script)
  - [ProxySU](https://github.com/proxysu/ProxySU)
  - [v2ray-agent](https://github.com/reeceyng/v2ray-agent) Спасибо, [@mack-a](https://github.com/mack-a) [@Reece](https://github.com/reeceyng)!
  - [Xray-yes](https://github.com/jiuqi9997/Xray-yes)
  - [Xray-onekey](https://github.com/wulabing/Xray_onekey)

* Magisk
  - [Xray4Magisk](https://github.com/CerteKim/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)

### Arch Linux

#### Arch User Repository

Требуется [помощник AUR](https://wiki.archlinux.org/index.php/AUR_helpers), например, [yay](https://github.com/Jguer/yay), установка с помощью команды `yay -S xray`.

#### Arch Linux CN

Сначала добавьте [репозиторий Arch Linux CN](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/), затем установите от имени пользователя root с помощью команды `pacman -S xray`.

### Linuxbrew

Использование менеджера пакетов Linuxbrew аналогично Homebrew: `brew install xray`.

### Debian <Badge text="WIP" type="warning"/>

### Gentoo

В настоящее время существует три оверлея сторонних разработчиков, которые предоставляют сценарии установки Portage:

- [CHN-beta/touchfish-os](https://github.com/gentoo-mirror/touchfish-os/tree/master/net-proxy/Xray): Поддерживается отдельным пользователем, подходит для систем с systemD.
- [Gentoo-zh](https://github.com/microcai/gentoo-zh): Поддерживается сообществом, подходит для систем с systemD.
- [JuanCldCmt/Xray-Overlay](https://github.com/JuanCldCmt/Xray-Overlay): Поддерживается отдельным пользователем, подходит для систем с openRC, использует группу пользователей xray для повышения безопасности.

Добавьте оверлей в локальную систему с помощью layman или eselect-repository, а затем выполните установку.

## Установка с помощью Docker

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)

### Файловая структура образа Docker

- `/etc/xray/config.json`: файл конфигурации;
- `/usr/bin/xray`: основная программа Xray;
- `/usr/share/xray/geoip.dat`: файл данных IP;
- `/usr/share/xray/geosite.dat`: файл данных доменных имен.

# Графические клиенты

- OpenWrt
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall)
  - [Hello World](https://github.com/jerrykuku/luci-app-vssr)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
  - [luci-app-xray](https://github.com/yichya/luci-app-xray) ([openwrt-xray](https://github.com/yichya/openwrt-xray))
- Windows
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) (проект заморожен и архивирован)
  - [Netch (NetFilter & TUN/TAP)](https://github.com/NetchX/Netch) (проект заморожен и архивирован)
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [Kitsunebi](https://github.com/rurirei/Kitsunebi/tree/release_xtls)
- iOS / macOS (с чипом ARM)
  - [Shadowrocket](https://apps.apple.com/app/shadowrocket/id932747118)
  - [Stash](https://apps.apple.com/app/stash/id1596063349)
- macOS (чип X86 / ARM)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray) (проект заморожен и архивирован)
  - [V2RayXS](https://github.com/tzmax/V2RayXS)

# Генератор UUID

Генератор UUID от сторонних разработчиков: [uuidgenerator.net](https://www.uuidgenerator.net)
