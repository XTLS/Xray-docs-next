import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarRu: SidebarConfig = {
  '/ru/config/': [
    {
      text: 'Описание функций',
      children: [
        '/ru/config/features/xtls.md',
        '/ru/config/features/fallback.md',
        '/ru/config/features/browser_dialer.md',
        '/ru/config/features/env.md',
        '/ru/config/features/multiple.md',
      ],
    },
    {
      text: 'Базовая конфигурация',
      children: [
        '/ru/config/README.md',
        '/ru/config/log.md',
        '/ru/config/api.md',
        '/ru/config/dns.md',
        '/ru/config/fakedns.md',
        '/ru/config/inbound.md',
        '/ru/config/outbound.md',
        '/ru/config/policy.md',
        '/ru/config/reverse.md',
        '/ru/config/routing.md',
        '/ru/config/stats.md',
        '/ru/config/transport.md',
        '/ru/config/metrics.md',
        '/ru/config/observatory.md',
      ],
    },
    {
      text: 'Входящие подключения',
      children: [
        '/ru/config/inbounds/dokodemo.md',
        '/ru/config/inbounds/http.md',
        '/ru/config/inbounds/shadowsocks.md',
        '/ru/config/inbounds/socks.md',
        '/ru/config/inbounds/trojan.md',
        '/ru/config/inbounds/vless.md',
        '/ru/config/inbounds/vmess.md',
        '/ru/config/inbounds/wireguard.md',
      ],
    },
    {
      text: 'Исходящие подключения',
      children: [
        '/ru/config/outbounds/blackhole.md',
        '/ru/config/outbounds/dns.md',
        '/ru/config/outbounds/freedom.md',
        '/ru/config/outbounds/http.md',
        '/ru/config/outbounds/loopback.md',
        '/ru/config/outbounds/shadowsocks.md',
        '/ru/config/outbounds/socks.md',
        '/ru/config/outbounds/trojan.md',
        '/ru/config/outbounds/vless.md',
        '/ru/config/outbounds/vmess.md',
        '/ru/config/outbounds/wireguard.md',
      ],
    },
    {
      text: 'Транспортный уровень',
      children: [
        '/ru/config/transports/grpc.md',
        '/ru/config/transports/http.md',
        '/ru/config/transports/mkcp.md',
        '/ru/config/transports/raw.md',
        '/ru/config/transports/websocket.md',
        '/ru/config/transports/httpupgrade.md',
        '/ru/config/transports/splithttp.md'
      ],
    },
  ],
  '/ru/document/': [
    {
      text: 'Быстрый старт',
      children: [
        '/ru/document/README.md',
        '/ru/document/install.md',
        '/ru/document/config.md',
        '/ru/document/command.md',
        '/ru/document/document.md',
      ],
    },
    {
      text: 'Простыми словами',
      children: [
        '/ru/document/level-0/README.md',
        '/ru/document/level-0/ch01-preface.md',
        '/ru/document/level-0/ch02-preparation.md',
        '/ru/document/level-0/ch03-ssh.md',
        '/ru/document/level-0/ch04-security.md',
        '/ru/document/level-0/ch05-webpage.md',
        '/ru/document/level-0/ch06-certificates.md',
        '/ru/document/level-0/ch07-xray-server.md',
        '/ru/document/level-0/ch08-xray-clients.md',
        '/ru/document/level-0/ch09-appendix.md',
      ],
    },
    {
      text: 'Базовые навыки',
      children: [
        '/ru/document/level-1/README.md',
        '/ru/document/level-1/fallbacks-lv1.md',
        '/ru/document/level-1/routing-lv1-part1.md',
        '/ru/document/level-1/routing-lv1-part2.md',
        '/ru/document/level-1/work.md',
        '/ru/document/level-1/fallbacks-with-sni.md',
      ],
    },
    {
      text: 'Продвинутые навыки',
      children: [
        '/ru/document/level-2/README.md',
        '/ru/document/level-2/transparent_proxy/transparent_proxy.md',
        '/ru/document/level-2/tproxy.md',
        '/ru/document/level-2/tproxy_ipv4_and_ipv6.md',
        '/ru/document/level-2/nginx_or_haproxy_tls_tunnel.md',
        '/ru/document/level-2/iptables_gid.md',
        '/ru/document/level-2/redirect.md',
        '/ru/document/level-2/warp.md',
        '/ru/document/level-2/traffic_stats.md',
      ],
    }
  ],
  '/ru/development/': [
    {
      text: 'Руководство разработчика',
      children: [
        '/ru/development/README.md',
        '/ru/development/intro/compile.md',
        '/ru/development/intro/design.md',
        '/ru/development/intro/guide.md',
      ],
    },
    {
      text: 'Описание протоколов',
      children: [
        '/ru/development/protocols/vless.md',
        '/ru/development/protocols/vmess.md',
        '/ru/development/protocols/muxcool.md',
        '/ru/development/protocols/mkcp.md',
      ],
    },
  ],
}
