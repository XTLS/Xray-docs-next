import { defaultTheme } from '@vuepress/theme-default'
import { path, getDirname } from '@vuepress/utils'
import process from 'node:process'
import { navbarEn, navbarZh, sidebarEn, sidebarZh } from './configs/index.js'

let __dirname = getDirname(import.meta.url)
const isProduction = process.env.NODE_ENV === 'production'
console.log('>>> __dirname --> ', __dirname)

export default defaultTheme({
  // name: 'vuepress-theme-xray',
  // logo: '/logo.png',
  // smoothScroll: true,
  repo: 'xtls/xray-core',
  docsDir: 'docs',
  locales: {
    '/': {
      // navbar
      navbar: navbarZh,
      // sidebar
      sidebar: sidebarZh,
      repoLabel: '查看源码',
      editLinkText: '帮助我们改善此页面！',
      tip: '提示',
      warning: '注意',
      danger: '警告',
      lastUpdatedText: '最近更改',
      selectLanguageName: '简体中文',
      selectLanguageText: '多语言',
      selectLanguageAriaLabel: '多语言',
      docsDir: 'docs',
      backToHome: 'back to home',
      openInNewWindow: 'open in new tag',
      toggleColorMode: 'toggle color mode',
      toggleSidebar: 'toggle side bar',
    },
    '/en/': {
      // TODO: translation
      sidebar: sidebarEn,
      navbar: navbarEn,
      selectLanguageName: 'English (WIP)',
      selectLanguageText: 'Multiple language',
      selectLanguageAriaLabel: 'Multiple language',
      editLinkText: 'Help us improve this page on GitHub！',
      lastUpdatedText: 'Last Updated',
      contributorsText: 'contributors',
      // repoLabel: 'Source',
      tip: 'Tip',
      warning: 'Warning',
      danger: 'Danger',

      // 404 page
      notFound: [
        '这里什么都没有',
        '我们怎么到这来了？',
        '这是一个 404 页面',
        '看起来我们进入了错误的链接',
      ],
      backToHome: 'back to home',
      openInNewWindow: 'open in new tag',
      toggleColorMode: 'toggle color mode',
      toggleSidebar: 'toggle side bar',
    },
    docsRepo: 'xtls/Xray-docs-next',
    docsBranch: 'main',
    editLinks: true,
    enableToggle: true,
    smoothScroll: true,
    // logo: '/logo.png',

    // sidebar: 'auto',

    themePlugins: {
      git: isProduction,
    },
  },
})
