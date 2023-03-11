import { SidebarConfigArray } from "@vuepress/theme-default";

export function getConfigSidebar(
  feature: string,
  config: string,
  inbound: string,
  outbound: string,
  transport: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: feature,
      children: [
        path + "features/xtls.md",
        path + "features/fallback.md",
        path + "features/browser_dialer.md",
        path + "features/env.md",
        path + "features/multiple.md",
      ],
    },
    {
      text: config,
      children: [
        path + "",
        path + "log.md",
        path + "api.md",
        path + "dns.md",
        path + "fakedns.md",
        path + "inbound.md",
        path + "outbound.md",
        path + "policy.md",
        path + "reverse.md",
        path + "routing.md",
        path + "stats.md",
        path + "transport.md",
      ],
    },
    {
      text: inbound,
      children: [
        path + "inbounds/dokodemo.md",
        path + "inbounds/http.md",
        path + "inbounds/shadowsocks.md",
        path + "inbounds/socks.md",
        path + "inbounds/trojan.md",
        path + "inbounds/vless.md",
        path + "inbounds/vmess.md",
      ],
    },
    {
      text: outbound,
      children: [
        path + "outbounds/blackhole.md",
        path + "outbounds/dns.md",
        path + "outbounds/freedom.md",
        path + "outbounds/http.md",
        path + "outbounds/shadowsocks.md",
        path + "outbounds/socks.md",
        path + "outbounds/trojan.md",
        path + "outbounds/vless.md",
        path + "outbounds/vmess.md",
        path + "outbounds/wireguard.md",
      ],
    },
    {
      text: transport,
      children: [
        path + "transports/grpc.md",
        path + "transports/h2.md",
        path + "transports/mkcp.md",
        path + "transports/quic.md",
        path + "transports/tcp.md",
        path + "transports/websocket.md",
      ],
    },
  ];
}

export function getDocumentSidebar(
  title: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      children: [
        path + "install.md",
        path + "config.md",
        path + "command.md",
        path + "document.md",
        path + "level-0",
        path + "level-1",
        path + "level-2",
      ],
    },
  ];
}

export function getDocumentLv0Sidebar(
  title: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      children: [
        path + "ch01-preface.md",
        path + "ch02-preparation.md",
        path + "ch03-ssh.md",
        path + "ch04-security.md",
        path + "ch05-webpage.md",
        path + "ch06-certificates.md",
        path + "ch07-xray-server.md",
        path + "ch08-xray-clients.md",
        path + "ch09-appendix.md",
      ],
    },
  ];
}

export function getDocumentLv1Sidebar(
  title: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      children: [
        path + "fallbacks-lv1.md",
        path + "routing-lv1-part1.md",
        path + "routing-lv1-part2.md",
        path + "work.md",
        path + "fallbacks-with-sni.md",
      ],
    },
  ];
}

export function getDocumentLv2Sidebar(
  title: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      children: [
        path + "transparent_proxy/transparent_proxy.md",
        path + "tproxy.md",
        path + "tproxy_ipv4_and_ipv6.md",
        path + "nginx_or_haproxy_tls_tunnel.md",
        path + "iptables_gid.md",
        path + "redirect.md",
        path + "warp.md",
        path + "traffic_stats.md",
      ],
    },
  ];
}

export function getDevelopmentSidebar(
  title: string,
  protocols: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      children: [
        path + "intro/compile.md",
        path + "intro/design.md",
        path + "intro/guide.md",
        {
          text: protocols,
          children: [
            path + "protocols/vless.md",
            path + "protocols/vmess.md",
            path + "protocols/muxcool.md",
            path + "protocols/mkcp.md",
          ],
        },
      ],
    },
  ];
}
