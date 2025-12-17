import { defineConfig } from "vitepress";
import { MermaidMarkdown, MermaidPlugin } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "Project X",
  description: "Xray-core",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  lastUpdated: true,

  ignoreDeadLinks: true, // TODO: cleanup dead links

  sitemap: {
    hostname: "https://xtls.github.io",
  },

  markdown: {
    config(md) {
      md.use(MermaidMarkdown);
    },
  },
  vite: {
    plugins: [MermaidPlugin()],
    optimizeDeps: {
      include: ["mermaid"],
    },
    ssr: {
      noExternal: ["mermaid"],
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "大史记", link: "/about/news.md" },
      { text: "配置指南", link: "/config/" },
      { text: "使用指南", link: "/document/" },
      { text: "开发指南", link: "/development/" },
    ],

    search: {
      provider: "local",
      options: {
        miniSearch: {
          options: {
            tokenize: (str) => str.split(/[\s,，。、]+/),
          },
        },
        translations: {
          button: {
            buttonText: "搜索",
            buttonAriaLabel: "搜索",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },

    darkModeSwitchLabel: "深色模式",
    darkModeSwitchTitle: "切换至深色主题",
    lightModeSwitchTitle: "切换至浅色主题",
    sidebarMenuLabel: "目录",
    returnToTopLabel: "返回至顶部",

    externalLinkIcon: true,

    outline: {
      level: [2, 4],
      label: "页面导航",
    },

    sidebar: {
      "/config/": [
        {
          text: "特性详解",
          collapsed: false,
          items: [
            { text: "XTLS 深度剖析", link: "/config/features/xtls.md" },
            { text: "Fallback 回落", link: "/config/features/fallback.md" },
            {
              text: "Browser Dialer",
              link: "/config/features/browser_dialer.md",
            },
            { text: "环境变量", link: "/config/features/env.md" },
            { text: "多文件配置", link: "/config/features/multiple.md" },
          ],
        },
        {
          text: "基础配置",
          collapsed: true,
          items: [
            { text: "配置文件", link: "/config/" },
            { text: "日志配置", link: "/config/log.md" },
            { text: "API 接口", link: "/config/api.md" },
            { text: "内置 DNS 服务器", link: "/config/dns.md" },
            { text: "FakeDNS", link: "/config/fakedns.md" },
            { text: "入站代理", link: "/config/inbound.md" },
            { text: "出站代理（Mux、XUDP）", link: "/config/outbound.md" },
            { text: "本地策略", link: "/config/policy.md" },
            { text: "反向代理", link: "/config/reverse.md" },
            { text: "路由", link: "/config/routing.md" },
            { text: "统计信息", link: "/config/stats.md" },
            { text: "传输方式（uTLS、REALITY）", link: "/config/transport.md" },
            { text: "Metrics", link: "/config/metrics.md" },
            { text: "连接观测", link: "/config/observatory.md" },
          ],
        },
        {
          text: "入站协议",
          collapsed: true,
          items: [
            {
              text: "Tunnel（dokodemo-door）",
              link: "/config/inbounds/tunnel.md",
            },
            { text: "HTTP", link: "/config/inbounds/http.md" },
            { text: "Shadowsocks", link: "/config/inbounds/shadowsocks.md" },
            { text: "Socks", link: "/config/inbounds/socks.md" },
            { text: "Trojan", link: "/config/inbounds/trojan.md" },
            {
              text: "VLESS（XTLS Vision Seed）",
              link: "/config/inbounds/vless.md",
            },
            { text: "VMess", link: "/config/inbounds/vmess.md" },
            { text: "Wireguard", link: "/config/inbounds/wireguard.md" },
          ],
        },
        {
          text: "出站协议",
          collapsed: true,
          items: [
            { text: "Blackhole", link: "/config/outbounds/blackhole.md" },
            { text: "DNS", link: "/config/outbounds/dns.md" },
            {
              text: "Freedom（fragment、noises）",
              link: "/config/outbounds/freedom.md",
            },
            { text: "HTTP", link: "/config/outbounds/http.md" },
            { text: "Loopback", link: "/config/outbounds/loopback.md" },
            { text: "Shadowsocks", link: "/config/outbounds/shadowsocks.md" },
            { text: "Socks", link: "/config/outbounds/socks.md" },
            { text: "Trojan", link: "/config/outbounds/trojan.md" },
            {
              text: "VLESS（XTLS Vision Seed）",
              link: "/config/outbounds/vless.md",
            },
            { text: "VMess", link: "/config/outbounds/vmess.md" },
            { text: "Wireguard", link: "/config/outbounds/wireguard.md" },
          ],
        },
        {
          text: "底层传输",
          collapsed: true,
          items: [
            { text: "RAW", link: "/config/transports/raw.md" },
            {
              text: "XHTTP: Beyond REALITY",
              link: "/config/transports/xhttp.md",
            },
            { text: "mKCP", link: "/config/transports/mkcp.md" },
            { text: "gRPC", link: "/config/transports/grpc.md" },
            { text: "WebSocket", link: "/config/transports/websocket.md" },
            { text: "HTTPUpgrade", link: "/config/transports/httpupgrade.md" },
          ],
        },
      ],
      "/document/": [
        {
          text: "快速入门文档",
          link: "/document/",
          collapsed: true,
          items: [
            { text: "下载安装", link: "/document/install.md" },
            { text: "配置运行", link: "/document/config.md" },
            { text: "命令参数", link: "/document/command.md" },
            { text: "为 Project X 的文档贡献", link: "/document/document.md" },
          ],
        },
        {
          text: "小小白白话文",
          link: "/document/level-0/",
          collapsed: true,
          items: [
            {
              text: "【第 1 章】 小小白白话文",
              link: "/document/level-0/ch01-preface.md",
            },
            {
              text: "【第 2 章】原料准备篇",
              link: "/document/level-0/ch02-preparation.md",
            },
            {
              text: "【第 3 章】远程登录篇",
              link: "/document/level-0/ch03-ssh.md",
            },
            {
              text: "【第 4 章】安全防护篇",
              link: "/document/level-0/ch04-security.md",
            },
            {
              text: "【第 5 章】网站建设篇",
              link: "/document/level-0/ch05-webpage.md",
            },
            {
              text: "【第 6 章】证书管理篇",
              link: "/document/level-0/ch06-certificates.md",
            },
            {
              text: "【第 7 章】Xray 服务器篇",
              link: "/document/level-0/ch07-xray-server.md",
            },
            {
              text: "【第 8 章】Xray 客户端篇",
              link: "/document/level-0/ch08-xray-clients.md",
            },
            {
              text: "【第 9 章】附录",
              link: "/document/level-0/ch09-appendix.md",
            },
          ],
        },
        {
          text: "入门技巧",
          collapsed: true,
          link: "/document/level-1/",
          items: [
            {
              text: "回落 (fallbacks) 功能简析",
              link: "/document/level-1/fallbacks-lv1.md",
            },
            {
              text: "路由 (routing) 功能简析（上）",
              link: "/document/level-1/routing-lv1-part1.md",
            },
            {
              text: "路由 (routing) 功能简析（下）",
              link: "/document/level-1/routing-lv1-part2.md",
            },
            { text: "Xray 的工作模式", link: "/document/level-1/work.md" },
            {
              text: "SNI 回落",
              link: "/document/level-1/fallbacks-with-sni.md",
            },
            {
              text: "用 DNS 实现精准境内外分流",
              link: "/document/level-1/routing-with-dns.md",
            },
          ],
        },
        {
          text: "进阶技巧",
          collapsed: true,
          link: "/document/level-2/",
          items: [
            {
              text: "透明代理入门",
              link: "/document/level-2/transparent_proxy/transparent_proxy.md",
            },
            { text: "TProxy 透明代理", link: "/document/level-2/tproxy.md" },
            {
              text: "TProxy 透明代理（ipv4 and ipv6）",
              link: "/document/level-2/tproxy_ipv4_and_ipv6.md",
            },
            {
              text: "Nginx 或 Haproxy 搭建 TLS 隧道隐藏指纹",
              link: "/document/level-2/nginx_or_haproxy_tls_tunnel.md",
            },
            { text: "GID 透明代理", link: "/document/level-2/iptables_gid.md" },
            { text: "出站流量重定向", link: "/document/level-2/redirect.md" },
            {
              text: "通过 Cloudflare Warp 增强代理安全性",
              link: "/document/level-2/warp.md",
            },
            { text: "流量统计", link: "/document/level-2/traffic_stats.md" },
          ],
        },
      ],
      "/development/": [
        {
          text: "开发指南",
          collapsed: true,
          link: "/development/",
          items: [
            { text: "编译", link: "/development/intro/compile.md" },
            { text: "设计目标", link: "/development/intro/design.md" },
            { text: "开发规范", link: "/development/intro/guide.md" },
          ],
        },
        {
          text: "协议详解",
          collapsed: true,
          items: [
            { text: "VLESS 协议", link: "/development/protocols/vless.md" },
            { text: "VMess 协议", link: "/development/protocols/vmess.md" },
            {
              text: "Mux.Cool 协议",
              link: "/development/protocols/muxcool.md",
            },
            { text: "mKCP 协议", link: "/development/protocols/mkcp.md" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/XTLS/Xray-core" },
    ],

    editLink: {
      pattern: "https://github.com/xtls/Xray-docs-nex/edit/main/docs/:path",
      text: "帮助我们改善此页面！",
    },

    lastUpdated: {
      text: "最近更改",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    footer: {
      message: "根据 CC-BY-SA 4.0 许可协议授权",
      copyright: "版权所有 © 2020-至今 Project X 社区",
    },
  },

  locales: {
    root: {
      label: "简体中文",
      lang: "zh",
    },

    en: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Homepage", link: "/en" },
          { text: "The Great Chronicles", link: "/en/about/news.md" },
          { text: "Config Reference", link: "/en/config/" },
          { text: "Quick Start", link: "/en/document/" },
          { text: "Developer Guide", link: "/en/development/" },
        ],

        search: {
          options: {
            miniSearch: {
              options: {
                tokenize: (str) =>
                  str
                    .split(/[\s.,;!?'"(){}[\]\-_+=&%$#@~`^<>|\\]+/)
                    .filter(Boolean),
              },
            },
          },
        },

        darkModeSwitchLabel: "Appearance",
        darkModeSwitchTitle: "Switch to dark theme",
        lightModeSwitchTitle: "Switch to light theme",
        sidebarMenuLabel: "Menu",
        returnToTopLabel: "Return to top",

        outline: {
          label: "On this page",
        },

        sidebar: {
          "/en/config/": [
            {
              text: "Feature Details",
              collapsed: false,
              items: [
                {
                  text: "In-depth Analysis of XTLS",
                  link: "/en/config/features/xtls.md",
                },
                {
                  text: "Fallback",
                  link: "/en/config/features/fallback.md",
                },
                {
                  text: "Browser Dialer",
                  link: "/en/config/features/browser_dialer.md",
                },
                {
                  text: "Environment Variables",
                  link: "/en/config/features/env.md",
                },
                {
                  text: "Multi-file Configuration",
                  link: "/en/config/features/multiple.md",
                },
              ],
            },
            {
              text: "Basic Configuration",
              collapsed: true,
              items: [
                { text: "Configuration File", link: "/en/config/" },
                { text: "Log Configuration", link: "/en/config/log.md" },
                { text: "API Interface", link: "/en/config/api.md" },
                { text: "Built-in DNS Server", link: "/en/config/dns.md" },
                { text: "FakeDNS", link: "/en/config/fakedns.md" },
                { text: "Inbound Proxy", link: "/en/config/inbound.md" },
                {
                  text: "Outbound Proxy (Mux, XUDP)",
                  link: "/en/config/outbound.md",
                },
                { text: "Local Policy", link: "/en/config/policy.md" },
                { text: "Reverse Proxy", link: "/en/config/reverse.md" },
                { text: "Routing", link: "/en/config/routing.md" },
                { text: "Statistics", link: "/en/config/stats.md" },
                {
                  text: "Transport (uTLS, REALITY)",
                  link: "/en/config/transport.md",
                },
                { text: "Metrics", link: "/en/config/metrics.md" },
                {
                  text: "Connection Observatory",
                  link: "/en/config/observatory.md",
                },
              ],
            },
            {
              text: "Inbound Protocols",
              collapsed: true,
              items: [
                {
                  text: "Tunnel (dokodemo-door)",
                  link: "/en/config/inbounds/tunnel.md",
                },
                { text: "HTTP", link: "/en/config/inbounds/http.md" },
                {
                  text: "Shadowsocks",
                  link: "/en/config/inbounds/shadowsocks.md",
                },
                { text: "Socks", link: "/en/config/inbounds/socks.md" },
                { text: "Trojan", link: "/en/config/inbounds/trojan.md" },
                {
                  text: "VLESS (XTLS Vision Seed)",
                  link: "/en/config/inbounds/vless.md",
                },
                { text: "VMess", link: "/en/config/inbounds/vmess.md" },
                { text: "Wireguard", link: "/en/config/inbounds/wireguard.md" },
              ],
            },
            {
              text: "Outbound Protocols",
              collapsed: true,
              items: [
                {
                  text: "Blackhole",
                  link: "/en/config/outbounds/blackhole.md",
                },
                { text: "DNS", link: "/en/config/outbounds/dns.md" },
                {
                  text: "Freedom (fragment, noises)",
                  link: "/en/config/outbounds/freedom.md",
                },
                { text: "HTTP", link: "/en/config/outbounds/http.md" },
                { text: "Loopback", link: "/en/config/outbounds/loopback.md" },
                {
                  text: "Shadowsocks",
                  link: "/en/config/outbounds/shadowsocks.md",
                },
                { text: "Socks", link: "/en/config/outbounds/socks.md" },
                { text: "Trojan", link: "/en/config/outbounds/trojan.md" },
                {
                  text: "VLESS (XTLS Vision Seed)",
                  link: "/en/config/outbounds/vless.md",
                },
                { text: "VMess", link: "/en/config/outbounds/vmess.md" },
                {
                  text: "Wireguard",
                  link: "/en/config/outbounds/wireguard.md",
                },
              ],
            },
            {
              text: "Underlying Transports",
              collapsed: true,
              items: [
                { text: "RAW", link: "/en/config/transports/raw.md" },
                {
                  text: "XHTTP: Beyond REALITY",
                  link: "/en/config/transports/xhttp.md",
                },
                { text: "mKCP", link: "/en/config/transports/mkcp.md" },
                { text: "gRPC", link: "/en/config/transports/grpc.md" },
                {
                  text: "WebSocket",
                  link: "/en/config/transports/websocket.md",
                },
                {
                  text: "HTTPUpgrade",
                  link: "/en/config/transports/httpupgrade.md",
                },
              ],
            },
          ],
          "/en/document/": [
            {
              text: "Quick Start Guide",
              link: "/en/document/",
              collapsed: true,
              items: [
                {
                  text: "Download and Install",
                  link: "/en/document/install.md",
                },
                { text: "Configure and Run", link: "/en/document/config.md" },
                { text: "Command Parameters", link: "/en/document/command.md" },
                {
                  text: "Contribute to Project X's Documentation",
                  link: "/en/document/document.md",
                },
              ],
            },
            {
              text: "Beginner's Plain Language Guide",
              link: "/en/document/level-0/",
              collapsed: true,
              items: [
                {
                  text: "[Chapter 1] Beginner's Plain Language Guide",
                  link: "/en/document/level-0/ch01-preface.md",
                },
                {
                  text: "[Chapter 2] Preparation",
                  link: "/en/document/level-0/ch02-preparation.md",
                },
                {
                  text: "[Chapter 3] Remote Login",
                  link: "/en/document/level-0/ch03-ssh.md",
                },
                {
                  text: "[Chapter 4] Security Protection",
                  link: "/en/document/level-0/ch04-security.md",
                },
                {
                  text: "[Chapter 5] Website Construction",
                  link: "/en/document/level-0/ch05-webpage.md",
                },
                {
                  text: "[Chapter 6] Certificate Management",
                  link: "/en/document/level-0/ch06-certificates.md",
                },
                {
                  text: "[Chapter 7] Xray Server",
                  link: "/en/document/level-0/ch07-xray-server.md",
                },
                {
                  text: "[Chapter 8] Xray Client",
                  link: "/en/document/level-0/ch08-xray-clients.md",
                },
                {
                  text: "[Chapter 9] Appendix",
                  link: "/en/document/level-0/ch09-appendix.md",
                },
              ],
            },
            {
              text: "Beginner Tips",
              collapsed: true,
              link: "/en/document/level-1/",
              items: [
                {
                  text: "Brief Analysis of Fallbacks",
                  link: "/en/document/level-1/fallbacks-lv1.md",
                },
                {
                  text: "Brief Analysis of Routing (Part 1)",
                  link: "/en/document/level-1/routing-lv1-part1.md",
                },
                {
                  text: "Brief Analysis of Routing (Part 2)",
                  link: "/en/document/level-1/routing-lv1-part2.md",
                },
                {
                  text: "Xray's Working Modes",
                  link: "/en/document/level-1/work.md",
                },
                {
                  text: "SNI Fallback",
                  link: "/en/document/level-1/fallbacks-with-sni.md",
                },
                {
                  text: "Achieving Precise Domestic/International Traffic Splitting with DNS",
                  link: "/en/document/level-1/routing-with-dns.md",
                },
              ],
            },
            {
              text: "Advanced Tips",
              collapsed: true,
              link: "/en/document/level-2/",
              items: [
                {
                  text: "Introduction to Transparent Proxy",
                  link: "/en/document/level-2/transparent_proxy/transparent_proxy.md",
                },
                {
                  text: "TProxy Transparent Proxy",
                  link: "/en/document/level-2/tproxy.md",
                },
                {
                  text: "TProxy Transparent Proxy (IPv4 and IPv6)",
                  link: "/en/document/level-2/tproxy_ipv4_and_ipv6.md",
                },
                {
                  text: "Building TLS Tunnel with Nginx or Haproxy to Hide Fingerprints",
                  link: "/en/document/level-2/nginx_or_haproxy_tls_tunnel.md",
                },
                {
                  text: "GID Transparent Proxy",
                  link: "/en/document/level-2/iptables_gid.md",
                },
                {
                  text: "Outbound Traffic Redirection",
                  link: "/en/document/level-2/redirect.md",
                },
                {
                  text: "Enhancing Proxy Security with Cloudflare Warp",
                  link: "/en/document/level-2/warp.md",
                },
                {
                  text: "Traffic Statistics",
                  link: "/en/document/level-2/traffic_stats.md",
                },
              ],
            },
          ],
          "/en/development/": [
            {
              text: "Development Guide",
              collapsed: true,
              link: "/en/development/",
              items: [
                {
                  text: "Compilation",
                  link: "/en/development/intro/compile.md",
                },
                {
                  text: "Design Goals",
                  link: "/en/development/intro/design.md",
                },
                {
                  text: "Development Guidelines",
                  link: "/en/development/intro/guide.md",
                },
              ],
            },
            {
              text: "Protocol Details",
              collapsed: true,
              items: [
                {
                  text: "VLESS Protocol",
                  link: "/en/development/protocols/vless.md",
                },
                {
                  text: "VMess Protocol",
                  link: "/en/development/protocols/vmess.md",
                },
                {
                  text: "Mux.Cool Protocol",
                  link: "/en/development/protocols/muxcool.md",
                },
                {
                  text: "mKCP Protocol",
                  link: "/en/development/protocols/mkcp.md",
                },
              ],
            },
          ],
        },

        editLink: {
          text: "Help us improve this page on GitHub!",
        },

        lastUpdated: {
          text: "Last Updated",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },

        docFooter: {
          prev: "Previous page",
          next: "Next page",
        },

        footer: {
          message: "Licensed under CC-BY-SA 4.0",
          copyright: "Copyright © 2020-Present Project X Community",
        },
      },
    },

    ru: {
      label: "Русский",
      lang: "ru",
      themeConfig: {
        nav: [
          { text: "Главная", link: "/ru" },
          { text: "История сайта", link: "/ru/about/news.md" },
          { text: "Справочник по конфигурации", link: "/ru/config/" },
          { text: "Быстрый старт", link: "/ru/document/" },
          { text: "Руководство разработчика", link: "/ru/development/" },
        ],

        search: {
          options: {
            miniSearch: {
              options: {
                tokenize: (str) =>
                  str
                    .split(/[\s.,;!?'"(){}[\]\-_+=&%$#@~`^<>|\\]+/)
                    .filter(Boolean),
              },
            },
            translations: {
              button: {
                buttonText: "Поиск",
                buttonAriaLabel: "Поиск",
              },
              modal: {
                noResultsText: "Результаты не найдены",
                resetButtonTitle: "Очистить запрос",
                footer: {
                  selectText: "Выбрать",
                  navigateText: "Переключить",
                },
              },
            },
          },
        },

        darkModeSwitchLabel: "Внешний вид",
        darkModeSwitchTitle: "Переключиться на тёмную тему",
        lightModeSwitchTitle: "Переключиться на светлую тему",
        sidebarMenuLabel: "Меню",
        returnToTopLabel: "Вернуться наверх",

        outline: {
          label: "Содержание страницы",
        },

        sidebar: {
          "/ru/config/": [
            {
              text: "Подробности функций",
              collapsed: false,
              items: [
                {
                  text: "Глубокий анализ XTLS",
                  link: "/ru/config/features/xtls.md",
                },
                {
                  text: "Fallback (Возврат)",
                  link: "/ru/config/features/fallback.md",
                },
                {
                  text: "Browser Dialer",
                  link: "/ru/config/features/browser_dialer.md",
                },
                {
                  text: "Переменные окружения",
                  link: "/ru/config/features/env.md",
                },
                {
                  text: "Конфигурация из нескольких файлов",
                  link: "/ru/config/features/multiple.md",
                },
              ],
            },
            {
              text: "Базовая конфигурация",
              collapsed: true,
              items: [
                { text: "Файл конфигурации", link: "/ru/config/" },
                { text: "Настройка логов", link: "/ru/config/log.md" },
                { text: "API интерфейс", link: "/ru/config/api.md" },
                { text: "Встроенный DNS-сервер", link: "/ru/config/dns.md" },
                { text: "FakeDNS", link: "/ru/config/fakedns.md" },
                { text: "Входящий прокси", link: "/ru/config/inbound.md" },
                {
                  text: "Исходящий прокси (Mux, XUDP)",
                  link: "/ru/config/outbound.md",
                },
                { text: "Локальная политика", link: "/ru/config/policy.md" },
                { text: "Обратный прокси", link: "/ru/config/reverse.md" },
                { text: "Маршрутизация", link: "/ru/config/routing.md" },
                { text: "Статистика", link: "/ru/config/stats.md" },
                {
                  text: "Транспорт (uTLS, REALITY)",
                  link: "/ru/config/transport.md",
                },
                { text: "Метрики", link: "/ru/config/metrics.md" },
                {
                  text: "Наблюдение за соединениями",
                  link: "/ru/config/observatory.md",
                },
              ],
            },
            {
              text: "Входящие протоколы",
              collapsed: true,
              items: [
                {
                  text: "Tunnel (dokodemo-door)",
                  link: "/ru/config/inbounds/tunnel.md",
                },
                { text: "HTTP", link: "/ru/config/inbounds/http.md" },
                {
                  text: "Shadowsocks",
                  link: "/ru/config/inbounds/shadowsocks.md",
                },
                { text: "Socks", link: "/ru/config/inbounds/socks.md" },
                { text: "Trojan", link: "/ru/config/inbounds/trojan.md" },
                {
                  text: "VLESS (XTLS Vision Seed)",
                  link: "/ru/config/inbounds/vless.md",
                },
                { text: "VMess", link: "/ru/config/inbounds/vmess.md" },
                { text: "Wireguard", link: "/ru/config/inbounds/wireguard.md" },
              ],
            },
            {
              text: "Исходящие протоколы",
              collapsed: true,
              items: [
                {
                  text: "Blackhole",
                  link: "/ru/config/outbounds/blackhole.md",
                },
                { text: "DNS", link: "/ru/config/outbounds/dns.md" },
                {
                  text: "Freedom (fragment, noises)",
                  link: "/ru/config/outbounds/freedom.md",
                },
                { text: "HTTP", link: "/ru/config/outbounds/http.md" },
                { text: "Loopback", link: "/ru/config/outbounds/loopback.md" },
                {
                  text: "Shadowsocks",
                  link: "/ru/config/outbounds/shadowsocks.md",
                },
                { text: "Socks", link: "/ru/config/outbounds/socks.md" },
                { text: "Trojan", link: "/ru/config/outbounds/trojan.md" },
                {
                  text: "VLESS (XTLS Vision Seed)",
                  link: "/ru/config/outbounds/vless.md",
                },
                { text: "VMess", link: "/ru/config/outbounds/vmess.md" },
                {
                  text: "Wireguard",
                  link: "/ru/config/outbounds/wireguard.md",
                },
              ],
            },
            {
              text: "Нижние транспорты",
              collapsed: true,
              items: [
                { text: "RAW", link: "/ru/config/transports/raw.md" },
                {
                  text: "XHTTP: За пределами REALITY",
                  link: "/ru/config/transports/xhttp.md",
                },
                { text: "mKCP", link: "/ru/config/transports/mkcp.md" },
                { text: "gRPC", link: "/ru/config/transports/grpc.md" },
                {
                  text: "WebSocket",
                  link: "/ru/config/transports/websocket.md",
                },
                {
                  text: "HTTPUpgrade",
                  link: "/ru/config/transports/httpupgrade.md",
                },
              ],
            },
          ],
          "/ru/document/": [
            {
              text: "Руководство по быстрому старту",
              link: "/ru/document/",
              collapsed: true,
              items: [
                {
                  text: "Скачать и установить",
                  link: "/ru/document/install.md",
                },
                { text: "Настройка и запуск", link: "/ru/document/config.md" },
                { text: "Параметры команды", link: "/ru/document/command.md" },
                {
                  text: "Вклад в документацию Project X",
                  link: "/ru/document/document.md",
                },
              ],
            },
            {
              text: "Руководство для новичков простым языком",
              link: "/ru/document/level-0/",
              collapsed: true,
              items: [
                {
                  text: "[Глава 1] Руководство для новичков простым языком",
                  link: "/ru/document/level-0/ch01-preface.md",
                },
                {
                  text: "[Глава 2] Подготовка",
                  link: "/ru/document/level-0/ch02-preparation.md",
                },
                {
                  text: "[Глава 3] Удаленный вход",
                  link: "/ru/document/level-0/ch03-ssh.md",
                },
                {
                  text: "[Глава 4] Защита безопасности",
                  link: "/ru/document/level-0/ch04-security.md",
                },
                {
                  text: "[Глава 5] Создание веб-сайта",
                  link: "/ru/document/level-0/ch05-webpage.md",
                },
                {
                  text: "[Глава 6] Управление сертификатами",
                  link: "/ru/document/level-0/ch06-certificates.md",
                },
                {
                  text: "[Глава 7] Сервер Xray",
                  link: "/ru/document/level-0/ch07-xray-server.md",
                },
                {
                  text: "[Глава 8] Клиент Xray",
                  link: "/ru/document/level-0/ch08-xray-clients.md",
                },
                {
                  text: "[Глава 9] Приложение",
                  link: "/ru/document/level-0/ch09-appendix.md",
                },
              ],
            },
            {
              text: "Советы для начинающих",
              collapsed: true,
              link: "/ru/document/level-1/",
              items: [
                {
                  text: "Краткий анализ функции Fallbacks",
                  link: "/ru/document/level-1/fallbacks-lv1.md",
                },
                {
                  text: "Краткий анализ функции маршрутизации (Часть 1)",
                  link: "/ru/document/level-1/routing-lv1-part1.md",
                },
                {
                  text: "Краткий анализ функции маршрутизации (Часть 2)",
                  link: "/ru/document/level-1/routing-lv1-part2.md",
                },
                {
                  text: "Режимы работы Xray",
                  link: "/ru/document/level-1/work.md",
                },
                {
                  text: "SNI Fallback",
                  link: "/ru/document/level-1/fallbacks-with-sni.md",
                },
                {
                  text: "Достижение точного разделения трафика (внутренний/международный) с помощью DNS",
                  link: "/ru/document/level-1/routing-with-dns.md",
                },
              ],
            },
            {
              text: "Продвинутые советы",
              collapsed: true,
              link: "/ru/document/level-2/",
              items: [
                {
                  text: "Введение в прозрачный прокси",
                  link: "/ru/document/level-2/transparent_proxy/transparent_proxy.md",
                },
                {
                  text: "Прозрачный прокси TProxy",
                  link: "/ru/document/level-2/tproxy.md",
                },
                {
                  text: "Прозрачный прокси TProxy (IPv4 и IPv6)",
                  link: "/ru/document/level-2/tproxy_ipv4_and_ipv6.md",
                },
                {
                  text: "Создание TLS-туннеля с Nginx или Haproxy для скрытия отпечатков",
                  link: "/ru/document/level-2/nginx_or_haproxy_tls_tunnel.md",
                },
                {
                  text: "Прозрачный прокси GID",
                  link: "/ru/document/level-2/iptables_gid.md",
                },
                {
                  text: "Перенаправление исходящего трафика",
                  link: "/ru/document/level-2/redirect.md",
                },
                {
                  text: "Улучшение безопасности прокси с помощью Cloudflare Warp",
                  link: "/ru/document/level-2/warp.md",
                },
                {
                  text: "Статистика трафика",
                  link: "/ru/document/level-2/traffic_stats.md",
                },
              ],
            },
          ],
          "/ru/development/": [
            {
              text: "Руководство разработчика",
              collapsed: true,
              link: "/ru/development/",
              items: [
                {
                  text: "Компиляция",
                  link: "/ru/development/intro/compile.md",
                },
                {
                  text: "Цели дизайна",
                  link: "/ru/development/intro/design.md",
                },
                {
                  text: "Принципы разработки",
                  link: "/ru/development/intro/guide.md",
                },
              ],
            },
            {
              text: "Детали протоколов",
              collapsed: true,
              items: [
                {
                  text: "Протокол VLESS",
                  link: "/ru/development/protocols/vless.md",
                },
                {
                  text: "Протокол VMess",
                  link: "/ru/development/protocols/vmess.md",
                },
                {
                  text: "Протокол Mux.Cool",
                  link: "/ru/development/protocols/muxcool.md",
                },
                {
                  text: "Протокол mKCP",
                  link: "/ru/development/protocols/mkcp.md",
                },
              ],
            },
          ],
        },

        editLink: {
          text: "Помогите нам улучшить эту страницу!",
        },

        lastUpdated: {
          text: "Последние изменения",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },

        docFooter: {
          prev: "Предыдущая страница",
          next: "Следующая страница",
        },

        footer: {
          message: "Лицензия CC-BY-SA 4.0",
          copyright:
            "Авторские права 2020-настоящее время Сообщество Project X",
        },
      },
    },
  },
});
