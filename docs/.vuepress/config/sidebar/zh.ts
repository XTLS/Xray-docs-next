import type { SidebarConfig } from '@vuepress/theme-default'

export const sidebarZh: SidebarConfig = {
  '/config/': [
    {
      text: '特性详解',
      children: [
        '/config/features/xtls.md',
        '/config/features/fallback.md',
        '/config/features/browser_dialer.md',
        '/config/features/env.md',
        '/config/features/multiple.md',
      ],
    },
    {
      text: '基础配置',
      children: [
        '/config/README.md',
        '/config/log.md',
        '/config/api.md',
        '/config/dns.md',
        '/config/fakedns.md',
        '/config/inbound.md',
        '/config/outbound.md',
        '/config/policy.md',
        '/config/reverse.md',
        '/config/routing.md',
        '/config/stats.md',
        '/config/transport.md',
        '/config/metrics.md',
        '/config/observatory.md',
      ],
    },
    {
      text: '入站代理',
      children: [
        '/config/inbounds/dokodemo.md',
        '/config/inbounds/http.md',
        '/config/inbounds/shadowsocks.md',
        '/config/inbounds/socks.md',
        '/config/inbounds/trojan.md',
        '/config/inbounds/vless.md',
        '/config/inbounds/vmess.md',
        '/config/inbounds/wireguard.md',
      ],
    },
    {
      text: '出站代理',
      children: [
        '/config/outbounds/blackhole.md',
        '/config/outbounds/dns.md',
        '/config/outbounds/freedom.md',
        '/config/outbounds/http.md',
        '/config/outbounds/loopback.md',
        '/config/outbounds/shadowsocks.md',
        '/config/outbounds/socks.md',
        '/config/outbounds/trojan.md',
        '/config/outbounds/vless.md',
        '/config/outbounds/vmess.md',
        '/config/outbounds/wireguard.md',
      ],
    },
    {
      text: '底层传输',
      children: [
        '/config/transports/grpc.md',
        '/config/transports/http.md',
        '/config/transports/mkcp.md',
        '/config/transports/raw.md',
        '/config/transports/websocket.md',
        '/config/transports/httpupgrade.md',
        '/config/transports/splithttp.md'
      ],
    },
  ],
  '/document/': [
    {
      text: '快速入门文档',
      children: [
        '/document/README.md',
        '/document/install.md',
        '/document/config.md',
        '/document/command.md',
        '/document/document.md',
      ],
    },
    {
      text: '小小白白话文',
      children: [
        '/document/level-0/README.md',
        '/document/level-0/ch01-preface.md',
        '/document/level-0/ch02-preparation.md',
        '/document/level-0/ch03-ssh.md',
        '/document/level-0/ch04-security.md',
        '/document/level-0/ch05-webpage.md',
        '/document/level-0/ch06-certificates.md',
        '/document/level-0/ch07-xray-server.md',
        '/document/level-0/ch08-xray-clients.md',
        '/document/level-0/ch09-appendix.md',
      ],
    },
    {
      text: '入门技巧',
      children: [
        '/document/level-1/README.md',
        '/document/level-1/fallbacks-lv1.md',
        '/document/level-1/routing-lv1-part1.md',
        '/document/level-1/routing-lv1-part2.md',
        '/document/level-1/work.md',
        '/document/level-1/fallbacks-with-sni.md',
      ],
    },
    {
      text: '进阶技巧',
      children: [
        '/document/level-2/README.md',
        '/document/level-2/transparent_proxy/transparent_proxy.md',
        '/document/level-2/tproxy.md',
        '/document/level-2/tproxy_ipv4_and_ipv6.md',
        '/document/level-2/nginx_or_haproxy_tls_tunnel.md',
        '/document/level-2/iptables_gid.md',
        '/document/level-2/redirect.md',
        '/document/level-2/warp.md',
        '/document/level-2/traffic_stats.md',
      ],
    }
  ],
  '/development/': [
    {
      text: '开发指南',
      children: [
        '/development/README.md',
        '/development/intro/compile.md',
        '/development/intro/design.md',
        '/development/intro/guide.md',
      ],
    },
    {
      text: '协议详解',
      children: [
        '/development/protocols/vless.md',
        '/development/protocols/vmess.md',
        '/development/protocols/muxcool.md',
        '/development/protocols/mkcp.md',
      ],
    },
  ],
}
