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
        docsDir: 'docs',
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
                {
                    title: '入站代理',
                    collapsable: false,
                    path: '/config/inbounds/',
                    children: [
                        'inbounds/dokodemo',
                        'inbounds/http',
                        'inbounds/shadowsocks',
                        'inbounds/socks',
                        'inbounds/trojan',
                        'inbounds/vless',
                        'inbounds/vmess'
                    ]
                },
                {
                    title: '出站代理',
                    collapsable: false,
                    path: '/config/outbounds/',
                    children: [
                        'outbounds/blackhole',
                        'outbounds/dns',
                        'outbounds/freedom',
                        'outbounds/http',
                        'outbounds/shadowsocks',
                        'outbounds/socks',
                        'outbounds/trojan',
                        'outbounds/vless',
                        'outbounds/vmess'
                    ]
                },
                {
                    title: '底层传输',
                    collapsable: false,
                    path: '/config/transports/',
                    children: [
                        'transports/grpc',
                        'transports/h2',
                        'transports/mkcp',
                        'transports/quic',
                        'transports/tcp',
                        'transports/websocket'
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
