import { defineConfig } from "vitepress";
import llmstxt from "vitepress-plugin-llms";
import { MermaidMarkdown, MermaidPlugin } from "vitepress-plugin-mermaid";

import { nav as nav } from "./menus/nav.mts";
import { nav as nav_en } from "./menus/nav.en.mts";
import { nav as nav_ru } from "./menus/nav.ru.mts";
import { sidebar as sidebar } from "./menus/sidebar.mts";
import { sidebar as sidebar_en } from "./menus/sidebar.en.mts";
import { sidebar as sidebar_ru } from "./menus/sidebar.ru.mts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",

  title: "Project X",
  description: "Xray-core",
  head: [["link", { rel: "icon", href: "/logo.png" }]],

  lastUpdated: true,

  ignoreDeadLinks: false,

  sitemap: {
    hostname: "https://xtls.github.io",
  },

  markdown: {
    lineNumbers: true,

    theme: {
      dark: "dark-plus",
      light: "light-plus",
    },

    attrs: { leftDelimiter: "{:" },

    config(md) {
      md.use(MermaidMarkdown);
    },
  },
  vite: {
    plugins: [llmstxt({ ignoreFiles: ["en/**", "ru/**"] }), MermaidPlugin()],
    optimizeDeps: {
      include: ["mermaid"],
    },
    ssr: {
      noExternal: ["mermaid"],
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: nav,

    search: {
      provider: "local",
      options: {
        detailedView: true,
        miniSearch: {
          options: {
            tokenize: (str) => str.split(/[\s,，。、]+/),
          },
        },
        translations: {
          button: {
            buttonText: "搜索",
            buttonAriaLabel: "搜索",
          },
          modal: {
            displayDetails: "显示详细列表",
            resetButtonTitle: "清除查询条件",
            backButtonTitle: "关闭搜索",
            noResultsText: "无法找到相关结果",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭",
            },
          },
        },
      },
    },

    darkModeSwitchLabel: "深色模式",
    darkModeSwitchTitle: "切换至深色主题",
    lightModeSwitchTitle: "切换至浅色主题",
    sidebarMenuLabel: "目录",
    returnToTopLabel: "返回至顶部",

    externalLinkIcon: true,

    outline: {
      level: [2, 4],
      label: "页面导航",
    },

    sidebar: sidebar,

    socialLinks: [
      { icon: "github", link: "https://github.com/XTLS/Xray-core" },
    ],

    editLink: {
      pattern: "https://github.com/XTLS/Xray-docs-next/edit/main/docs/:path",
      text: "帮助我们改善此页面！",
    },

    lastUpdated: {
      text: "最近更改",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    footer: {
      message: "根据 CC-BY-SA 4.0 许可协议授权",
      copyright: "版权所有 © 2020-至今 Project X 社区",
    },
  },

  locales: {
    root: {
      label: "简体中文",
      lang: "zh",
    },

    en: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: nav_en,

        search: {
          options: {
            miniSearch: {
              options: {
                tokenize: (str) =>
                  str
                    .split(/[\s.,;!?'"(){}[\]\-_+=&%$#@~`^<>|\\]+/)
                    .filter(Boolean),
              },
            },
            translations: {
              button: {
                buttonText: "Search",
                buttonAriaLabel: "Search",
              },
              modal: {
                displayDetails: "Show detailed list",
                resetButtonTitle: "Clear search query",
                backButtonTitle: "Close search",
                noResultsText: "No results found for",
                footer: {
                  selectText: "Select",
                  navigateText: "Navigate",
                  closeText: "Close",
                },
              },
            },
          },
        },

        darkModeSwitchLabel: "Appearance",
        darkModeSwitchTitle: "Switch to dark theme",
        lightModeSwitchTitle: "Switch to light theme",
        sidebarMenuLabel: "Menu",
        returnToTopLabel: "Return to top",

        outline: {
          label: "On this page",
        },

        sidebar: sidebar_en,

        editLink: {
          text: "Help us improve this page on GitHub!",
        },

        lastUpdated: {
          text: "Last Updated",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },

        docFooter: {
          prev: "Previous page",
          next: "Next page",
        },

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
        nav: nav_ru,

        search: {
          options: {
            miniSearch: {
              options: {
                tokenize: (str) =>
                  str
                    .split(/[\s.,;!?'"(){}[\]\-_+=&%$#@~`^<>|\\]+/)
                    .filter(Boolean),
              },
            },
            translations: {
              button: {
                buttonText: "Поиск",
                buttonAriaLabel: "Поиск",
              },
              modal: {
                displayDetails: "Показать подробный список",
                resetButtonTitle: "Очистить запрос",
                backButtonTitle: "Закрыть поиск",
                noResultsText: "Результаты не найдены",
                footer: {
                  selectText: "Выбрать",
                  navigateText: "Переключить",
                  closeText: "Закрыть",
                },
              },
            },
          },
        },

        darkModeSwitchLabel: "Внешний вид",
        darkModeSwitchTitle: "Переключиться на тёмную тему",
        lightModeSwitchTitle: "Переключиться на светлую тему",
        sidebarMenuLabel: "Меню",
        returnToTopLabel: "Вернуться наверх",

        outline: {
          label: "Содержание страницы",
        },

        sidebar: sidebar_ru,

        editLink: {
          text: "Помогите нам улучшить эту страницу!",
        },

        lastUpdated: {
          text: "Последние изменения",
          formatOptions: {
            dateStyle: "short",
            timeStyle: "short",
          },
        },

        docFooter: {
          prev: "Предыдущая страница",
          next: "Следующая страница",
        },

        footer: {
          message: "Лицензия CC-BY-SA 4.0",
          copyright:
            "Авторские права 2020-настоящее время Сообщество Project X",
        },
      },
    },
  },
});
