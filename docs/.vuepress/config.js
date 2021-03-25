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
            { text: '使用指南', link: '/document/' },
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
            '/config/basis/': [
                {
                    title: '基础配置',
                    collapsable: false,
                    children: [
                        'api',
                        'dns',
                        'fakedns',
                        'inbound',
                        'outbound',
                        'policy',
                        'reverse',
                        'routing',
                        'stats',
                        'transport'
                    ]
                },
                {
                    title: '入站代理',
                    path: '/config/inbounds/',
                },
                {
                    title: '出站代理',
                    path: '/config/outbounds/',
                },
                {
                    title: '底层传输',
                    path: '/config/transports/',
                },

            ],
            '/config/': [
                {
                    title: '特性详解',
                    collapsable: false,
                    children: [
                        'features/vless',
                        'features/xtls',
                        'features/fallback',
                        'features/env',
                        'features/multiple'
                    ]
                },
                {
                    title: '基础配置',
                    path: '/config/',
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
            '/document/level-0/': [
                'ch01-preface',
                'ch02-preparation',
                'ch03-ssh',
                'ch04-security',
                'ch05-webpage',
                'ch06-certificates',
                'ch07-xray-server',
                'ch08-xray-clients',
                'ch09-appendix',
            ],
            '/': 'auto',
        }
    },
    markdown: {
        toc: {
            includeLevel: [2]
        },
        extendMarkdown: md => {
            md.use(require('markdown-it-footnote'))
        }
    },
    chainWebpack: (config) => {
        config.module
	    .rule('webp')
	        .test(/\.(webp)(\?.*)?$/)
	        .use('file-loader')
	            .loader('file-loader')
	            .options({
                        name: `assets/img/[name].[hash:8].[ext]`
                    })
    }
}
