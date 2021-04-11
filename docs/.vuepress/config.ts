import { defineUserConfig, DefaultThemeOptions } from "vuepress";
import * as sidebar from "./config/sidebar";
import * as navbar from "./config/navbar";
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
    docsRepo: "xtls/Xray-docs-next",
    docsDir: "docs",
    docsBranch: "main",
    editLinks: true,
    enableToggle: true,

    themePlugins: {
      git: process.env.NODE_ENV === "production",
    },
    locales: {
      "/": {
        ToggleText: "切换主题",
        repoLabel: "查看源码",
        editLinkText: "帮助我们改善此页面！",
        sidebar: {
          "/config/": sidebar.getConfigSidebar(
            "特性详解",
            "基础配置",
            "入站代理",
            "出站代理",
            "底层传输",
            "/config/"
          ),
          "/document/level-0/": sidebar.getDocumentLv0Sidebar(
            "小小白白话文",
            "/document/level-0/"
          ),
          "/document/level-1/": sidebar.getDocumentLv1Sidebar(
            "入门技巧",
            "/document/level-1/"
          ),
          "/document/level-2/": sidebar.getDocumentLv2Sidebar(
            "进阶技巧",
            "/document/level-2/"
          ),
          "/development/": sidebar.getDevelopmentSidebar(
            "开发指南",
            "协议详解",
            "/development/"
          ),
        },
        navbar: navbar.hans,
      },
    },
  },
  head: [["link", { rel: "icon", href: `/logo.png` }]],
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
