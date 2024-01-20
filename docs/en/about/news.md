---
sidebar: auto
---

# 大史记

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
- 向发现问题->开 issue->自行测试->自行分析->自行找到问题->自行解决->然后给上下游提交 PR 的大佬 <img src="https://avatars2.githubusercontent.com/u/8384161?s=32" width="32px" height="32px" alt="a"/> [@Bohan Yang](https://github.com/bohanyang) 致敬!
- 其他美味小樱桃, 惯例更新品尝就对啦.

## 2021.01.19

- 一些数字
  - 版本发布了 10&nbsp;&nbsp; 个 tag
  - 解决掉了 100&nbsp; 个 issue
  - 复刻了 300&nbsp; 个 fork
  - 点了 2000 个 star
  - 群 3000 个 人

## 2021.01.17

- 辛苦的翻译工作开始了, 感谢<img src="https://avatars2.githubusercontent.com/u/60207794?s=32" width="32px" height="32px" alt="a"/> [@玖柒 Max](https://github.com/jiuqi9997)和其他所有的翻译大佬们.
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
  [透明代理（TProxy）配置教程 ](../document/level-2/tproxy.md) ，感谢<img src="https://avatars2.githubusercontent.com/u/41363844?s=32" width="32px" height="32px" alt="a"/> [@BioniCosmos](https://github.com/BioniCosmos)
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
