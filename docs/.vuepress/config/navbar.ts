import { NavbarConfig } from "@vuepress/theme-default";

export const hans: NavbarConfig = [
  { text: "首页", link: "/" },
  { text: "大史记", link: "/about/news.md" },
  { text: "配置指南", link: "/config/" },
  { text: "开发指南", link: "/development/" },
  { text: "使用指南", link: "/document/" },
];

// TODO: translation
export const en: NavbarConfig = [
  { text: "Homepage", link: "/en" },
  { text: "Website History", link: "/en/about/news.md" },
  { text: "Config Reference", link: "/en/config/" },
  { text: "Developer Guide", link: "/en/development/" },
  { text: "Quick Start", link: "/en/document/" },
];
