---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Project X
  text: Xray-core
  tagline: 不畏浮云遮望眼 · 金睛如炬耀苍穹
  image:
    src: /img-project-x.png
    alt: Xray, Penetrates Everything
  actions:
    - theme: brand
      text: 快速上手
      link: /document/
    - theme: alt
      text: 配置指南
      link: /config/
    - theme: alt
      text: 赞助 & 捐款 & NFTs
      link: /about/sponsor.md

features:
  - title: 原创协议
    icon: 📄
    details: VLESS、XTLS、XUDP、XHTTP、REALITY 等原创协议，覆盖代理、流控、复用、传输与安全等各个层面
  - title: 强大路由
    icon: 🔀
    details: 灵活的路由与 DNS 系统，支持按域名、IP、端口、协议、进程、用户等条件细粒度调度流量
  - title: 流量伪装
    icon: 🎭
    details: VLESS 回落、REALITY、XTLS 流控与 FinalMask 等方案，从多个层面降低流量特征并增强抗探测能力
  - title: 自由组合
    icon: 🧩
    details: 代理协议、流控模式、传输层与路由系统可自由组合，灵活适配不同场景
  - title: 超低占用
    icon: 📊
    details: VLESS 摆脱冗余加密、Splice 降低转发开销，OpenWRT、树莓派等低功耗设备皆可使用
  - title: 社区共建
    icon: 💖
    details: 活跃的社区讨论及贡献，MPL 2.0 开源许可协议
---

## XTLS ? Xray ? V2Ray ?

> **XTLS are brilliant ideas for TLS we study, while Xray is the best practice we maintain.**

- Xray-core 最初源自 v2ray-core，但已经长期独立演进；不应再将其视为与 v2ray-core 完全兼容的替代品。
  - 只有一个可执行文件，含 ctl 的功能，run 为默认指令
  - 部分配置结构和使用习惯与 v2ray-core 接近，但环境变量、API 前缀及诸多特性已经不同
  - 全平台开放了裸协议的 ReadV
  - 提供完整的 VLESS、XTLS Vision 与 REALITY 支持
  - 提供了 XTLS 多种流控模式，在合适场景下可结合 Splice 获得极高性能

### 我们是谁？

> **It doesn't matter who we are. What matters is that we will keep riding and never look back.**

### 帮助 Xray 变得更强

欢迎帮助 Xray 变得更强！

- 🖥️ 帮助开发和测试 Xray, 提交高质量的 Pull Request.
- 📩 在 [GitHub Issues](https://github.com/XTLS/Xray-core/issues) 或 [讨论区](https://github.com/XTLS/Xray-core/discussions)发起建设性或有意义的 issue 与 discussion.
- 📝 写下您的使用心得并提交至 Xray 的 [文档网站](https://github.com/XTLS/Xray-docs-next).
- 💬 在 Telegram 群帮助群友/灌水.
- **...事实上,每一份对 Xray 的支持都会让 Xray 变得更强大.**

### Telegram

- [Project X 交流群](https://t.me/projectXray)
  - 中文 / English 用户群。主要群聊。

- [Project VLESS 交流群](https://t.me/projectVless)
  - Russian 用户群。 [Project X](https://t.me/projectXray) 的姊妹群。

- [Project XHTTP 交流群](https://t.me/projectXHTTP)
  - Persian 用户群。 [Project X](https://t.me/projectXray) 的姊妹群。

- [Project X 频道](https://t.me/projectXtls)
  - 发布 Project X 的资讯。

### 致谢

- 感谢所有人的支持！
- 感谢各类脚本、Docker 镜像、客户端支持...感谢所有帮忙完善生态的大佬们！
- 感谢为 Xray 网站和文档添砖加瓦的朋友们.
- 感谢提出有意义的建议和意见的朋友们.
- 感谢 Telegram 群每一位帮助群友的朋友.

### 更多关于 Project X

- 如果你想知道更多关于 Project X 的足迹与成长, 请点击[这里](./about/news.md)
- 现在 Project X 也发行 NFT 了！如果想拥有一枚 Project X NFT 或者想捐赠或者赞助 Project X，请点击[这里](https://github.com/XTLS/Xray-core/discussions/3633)

### License

[Mozilla Public License Version 2.0](https://github.com/XTLS/Xray-core/blob/main/LICENSE)

### Stargazers over time

[![Stargazers over time](https://starchart.cc/XTLS/Xray-core.svg?variant=adaptive)](https://starchart.cc/XTLS/Xray-core)
