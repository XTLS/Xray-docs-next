import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  { text: "Главная", link: "/ru" },
  { text: "Sponsor & Donation & NFTs", link: "/ru/about/sponsor.md" },
  {
    text: "Описание функций",
    items: [
      { text: "Обзор", link: "/ru/config/features/" },
      { text: "Базовая конфигурация", link: "/ru/config/" },
      { text: "Входящие подключения", link: "/ru/config/inbounds/" },
      { text: "Исходящие подключения", link: "/ru/config/outbounds/" },
      { text: "Транспортный уровень", link: "/ru/config/transports/" },
    ],
  },
  {
    text: "Руководство по использованию",
    items: [
      { text: "Быстрый старт", link: "/ru/document/" },
      {
        text: "Простыми словами",
        link: "/ru/document/level-0/",
      },
      { text: "Базовые навыки", link: "/ru/document/level-1/" },
      { text: "Продвинутые навыки", link: "/ru/document/level-2/" },
    ],
  },
  { text: "Руководство разработчика", link: "/ru/development/" },
];
