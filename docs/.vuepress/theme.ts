import { defaultTheme } from '@vuepress/theme-default'
// import { path, getDirname } from '@vuepress/utils'
import { path, getDirname } from 'vuepress/utils'
import process from 'node:process'
import { navbarEn, navbarZh, navbarRu, sidebarEn, sidebarZh, sidebarRu } from './config/index.js'

let __dirname = getDirname(import.meta.url)
const isProduction = process.env.NODE_ENV === 'production'

export default defaultTheme({
  name: 'vuepress-theme-xray',
  smoothScroll: true,
  repo: 'xtls/xray-core',
  docsDir: 'docs',
  docsRepo: 'xtls/Xray-docs-next',
  docsBranch: 'main',
  editLinks: true,
  enableToggle: true,
  locales: {
    '/': {
      navbar: navbarZh,
      sidebar: sidebarZh,
      repoLabel: '查看源码',
      editLinkText: '帮助我们改善此页面！',
      tip: '提示',
      warning: '注意',
      danger: '警告',
      lastUpdatedText: '最近更改',
      selectLanguageName: '简体中文',
      selectLanguageText: '🌏 简体中文 / Change language',
      selectLanguageAriaLabel: '简体中文 / Change language',
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
      selectLanguageText: '🌎 English / Change language',
      selectLanguageAriaLabel: 'English / Change language',
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
    '/ru/': {
      navbar: navbarRu,
      sidebar: sidebarRu,
      repoLabel: 'Посмотреть исходный код', 
      editLinkText: 'Помогите нам улучшить эту страницу!',
      tip: 'Подсказка',                
      warning: 'Внимание',             
      danger: 'Предупреждение',              
      lastUpdatedText: 'Последние изменения',     
      selectLanguageName: 'Русский',
      selectLanguageText: '🌍 Русский / Change language', 
      selectLanguageAriaLabel: 'Русский / Change language', 
      docsDir: 'docs',            
      backToHome: 'На главную',    
      openInNewWindow: 'Открыть в новой вкладке',
      toggleColorMode: 'Переключить цветовую схему', 
      toggleSidebar: 'Переключить боковую панель',  
    },
    // logo: '/logo.png',

    // sidebar: 'auto',

    themePlugins: {
      git: isProduction,
    },
  },
})
