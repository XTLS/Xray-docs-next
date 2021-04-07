import { NavbarConfig } from "@vuepress/theme-default/lib/types/nav";

export const hans: NavbarConfig = [
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
];
