import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.Config["nav"] = [
  { text: "Главная", link: "/ru" },
  {
    text: "Описание функций",
    activeMatch: "^/ru/config/",
    items: [
      {
        text: "Обзор",
        link: "/ru/config/features/",
        activeMatch: "^/ru/config/features/"
      },
      {
        text: "Базовая конфигурация",
        link: "/ru/config/",
        activeMatch: "^/ru/config/[^/]*$"
      },
      {
        text: "Входящие подключения",
        link: "/ru/config/inbounds/",
        activeMatch: "^/ru/config/inbounds/"
      },
      {
        text: "Исходящие подключения",
        link: "/ru/config/outbounds/",
        activeMatch: "^/ru/config/outbounds/"
      },
      {
        text: "Конфигурация транспорта",
        link: "/ru/config/transports/",
        activeMatch: "^/ru/config/transports/"
      }
    ]
  },
  {
    text: "Руководство по использованию",
    activeMatch: "^/ru/document/",
    items: [
      {
        text: "Быстрый старт",
        link: "/ru/document/",
        activeMatch: "^/ru/document/[^/]*$"
      },
      {
        text: "Простыми словами",
        link: "/ru/document/level-0/",
        activeMatch: "^/ru/document/level-0/"
      },
      {
        text: "Базовые навыки",
        link: "/ru/document/level-1/",
        activeMatch: "^/ru/document/level-1/"
      },
      {
        text: "Продвинутые навыки",
        link: "/ru/document/level-2/",
        activeMatch: "^/ru/document/level-2/"
      }
    ]
  },
  {
    text: "Руководство разработчика",
    link: "/ru/development/",
    activeMatch: "^/ru/development/"
  },
  { text: "Sponsor & Donation & NFTs", link: "/ru/about/sponsor.md" }
]
