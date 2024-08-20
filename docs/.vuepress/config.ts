import { viteBundler } from "@vuepress/bundler-vite";
import { webpackBundler } from "@vuepress/bundler-webpack";
// import { UserConfig, defineUserConfig } from "@vuepress/cli";
import { UserConfig, defineUserConfig } from "vuepress/cli";
import { searchPlugin } from "@vuepress/plugin-search";
import markdownItFootnote from "markdown-it-footnote";
import theme from './theme.js'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import process from 'node:process'
// import { getDirname, path } from '@vuepress/utils'
import { getDirname, path } from 'vuepress/utils'
import { MermaidPlugin } from './plugins/mermaid/node/mermaid'
import i18nPlugin from "vuepress-plugin-i18n";

const __dirname = getDirname(import.meta.url)
console.log('>>> __dirname -> ', __dirname)
const isProduction = process.env.NODE_ENV === "production";
const useVite = process.env.XRAY_DOCS_USE_VITE === "true";

console.log(
  "bundler:",
  isProduction && !useVite ? "@vuepress/webpack" : "@vuepress/vite"
);

export default defineUserConfig(<UserConfig>{
  plugins: [
    i18nPlugin({
      updatedTime: "git",
      translationGuide: "https://github.com/XTLS/Xray-docs-next",
      locales: {
        en: {
          lang: "en-US",
          untranslated: {
            title: "Untranslated"
          },
          outdated: {
            title: "Outdated"
          }
        }
      }
    }),
    searchPlugin({
      locales: {
        "/": {
          placeholder: "搜索",
        },
      },
    }),
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './theme/components'),
    }),
  ],
  base: "/",
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
    "/ru/": {
      lang: "ru-RU",
      title: "Project X",
      description: "Официальная документация Xray",
    },
  },
  theme,
  head: [["link", { rel: "icon", href: `/logo.png` }]],
  markdown: {
    toc: {
      level: [2],
    },
  },
  extendsMarkdown: (md) => {
    md.use(markdownItFootnote);
    md.use(MermaidPlugin);
  },
  bundler:
    process.env.DOCS_BUNDLER === "webpack" ? webpackBundler() : viteBundler(),
});
