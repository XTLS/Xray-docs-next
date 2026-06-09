import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.Config["nav"] = [
  { text: "首页", link: "/" },
  {
    text: "配置指南",
    activeMatch: "^/config/",
    items: [
      {
        text: "特性详解",
        link: "/config/features/",
        activeMatch: "^/config/features/"
      },
      {
        text: "基础配置",
        link: "/config/",
        activeMatch: "^/config/[^/]*$"
      },
      {
        text: "入站协议",
        link: "/config/inbounds/",
        activeMatch: "^/config/inbounds/"
      },
      {
        text: "出站协议",
        link: "/config/outbounds/",
        activeMatch: "^/config/outbounds/"
      },
      {
        text: "传输配置",
        link: "/config/transports/",
        activeMatch: "^/config/transports/"
      }
    ]
  },
  {
    text: "使用指南",
    activeMatch: "^/document/",
    items: [
      {
        text: "快速入门",
        link: "/document/",
        activeMatch: "^/document/[^/]*$"
      },
      {
        text: "小小白白话文",
        link: "/document/level-0/",
        activeMatch: "^/document/level-0/"
      },
      {
        text: "入门技巧",
        link: "/document/level-1/",
        activeMatch: "^/document/level-1/"
      },
      {
        text: "进阶技巧",
        link: "/document/level-2/",
        activeMatch: "^/document/level-2/"
      }
    ]
  },
  {
    text: "开发指南",
    link: "/development/",
    activeMatch: "^/development/"
  },
  { text: "赞助 & 捐款 & NFTs", link: "/about/sponsor.md" }
]
