# Загрузка и установка

## Поддерживаемые платформы

Xray доступен на следующих платформах:

- Windows 7 и выше (x86 / amd64 / arm32 / arm64);
  - Если вам требуется использовать эти версии (1.8.18 и более новые, отмеченные как `win7`, 1.8.6, 1.8.4) в Windows 7, необходимо убедиться, что в вашей ОС установлено обновление **KB4474419**. Для повышения уровня безопасности также рекомендуем убедиться, что у вас установлено обновление KB4490628.
- macOS 10.10 Yosemite и выше (amd64 / arm64);
- Linux 2.6.23 и выше (x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64);
  - Включая, но не ограничиваясь: Debian 7 / 8, Ubuntu 12.04 / 14.04 и выше, CentOS 7 / 8, Arch Linux и др.;
- FreeBSD (x86 / amd64);
- OpenBSD (x86 / amd64);

## Загрузка Xray

Предварительно скомпилированные ZIP-архивы с двоичными файлами можно найти в [списке релизов на GitHub](https://github.com/xtls/Xray-core/releases).

Скачайте архив для своей платформы, распакуйте его и можете использовать.

## Проверка установочного пакета

Xray предлагает два способа проверки:

- По хэш-сумме ZIP-архива (SHA1 / SHA256);
- Воспроизводимая сборка: см. [Сборка Xray](../development/intro/compile.md).

## Установка на Windows

- Скачайте ZIP-архив для Windows из [релизов на GitHub](https://github.com/xtls/Xray-core/releases), распакуйте его, чтобы получить исполняемый файл `xray.exe`, а затем [запустите его из командной строки с параметрами](./command).
- Установите с помощью менеджера пакетов [Scoop](https://scoop.sh): Xray был добавлен в [Mochi](https://github.com/Qv2ray/mochi).

## Установка на macOS

- Скачайте ZIP-архив для macOS из [релизов на GitHub](https://github.com/xtls/Xray-core/releases), распакуйте его, чтобы получить исполняемый файл `xray`, а затем [запустите его из командной строки с параметрами](./command.md).
- Установите с помощью менеджера пакетов [Homebrew](https://brew.sh): `brew install xray`.
- [homebrew-xray](https://github.com/N4FA/homebrew-xray) Спасибо, [@N4FA](https://github.com/N4FA)!

## Установка на Linux

### Установочные скрипты

- Скрипты для Linux
  - [XTLS/Xray-install](https://github.com/XTLS/Xray-install) (**официальный**)
  - [tempest](https://github.com/team-cloudchaser/tempest) (поддерживает [`systemd`](https://systemd.io) и [OpenRC](https://github.com/OpenRC/openrc); подходит только для Linux)

* Установка одной командой
  - [Xray-REALITY](https://github.com/zxcvos/Xray-script), [xray-reality](https://github.com/sajjaddg/xray-reality), [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)
  - [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey), [XTool](https://github.com/LordPenguin666/XTool)
  - [v2ray-agent](https://github.com/mack-a/v2ray-agent), [Xray_onekey](https://github.com/wulabing/Xray_onekey), [ProxySU](https://github.com/proxysu/ProxySU)

* Magisk
  - [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)
  - [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)

### Arch Linux

#### Arch User Repository

Требуется [помощник AUR](https://wiki.archlinux.org/index.php/AUR_helpers), например, [yay](https://github.com/Jguer/yay), установка с помощью команды `yay -S xray`.

#### Arch Linux CN

Сначала добавьте [репозиторий Arch Linux CN](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/), затем установите от имени пользователя `root` с помощью команды `pacman -S xray`.

### Linuxbrew

Использование менеджера пакетов Linuxbrew аналогично Homebrew: `brew install xray`.

### Debian <Badge text="WIP" type="warning"/>

### Gentoo

В настоящее время существуют три оверлея от сторонних разработчиков, которые предоставляют сценарии установки Portage:

- [CHN-beta/touchfish-os](https://github.com/gentoo-mirror/touchfish-os/tree/master/net-proxy/Xray): Поддерживается отдельным пользователем, подходит для систем с systemD.
- [Gentoo-zh](https://github.com/microcai/gentoo-zh): Поддерживается сообществом, подходит для систем с systemD.
- [JuanCldCmt/Xray-Overlay](https://github.com/JuanCldCmt/Xray-Overlay): Поддерживается отдельным пользователем, подходит для систем с openRC, использует группу пользователей xray для повышения безопасности.

Добавьте оверлей в локальную систему с помощью layman или eselect-repository, а затем выполните установку.

## Установка с помощью Docker

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray) Имеет root-права, есть оболочка (shell), совместим со всеми архитектурами, поддерживаемыми Alpine. Скомпилирован и собран на частном сервере dl.lamp.sh. Более удобен в использовании.
- [ghcr.io/xtls/xray-core](https://ghcr.io/xtls/xray-core) Не имеет root-прав, нет оболочки (shell), поддерживает большее количество архитектур. Скомпилирован и собран из официального репозитория с поддержкой отслеживания. Удобство принесено в жертву ради более высокой безопасности.

### Файловая структура образа Docker

Образ версии teddysun/xray:

- `/usr/bin/xray`: Основная программа Xray
- `/etc/xray/config.json`: Единый конфигурационный файл (каталог, в котором он находится, является точкой монтирования)
- `/usr/share/xray/`: Каталог с файлами ресурсов, содержит файлы геолокационных данных от v2fly
  - geoip.dat
  - geosite.dat

Образ версии ghcr.io/xtls/xray-core:

- `/usr/local/bin/xray`: Основная программа Xray (владелец root:root, права доступа к файлу 755)
- `/usr/local/etc/xray/`: Каталог конфигурационных файлов (точка монтирования) (владелец каталога root:root, права доступа к каталогу 755, права доступа к файлам 644)
  - 01_api.json
  - 02_dns.json
  - 03_routing.json
  - 04_policy.json
  - 05_inbounds.json
  - 06_outbounds.json
  - 07_transport.json
  - 08_stats.json
  - 09_reverse.json
- `/usr/local/share/xray/`: Каталог с файлами ресурсов, содержит файлы геолокационных данных от Loyalsoldier (права доступа те же, что и выше)
  - geoip.dat
  - geosite.dat
- `/var/log/xray/`: Каталог лог-файлов (точка монтирования) (владелец каталога root:root, права доступа 755; владелец файлов 65532:65532, права доступа 600)
  - access.log
  - error.log

# Графические клиенты

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

## Генератор UUID

Генератор UUID от сторонних разработчиков: [uuidgenerator.net](https://www.uuidgenerator.net)
