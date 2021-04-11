import { SidebarConfigArray } from "@vuepress/theme-default/lib/types/nav";

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
      isGroup: true,
      children: [
        path + "features/vless.md",
        path + "features/xtls.md",
        path + "features/fallback.md",
        path + "features/env.md",
        path + "features/multiple.md",
      ],
    },
    {
      text: config,
      isGroup: true,
      children: [
        path + "",
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
      isGroup: true,
      children: [
        path + "inbounds/",
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
      isGroup: true,
      children: [
        path + "outbounds/",
        path + "outbounds/blackhole.md",
        path + "outbounds/dns.md",
        path + "outbounds/freedom.md",
        path + "outbounds/http.md",
        path + "outbounds/shadowsocks.md",
        path + "outbounds/socks.md",
        path + "outbounds/trojan.md",
        path + "outbounds/vless.md",
        path + "outbounds/vmess.md",
      ],
    },
    {
      text: transport,
      isGroup: true,
      children: [
        path + "transports/",
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

export function getDocumentLv0Sidebar(
  title: string,
  path: string
): SidebarConfigArray {
  return [
    {
      text: title,
      isGroup: true,
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
      isGroup: true,
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
      isGroup: true,
      children: [
        path + "transparent_proxy/transparent_proxy.md",
        path + "tproxy.md",
        path + "iptables_gid.md",
        path + "redirect.md",
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
      isGroup: true,
      children: [
        path + "intro/compile.md",
        path + "intro/design.md",
        path + "intro/guide.md",
        {
          text: protocols,
          isGroup: true,
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
