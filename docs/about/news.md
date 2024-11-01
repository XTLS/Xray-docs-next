---
sidebar: auto
---

# 大史记

## 2024.10.31 <badge>[24.10.31](https://github.com/XTLS/Xray-core/releases/tag/v24.10.31)</badge>

万圣节快乐！ 🎃

本次万圣节可是有礼物和小糖果的喔~欢迎拆开品尝~ 🎁

~~SplitHTTP 进化为 XHTTP，而且现在更有上下行分离的能力了！毫无疑问 XHTTP 又开启了一个崭新的时代。~~

## 2024.10.24

现在只列出能安全配置的面板。明文 HTTP 问题不能轻视。

## 2024.10.18

昨天已售出第一个 0.15 ETH 的 Project X NFT，感谢支持！别忘了买得越早越便宜喔。

REALITY NFT 预计有一万个（送两个），0.01 ETH 一个，以便作为日常捐款途径。

## 2024.10.4

为什么会有在公网用 http://ip 来管理面板的？不，这不应该……

安全起见，这类配置用的工具应该用 HTTPS 或者 SSH 转发来[保证安全](https://t.me/projectXtls/358)。

## 2024.10.3

v24.9.30 被设为 latest 已经快一天了，根本没看到有人抱怨问题 ~~，说明那些被删掉的东西真的没人用~~。🤡

## 2024.9.30 <badge>[24.9.30](https://github.com/XTLS/Xray-core/releases/tag/v24.9.30)</badge>

更改版本号规则之后的第一次发稳定版！

作为更改版本号后的开山第一版：

- SplitHTTP 加入了 XMUX 控制
- HTTP 传输层加入了 HTTP/3
- 传输层的 TCP 更名为 RAW （现在变得更合理了）
- Freedom 出站的 UDP Noises
- **注意**：该版本移除了大量的过时配置代码，升级前请根据文档严格检查配置文件避免意外喔。

## 2024.9.28

入群问题真的公认的难。

不过人不在多而在精，考验的就是独立查找问题答案的能力 ~~以及一点点运气~~，这样才能保持群的高质量交流。

珍惜留在群里的资格不要违规喔。

## 2024.9.24

提醒：价格为 0.1 ETH 的 Project X NFT 仅剩一个，此后价格为 0.15 ETH 起步。

## 2024.9.17

姊妹群组 Project X 成员数达到 1000。

感谢来自非中文世界的支持！

- XHTTP 和 XgRPC 是什么？

## 2024.9.12

大史记重出江湖？！

## 2024.9.7 <Badge>[v24.9.7](https://github.com/XTLS/Xray-core/releases/tag/v24.9.7)</Badge>

更改版本号之后的首次发版。

- 这次移除了 QUIC 以及 DomainSocket 传输，移除了两处远古配置遗留代码。
  - 二进制大小比 v1.8.24 减小了 1MB。
- 依然有每次必备的 bug 修复。

## 2024.9.6

Xray-core 能使用 JSON 格式订阅吗？提案[在此](https://github.com/XTLS/Xray-core/discussions/3765)。

## 2024.8.30 <Badge>[v1.8.24](https://github.com/XTLS/Xray-core/releases/tag/v1.8.24)</Badge>

在等待 SplitHTTP multiplex controller 期间，main 分支已经积累了大量重要更新，所以我们决定先发一个版本。

- Socks 入站现在默认兼容 HTTP 代理请求。
- UDP noise (preview)
- 还有一些改进。

由于传统版本号的存在，为每个版本规划功能、进行排期已经严重阻碍了新功能的开发、合并、发布。所以我们决定从下个版本开始弃用传统的版本号，改用发版日期作为版本号，如 v24.8.30，并取消版本规划，全面采用流式更新，写好的功能直接合并，不再等待，预计每月月底发一个版本。

毕竟对于反审查软件来说，相较于传统的版本号，新功能的及时性、每月更新更为重要，而不是发一个功能确定的版本并长期维护。

下个版本会移除一些历史久远的代码，以后日常积累新代码、提醒迁移，跨年新版删代码、breaking。

我们相信有了各位的捐款以及对发版形式的革新，Xray-core 这个项目会发展得更好。

## 2024.8.26

Project VLESS 群组创立。

We have created [Project VLESS](https://t.me/projectVless) for non-Chinese users (mainly Russian).

## 2024.8.3

第一个 [Project X NFT](https://github.com/XTLS/Xray-core/discussions/3633) 正式发行！

就像 Xray 开创过很多历史一样，发行 NFT 也是这个领域前无古人的操作。这些 NFT 非常有纪念意义，甚至可以说是有历史意义，远大于现在的初始价格，假以时日它们必将价值连城。最后再次感谢大家对 Project X 的支持。

## 2024.7.29 <Badge>[v1.8.23](https://github.com/XTLS/Xray-core/releases/tag/v1.8.23)</Badge>

- 恭喜 [@mmmray](https://github.com/mmmray) 贡献了 Xray-core 的第 1000 个 commit！
- 优化了 SplitHTTP 上行的稳定性，服务端必须升级到该版本以支持新版客户端。
- 更多 SplitHTTP 上的变化。

## 2024.7.22 <Badge>[v1.8.21](https://github.com/XTLS/Xray-core/releases/tag/v1.8.21)</Badge>

中间似乎回到了最初的腹泻式发版状态……

正如 v1.8.16 所预告的，SplitHTTP 现已初步支持 HTTP/3（QUIC）。毫无疑问，SplitHTTP H3 已经开启了一个崭新的时代。

- SplitHTTP H3 是第一个完全基于标准 H3、支持套 CDN 的 QUIC 类代理，亦可用反代、Browser Dialer 来隐蔽自身。

## 2024.7.16

Project X 文档迎来了俄语版！感谢 [@iambabyninja](https://github.com/iambabyninja) 的翻译！

> Привет, друзья из России!

## 2024.7.15

通过已知信息以及努力，Xray-core 现在重新支持 Windows 7！在后续的发版中，Windows 7 用户下载名为 Xray-win7-32.zip 或 Xray-win7-64.zip 的压缩包解压即可享受，感谢大家的支持！具体使用方式请点[这里](../document/install.html)

虽然日后随着各方面升级 Windows 7 最终会离开，但是现在还是可以让这个时间来得稍微晚一些。

## 2024.6.18 <Badge>[v1.8.16](https://github.com/XTLS/Xray-core/releases/tag/v1.8.16)</Badge>

新传输来了，它目前叫 SplitHTTP。

- 实现进一步的流量混淆有两种刚好相反的方式：多路复用与拆分连接。
- 可以通过不支持 WebSocket、gRPC 的 CDN，实现与 Meek 相同的目标，且 SplitHTTP 比 Meek 更简单、效率更高。
- SplitHTTP 没有 WebSocket 的 ALPN 问题，这是一大优势，未来还会支持 HTTP/3（QUIC）。
- 另外 SplitHTTP 也已经加入分享链接套餐~

## 2024.6.2

一个新的传输方式正在被打造……

## 2024.4.26 <Badge>[v1.8.11](https://github.com/XTLS/Xray-core/releases/tag/v1.8.11)</Badge>

- 现在有了生成 ECH 密钥的工具。
- 增强、修复，并移除了一点不再使用的代码。

## 2024.4.20

我们现在有了 issues 模板，感谢 [@Fangliding](https://github.com/Fangliding) ！

## 2024.4.13

VLESS Seed 整备完毕，待势而发。

## 2024.3.18 <Badge>[v1.8.10](https://github.com/XTLS/Xray-core/releases/tag/v1.8.10)</Badge>

和 WebSocket 一样，HTTPUpgrade 也有 0-RTT 了。

## 2024.3.11 <Badge>[v1.8.9](https://github.com/XTLS/Xray-core/releases/tag/v1.8.9)</Badge>

新增 HTTPUpgrade 传输，听说比 WebSocket 要轻。

- 已加入分享链接套餐~

## 2024.2.29

gRPC 传输现在也有 Host 一样的配置字段了！它叫 `authority`。这下 gRPC 也能“域前置”了，没有 ALPN 问题。

## 2024.2.25 <Badge>[v1.8.8](https://github.com/XTLS/Xray-core/releases/tag/v1.8.8)</Badge>

- 现在 XUDP 流量统一使用 Vision 填充了，速来体验。
- 新增了 leastLoad balancer。
- 修复错误、优化性能……

## 2024.1.9

惊闻 Win7 无法运行新版 Xray-core？探索之下竟发现 Go 放弃了对 Win7 的支持。有什么办法能继续支持这个有些古老但是依然优雅的操作系统吗？

## 2023.11.21

发表在 USENIX 顶会的[论文](https://t.me/projectXtls/212)证实，XTLS Vision 已经达到它的设计目标。

而 XTLS 也不会止步于此，如 X 射线一般穿破高耸的围墙。

## 2023.11.18 <Badge>[v1.8.6](https://github.com/XTLS/Xray-core/releases/tag/v1.8.6)</Badge>

- WireGuard 现在也有了对应的入站。Freedom 出站也终于有了 splice。
- 现在出站的 domainStrategy 也得到了统一。
- 更多的美味小点心。
- 因为 ~~不可抗力~~ 功能变更，Dragonfly BSD 支持黯然离场。
- ~~我们真的要对一代经典 Windows 7 说再见了吗？~~

## 2023.9.30

为 v2rayNG 设计了全新的配色，安装最新的 Pre-release 版本即可体验。

## 2023.8.29 <Badge>[v1.8.4](https://github.com/XTLS/Xray-core/releases/tag/v1.8.4)</Badge>

1.8.x 在经过半年的打磨后终于来到了第一个认可的正式版了。

同样地，这次集成的改进也不少，速来品尝！

## 2023.7.22

又修好了一个 HTTP/2 传输的历史遗留断流问题。

## 2023.7.7

即将给 Vision 添加 Seed 支持。

## 2023.6.30

下一个 XTLS 流控：xtls-rprx-switch 🍪

- XTLS 的 0-RTT 已经预告几个月了，本来也是想保留神秘感。
- 对比现有的 XTLS Vision 和 Mux 有着更加不错的优势。

## 2023.6.27

[如何选取 REALITY 目标域名？来看这里助你事半功倍！](https://github.com/XTLS/Xray-core/discussions/2256#discussioncomment-6295296)

## 2023.6.19 <Badge>[v1.8.3](https://github.com/XTLS/Xray-core/releases/tag/v1.8.3)</Badge>

- 精简代码计划后的第一个版本，VMess (MD5)、MTProto 以及 Starlark 相关代码已被卸下。轻装上阵。
- 对代码进重构也是轻装上阵的一部分。
- 同时我们也没有忘记增添一些增强功能，还有修复漏洞。
- ~~v1.8.3 为今年的最后一个版本。~~

## 2023.6.6

好消息：下一个 XTLS 流控不叫 Vision。 🍪

## 2023.4.21

也许我们可以借助一下 [RealiTLScanner](https://github.com/XTLS/RealiTLScanner)……

## 2023.4.20

经过长年累月的开发，累积代码不计其数…… [精简代码计划](https://github.com/XTLS/Xray-core/discussions/1967) 被提出了！

## 2023.4.19

`xtls-0rtt-vision(-udp443)` 🍪

## 2023.4.18 <Badge>[v1.8.1](https://github.com/XTLS/Xray-core/releases/tag/v1.8.1)</Badge>

升级后的 XUDP 也来了！

- 现在 XUDP 也带有连接迁移、端口复用的特性，并且带有全局 Session ID ~~，麻麻再也不用担心意外断线的时候怎么办了~~ 。
- 同时我们也添加了 XUDP 的控制配置，让你能更好掌控它~
- 新的 XUDP 配合 XTLS Vision 食用风味更好喔~
- 惯例还有小甜点，欢迎品尝~

## 2023.4.6

XUDP 也在悄然升级……

## 2023.3.29

`PLUX protocol` 🍪

## 2023.3.19

对 REALITY 的分享链接标准也已经出现了。

## 2023.3.9 <Badge>[v1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)</Badge>

> THE NEXT FUTURE, REALITY is NOW release on Xray-core

REALITY 已经实装发版！欢迎体验！
XTLS Vision 也已经完善，请两端升级至最新版食用。

- 因为这次 Vision 填充算法改变，XTLS Vision 旧版和新版之间会存在兼容性问题。
- HTTP/2 传输也已经做了改善，现在使用新版即可纵享丝滑~
- 还有大量小改进欢迎体验~

## 2023.3.4

> Legends never die, they become a part of ~~you~~ VLESS.
>
> They simply fade away.

## 2023.3.2

HTTP/2 传输的一些遗留问题已经被改善，欢迎搭配 REALITY 测试纵享丝滑~

## 2023.2.16

THE NEXT FUTURE becomes THE REALITY NOW!

## 2023.2.9

REALITY is reality now!

## 2023.2.8 <Badge>[v1.7.5](https://github.com/XTLS/Xray-core/releases/tag/v1.7.5)</Badge>

Keep riding and never look back.

- 恭喜 [@yuhan6665](https://github.com/yuhan6665) 贡献了 Xray-core 的第 500 个 commit！
- XTLS Vision 流控已经接近完善，即将实用。
- 现在对 uTLS 指纹模拟添加了更多可选项，有哪一款适合你？
- 分享链接也支持同时分享 uTLS 指纹配置了。
- 还有更多的功能增强和修复。
- 这一版也是能最后一次看到 XTLS Origin、Direct 和 Splice 流控的一版了。 ~~有点伤感不是吗？~~

## 2023.1.29

Winter cannot cover the NEXT FUTURE...

## 2022.12.26 <Badge>[v1.7.0](https://github.com/XTLS/Xray-core/releases/tag/v1.7.0)</Badge>

因为手滑，这次的版本号直接大升，感谢大家支持！

- 以后将会严格执行 Semantic Versioning。

## 2022.11.28 <Badge>[v1.6.5](https://github.com/XTLS/Xray-core/releases/tag/v1.6.5)</Badge>

这次我们有了 WireGuard 出站。

- 使用 WireGuard 搭配 CF WARP 使用可以解锁有趣的新玩法呢。
- 同样安全更新和修复也不会少。

## 2022.11.7 <Badge>[v1.6.3](https://github.com/XTLS/Xray-core/releases/tag/v1.6.3)</Badge>

现在 Vision 流控也能使用 uTLS 指纹模拟了，这就是使用 `tlsSettings` 带来的好处吗！

## 2022.10.29 <Badge>[v1.6.2](https://github.com/XTLS/Xray-core/releases/tag/v1.6.2)</Badge>

第一个包含 Vision 流控的发行版已经放出！欢迎试用并提交反馈！

## 2022.10.22 <Badge>[v1.6.1](https://github.com/XTLS/Xray-core/releases/tag/v1.6.1)</Badge>

- 为 WebSocket、HTTP/2 以及 gRPC 传输带来了 uTLS 指纹支持！
  - 之前只有普通 TLS 下 TCP 传输能用的选项现在更好用了。
- Linux 下可以单独为出入口设置 TCP 拥塞控制了。

## 2022.10.3

天气渐凉，但是并没有凉下开发的脚步。封锁天降，但无法阻止前行……

- 新的 XTLS 流控酝酿中……
  - 解决之前流控已有的问题；
  - 对 TLS 1.3 直接启用 splice；
  - 增加 TLS 握手长度混淆；
  - 简化代码，使用 `tlsSettings` 而不是 `xtlsSettings`……

## 2022.8.28 <Badge>[v1.5.10](https://github.com/XTLS/Xray-core/releases/tag/v1.5.10)</Badge>

底层传输支持更合理的 TCP Keepalive 配置了。

## 2022.6.20 <Badge>[v1.5.8](https://github.com/XTLS/Xray-core/releases/tag/v1.5.8)</Badge>

现在 Shadowsocks-2022 的 relay 中转也受支持了。

## 2022.5.29 <Badge>[v1.5.6](https://github.com/XTLS/Xray-core/releases/tag/v1.5.6)</Badge>

Shadowsocks-2022 协议来到了 Xray-core！

- 感谢 [@nekohasekai](https://github.com/nekohasekai) 开发全新 go 实现 https://github.com/SagerNet/sing-shadowsocks 并引入 Xray。
- 感谢 [@database64128](https://github.com/database64128) 推动 Shadowsocks 社区提出完整设计方案。
- 感谢 [@RPRX](https://github.com/RPRX) 提交原始漏洞。

Shadowsocks-2022 是重新设计的全新协议：

- 在保留 Shadowsocks 原生 udp 的基础上解决了重放攻击等安全问题（与 vmess 一样使用时间戳，因此客户端与服务端需要时间一致）。
- 支持单端口多用户，并且参考 quic、wireguard 等协议设计与实现使用了 session 机制，减低加密负担，保证网络变动时的无缝迁移。

## 2022.4.24 <Badge>[v1.5.5](https://github.com/XTLS/Xray-core/releases/tag/v1.5.5)</Badge>

这次带来了方便可视化的检测数据接口！快来体验！

- 顺便修复了一些影响使用体验的问题。

## 2022.3.13 <Badge>[v1.5.4](https://github.com/XTLS/Xray-core/releases/tag/v1.5.4)</Badge>

给 Windows 平台加上了没有黑窗冒出的 wxray.exe 文件，并带来了对 UDS 监听的增强。

## 2022.1.29 <Badge>[v1.5.3](https://github.com/XTLS/Xray-core/releases/tag/v1.5.3)</Badge>

牛辞胜岁，虎跃新程。🧨

- 这次带来了对 QUIC 传输的流分配改进，使用 QUIC 传输现在更丝滑了。

## 2021.12.24 <Badge>[v1.5.2](https://github.com/XTLS/Xray-core/releases/tag/v1.5.2)</Badge>

为 gRPC 添加了一个新的选项，在通过 CDN 时变得更好用了。

## 2021.12.15 <Badge>[v1.5.1](https://github.com/XTLS/Xray-core/releases/tag/v1.5.1)</Badge>

> “过渡时期的阶段性的维护版本”

- 新功能、增强还有大量修复陆续有来。
- 记得将 VMess 配置中的 `alterID` 去掉！

## 2021.10.20 <Badge>[v1.5.0](https://github.com/XTLS/Xray-core/releases/tag/v1.5.0)</Badge>

真的是巨大的改动！

- 重构了 DNS 组件，支持的协议和细化配置更多了。
- 增强了 gRPC 传输以及 FakeDNS。
- 现在终于支持 Windows ARM64 了。
- 更多新功能和改进等待体验。

## 2021.9.23 <Badge>[v1.4.5](https://github.com/XTLS/Xray-core/releases/tag/v1.4.5)</Badge>

中秋快乐，阖家团圆。

- ~~修正了版本号过低，版本号不吉利的 bug。~~
- 这次移除了 Shadowsocks 里面已经不安全的加密方式。要尽快迁移到 AEAD 加密上面喔。
- 这次修复了远古时期开始就存在的历史问题：开启流量统计功能可能会使性能下降。简单来说，不论什么配置现在打开统计都不会对性能有任何影响了。
- 还有对 XTLS 的安全性更新以及大量修复。
- 对了，因为 TLS 库的更新，`cipherSuites` 不能再指定加密套件顺序了，而 `preferServerCipherSuites` 已经被彻底弃用。事实上这些变化在 Xray-core v1.4.3 中已经产生了。

## 2021.9.16

- 文档站已经完全切换到 docs-next，丝般顺滑，体验更好！地址仍为 [https://xtls.github.io/](https://xtls.github.io/)

## 2021.9.8 <Badge>[v1.4.3](https://github.com/XTLS/Xray-core/releases/tag/v1.4.3)</Badge>

这是一个阶段性维护版本。开发仍在继续……

- 在此期间累积了大量改进和新功能。
- 加入新的 DomainMatcher，现在域名规则匹配性能更好了。
- 加入对 HTTP/2 和 gRPC 传输的健康检查、对未知 SNI 的处理改进，以及修复了一大堆 bug。

> ~~Helden sterben nicht!~~

## 2021.7.14

- AnXray ~~重金设计~~ 的新图标已经上线！
  - 现在图标的辨识度更高了。
- 过去三个星期，AnXray 共积累了 600 stars、2K+ 频道订阅数和 11K+ GitHub 下载量，感谢大家的支持。
- AX 为 AnXray 的缩写，推荐用 AX 指代 AnXray，简短方便

## 2021.6.21

现在一个以 Xray-core 为核心的开源、自由的 Android 客户端已经出现——[AnXray](https://github.com/XTLS/AnXray)！由 [@nekohasekai](https://github.com/nekohasekai) 维护。

  - 支持众多协议、插件.
  - 首席视觉设计师 [@RPRX](https://github.com/RPRX) 设计了 X-style 的 logo、slogan，以及独一无二的 material 黑白主题。
  - APP 内还有个小彩蛋等你去发现。

前两天从早到晚反复打磨细节，希望大家多多 Star、关注。

## 2021.5.1

对 tun2socks 的改进出现在 v2rayNG 上面了。

## 2021.4.26

给 tun2socks 带来了一个改进。后续有可能能吃到它~

## 2021.4.12

现在带来了 X-flutter 前瞻，可以期待一下会是什么样子呢~ ~~🍪~~

## 2021.4.6

- VuePress Next.
- With Dark Mode.

## 2021.4.4

- 本文档迎来的新的首页。
- 本文档迎来了暗黑模式。
- ~~当然，暗黑模式还有各种各样的问题。具体的内容还需要慢慢调整。~~
- 另：Telegram 群聊突破了 5000 人！还加入了 Anti-Spam 机器人！
- 🎉🎉🎉

## 2021.4.1 <Badge>[v1.4.2](https://github.com/XTLS/Xray-core/releases/tag/v1.4.2)</Badge>

- 不是愚人节玩笑，今天更新。
- 加入 Browser Dialer，用与改变 TLS 指纹与行为。
- 加入 uTLS，用与改变 TLS Client Hello 的指纹。
- 顺便修复了一大堆奇妙的问题，具体的内容见更新日志。

## 2021.3.25

<!-- prettier-ignore -->
没错还在变。 -_-

## 2021.3.15

文档网站正在悄悄的进行着某些神秘的变化。。。，🙊🙊🙊

## 2021.3.14 <Badge>[v1.4.0](https://github.com/XTLS/Xray-core/releases/tag/v1.4.0)</Badge>

- Happy Pi-Day!
- 这次是个大更新：
  - 为链式代理引入了传输层支持。
  - 为 Dialer 引入了 Domain Strategy，解决奇妙的 DNS 问题。
  - 添加了 gRPC 传输方式，与更快一点的 Multi Mode。
  - 添加了 WebSocket Early-Data 功能，减少了 WebSocket 的延迟。
  - 添加了 FakeDNS。
  - 还修复了系列的问题，添加了各类功能，详情请见更新日志。
- 还是 VuePress 比较爽啊（

## 2021.3.3 <Badge>[1.3.1](https://github.com/XTLS/Xray-core/releases/tag/v1.3.1)</Badge>

- 这个版本使用了 Golang 1.16，正式原生支持 Apple Silicon。
- 同时修复了一个会导致 Panic 的 bug。~~Holmium\_认为这是在骗、在偷袭。~~
- 修复了几个遗留问题。

## 2021.2.14 <Badge>[1.3.0](https://github.com/XTLS/Xray-core/releases/tag/v1.3.0)</Badge>

- Happy 🐮 Year 🎉！
- v1.3.0 通过非常巧妙的机制实现了 V 系协议全部 FullCone，同时保证了一定的兼容性。
- OHHHHHHHHHHHH！

## 2021.01.31 <Badge>[1.2.4](https://github.com/XTLS/Xray-core/releases/tag/v1.2.4)</Badge>

- 解决两个“连接至标准 Socks 服务端时可能出错”的历史遗留问题。
- 似乎这个版本没有什么改变，但这只是暴风雨前的宁静。
- （没错我就是先知）
  > 你个傻子，你拿的是 UNO 牌。

## 2021.01.25

- 全互联网最好最详细的秘籍入门篇同学们练熟了吗? 🍉 老师开始连载[秘籍第一层](../document/level-1/)咯...
- [英文版文档网站](../en)逐渐增加内容 ing, 感谢各位大佬的辛苦付出~!

## 2021.01.22 <Badge>[1.2.3](https://github.com/XTLS/Xray-core/releases/tag/v1.2.3)</Badge>

- 对 SS 协议的支持**又**变强了, 支持单端口多用户!
- 对 trojan 协议的支持也**又**变强了, trojan 的回落也解锁 SNI 分流的新姿势啦~!
- _(VLESS: 嘤嘤嘤)_
- UDP 奇奇怪怪的 BUG 被干掉了, 一个字, "稳定".
- 嗅探可以排除你不想嗅探的域名, 可以开启一些新玩法.
- 向发现问题->开 issue->自行测试->自行分析->自行找到问题->自行解决->然后给上下游提交 PR 的大佬 [@Bohan Yang](https://github.com/bohanyang) 致敬!
- 其他美味小樱桃, 惯例更新品尝就对啦.

## 2021.01.19

- 一些数字
  - 版本发布了 10&nbsp;&nbsp; 个 tag
  - 解决掉了 100&nbsp; 个 issue
  - 复刻了 300&nbsp; 个 fork
  - 点了 2000 个 star
  - 群 3000 个 人

## 2021.01.17

- 辛苦的翻译工作开始了, 感谢 [@玖柒 Max](https://github.com/jiuqi9997)和其他所有的翻译大佬们.
- [English version](https://xtls.github.io/en/)

## 2021.01.15 <Badge>[1.2.2](https://github.com/XTLS/Xray-core/releases/tag/v1.2.2)</Badge>

- 回落分流又解锁了奇怪的新姿势! 回落中可以根据 SNI 分流啦~!
- 之前预告的 UUID 修改正式上线.([往下看往下看](#2021.01.12))
- 日志现在看起来比上一次顺眼又更顺眼了一丢丢.
- 远程 DOH 和其他的 DNS 模式一样学会了走路由分流.
- 当然还有其他各种小糖果.(更新品尝就对了)
- 啊, 还有, 世界上第一個 M1 上跑起 Xray 的男人是 Anthony TSE

## 2021.01.12

- 将要到来的 UUID 修改, 支持自定义字符串和 UUID 之间的映射. 这意味着你将可以这样在配置文件中写 id 来对应用户.
  - 客户端写 "id": "我爱 🍉 老师 1314",
  - 服务端写 "id": "5783a3e7-e373-51cd-8642-c83782b807c5" (此 UUID 是 `我爱🍉老师1314` 的 UUID 映射)
- 🍉 老师的[小小白白话文](../document/level-0/)大结局, 撒花.

## 2021.01.10 <Badge>[1.2.1](https://github.com/XTLS/Xray-core/releases/tag/v1.2.1)</Badge>

- [小小白白话文](../document/level-0/)连载上线啦,🍉 老师呕心沥血之作, 手把手教你从什么都不会到熟练配置 Xray!
- (可能是整个互联网上, 最详细最有耐心的教你从 0 开始配置的教程)
- [透明代理](../document/level-2/)也增加了更多文章.
- 还有很多细节修改, 文档将会越来越规范!
- 感谢 [@ricuhkaen](https://github.com/ricuhkaen) , [@BioniCosmos](https://github.com/BioniCosmos), [@kirin](https://github.com/kirin10000)

* 大量的 UDP 相关修复, 甚至可以在育碧的土豆服务器上玩彩虹六号!
* Google Voice 应该也可以正常使用 v2rayNG 拨打了.
* 日志现在看起来更顺眼.

## 2021.01.07

- 礼貌和尊重本应是社区不需要明说的准则之一。

## 2021.01.05

- 文档网站正在悄悄的进行着某些神秘的变化。。。，🙊🙊🙊

## 2021.01.03

- 文档仓库第一个 PR。🎉
  [透明代理（TProxy）配置教程 ](../document/level-2/tproxy.md) ，感谢 [@BioniCosmos](https://github.com/BioniCosmos)
- tg 群突破 2500。

## 2021.01.01

【祝大家新年快乐，嗨皮牛耶！】🎆🎇🎆 <Badge>[1.2.0](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0)</Badge>

🎁 在元旦的最后几分钟，v1.2.0 它来了，带着周五必更的惯例，带着各位贡献大佬的心血以及 @rprxx 的黑眼圈，不负众望的来了!

- 圣诞礼物[v1.1.5](#20201225)后的元旦礼物 🎁，游戏玩家大福利，全面 FullCone。
- （UDP 还会继续增强！）
- 如果你已经拆过圣诞礼物，这次还有比圣诞礼物更精美的包装和小糖果哦。（同样不用问，更新品尝就对了）
- （不，下面不是广告，是里程碑。）
- Xray 是有史以来第一个不受限制的多协议平台：只需 Xray 即可解决问题，无需借力其它实现。
  - 一人扛起了所有！支持各大主流协议！
  - 一骑绝尘的性能!
  - 日趋完善的功能!
  - 可怕的生命力与社区亲和力！
- Xray 将继续保持前行！ 因此 [Xray 需要更多的英雄！！](https://github.com/XTLS/Xray-core/discussions/56)！
- PS：请品，请细品[release notes](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0)每一句。似乎有一个小秘密小彩蛋 ~~（啊，有人敲门...我一会和你们说）~~

## 2020.12.29

透明代理的游戏玩家利好！ Xray-core tproxy 入站， socks 出站 UDP FullCone 测试版, [TG 群](https://t.me/projectXray)火热测试中

## 2020.12.25 <Badge>[1.1.5](https://github.com/XTLS/Xray-core/releases/tag/v1.1.5)</Badge>

圣诞节快乐！

- 游戏玩家的圣诞礼物！你可以用 xray 爽快的打游戏啦！因为有了 SS/trojan UDP fullcone
- 你可以用你喜欢的格式写配置文件了，比如 yaml，比如 toml...
- （VLESS 的 UDP fullcone 和更多增强很快就到！）
- 无须再担心证书验证被墙，OCSP stapling 已经上线!
- kirin 带来了一大波 脚本更新.[脚本在此](https://github.com/XTLS/Xray-install)
- 还有更多美味小樱桃！（不用问，更新品尝就对了）

## 2020.12.24

因为某些不可描述的原因，Xray 的文档网站已在发布日前偷跑上线。
网址为：[没错你正在看的就是](https://xtls.github.io)

大家可以查阅各种内容也欢迎纠错/提出建议（可发往文档 github 仓库的 issue 区）

文档网站需要不断完善和增加内容，以及完善设计。
因此更欢迎大家一起为文档建设添砖加瓦。
[文档的仓库](https://github.com/XTLS/XTLS.github.io)

仓库的 readme 中有简略教程说明如何帮助 xray 改进文档网站.
欢迎大家查看，纠错，修改，增加心得。

## 2020.12.23

Xray-core Shadowsocks UDP FullCone 测试版, [TG 群](https://t.me/projectXray)火热测试中

## 2020.12.21

- Project X 群人数 2000+
- 群消息(含游戏群) 日均破万

## 2020.12.18 <Badge>[1.1.4](https://github.com/XTLS/Xray-core/releases/tag/v1.1.4)</Badge>

- 更低的启动内占用和内存使用优化
- 随意定制的 TLS 提高你的 SSL 评级
- 支持 XTLS 入站的 Splice 以及支持 trojan 的 XTLS
- 还有在您路由器上使用的 Splice 最佳使用模式建议

## 2020.12.17

鉴于日益增长群人数和游戏需求, 开启了[TG 游戏群](https://t.me/joinchat/UO4NixbB_XDQJOUjS6mHEQ)

## 2020.12.15

[安装脚本 dev 分支](https://github.com/XTLS/Xray-install/tree/dev)开启, 持续更新功能中.

## 2020.12.11 <Badge>[1.1.3](https://github.com/XTLS/Xray-core/releases/tag/v1.1.3)</Badge>

- 完整版本的 REDIRECT 透明代理模式.
- 软路由 splice 流控模式的优化建议.

## 2020.12.06 <Badge>[1.1.2](https://github.com/XTLS/Xray-core/releases/tag/v1.1.2)</Badge>

- 流控增加 splice 模式, Linux 限定, 性能一骑绝尘.
- 增强了 API 兼容

## 2020.12.04

增加 splice 模式

## 2020.11.27

- Project X 的 GitHub 主仓库 Xray-core 已获 500+ stars
- 登上了 GitHub Trending
- Project X 群人数破千，频道订阅数 500+

## 2020.11.25 <Badge>[1.0.0](https://github.com/XTLS/Xray-core/releases/tag/v1.0.0)</Badge>

Xray 的第一个版本.

- 基于 v2ray-core 修改而来，改动较大
- 全面增强, 性能卓越, 完全兼容

## 2020.11.23

project X start

> ~~梦开始的时候~~
