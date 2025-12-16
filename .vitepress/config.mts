import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "Project X",
  description: "Xray-core",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "首页", link: "/" },
      { text: "大史记", link: "/about/news.md" },
      { text: "配置指南", link: "/config/" },
      { text: "开发指南", link: "/development/" },
      { text: "使用指南", link: "/document/" },
    ],

    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/XTLS/Xray-core" },
    ],

    footer: {
      message: "根据 CC-BY-SA 4.0 许可协议授权",
      copyright: "版权所有 © 2020-至今 Project X 社区",
    },
  },

  locales: {
    root: {
      label: "简体中文",
      lang: "cn",
    },

    en: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Homepage", link: "/en" },
          { text: "The Great Chronicles", link: "/en/about/news.md" },
          { text: "Config Reference", link: "/en/config/" },
          { text: "Developer Guide", link: "/en/development/" },
          { text: "Quick Start", link: "/en/document/" },
        ],

        sidebar: [
          {
            text: "Examples",
            items: [
              { text: "Markdown Examples", link: "/markdown-examples" },
              { text: "Runtime API Examples", link: "/api-examples" },
            ],
          },
        ],

        footer: {
          message: "Licensed under CC-BY-SA 4.0",
          copyright: "Copyright © 2020-Present Project X Community",
        },
      },
    },

    ru: {
      label: "Русский",
      lang: "ru",
      themeConfig: {
        nav: [
          { text: "Главная", link: "/ru" },
          { text: "История сайта", link: "/ru/about/news.md" },
          { text: "Справочник по конфигурации", link: "/ru/config/" },
          { text: "Руководство разработчика", link: "/ru/development/" },
          { text: "Быстрый старт", link: "/ru/document/" },
        ],

        sidebar: [
          {
            text: "Examples",
            items: [
              { text: "Markdown Examples", link: "/markdown-examples" },
              { text: "Runtime API Examples", link: "/api-examples" },
            ],
          },
        ],

        footer: {
          message: "Лицензия CC-BY-SA 4.0",
          copyright:
            "Авторские права 2020-настоящее время Сообщество Project X",
        },
      },
    },
  },
});
