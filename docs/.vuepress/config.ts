import { defineUserConfig } from "@vuepress/cli";
import type { DefaultThemeOptions } from "@vuepress/theme-default";
import * as sidebar from "./config/sidebar";
import * as navbar from "./config/navbar";
import * as path from "path";

const isProduction = process.env.NODE_ENV === "production";
const forMainRepo = process.env.XRAY_DOCS_MAIN_REPO === "true";
const useVite = process.env.XRAY_DOCS_USE_VITE === "true";

console.log("base:", forMainRepo ? "/" : "/Xray-docs-next/");
console.log(
  "bundler:",
  isProduction && !useVite ? "@vuepress/webpack" : "@vuepress/vite"
);

export default defineUserConfig<DefaultThemeOptions>({
  theme: path.join(__dirname, "./theme"),
  plugins: [
    [
      "@vuepress/plugin-search",
      {
        locales: {
          "/": {
            placeholder: "搜索",
          },
        },
      },
    ],
    ["@vuepress/plugin-debug", !isProduction],
  ],
  base: forMainRepo ? "/" : "/Xray-docs-next/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "Project X",
      description: "Xray 官方文档",
    },
    "/en/": {
      lang: "en-US",
      title: "Project X",
      description: "Official document of Xray",
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
      git: isProduction,
    },
    locales: {
      "/": {
        repoLabel: "查看源码",
        editLinkText: "帮助我们改善此页面！",
        tip: "提示",
        warning: "注意",
        danger: "警告",
        lastUpdatedText: "最近更改",
        selectLanguageName: "简体中文",
        selectLanguageText: "多语言",
        selectLanguageAriaLabel: "多语言",
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
      "/en/": {
        repoLabel: "Source",
        selectLanguageName: "English (WIP)",
        // TODO: translation
        sidebar: {
          "/en/config/": sidebar.getConfigSidebar(
            "特性详解",
            "基础配置",
            "入站代理",
            "出站代理",
            "底层传输",
            "/en/config/"
          ),
          "/en/document/level-0/": sidebar.getDocumentLv0Sidebar(
            "小小白白话文",
            "/en/document/level-0/"
          ),
          "/en/document/level-1/": sidebar.getDocumentLv1Sidebar(
            "入门技巧",
            "/en/document/level-1/"
          ),
          "/en/document/level-2/": sidebar.getDocumentLv2Sidebar(
            "进阶技巧",
            "/en/document/level-2/"
          ),
          "/en/development/": sidebar.getDevelopmentSidebar(
            "开发指南",
            "协议详解",
            "/en/development/"
          ),
        },
        navbar: navbar.en,
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
  bundler: isProduction && !useVite ? "@vuepress/webpack" : "@vuepress/vite",
});
