---
sidebar: auto
---

# The Great Chronicles

## 2024.10.31 <badge>[24.10.31](https://github.com/XTLS/Xray-core/releases/tag/v24.10.31)</badge>

Happy Halloween! 🎃

We have a gift with candies for you, come get and open~ 🎁

~~SplitHTTP now evolved into XHTTP, with ability of splitting upstream and downstream to different pathway! It is concrete that XHTTP opens a new era again.~~

## 2024.10.24

Only panels that secure in default are listed here. The plain HTTP issue shouldn’t be taken lightly.

## 2024.10.18

The first Projext X NFT pricing 0.15 ETH has been sold. Thank you for your support! And don't forget that the earlier you purchase the lower the price.

We may have 10,000 REALITY NFT (two of them as a gift) with each pricing 0.01 ETH as a way of normal donation.

## 2024.10.4

Why there is someone use panels with http://ip over Internet? Oh no, oh no, oh no no no no no...

For [data security](https://t.me/projectXtls/358), these tools should use HTTPS or SSH tunneling.

## 2024.10.3

It is almost one day after marking v24.9.30 as the latest version and no one complaints, ~~oh so nobody use the removed obsolote parts~~.

## 2024.9.30 <badge>[24.9.30](https://github.com/XTLS/Xray-core/releases/tag/v24.9.30)</badge>

The first stable release after changing the versioning rule!

As the first stable version of versioning change:

- We have XMUX for SplitHTTP
- HTTP/3 now in HTTP transport
- TCP transport renamed to RAW (more sensible)
- UDP Noises in Freedom outbound
- **WARNING**: This version has removed lots of obsolote config fields, check the config file carefully before upgrade to prevent unexpected situations.

## 2024.9.28

We all know the entrance question of the group is hell difficult.

But it’s not about the number of people — it’s about quality. The goal is to test one's ability to find answers independently and ~~a bit of luck~~. This way, we can maintain high-quality discussions.

Cherish your place in the group and be sure not to break the rules!

## 2024.9.24

NOTICE: There is ONLY one Project X NFT left with the price 0.1 ETH. The subsequent price starts from 0.15 ETH.

## 2024.9.17

The sister group, Project X, reached 1000 members.

Thank you for the support from non-Chinese world!

- What are XHTTP and XgRPC?

## 2024.9.12

The Great Chronicles Return to the Scene?!

## 2024.9.7 <Badge>[v24.9.7](https://github.com/XTLS/Xray-core/releases/tag/v24.9.7)</Badge>

First release after abandoning semantic versioning.

- This time, QUIC and DomainSocket transports were removed, along with two pieces of legacy code.
  - The binary size is 1MB smaller than v1.8.24.
- As always, there are essential bug fixes.

## 2024.9.6

Can Xray-core use Xray-JSON subscription? The proposal is [over here](https://github.com/XTLS/Xray-core/discussions/3765).

## 2024.8.30 <Badge>[v1.8.24](https://github.com/XTLS/Xray-core/releases/tag/v1.8.24)</Badge>

While waiting for the SplitHTTP multiplex controller, the main branch had accumulated many important updates, so we decided to release a version first.

- The Socks inbound now supports HTTP proxy requests by default.
- UDP noise (preview)
- And some other improvements.

Due to the existence of semantic versioning, planning features and scheduling for each release have severely hindered the development, merging, and release of new features. Therefore, we decided to abandon semantic versioning starting with the next release and use the release date as the version number, such as v24.8.30, and cancel version planning, fully adopting continuous updates. Features will be merged and released as soon as they are ready, with a version released at the end of each month.

After all, as a software aiming to help people bypass censorship, instead of maintaining a long-term stable version, it's more important to adapt new features and keep updating monthly.

The next version will remove some legacy code no longer in used, add warning log for using deprecated features/configs, and for sure, some breaking changes. Be aware that future versions will be released once we consider something new is ready for a release.

We believe that with your donations and the reform of the release format, the Xray-core project will develop even better.

## 2024.8.26

The Project VLESS group was established.

We have created [Project VLESS](https://t.me/projectVless) for non-Chinese users (mainly Russian).

## 2024.8.3

The first [Project X NFT](https://github.com/XTLS/Xray-core/discussions/3633#discussioncomment-10240940) is officially released! Just as Xray has made history, releasing an NFT is also an unprecedented move in this field. These NFTs are highly commemorative and even historically significant, far beyond their current initial price. In time, they will undoubtedly become priceless. Once again, thank you for your support of Project X.

## 2024.7.29 <Badge>[v1.8.23](https://github.com/XTLS/Xray-core/releases/tag/v1.8.23)</Badge>

- Congratulations to [@mmmray](https://github.com/mmmray) for contributing the 1000th commit to Xray-core!
- Optimized the stability of SplitHTTP upstream, and the server must be upgraded to this version to support the new client.
- More changes on SplitHTTP.

## 2024.7.22 <Badge>[v1.8.21](https://github.com/XTLS/Xray-core/releases/tag/v1.8.21)</Badge>

It seems to have returned to the original state of rapid-fire releases...

As foreshadowed in v1.8.16, SplitHTTP now preliminarily supports HTTP/3 (QUIC). Undoubtedly, SplitHTTP H3 has ushered in a new era.

- SplitHTTP H3 is the first QUIC-based proxy fully compliant with standard H3, supporting CDN passthrough, and can be concealed using reverse proxy or Browser Dialer.

## 2024.7.16

Project X documentation now has a Russian version! Thanks to [@iambabyninja](https://github.com/iambabyninja) for the translation!

> Привет, друзья из России!

## 2024.7.15

Through known information and efforts, Xray-core now supports Windows 7 again! In subsequent releases, Windows 7 users can enjoy it by downloading and extracting the Xray-win7-32.zip or Xray-win7-64.zip packages. Thank you for your support! For specific usage, please click [here](../document/install.html)

Although Windows 7 will eventually be phased out with future upgrades, we can now delay that time a little.

## 2024.6.18 <Badge>[v1.8.16](https://github.com/XTLS/Xray-core/releases/tag/v1.8.16)</Badge>

A new transport has arrived, currently called SplitHTTP.

- There are two completely opposite ways to achieve further traffic obfuscation: multiplexing and splitting connections.
- It can achieve the same goals as Meek through CDNs that do not support WebSocket or gRPC, and SplitHTTP is simpler and more efficient than Meek.
- SplitHTTP does not have WebSocket's ALPN issues, which is a major advantage, and it will support HTTP/3 (QUIC) in the future.
- SplitHTTP has also been added to the sharing link package.

## 2024.6.2

A new transport method is being developed...

## 2024.4.26 <Badge>[v1.8.11](https://github.com/XTLS/Xray-core/releases/tag/v1.8.11)</Badge>

- Now there is a tool to generate ECH keys.
- Enhancements, fixes, and some obsolete code removal.

## 2024.4.20

We now have issue templates, thanks to [@Fangliding](https://github.com/Fangliding)!

## 2024.4.13

VLESS Seed is ready, waiting for the right moment.

## 2024.3.18 <Badge>[v1.8.10](https://github.com/XTLS/Xray-core/releases/tag/v1.8.10)</Badge>

Like WebSocket, HTTPUpgrade now also has 0-RTT.

## 2024.3.11 <Badge>[v1.8.9](https://github.com/XTLS/Xray-core/releases/tag/v1.8.9)</Badge>

Added HTTPUpgrade transport, said to be lighter than WebSocket.
- Already added to the sharing link package.

## 2024.2.29

gRPC transport now also has a Host-like configuration field! It's called `authority`. Now gRPC can also "domain front," without ALPN issues.

## 2024.2.25 <Badge>[v1.8.8](https://github.com/XTLS/Xray-core/releases/tag/v1.8.8)</Badge>

- Now XUDP traffic is uniformly padded with Vision, come and experience it.
- Added leastLoad balancer.
- Fixed errors, optimized performance...

## 2024.1.9

Shocked to hear that Win7 cannot run the new version of Xray-core? Upon exploration, it was discovered that Go has dropped support for Win7. Is there a way to continue supporting this somewhat ancient but still elegant operating system?

## 2023.11.21

The [paper](https://t.me/projectXtls/212) published at the USENIX top conference confirms that XTLS Vision has achieved its design goals. And XTLS will not stop there, breaking through towering walls like X-rays.

## 2023.11.18 <Badge>[v1.8.6](https://github.com/XTLS/Xray-core/releases/tag/v1.8.6)</Badge>

- WireGuard now also has a corresponding inbound. Freedom outbound finally has splice.
- The domainStrategy for outbound has also been unified.
- More delicious little treats.
- Due to ~~force majeure~~ feature changes, Dragonfly BSD support has quietly left the stage.
- ~~Are we really saying goodbye to the classic Windows 7?~~

## 2023.9.30

Designed a brand new color scheme for v2rayNG, install the latest Pre-release version to experience it.

## 2023.8.29 <Badge>[v1.8.4](https://github.com/XTLS/Xray-core/releases/tag/v1.8.4)</Badge>

After half a year of polishing, 1.8.x has finally reached its first recognized official version.
Likewise, there are many integrated improvements this time, come and taste it!

## 2023.7.22

Another historical HTTP/2 transport issue has been fixed.

## 2023.7.7

Vision will soon have Seed support.

## 2023.6.30

The next XTLS flow control: xtls-rprx-switch 🍪

- XTLS's 0-RTT has been teased for months, originally to maintain some mystery.
- Compared to the existing XTLS Vision and Mux, it has even better advantages.

## 2023.6.27

[How to choose a REALITY target domain? Check here to help you achieve twice the result with half the effort!](https://github.com/XTLS/Xray-core/discussions/2256#discussioncomment-6295296)

## 2023.6.19 <Badge>[v1.8.3](https://github.com/XTLS/Xray-core/releases/tag/v1.8.3)</Badge>

- The first version after the code streamlining plan, VMess (MD5), MTProto, and Starlark-related code have been removed. Going light.
- Code refactoring is also part of going light.
- We have also not forgotten to add some enhancements and fix vulnerabilities.
- ~~v2rayNG has not yet supported Xray, and the new sharing link format cannot be used yet.~~

## 2023.6.6

Good News: The next XTLS flow control will not be called Vision. 🍪

## 2023.4.21

Maybe we can leverage [RealiTLScanner](https://github.com/XTLS/RealiTLScanner)……

## 2023.4.20

After years of development and countless lines of code... [The code simplification plan](https://github.com/XTLS/Xray-core/discussions/1967) has been proposed!

## 2023.4.19

`xtls-0rtt-vision(-udp443)` 🍪

## 2023.4.18 <Badge>[v1.8.1](https://github.com/XTLS/Xray-core/releases/tag/v1.8.1)</Badge>

The upgraded XUDP is here!

- Now XUDP features connection migration and port reuse, with a global Session ID ~~, so mom doesn't have to worry about what to do when there is an unexpected disconnection anymore~~.
- We’ve also added control settings for XUDP, giving you better control~
- The new XUDP paired with XTLS Vision offers an even better experience~
- As usual, there’s a little treat, enjoy~

## 2023.4.6

XUDP is also quietly upgrading...

## 2023.3.29

`PLUX protocol` 🍪

## 2023.3.19

The sharing link standard for REALITY has also emerged.

## 2023.3.9 <Badge>[v1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)</Badge>

> THE NEXT FUTURE, REALITY is NOW release on Xray-core

REALITY has been implemented and released! Welcome to try it out!
XTLS Vision has also been improved, please upgrade both ends to the latest version for the best experience.

- Due to changes in the Vision padding algorithm, there may be compatibility issues between old and new versions of XTLS Vision.
- HTTP/2 transport has also been improved, enjoy the smooth experience with the new version~
- There are many other small improvements, feel free to explore~

## 2023.3.4

> Legends never die, they become a part of ~~you~~ VLESS.
>
> They simply fade away.

## 2023.3.2

Some lingering issues with HTTP/2 transport have been improved. Enjoy the smooth experience when testing with REALITY~

## 2023.2.16

THE NEXT FUTURE becomes THE REALITY NOW!

## 2023.2.9

REALITY is reality now!

## 2023.2.8 <Badge>[v1.7.5](https://github.com/XTLS/Xray-core/releases/tag/v1.7.5)</Badge>

Keep riding and never look back.

- Congratulations to [@yuhan6665](https://github.com/yuhan6665) for contributing the 500th commit to Xray-core!
- XTLS Vision flow control is nearly complete and will soon be practical.
- Now there are more options for uTLS fingerprint simulation, which one suits you?
- Sharing links now also support sharing uTLS fingerprint configurations.
- There are more feature enhancements and fixes.
- This version will also be the last time to see XTLS Origin, Direct, and Splice flow control. ~~A bit nostalgic, isn’t it?~~

## 2023.1.29

Winter cannot cover the NEXT FUTURE...

## 2022.12.26 <Badge>[v1.7.0](https://github.com/XTLS/Xray-core/releases/tag/v1.7.0)</Badge>

Due to a slip of the hand, this version number jumped directly up, thanks for everyone's support!

- From now on, Semantic Versioning will be strictly followed.

## 2022.11.28 <Badge>[v1.6.5](https://github.com/XTLS/Xray-core/releases/tag/v1.6.5)</Badge>

This time we have WireGuard outbound.

- Using WireGuard with CF WARP can unlock some fun new ways to play.
- Of course, there are also security updates and fixes.

## 2022.11.7 <Badge>[v1.6.3](https://github.com/XTLS/Xray-core/releases/tag/v1.6.3)</Badge>

Now Vision flow control can also use uTLS fingerprint simulation, is this the benefit brought by `tlsSettings`!

## 2022.10.29 <Badge>[v1.6.2](https://github.com/XTLS/Xray-core/releases/tag/v1.6.2)</Badge>

The first release with Vision flow control is out! Welcome to try it and give feedback!

## 2022.10.22 <Badge>[v1.6.1](https://github.com/XTLS/Xray-core/releases/tag/v1.6.1)</Badge>

- Brought uTLS fingerprint support for WebSocket, HTTP/2, and gRPC transport!
  - The option that was previously only available under regular TLS for TCP transport is now better.
- On Linux, TCP congestion control can be set independently for ingress and egress.

## 2022.10.3

The weather is getting cooler, but the pace of development hasn’t slowed down. Blocks fall from the sky, but progress can’t be stopped...

- A new XTLS flow control is brewing...
  - Addressing existing flow control issues;
  - Direct splice activation for TLS 1.3;
  - Added TLS handshake length obfuscation;
  - Simplified code, using `tlsSettings` instead of `xtlsSettings`...

## 2022.8.28 <Badge>[v1.5.10](https://github.com/XTLS/Xray-core/releases/tag/v1.5.10)</Badge>

Underlying transport now supports more reasonable TCP Keepalive settings.

## 2022.6.20 <Badge>[v1.5.8](https://github.com/XTLS/Xray-core/releases/tag/v1.5.8)</Badge>

Now Shadowsocks-2022 relay is also supported.

## 2022.5.29 <Badge>[v1.5.6](https://github.com/XTLS/Xray-core/releases/tag/v1.5.6)</Badge>

Shadowsocks-2022 protocol has come to Xray-core!

- Thanks to [@nekohasekai](https://github.com/nekohasekai) for developing the brand new go implementation https://github.com/SagerNet/sing-shadowsocks and bringing it to Xray.
- Thanks to [@database64128](https://github.com/database64128) for driving the Shadowsocks community to propose a complete design.
- Thanks to [@RPRX](https://github.com/RPRX) for submitting the original vulnerability.

Shadowsocks-2022 is a newly designed protocol:

- It addresses security issues like replay attacks while retaining native udp support from Shadowsocks (using timestamps similar to vmess, so client and server need synchronized time).
- Supports multi-user on a single port, and implements session mechanisms similar to quic and wireguard to reduce encryption overhead and ensure seamless migration during network changes.

## 2022.4.24 <Badge>[v1.5.5](https://github.com/XTLS/Xray-core/releases/tag/v1.5.5)</Badge>

This time we brought a convenient visual data detection interface! Come and experience it!

- We also fixed some issues affecting user experience.

## 2022.3.13 <Badge>[v1.5.4](https://github.com/XTLS/Xray-core/releases/tag/v1.5.4)</Badge>

Added a wxray.exe file for Windows platform with no black windows popping up, and brought enhancements for UDS listening.

## 2022.1.29 <Badge>[v1.5.3](https://github.com/XTLS/Xray-core/releases/tag/v1.5.3)</Badge>

Farewell to the year of the Ox, and leap into the new year of the Tiger. 🧨

- This time we brought improvements to stream allocation for QUIC transport, making QUIC transport smoother.

## 2021.12.24 <Badge>[v1.5.2](https://github.com/XTLS/Xray-core/releases/tag/v1.5.2)</Badge>

Added a new option for gRPC, making it even better when used through a CDN.

## 2021.12.15 <Badge>[v1.5.1](https://github.com/XTLS/Xray-core/releases/tag/v1.5.1)</Badge>

> “A transitional, phased maintenance version”

- New features, enhancements, and a lot of fixes are coming in.
- Remember to remove `alterID` from your VMess configuration!

## 2021.10.20 <Badge>[v1.5.0](https://github.com/XTLS/Xray-core/releases/tag/v1.5.0)</Badge>

A really big change!

- Refactored the DNS component, with more supported protocols and detailed configurations.
- Enhanced gRPC transport and FakeDNS.
- Finally supports Windows ARM64.
- More new features and improvements await you.

## 2021.9.23 <Badge>[v1.4.5](https://github.com/XTLS/Xray-core/releases/tag/v1.4.5)</Badge>

Happy Mid-Autumn Festival, wishing you a joyful reunion.

- ~~Fixed a bug where the version number was too low and unlucky.~~
- This update removed the insecure encryption methods from Shadowsocks. Please migrate to AEAD encryption as soon as possible.
- This update fixed a longstanding issue from ancient times: enabling traffic statistics could cause a performance drop. Simply put, enabling statistics now will not impact performance regardless of the configuration.
- Also included are security updates for XTLS and numerous other fixes.
- By the way, due to the TLS library update, `cipherSuites` can no longer specify the order of cipher suites, and `preferServerCipherSuites` has been completely deprecated. In fact, these changes were already present in Xray-core v1.4.3.

## 2021.9.16

- The documentation site has fully transitioned to docs-next, providing a smoother and better experience! The address remains [https://xtls.github.io/](https://xtls.github.io/).

## 2021.9.8 <Badge>[v1.4.3](https://github.com/XTLS/Xray-core/releases/tag/v1.4.3)</Badge>

This is a maintenance release. Development continues…

- A large number of improvements and new features have accumulated during this period.
- Added a new DomainMatcher, improving domain rule matching performance.
- Added health checks for HTTP/2 and gRPC transports, improved handling of unknown SNI, and fixed a bunch of bugs.

> ~~Helden sterben nicht!~~

## 2021.7.14

- AnXray's ~~expensively designed~~ new icon is now live!
  - The new icon is now more recognizable.
- Over the past three weeks, AnXray has accumulated 600 stars, 2K+ channel subscriptions, and 11K+ GitHub downloads. Thank you for your support.
- AX is short for AnXray. We recommend using AX to refer to AnXray—it's short and convenient.

## 2021.6.21

Now, an open-source, free Android client based on Xray-core is available—[AnXray](https://github.com/XTLS/AnXray)! Maintained by [@nekohasekai](https://github.com/nekohasekai).

  - Supports numerous protocols and plugins.
  - Chief visual designer [@RPRX](https://github.com/RPRX) designed an X-style logo, slogan, and a unique black-and-white material theme.
  - There's also a small Easter egg waiting to be discovered in the app.

Spent the last few days refining details from morning till night. We hope you'll star and follow the project.

## 2021.5.1

Improvements to tun2socks have appeared in v2rayNG.

## 2021.4.26

Brought an improvement to tun2socks. You might get to enjoy it in the future~

## 2021.4.12

Let's foresee X-flutter; looking forward to what it might be like~ ~~🍪~~

## 2021.4.6

- VuePress Next.
- With Dark Mode.

## 2021.4.4

- This document has a new homepage.
- This document now has a dark mode.
- ~~Of course, dark mode still has various issues. Specific content will need to be gradually adjusted.~~
- Additionally, the Telegram group chat has surpassed 5,000 members! An Anti-Spam bot has also been added!
- 🎉🎉🎉

## 2021.4.1 <Badge>[v1.4.2](https://github.com/XTLS/Xray-core/releases/tag/v1.4.2)</Badge>

- Not an April Fool's joke, updated today.
- Added Browser Dialer to modify TLS fingerprints and behavior.
- Added uTLS to modify the TLS Client Hello fingerprint.
- Also fixed a bunch of strange issues; see the changelog for details.

## 2021.3.25

<!-- prettier-ignore -->
Yes, it’s still changing. -_-

## 2021.3.15

The documentation site is quietly undergoing some mysterious changes..., 🙊🙊🙊

## 2021.3.14 <Badge>[v1.4.0](https://github.com/XTLS/Xray-core/releases/tag/v1.4.0)</Badge>

- Happy Pi-Day!
- This is a major update:
  - Introduced transport layer support for chained proxies.
  - Introduced Domain Strategy for the Dialer, solving strange DNS issues.
  - Added gRPC transport method and a slightly faster Multi Mode.
  - Added WebSocket Early-Data feature, reducing WebSocket latency.
  - Added FakeDNS.
  - Also fixed a series of issues and added various features. For details, see the changelog.
- VuePress is still more enjoyable~

## 2021.3.3 <Badge>[1.3.1](https://github.com/XTLS/Xray-core/releases/tag/v1.3.1)</Badge>

- This version uses Golang 1.16, officially supporting Apple Silicon natively.
- Also fixed a bug that could cause a panic. ~~Holmium\_ thinks this is deceit, a sneak attack.~~
- Fixed several legacy issues.

## 2021.2.14 <Badge>[1.3.0](https://github.com/XTLS/Xray-core/releases/tag/v1.3.0)</Badge>

- Happy 🐮 Year 🎉!
- v1.3.0 implemented FullCone for all V protocols using a very clever mechanism, while ensuring some compatibility.
- OHHHHHHHHHHHH!

## 2021.01.31 <Badge>[1.2.4](https://github.com/XTLS/Xray-core/releases/tag/v1.2.4)</Badge>

- Resolved two longstanding issues where “connecting to a standard Socks server might result in errors.”
- It seems there’s not much change in this version, but it’s just the calm before the storm.
- (Yes, I’m a prophet)
  > You fool, you’re holding a UNO card.

## 2021.01.25

- Have you mastered the most detailed beginner's guide on the entire internet? 🍉 The teacher has started serializing [Level One of the Guide](../document/level-1/)...
- The [English version of the documentation site](../en) is gradually being updated, thanks to the hard work of everyone involved!

## 2021.01.22 <Badge>[1.2.3](https://github.com/XTLS/Xray-core/releases/tag/v1.2.3)</Badge>

- **Yet again**, support for the SS protocol has been strengthened, now supporting multi-user on a single port!
- **Yet again**, support for the trojan protocol has been strengthened, with new SNI-based routing for trojan fallback!
- _(VLESS: sobbing)_
- The weird UDP bugs have been fixed, making it “stable” in one word.
- Sniffing can now exclude domains you don't want to sniff, opening up some new possibilities.
- Salute to the big shot [@Bohan Yang](https://github.com/bohanyang) who discovers issues -> opens an issue -> tests on their own -> analyzes on their own -> finds the issue on their own -> fixes it on their own -> and then submits a PR upstream and downstream!
- Other tasty cherries—just update and taste them.

## 2021.01.19

- Some numbers:
  - 10 tags released
  - 100 issues resolved
  - 300 forks created
  - 2000 stars given
  - 3000 members in the group

## 2021.01.17

- The hard work of translation has begun, thanks to [@玖柒 Max](https://github.com/jiuqi9997) and all the other translation contributors.
- [English version](https://xtls.github.io/en/)

## 2021.01.15 <Badge>[1.2.2](https://github.com/XTLS/Xray-core/releases/tag/v1.2.2)</Badge>

- Fallback routing has unlocked a new strange trick! You can now route based on SNI in the fallback!
- The previously announced UUID modification is officially live. ([Scroll down, scroll down](#2021.01.12))
- The logs now look a bit more pleasing to the eye than last time.
- Remote DOH has learned to use routing just like other DNS modes.
- And of course, various other little candies. (Just update and taste them)
- Oh, and, the first person to run Xray on an M1 Mac is Anthony TSE.

## 2021.01.12

- Upcoming UUID modification supports mapping between custom strings and UUIDs. This means you can write the id like this in the configuration file to correspond to users.
  - Client writes `"id": "I love 🍉 teacher 1314"`,
  - Server writes `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the UUID mapping of `I love 🍉 teacher 1314`)
- The [Simple White Language](../document/level-0/) by 🍉 teacher concludes with a grand finale, throwing flowers.

## 2021.01.10 <Badge>[1.2.1](https://github.com/XTLS/Xray-core/releases/tag/v1.2.1)</Badge>

- The [Simple White Language](../document/level-0/) series has been launched! 🍉 Teacher's painstaking work teaches you how to configure Xray from scratch!
- (Possibly the most detailed and patient guide on the entire internet for configuring from zero)
- [Transparent Proxy](../document/level-2/) has also been updated with more articles.
- Many other details have been modified, and the documentation will become more standardized!
- Thanks to [@ricuhkaen](https://github.com/ricuhkaen), [@BioniCosmos](https://github.com/BioniCosmos), [@kirin](https://github.com/kirin10000).

* A lot of UDP-related fixes, now you can even play Rainbow Six Siege on Ubisoft's potato servers!
* Google Voice should now work properly when making calls with v2rayNG.
* Logs now look more pleasing to the eye.

## 2021.01.07

- Courtesy and respect should be fundamental principles that don’t need to be explicitly stated in the community.

## 2021.01.05

- The documentation website is quietly undergoing some mysterious changes..., 🙊🙊🙊

## 2021.01.03

- The first PR in the documentation repository. 🎉
  [Transparent Proxy (TProxy) Configuration Tutorial](../document/level-2/tproxy.md), thanks to [@BioniCosmos](https://github.com/BioniCosmos).
- The TG group has surpassed 2500 members.

## 2021.01.01

[Happy New Year, Happy “Cow” Year!] 🎆🎇🎆 <Badge>[1.2.0](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0)</Badge>

🎁 In the last few minutes of New Year's Day, v1.2.0 arrived, continuing the tradition of Friday updates, bringing the hard work of all contributors and the dark circles of @rprxx—living up to expectations!

- The New Year's gift 🎁 following the Christmas gift [v1.1.5](#20201225), a great benefit for gamers, full FullCone support.
- (UDP will continue to be enhanced!)
- If you’ve already opened your Christmas gift, this time there’s an even more beautifully wrapped package and little candies. (As always, no need to ask, just update and taste it)
- (No, what's below is not an ad, but a milestone.)
- Xray is the first unrestricted multi-protocol platform: Xray alone solves the problem, without relying on other implementations.
  - One person handles everything! Supports all major mainstream protocols!
  - Unparalleled performance!
  - Continuously improving features!
  - Incredible vitality and community affinity!
- Xray will continue to move forward! Therefore, [Xray needs more heroes!!](https://github.com/XTLS/Xray-core/discussions/56)!
- PS: Please taste, taste every line of the [release notes](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0) carefully. It seems there's a small secret Easter egg. ~~(Ah, someone’s knocking at the door... I’ll tell you later)~~

## 2020.12.29

Good news for gamers using transparent proxy! Xray-core TProxy inbound, SOCKS outbound UDP FullCone beta, [TG group](https://t.me/projectXray) is hotly testing.

## 2020.12.25 <Badge>[1.1.5](https://github.com/XTLS/Xray-core/releases/tag/v1.1.5)</Badge>

Merry Christmas!

- A Christmas gift for gamers! You can now enjoy gaming with Xray! Thanks to SS/trojan UDP FullCone.
- You can now write configuration files in your preferred format, such as YAML or TOML...
- (VLESS’s UDP FullCone and more enhancements are coming soon!)
- No need to worry about certificate validation being blocked anymore, OCSP stapling is now online!
- Kirin brought a wave of script updates. [Scripts here](https://github.com/XTLS/Xray-install).
- And more delicious little cherries! (No need to ask, just update and taste it)

## 2020.12.24

For some unspeakable reasons, Xray’s documentation website was sneakily launched before the release date.
The URL is: [Yes, what you’re looking at](https://xtls.github.io).

Everyone is welcome to check various contents and correct any errors/suggestions (can be submitted to the issue area of the documentation GitHub repository).

The documentation website needs continuous improvement and content addition, as well as design refinement.
Therefore, everyone is welcome to contribute to the construction of the documentation together.
[Documentation Repository](https://github.com/XTLS/XTLS.github.io).

There’s a brief tutorial in the repository's README explaining how to help Xray improve the documentation website.
Everyone is welcome to check it out, correct errors, modify, and add experiences.

## 2020.12.23

Xray-core Shadowsocks UDP FullCone beta, [TG group](https://t.me/projectXray) is hotly testing.

## 2020.12.21

- Project X group member count exceeds 2000.
- The group messages (including game groups) surpass 10,000 daily.

## 2020.12.18 <Badge>[1.1.4](https://github.com/XTLS/Xray-core/releases/tag/v1.1.4)</Badge>

- Lower startup memory usage and memory usage optimization.
- Customize TLS at will to improve your SSL rating.
- Added Splice support for XTLS inbound and support for trojan XTLS.
- Also, best usage mode suggestions for Splice on your router.

## 2020.12.17

Given the growing number of group members and gaming needs, the [TG game group](https://t.me/joinchat/UO4NixbB_XDQJOUjS6mHEQ) has been launched.

## 2020.12.15

[Installation script dev branch](https://github.com/XTLS/Xray-install/tree/dev) is now open and features are being continuously updated.

## 2020.12.11 <Badge>[1.1.3](https://github.com/XTLS/Xray-core/releases/tag/v1.1.3)</Badge>

- Full version of REDIRECT transparent proxy mode.
- Optimization suggestions for Splice flow control mode on soft routers.

## 2020.12.06 <Badge>[1.1.2](https://github.com/XTLS/Xray-core/releases/tag/v1.1.2)</Badge>

- Added splice mode for flow control, Linux exclusive, with unparalleled performance.
- Enhanced API compatibility.

## 2020.12.04

Added splice mode.

## 2020.11.27

- Project X's GitHub main repository Xray-core has now received 500+ stars.
- Featured on GitHub Trending.
- Project X group members exceeded 1000, and channel subscribers reached 500+.

## 2020.11.25 <Badge>[1.0.0](https://github.com/XTLS/Xray-core/releases/tag/v1.0.0)</Badge>

Xray’s first version.

- Based on v2ray-core with significant modifications.
- Comprehensive enhancements, excellent performance, fully compatible.

## 2020.11.23

project X start

> ~~When the dream begins~~
