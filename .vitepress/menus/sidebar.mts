import type { DefaultTheme } from "vitepress"

export const sidebar: DefaultTheme.Config["sidebar"] = {
  "/config/": [
    {
      text: "特性详解",
      link: "/config/features/",
      collapsed: true,
      items: [
        { text: "XTLS 深度剖析", link: "/config/features/xtls.md" },
        { text: "Fallback 回落", link: "/config/features/fallback.md" },
        {
          text: "Browser Dialer",
          link: "/config/features/browser_dialer.md"
        },
        { text: "环境变量", link: "/config/features/env.md" },
        { text: "多文件配置", link: "/config/features/multiple.md" }
      ]
    },
    {
      text: "基础配置",
      link: "/config/",
      collapsed: true,
      items: [
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
        {
          text: "传输方式（uTLS、REALITY）",
          link: "/config/transport.md"
        },
        { text: "Metrics", link: "/config/metrics.md" },
        { text: "连接观测", link: "/config/observatory.md" }
      ]
    },
    {
      text: "入站协议",
      link: "/config/inbounds/",
      collapsed: true,
      items: [
        {
          text: "Tunnel（dokodemo-door）",
          link: "/config/inbounds/tunnel.md"
        },
        { text: "HTTP", link: "/config/inbounds/http.md" },
        { text: "Shadowsocks", link: "/config/inbounds/shadowsocks.md" },
        { text: "Socks", link: "/config/inbounds/socks.md" },
        { text: "Trojan", link: "/config/inbounds/trojan.md" },
        {
          text: "VLESS（XTLS Vision Seed）",
          link: "/config/inbounds/vless.md"
        },
        { text: "VMess", link: "/config/inbounds/vmess.md" },
        { text: "Wireguard", link: "/config/inbounds/wireguard.md" },
        { text: "TUN", link: "/config/inbounds/tun.md" }
      ]
    },
    {
      text: "出站协议",
      link: "/config/outbounds/",
      collapsed: true,
      items: [
        { text: "Blackhole", link: "/config/outbounds/blackhole.md" },
        { text: "DNS", link: "/config/outbounds/dns.md" },
        {
          text: "Freedom（fragment、noises）",
          link: "/config/outbounds/freedom.md"
        },
        { text: "HTTP", link: "/config/outbounds/http.md" },
        { text: "Loopback", link: "/config/outbounds/loopback.md" },
        { text: "Shadowsocks", link: "/config/outbounds/shadowsocks.md" },
        { text: "Socks", link: "/config/outbounds/socks.md" },
        { text: "Trojan", link: "/config/outbounds/trojan.md" },
        {
          text: "VLESS（XTLS Vision Seed）",
          link: "/config/outbounds/vless.md"
        },
        { text: "VMess", link: "/config/outbounds/vmess.md" },
        { text: "Wireguard", link: "/config/outbounds/wireguard.md" },
        { text: "Hysteria", link: "/config/outbounds/hysteria.md" }
      ]
    },
    {
      text: "底层传输",
      link: "/config/transports/",
      collapsed: true,
      items: [
        { text: "RAW", link: "/config/transports/raw.md" },
        {
          text: "XHTTP: Beyond REALITY",
          link: "/config/transports/xhttp.md"
        },
        { text: "mKCP", link: "/config/transports/mkcp.md" },
        { text: "gRPC", link: "/config/transports/grpc.md" },
        { text: "WebSocket", link: "/config/transports/websocket.md" },
        { text: "HTTPUpgrade", link: "/config/transports/httpupgrade.md" },
        { text: "Hysteria", link: "/config/transports/hysteria.md" }
      ]
    }
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
        { text: "为 Project X 的文档贡献", link: "/document/document.md" }
      ]
    },
    {
      text: "小小白白话文",
      link: "/document/level-0/",
      collapsed: true,
      items: [
        {
          text: "【第 1 章】 小小白白话文",
          link: "/document/level-0/ch01-preface.md"
        },
        {
          text: "【第 2 章】原料准备篇",
          link: "/document/level-0/ch02-preparation.md"
        },
        {
          text: "【第 3 章】远程登录篇",
          link: "/document/level-0/ch03-ssh.md"
        },
        {
          text: "【第 4 章】安全防护篇",
          link: "/document/level-0/ch04-security.md"
        },
        {
          text: "【第 5 章】网站建设篇",
          link: "/document/level-0/ch05-webpage.md"
        },
        {
          text: "【第 6 章】证书管理篇",
          link: "/document/level-0/ch06-certificates.md"
        },
        {
          text: "【第 7 章】Xray 服务器篇",
          link: "/document/level-0/ch07-xray-server.md"
        },
        {
          text: "【第 8 章】Xray 客户端篇",
          link: "/document/level-0/ch08-xray-clients.md"
        },
        {
          text: "【第 9 章】附录",
          link: "/document/level-0/ch09-appendix.md"
        }
      ]
    },
    {
      text: "入门技巧",
      link: "/document/level-1/",
      collapsed: true,
      items: [
        {
          text: "回落 (fallbacks) 功能简析",
          link: "/document/level-1/fallbacks-lv1.md"
        },
        {
          text: "路由 (routing) 功能简析（上）",
          link: "/document/level-1/routing-lv1-part1.md"
        },
        {
          text: "路由 (routing) 功能简析（下）",
          link: "/document/level-1/routing-lv1-part2.md"
        },
        { text: "Xray 的工作模式", link: "/document/level-1/work.md" },
        {
          text: "SNI 回落",
          link: "/document/level-1/fallbacks-with-sni.md"
        },
        {
          text: "用 DNS 实现精准境内外分流",
          link: "/document/level-1/routing-with-dns.md"
        }
      ]
    },
    {
      text: "进阶技巧",
      link: "/document/level-2/",
      collapsed: true,
      items: [
        {
          text: "透明代理入门",
          link: "/document/level-2/transparent_proxy/transparent_proxy.md"
        },
        { text: "TProxy 透明代理", link: "/document/level-2/tproxy.md" },
        {
          text: "TProxy 透明代理（ipv4 and ipv6）",
          link: "/document/level-2/tproxy_ipv4_and_ipv6.md"
        },
        {
          text: "Nginx 或 Haproxy 搭建 TLS 隧道隐藏指纹",
          link: "/document/level-2/nginx_or_haproxy_tls_tunnel.md"
        },
        {
          text: "GID 透明代理",
          link: "/document/level-2/iptables_gid.md"
        },
        { text: "出站流量重定向", link: "/document/level-2/redirect.md" },
        {
          text: "通过 Cloudflare Warp 增强代理安全性",
          link: "/document/level-2/warp.md"
        },
        { text: "流量统计", link: "/document/level-2/traffic_stats.md" }
      ]
    }
  ],
  "/development/": [
    {
      text: "开发指南",
      link: "/development/",
      collapsed: true,
      items: [
        { text: "编译", link: "/development/intro/compile.md" },
        { text: "设计目标", link: "/development/intro/design.md" },
        { text: "开发规范", link: "/development/intro/guide.md" }
      ]
    },
    {
      text: "协议详解",
      collapsed: false,
      items: [
        { text: "VLESS 协议", link: "/development/protocols/vless.md" },
        { text: "VMess 协议", link: "/development/protocols/vmess.md" },
        {
          text: "Mux.Cool 协议",
          link: "/development/protocols/muxcool.md"
        },
        { text: "mKCP 协议", link: "/development/protocols/mkcp.md" }
      ]
    }
  ]
}
