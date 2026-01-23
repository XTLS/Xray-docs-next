import type { DefaultTheme } from "vitepress"

export const sidebar: DefaultTheme.Config["sidebar"] = {
  "/ru/config/": [
    {
      text: "Обзор",
      link: "/config/features/",
      collapsed: true,
      items: [
        {
          text: "Глубокий анализ XTLS",
          link: "/ru/config/features/xtls.md"
        },
        {
          text: "Fallback",
          link: "/ru/config/features/fallback.md"
        },
        {
          text: "Browser Dialer",
          link: "/ru/config/features/browser_dialer.md"
        },
        {
          text: "Переменные окружения",
          link: "/ru/config/features/env.md"
        },
        {
          text: "Конфигурация из нескольких файлов",
          link: "/ru/config/features/multiple.md"
        }
      ]
    },
    {
      text: "Базовая конфигурация",
      link: "/ru/config/",
      collapsed: true,
      items: [
        { text: "Настройка журнала", link: "/ru/config/log.md" },
        { text: "API", link: "/ru/config/api.md" },
        { text: "Встроенный DNS-сервер", link: "/ru/config/dns.md" },
        { text: "FakeDNS", link: "/ru/config/fakedns.md" },
        { text: "Входящие подключения", link: "/ru/config/inbound.md" },
        {
          text: "Исходящие подключения",
          link: "/ru/config/outbound.md"
        },
        { text: "Локальные политики", link: "/ru/config/policy.md" },
        { text: "Обратный прокси", link: "/ru/config/reverse.md" },
        { text: "Маршрутизация", link: "/ru/config/routing.md" },
        { text: "Статистика", link: "/ru/config/stats.md" },
        {
          text: "Способы передачи",
          link: "/ru/config/transport.md"
        },
        { text: "Метрики", link: "/ru/config/metrics.md" },
        {
          text: "Мониторинг подключений",
          link: "/ru/config/observatory.md"
        }
      ]
    },
    {
      text: "Входящие подключения",
      link: "/ru/config/inbounds/",
      collapsed: true,
      items: [
        {
          text: "Tunnel (dokodemo-door)",
          link: "/ru/config/inbounds/tunnel.md"
        },
        { text: "HTTP", link: "/ru/config/inbounds/http.md" },
        {
          text: "Shadowsocks",
          link: "/ru/config/inbounds/shadowsocks.md"
        },
        { text: "Socks", link: "/ru/config/inbounds/socks.md" },
        { text: "Trojan", link: "/ru/config/inbounds/trojan.md" },
        {
          text: "VLESS (XTLS Vision Seed)",
          link: "/ru/config/inbounds/vless.md"
        },
        { text: "VMess", link: "/ru/config/inbounds/vmess.md" },
        { text: "Wireguard", link: "/ru/config/inbounds/wireguard.md" },
        { text: "TUN", link: "/ru/config/inbounds/tun.md" }
      ]
    },
    {
      text: "Исходящие подключения",
      link: "/ru/config/outbounds/",
      collapsed: true,
      items: [
        {
          text: "Blackhole",
          link: "/ru/config/outbounds/blackhole.md"
        },
        { text: "DNS", link: "/ru/config/outbounds/dns.md" },
        {
          text: "Freedom (fragment, noises)",
          link: "/ru/config/outbounds/freedom.md"
        },
        { text: "HTTP", link: "/ru/config/outbounds/http.md" },
        { text: "Loopback", link: "/ru/config/outbounds/loopback.md" },
        {
          text: "Shadowsocks",
          link: "/ru/config/outbounds/shadowsocks.md"
        },
        { text: "Socks", link: "/ru/config/outbounds/socks.md" },
        { text: "Trojan", link: "/ru/config/outbounds/trojan.md" },
        {
          text: "VLESS (XTLS Vision Seed)",
          link: "/ru/config/outbounds/vless.md"
        },
        { text: "VMess", link: "/ru/config/outbounds/vmess.md" },
        {
          text: "Wireguard",
          link: "/ru/config/outbounds/wireguard.md"
        },
        {
          text: "Hysteria 2",
          link: "/ru/config/outbounds/hysteria.md"
        }
      ]
    },
    {
      text: "Способы передачи",
      link: "/ru/config/transports/",
      collapsed: true,
      items: [
        { text: "RAW", link: "/ru/config/transports/raw.md" },
        {
          text: "XHTTP: За пределами REALITY",
          link: "/ru/config/transports/xhttp.md"
        },
        { text: "mKCP", link: "/ru/config/transports/mkcp.md" },
        { text: "gRPC", link: "/ru/config/transports/grpc.md" },
        {
          text: "WebSocket",
          link: "/ru/config/transports/websocket.md"
        },
        {
          text: "HTTPUpgrade",
          link: "/ru/config/transports/httpupgrade.md"
        },
        {
          text: "Hysteria",
          link: "/ru/config/transports/hysteria.md"
        }
      ]
    }
  ],
  "/ru/document/": [
    {
      text: "Руководство по быстрому старту",
      link: "/ru/document/",
      collapsed: true,
      items: [
        {
          text: "Загрузка и установка",
          link: "/ru/document/install.md"
        },
        { text: "Настройка и запуск", link: "/ru/document/config.md" },
        { text: "Параметры команды", link: "/ru/document/command.md" },
        {
          text: "Вклад в документацию Project X",
          link: "/ru/document/document.md"
        }
      ]
    },
    {
      text: "Простыми словами",
      link: "/ru/document/level-0/",
      collapsed: true,
      items: [
        {
          text: "[Глава 1] Руководство для новичков простым языком",
          link: "/ru/document/level-0/ch01-preface.md"
        },
        {
          text: "[Глава 2] Подготовка",
          link: "/ru/document/level-0/ch02-preparation.md"
        },
        {
          text: "[Глава 3] Удаленный вход",
          link: "/ru/document/level-0/ch03-ssh.md"
        },
        {
          text: "[Глава 4] Защита безопасности",
          link: "/ru/document/level-0/ch04-security.md"
        },
        {
          text: "[Глава 5] Создание веб-сайта",
          link: "/ru/document/level-0/ch05-webpage.md"
        },
        {
          text: "[Глава 6] Управление сертификатами",
          link: "/ru/document/level-0/ch06-certificates.md"
        },
        {
          text: "[Глава 7] Сервер Xray",
          link: "/ru/document/level-0/ch07-xray-server.md"
        },
        {
          text: "[Глава 8] Клиент Xray",
          link: "/ru/document/level-0/ch08-xray-clients.md"
        },
        {
          text: "[Глава 9] Приложение",
          link: "/ru/document/level-0/ch09-appendix.md"
        }
      ]
    },
    {
      text: "Советы для начинающих",
      link: "/ru/document/level-1/",
      collapsed: true,
      items: [
        {
          text: "Краткий анализ функции Fallbacks",
          link: "/ru/document/level-1/fallbacks-lv1.md"
        },
        {
          text: "Краткий анализ функции маршрутизации (Часть 1)",
          link: "/ru/document/level-1/routing-lv1-part1.md"
        },
        {
          text: "Краткий анализ функции маршрутизации (Часть 2)",
          link: "/ru/document/level-1/routing-lv1-part2.md"
        },
        {
          text: "Режимы работы Xray",
          link: "/ru/document/level-1/work.md"
        },
        {
          text: "SNI Fallback",
          link: "/ru/document/level-1/fallbacks-with-sni.md"
        },
        {
          text: "Достижение точного разделения трафика (внутренний/международный) с помощью DNS",
          link: "/ru/document/level-1/routing-with-dns.md"
        }
      ]
    },
    {
      text: "Продвинутые советы",
      link: "/ru/document/level-2/",
      collapsed: true,
      items: [
        {
          text: "Введение в прозрачный прокси",
          link: "/ru/document/level-2/transparent_proxy/transparent_proxy.md"
        },
        {
          text: "Прозрачный прокси TProxy",
          link: "/ru/document/level-2/tproxy.md"
        },
        {
          text: "Прозрачный прокси TProxy (IPv4 и IPv6)",
          link: "/ru/document/level-2/tproxy_ipv4_and_ipv6.md"
        },
        {
          text: "Создание TLS-туннеля с Nginx или Haproxy для скрытия отпечатков",
          link: "/ru/document/level-2/nginx_or_haproxy_tls_tunnel.md"
        },
        {
          text: "Прозрачный прокси GID",
          link: "/ru/document/level-2/iptables_gid.md"
        },
        {
          text: "Перенаправление исходящего трафика",
          link: "/ru/document/level-2/redirect.md"
        },
        {
          text: "Улучшение безопасности прокси с помощью Cloudflare Warp",
          link: "/ru/document/level-2/warp.md"
        },
        {
          text: "Статистика трафика",
          link: "/ru/document/level-2/traffic_stats.md"
        }
      ]
    }
  ],
  "/ru/development/": [
    {
      text: "Руководство разработчика",
      link: "/ru/development/",
      collapsed: true,
      items: [
        {
          text: "Компиляция",
          link: "/ru/development/intro/compile.md"
        },
        {
          text: "Дизайн",
          link: "/ru/development/intro/design.md"
        },
        {
          text: "Принципы разработки",
          link: "/ru/development/intro/guide.md"
        }
      ]
    },
    {
      text: "Детали протоколов",
      collapsed: false,
      items: [
        {
          text: "Протокол VLESS",
          link: "/ru/development/protocols/vless.md"
        },
        {
          text: "Протокол VMess",
          link: "/ru/development/protocols/vmess.md"
        },
        {
          text: "Протокол Mux.Cool",
          link: "/ru/development/protocols/muxcool.md"
        },
        {
          text: "Протокол mKCP",
          link: "/ru/development/protocols/mkcp.md"
        }
      ]
    }
  ]
}
