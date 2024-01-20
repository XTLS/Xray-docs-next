import { viteBundler } from '@vuepress/bundler-vite'
import { webpackBundler } from '@vuepress/bundler-webpack'
import { defineUserConfig } from '@vuepress/cli'
import { searchPlugin } from '@vuepress/plugin-search'
import markdownItFootnote from 'markdown-it-footnote'
import theme from './theme.js'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { getDirname, path } from '@vuepress/utils'
import process from 'node:process'

const __dirname = getDirname(import.meta.url)
const isProduction = process.env.NODE_ENV === 'production'

let forMainRepo = process.env.XRAY_DOCS_MAIN_REPO === 'true'
const useVite = process.env.XRAY_DOCS_USE_VITE === 'true'

forMainRepo = true
console.log('base:', forMainRepo ? '/' : '/Xray-docs-next/')
console.log(
  'bundler:',
  isProduction && !useVite ? '@vuepress/webpack' : '@vuepress/vite',
)

export default defineUserConfig({
  base: forMainRepo ? '/' : '/Xray-docs-next/',
  head: [['link', { rel: 'icon', href: `/logo.png` }]],
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Project X',
      description: 'Xray 官方文档',
    },
    '/en/': {
      lang: 'en-US',
      title: 'Project X',
      description: 'Official document of Xray',
    },
  },
  theme,

  markdown: {
    toc: {
      level: [2],
    },
    // headers: {
    //   level: [2, 3],
    // },
  },
  extendsMarkdown: (md) => {
    md.use(markdownItFootnote)
    // md.use(MermaidPlugin);
    // md.use(mermaidWrapperPlugin)
  },
  plugins: [
    searchPlugin({
      locales: {
        '/': {
          placeholder: '搜索',
        },
      },
    }),
    // mdEnhancePlugin({
    //   mermaid: true,
    // })
    registerComponentsPlugin({
      componentsDir: path.resolve(__dirname, './components'),
    }),
  ],
  bundler:
    process.env.DOCS_BUNDLER === 'webpack' ? webpackBundler() : viteBundler(),
})
