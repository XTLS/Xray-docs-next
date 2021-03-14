module.exports = {
    plugins: [
        '@vuepress/back-to-top'
    ],
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'Project X',
            description: 'Xray 官方文档'
        }
    },
    themeConfig: {
        displayAllHeaders: true,
        smoothScroll: true,
        repo: 'xtls/xray-core',
        repoLabel: '查看源码',
        docsRepo: 'xtls/xtls.github.io',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        nav: [
            { text: '首页', link: '/' },
            { text: '大史记', link: '/about/news' },
            { text: '经典文档', link: 'https://xtls.github.io' },
            { text: '下载核心', link: 'https://github.com/XTLS/Xray-core/releases' },
            {
                text: '多语言',
                ariaLabel: 'Language Menu',
                items: [
                    { text: '简体中文', link: '/' },
                    { text: 'English', link: '/en' }
                ]
            },

        ],
    },
    markdown: {
        toc: {
            includeLevel: [2]
        }
    }
}