import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarEn: SidebarConfig = {
  '/en/config/': [
    {
      text: 'feature',
      children: [
        '/en/config/features/xtls.md',
        '/en/config/features/fallback.md',
        '/en/config/features/browser_dialer.md',
        '/en/config/features/env.md',
        '/en/config/features/multiple.md',
      ],
    },
    {
      text: 'config',
      children: [
        '/en/config/README.md',
        '/en/config/log.md',
        '/en/config/api.md',
        '/en/config/dns.md',
        '/en/config/fakedns.md',
        '/en/config/inbound.md',
        '/en/config/outbound.md',
        '/en/config/policy.md',
        '/en/config/reverse.md',
        '/en/config/routing.md',
        '/en/config/stats.md',
        '/en/config/transport.md',
        '/en/config/metrics.md',
        '/en/config/observatory.md',
      ],
    },
    {
      text: 'inbound',
      children: [
        '/en/config/inbounds/dokodemo.md',
        '/en/config/inbounds/http.md',
        '/en/config/inbounds/shadowsocks.md',
        '/en/config/inbounds/socks.md',
        '/en/config/inbounds/trojan.md',
        '/en/config/inbounds/vless.md',
        '/en/config/inbounds/vmess.md',
        '/en/config/inbounds/wireguard.md',
      ],
    },
    {
      text: 'outbound',
      children: [
        '/en/config/outbounds/blackhole.md',
        '/en/config/outbounds/dns.md',
        '/en/config/outbounds/freedom.md',
        '/en/config/outbounds/http.md',
        '/en/config/outbounds/loopback.md',
        '/en/config/outbounds/shadowsocks.md',
        '/en/config/outbounds/socks.md',
        '/en/config/outbounds/trojan.md',
        '/en/config/outbounds/vless.md',
        '/en/config/outbounds/vmess.md',
        '/en/config/outbounds/wireguard.md',
      ],
    },
    {
      text: 'transport',
      children: [
        '/en/config/transports/grpc.md',
        '/en/config/transports/h2.md',
        '/en/config/transports/mkcp.md',
        '/en/config/transports/tcp.md',
        '/en/config/transports/websocket.md',
        '/en/config/transports/httpupgrade.md',
        '/en/config/transports/splithttp.md'
      ],
    },
  ],
  '/en/document/': [
    {
      text: 'Quick Start',
      children: [
        '/en/document/README.md',
        '/en/document/install.md',
        '/en/document/config.md',
        '/en/document/command.md',
        '/en/document/document.md',
      ]
    },
    {
      text: 'Beginner Tutorial',
      children: [
        '/en/document/level-0/README.md',
        '/en/document/level-0/ch01-preface.md',
        '/en/document/level-0/ch02-preparation.md',
        '/en/document/level-0/ch03-ssh.md',
        '/en/document/level-0/ch04-security.md',
        '/en/document/level-0/ch05-webpage.md',
        '/en/document/level-0/ch06-certificates.md',
        '/en/document/level-0/ch07-xray-server.md',
        '/en/document/level-0/ch08-xray-clients.md',
        '/en/document/level-0/ch09-appendix.md',
      ]
    },
    {
      text: 'Getting Started Tips',
      children: [
        '/en/document/level-1/README.md',
        '/en/document/level-1/fallbacks-lv1.md',
        '/en/document/level-1/routing-lv1-part1.md',
        '/en/document/level-1/routing-lv1-part2.md',
        '/en/document/level-1/work.md',
        '/en/document/level-1/fallbacks-with-sni.md',
      ]
    },
    {
      text: 'Advanced Documentation',
      children: [
        '/en/document/level-2/README.md',
        '/en/document/level-2/transparent_proxy/transparent_proxy.md',
        '/en/document/level-2/tproxy.md',
        '/en/document/level-2/tproxy_ipv4_and_ipv6.md',
        '/en/document/level-2/nginx_or_haproxy_tls_tunnel.md',
        '/en/document/level-2/iptables_gid.md',
        '/en/document/level-2/redirect.md',
        '/en/document/level-2/warp.md',
        '/en/document/level-2/traffic_stats.md',
      ]
    }
  ],
  '/en/development/': [
    {
      text: 'Developer Guide',
      children: [
        '/en/development/README.md',
        '/en/development/intro/compile.md',
        '/en/development/intro/design.md',
        '/en/development/intro/guide.md',
      ],
    },
    {
      text: 'Protocol Details',
      children: [
        '/en/development/protocols/vless.md',
        '/en/development/protocols/vmess.md',
        '/en/development/protocols/muxcool.md',
        '/en/development/protocols/mkcp.md',
      ],
    },
  ],
}
