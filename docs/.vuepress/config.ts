import { defineUserConfig } from "vuepress";
import { DefaultThemeOptions } from "vuepress";
import * as path from "path";

export default defineUserConfig<DefaultThemeOptions>({
  theme: path.join(__dirname, "./theme"),
  plugins: ["@vuepress/back-to-top", "vuepress-plugin-mermaidjs"],
  base: "/Xray-docs-next/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "Project X",
      description: "Xray 官方文档",
    },
  },
  themeConfig: {
    smoothScroll: true,
    repo: "xtls/xray-core",
    repoLabel: "查看源码",
    docsRepo: "xtls/Xray-docs-next",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: true,
    editLinkText: "帮助我们改善此页面！",
    enableToggle: true,
    ToggleText: "切换主题",
    navbar: [
      { text: "首页", link: "/" },
      { text: "大史记", link: "/about/news.md" },
      { text: "配置指南", link: "/config/" },
      { text: "开发指南", link: "/development/" },
      { text: "使用指南", link: "/document/" },
      {
        text: "多语言",
        ariaLabel: "Language Menu",
        children: [
          { text: "简体中文", link: "/" },
          { text: "English", link: "/en" },
        ],
      },
    ],
    sidebar: {
      "/config/": [
        {
          text: "特性详解",
          isGroup: true,
          children: [
            "/config/features/vless.md",
            "/config/features/xtls.md",
            "/config/features/fallback.md",
            "/config/features/env.md",
            "/config/features/multiple.md",
          ],
        },
        {
          text: "基础配置",
          isGroup: true,
          children: [
            "/config/",
            "/config/api.md",
            "/config/dns.md",
            "/config/fakedns.md",
            "/config/inbound.md",
            "/config/outbound.md",
            "/config/policy.md",
            "/config/reverse.md",
            "/config/routing.md",
            "/config/stats.md",
            "/config/transport.md",
          ],
        },
        {
          text: "入站代理",
          isGroup: true,
          children: [
            "/config/inbounds/",
            "/config/inbounds/dokodemo.md",
            "/config/inbounds/http.md",
            "/config/inbounds/shadowsocks.md",
            "/config/inbounds/socks.md",
            "/config/inbounds/trojan.md",
            "/config/inbounds/vless.md",
            "/config/inbounds/vmess.md",
          ],
        },
        {
          text: "出站代理",
          isGroup: true,
          children: [
            "/config/outbounds/",
            "/config/outbounds/blackhole.md",
            "/config/outbounds/dns.md",
            "/config/outbounds/freedom.md",
            "/config/outbounds/http.md",
            "/config/outbounds/shadowsocks.md",
            "/config/outbounds/socks.md",
            "/config/outbounds/trojan.md",
            "/config/outbounds/vless.md",
            "/config/outbounds/vmess.md",
          ],
        },
        {
          text: "底层传输",
          isGroup: true,
          children: [
            "/config/transports/",
            "/config/transports/grpc.md",
            "/config/transports/h2.md",
            "/config/transports/mkcp.md",
            "/config/transports/quic.md",
            "/config/transports/tcp.md",
            "/config/transports/websocket.md",
          ],
        },
      ],
      "/document/level-0/": [
        {
          text: "小小白白话文",
          isGroup: true,
          children: [
            "/document/level-0/ch01-preface.md",
            "/document/level-0/ch02-preparation.md",
            "/document/level-0/ch03-ssh.md",
            "/document/level-0/ch04-security.md",
            "/document/level-0/ch05-webpage.md",
            "/document/level-0/ch06-certificates.md",
            "/document/level-0/ch07-xray-server.md",
            "/document/level-0/ch08-xray-clients.md",
            "/document/level-0/ch09-appendix.md",
          ],
        },
      ],
      "/document/level-1/": [
        {
          text: "入门技巧",
          isGroup: true,
          children: [
            "/document/level-1/fallbacks-lv1.md",
            "/document/level-1/routing-lv1-part1.md",
            "/document/level-1/routing-lv1-part2.md",
            "/document/level-1/work.md",
            "/document/level-1/fallbacks-with-sni.md",
          ],
        },
      ],
      "/document/level-2/": [
        {
          text: "进阶技巧",
          isGroup: true,
          children: [
            "/document/level-2/transparent_proxy/transparent_proxy.md",
            "/document/level-2/tproxy.md",
            "/document/level-2/iptables_gid.md",
            "/document/level-2/redirect.md",
          ],
        },
      ],
    },
    themePlugins: {
      git: process.env.NODE_ENV === "production",
    },
  },
  markdown: {
    toc: {
      level: [2],
    },
  },
  extendsMarkdown: (md) => {
    md.use(require("markdown-it-footnote"));
  },
  bundlerConfig: {
    chainWebpack: (config) => {
      config.module
        .rule("webp")
        .test(/\.(webp)(\?.*)?$/)
        .use("file-loader")
        .loader("file-loader")
        .options({
          name: `assets/img/[name].[hash:8].[ext]`,
        });
    },
  },
  //postcss: { plugins: [require("autoprefixer")] }
});
