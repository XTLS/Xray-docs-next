module.exports = {
    plugins: [
        '@vuepress/back-to-top'
    ],
    base: '/Xray-docs-next/',
    locales: {
        '/': {
            lang: 'zh-CN',
            title: 'Project X',
            description: 'Xray 官方文档'
        }
    },
    themeConfig: {
        smoothScroll: true,
        repo: 'xtls/xray-core',
        repoLabel: '查看源码',
        docsRepo: 'xtls/Xray-docs-next',
        docsBranch: 'main',
        editLinks: true,
        editLinkText: '帮助我们改善此页面！',
        nav: [
            { text: '首页', link: '/' },
            { text: '大史记', link: '/about/news' },
            { text: '配置指南', link: '/config/' },
            { text: '开发指南', link: '/development/' },
            { text: '使用指南', link: '/usage/' },
            {
                text: '多语言',
                ariaLabel: 'Language Menu',
                items: [
                    { text: '简体中文', link: '/' },
                    { text: 'English', link: '/en' }
                ]
            },

        ],
        sidebar: {
            '/config/': [
                {
                    title: '示例配置',
                    collapsable: false,
                    children: [
                        'examples/vless',
                        'examples/xtls',
                        'examples/fallback',
                        'examples/env',
                        'examples/multiple'
                    ]
                },
            ],
            '/': 'auto',
        }
    },
    markdown: {
        toc: {
            includeLevel: [2]
        }
    }
}
