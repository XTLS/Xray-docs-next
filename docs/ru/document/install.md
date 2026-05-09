# Загрузка и установка

## Поддержка платформ

Официальные Release поддерживают следующие платформы

| Платформа | Минимальная версия                                           | Архитектуры                                                         |
| :-------- | :----------------------------------------------------------- | :------------------------------------------------------------------ |
| Windows   | 7 и новее <sup><a href="#platform-note-1">[1]</a></sup>      | x86 / amd64 / arm32 / arm64                                         |
| macOS     | 10.10 Yosemite и новее                                       | amd64 / arm64                                                       |
| Linux     | 2.6.23 и новее <sup><a href="#platform-note-2">[2]</a></sup> | x86 / amd64 / arm / arm64 / mips64 / mips / ppc64 / s390x / riscv64 |
| FreeBSD   | -                                                            | x86 / amd64                                                         |
| OpenBSD   | -                                                            | x86 / amd64                                                         |

<small id="platform-note-1">[1] В Windows 7 для обычных версий 1.8.4 и 1.8.6, а также для сборок `win7` после 1.8.18, требуется установленное обновление **KB4474419**. Также рекомендуется установить KB4490628, чтобы система могла получать последующие обновления безопасности после подключения к интернету. Начиная с v25, для нормальной работы сборки `win7` на Windows 7 требуется только SP1, однако для систем с доступом к сети по-прежнему настоятельно рекомендуется устанавливать последующие обновления безопасности ОС.</small>

<small id="platform-note-2">[2] Включая, но не ограничиваясь Debian 7 / 8, Ubuntu 12.04 / 14.04 и новее, CentOS 7 / 8, Arch Linux и другими.</small>

## Загрузка Xray

Предварительно собранные ZIP-архивы с бинарными файлами доступны в [Github Releases](https://github.com/xtls/Xray-core/releases).

Скачайте архив для своей платформы и распакуйте его, после чего Xray можно использовать.

## Проверка установочных пакетов

Xray предоставляет два способа проверки:

- SHA1 / SHA256 хэши ZIP-архивов
- Воспроизводимая сборка: см. [Сборка Xray](../development/intro/compile.md)

## Установка в Windows

- Скачайте ZIP-архив для Windows из [Github Releases](https://github.com/xtls/Xray-core/releases). После распаковки вы получите исполняемый файл `xray.exe`, который затем можно [запустить с аргументами командной строки](./command)

## Установка в macOS

- Скачайте ZIP-архив для macOS из [Github Releases](https://github.com/xtls/Xray-core/releases). После распаковки вы получите исполняемый файл `xray`, который затем можно [запустить с аргументами командной строки](./command.md)
- Установите через менеджер пакетов [Homebrew](https://brew.sh): `brew install xray`
- [homebrew-xray](https://github.com/N4FA/homebrew-xray), спасибо [@N4FA](https://github.com/N4FA)

## Установка в Linux

### Скрипты и проекты для установки

| Тип          | Проект                                                                      | Описание                                                                                    |
| :----------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| Linux Script | [XTLS/Xray-install](https://github.com/XTLS/Xray-install) (**Официальный**) | Официально поддерживаемый скрипт установки для Linux                                        |
| Linux Script | [tempest](https://github.com/team-cloudchaser/tempest)                      | Поддерживает [`Systemd`](https://systemd.io) и [`OpenRC`](https://github.com/OpenRC/openrc) |
| One Click    | [Xray-REALITY](https://github.com/zxcvos/Xray-script)                       | Решение для установки в один клик                                                           |
| One Click    | [reality-ezpz](https://github.com/aleskxyz/reality-ezpz)                    | Решение для установки в один клик                                                           |
| One Click    | [Xray_bash_onekey](https://github.com/hello-yunshu/Xray_bash_onekey)        | Решение для установки в один клик                                                           |
| One Click    | [v2ray-agent](https://github.com/mack-a/v2ray-agent)                        | Решение для установки в один клик                                                           |
| One Click    | [ProxySU](https://github.com/proxysu/ProxySU)                               | Решение для установки в один клик                                                           |
| Magisk       | [Xray4Magisk](https://github.com/Asterisk4Magisk/Xray4Magisk)               | Для окружений с Magisk                                                                      |
| Magisk       | [Xray_For_Magisk](https://github.com/E7KMbb/Xray_For_Magisk)                | Для окружений с Magisk                                                                      |

### Менеджеры пакетов и репозитории дистрибутивов

| Способ               | Проект                                                                                 | Описание                                                                                              |
| :------------------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| Arch User Repository | [AUR helpers](https://wiki.archlinux.org/index.php/AUR_helpers)                        | Например, с [yay](https://github.com/Jguer/yay) установка выполняется командой `yay -S xray`          |
| Arch Linux CN        | [репозиторий Arch Linux CN](https://www.archlinuxcn.org/archlinux-cn-repo-and-mirror/) | После добавления репозитория установите через `pacman -S xray` от имени root                          |
| Linuxbrew            | [Homebrew](https://brew.sh)                                                            | Использование такое же, как у Homebrew: `brew install xray`                                           |
| Gentoo Portage       | [Gentoo-zh](https://github.com/microcai/gentoo-zh)                                     | Подходит для систем с Systemd; установка после добавления Overlay через layman или eselect-repository |

## Установка через Docker

Сейчас доступны Docker-образы двух разных типов:

- [ghcr.io/xtls/xray-core](https://ghcr.io/xtls/xray-core) (**Официальный**)<br>
  Не имеет root-прав, не содержит shell-окружения и поддерживает больше архитектур. Компилируется и собирается из официального репозитория с поддержкой отслеживаемости. Удобство принесено в жертву ради более строгой безопасности.
  ::: details Структура файлов
  - `/usr/local/bin/xray`: основная программа Xray (владелец: `root:root`, права на файл: `755`)
  - `/usr/local/etc/xray/`: каталог конфигурационных файлов (точка монтирования) (владелец: `root:root`, права на каталог: `755`, права на файлы: `644`)
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
  - `/usr/local/share/xray/`: каталог файлов ресурсов с геоданными Loyalsoldier (те же права, что и выше)
    - geoip.dat
    - geosite.dat
  - `/var/log/xray/`: каталог логов (точка монтирования) (владелец каталога: `root:root`, права: `755`; владелец файлов: `65532:65532`, права: `600`)
    - access.log
    - error.log

  :::

- [teddysun/xray](https://hub.docker.com/r/teddysun/xray)<br>
  Имеет root-права, shell-окружение и совместим со всеми архитектурами, поддерживаемыми Alpine. Компилируется и собирается на частном сервере `dl.lamp.sh`. Более удобен в использовании.
  ::: details Структура файлов
  - `/usr/bin/xray`: основная программа Xray
  - `/etc/xray/config.json`: единый конфигурационный файл (его родительский каталог является точкой монтирования)
  - `/usr/share/xray/`: каталог файлов ресурсов с геоданными v2fly
    - geoip.dat
    - geosite.dat

  :::

## Сторонние графические клиенты

| Платформа                | Проект                                                                                                                                            |
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

## Генератор UUID

Сторонний генератор UUID: [uuidgenerator.net](https://www.uuidgenerator.net)
