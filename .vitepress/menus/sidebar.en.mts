import type { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Config["sidebar"] = {
  "/en/config/": [
    {
      text: "Feature Details",
      link: "/en/config/features/",
      collapsed: true,
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
      link: "/en/config/",
      collapsed: true,
      items: [
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
      link: "/en/config/inbounds/",
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
      link: "/en/config/outbounds/",
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
      link: "/en/config/transports/",
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
      link: "/en/document/level-1/",
      collapsed: true,
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
      link: "/en/document/level-2/",
      collapsed: true,
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
      link: "/en/development/",
      collapsed: true,
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
      collapsed: false,
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
};
