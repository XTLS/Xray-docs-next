# Grand Chronicle

## 2024.10.31 <badge>[24.10.31](https://github.com/XTLS/Xray-core/releases/tag/v24.10.31)</badge>

Happy Halloween! 🎃

There are gifts and candies for this Halloween~ Welcome to unwrap and taste~ 🎁

~~SplitHTTP evolved into XHTTP, and now it has the capability of separating uplink and downlink! Undoubtedly, XHTTP has opened a brand new era.~~

## 2024.10.24

Only panels that can be configured safely are listed now. The issue of plaintext HTTP cannot be taken lightly.

## 2024.10.18

The first Project X NFT priced at 0.15 ETH was sold yesterday. Thanks for the support! Don't forget, the earlier you buy, the cheaper it is.

There are expected to be 10,000 REALITY NFTs (with two being given away), priced at 0.01 ETH each, to serve as a channel for daily donations.

## 2024.10.4

Why are there people managing panels using <http://ip> on the public web? No, this shouldn't be happening...

For safety, tools used for such configurations should use HTTPS or SSH forwarding to [ensure security](https://t.me/projectXtls/358).

## 2024.10.3

It's been almost a day since v24.9.30 was set to `latest`, and I haven't seen anyone complaining about issues ~~, which implies that the deleted features were truly not being used by anyone~~. 🤡

## 2024.9.30 <badge>[24.9.30](https://github.com/XTLS/Xray-core/releases/tag/v24.9.30)</badge>

First stable release after changing the versioning rules!

As the first release after the version number change:

- SplitHTTP added XMUX control.
- HTTP transport added HTTP/3.
- TCP in transport layer renamed to RAW (it makes more sense now).
- UDP Noises for Freedom outbound.
- **Note**: This version removed a large amount of obsolete configuration code. Please strictly check your configuration file against the documentation before upgrading to avoid accidents.

## 2024.9.28

It is generally acknowledged that joining the group is difficult.

However, quality matters more than quantity. It tests the ability to find answers independently ~~and a little bit of luck~~, so as to maintain high-quality communication in the group.

Cherish your qualification to stay in the group and do not violate the rules.

## 2024.9.24

Reminder: Only one Project X NFT priced at 0.1 ETH remains. Afterward, the price will start at 0.15 ETH.

## 2024.9.17

The sister group, Project X, has reached 1000 members.

Thanks for the support from the non-Chinese speaking world!

- What are XHTTP and XgRPC?

## 2024.9.12

The return of the Grand Chronicle?!

## 2024.9.7 <Badge>[v24.9.7](https://github.com/XTLS/Xray-core/releases/tag/v24.9.7)</Badge>

First release after changing the version numbering.

- Removed QUIC and DomainSocket transport, and removed two pieces of legacy configuration code from ancient times.
  - Binary size reduced by 1MB compared to v1.8.24.
- As always, includes necessary bug fixes.

## 2024.9.6

Can Xray-core use JSON format subscriptions? The proposal is [here](https://github.com/XTLS/Xray-core/discussions/3765).

## 2024.8.30 <Badge>[v1.8.24](https://github.com/XTLS/Xray-core/releases/tag/v1.8.24)</Badge>

While waiting for the SplitHTTP multiplex controller, the main branch has accumulated a large number of important updates, so we decided to release a version first.

- Socks inbound now defaults to being compatible with HTTP proxy requests.
- UDP noise (preview).
- And some other improvements.

Due to the existence of traditional version numbers, planning features and scheduling for each version has seriously hindered the development, merging, and release of new features. Therefore, we decided to deprecate traditional version numbers starting from the next version, use the release date as the version number (e.g., v24.8.30), cancel version planning, and fully adopt rolling updates. Completed features will be merged directly without waiting. We expect to release a version at the end of each month.

After all, for anti-censorship software, compared to traditional version numbers, the timeliness of new features and monthly updates are more important than releasing a version with fixed features and maintaining it for a long time.

The next version will remove some ancient code. In the future, we will accumulate new code daily, remind users to migrate, and delete code/introduce breaking changes in the new year's version.

We believe that with your donations and the innovation in the release format, the Xray-core project will develop even better.

## 2024.8.26

Project VLESS group founded.

We have created [Project VLESS](https://t.me/projectVless) for non-Chinese users (mainly Russian).

## 2024.8.3

The first [Project X NFT](https://github.com/XTLS/Xray-core/discussions/3633) is officially issued!

Just as Xray has created a lot of history, issuing an NFT is also an unprecedented operation in this field. These NFTs are very commemorative, arguably historically significant, and their value far exceeds the current initial price. Given time, they will surely be invaluable. Finally, thank you again for your support of Project X.

## 2024.7.29 <Badge>[v1.8.23](https://github.com/XTLS/Xray-core/releases/tag/v1.8.23)</Badge>

- Congratulations to [@mmmray](https://github.com/mmmray) for contributing the 1000th commit to Xray-core!
- Optimized the stability of SplitHTTP uplink. The server must be upgraded to this version to support the new client.
- More changes on SplitHTTP.

## 2024.7.22 <Badge>[v1.8.21](https://github.com/XTLS/Xray-core/releases/tag/v1.8.21)</Badge>

It seems we have returned to the initial state of "diarrhea-style" frequent releases...

As predicted in v1.8.16, SplitHTTP now initially supports HTTP/3 (QUIC). Undoubtedly, SplitHTTP H3 has opened a brand new era.

- SplitHTTP H3 is the first QUIC-based proxy completely based on standard H3 and supporting CDN. It can also be hidden using reverse proxy or Browser Dialer.

## 2024.7.16

The Project X documentation now has a Russian version! Thanks to [@iambabyninja](https://github.com/iambabyninja) for the translation!

> Привет, друзья из России!

## 2024.7.15

Through known information and efforts, Xray-core now supports Windows 7 again! In subsequent releases, Windows 7 users can download the archive named Xray-win7-32.zip or Xray-win7-64.zip, unzip it, and enjoy. Thanks for everyone's support! For specific usage, please click [here](../document/install.md).

Although Windows 7 will eventually leave us as everything upgrades, we can delay that moment for a little while longer.

## 2024.6.18 <Badge>[v1.8.16](https://github.com/XTLS/Xray-core/releases/tag/v1.8.16)</Badge>

A new transport is here, currently named SplitHTTP.

- There are two diametrically opposed ways to achieve further traffic obfuscation: Multiplexing and Split Connection.
- It allows passing through CDNs that do not support WebSocket or gRPC, achieving the same goal as Meek, but SplitHTTP is simpler and more efficient than Meek.
- SplitHTTP does not have the ALPN issue of WebSocket, which is a major advantage. It will support HTTP/3 (QUIC) in the future.
- Additionally, SplitHTTP has also been added to the share link combo~

## 2024.6.2

A new transport mode is being forged...

## 2024.4.26 <Badge>[v1.8.11](https://github.com/XTLS/Xray-core/releases/tag/v1.8.11)</Badge>

- There is now a tool for generating ECH keys.
- Enhancements, fixes, and removed a bit of unused code.

## 2024.4.20

We now have issue templates, thanks to [@Fangliding](https://github.com/Fangliding)!

## 2024.4.13

VLESS Seed is ready, waiting for the right moment.

## 2024.3.18 <Badge>[v1.8.10](https://github.com/XTLS/Xray-core/releases/tag/v1.8.10)</Badge>

Like WebSocket, HTTPUpgrade now also has 0-RTT.

## 2024.3.11 <Badge>[v1.8.9](https://github.com/XTLS/Xray-core/releases/tag/v1.8.9)</Badge>

Added HTTPUpgrade transport, rumored to be lighter than WebSocket.

- Added to the share link combo~

## 2024.2.29

gRPC transport now also has a configuration field similar to Host! It's called `authority`. Now gRPC can also do "domain fronting" without ALPN issues.

## 2024.2.25 <Badge>[v1.8.8](https://github.com/XTLS/Xray-core/releases/tag/v1.8.8)</Badge>

- XUDP traffic now uniformly uses Vision padding. Come and experience it.
- Added leastLoad balancer.
- Bug fixes, performance optimizations...

## 2024.1.9

Shocked to hear Win7 cannot run the new Xray-core? Exploration revealed that Go dropped support for Win7. Is there any way to continue supporting this somewhat ancient but still elegant operating system?

## 2023.11.21

The [paper](https://t.me/projectXtls/212) published at the USENIX top conference confirms that XTLS Vision has achieved its design goals.

And XTLS will not stop there; it will pierce through towering walls like an X-ray.

## 2023.11.18 <Badge>[v1.8.6](https://github.com/XTLS/Xray-core/releases/tag/v1.8.6)</Badge>

- WireGuard now also has a corresponding inbound. Freedom outbound finally got `splice`.
- Outbound `domainStrategy` has also been unified.
- More delicious little snacks.
- Due to ~~force majeure~~ feature changes, Dragonfly BSD support has sadly left the stage.
- ~~Are we really going to say goodbye to the classic Windows 7?~~

## 2023.9.30

Designed a brand new color scheme for v2rayNG. Install the latest Pre-release version to experience it.

## 2023.8.29 <Badge>[v1.8.4](https://github.com/XTLS/Xray-core/releases/tag/v1.8.4)</Badge>

After half a year of polishing, 1.8.x has finally reached its first recognized stable version.

Likewise, this release integrates many improvements. Come and taste it!

## 2023.7.22

Fixed another legacy connection drop issue in HTTP/2 transport.

## 2023.7.7

About to add Seed support to Vision.

## 2023.6.30

The next XTLS flow control: xtls-rprx-switch 🍪

- XTLS 0-RTT has been teased for a few months; intended to keep a sense of mystery.
- Compared to the existing XTLS Vision and Mux, it has even better advantages.

## 2023.6.27

[How to choose a REALITY target domain? Check here to double the result with half the effort!](https://github.com/XTLS/Xray-core/discussions/2256#discussioncomment-6295296)

## 2023.6.19 <Badge>[v1.8.3](https://github.com/XTLS/Xray-core/releases/tag/v1.8.3)</Badge>

- The first version after the Code Slimming Plan. VMess (MD5), MTProto, and Starlark related codes have been unloaded. Traveling light.
- Code refactoring is also part of traveling light.
- At the same time, we haven't forgotten to add some enhancements and fix vulnerabilities.
- ~~v1.8.3 is the last version for this year.~~

## 2023.6.6

Good news: The next XTLS flow control is not called Vision. 🍪

## 2023.4.21

Perhaps we can borrow a bit from [RealiTLScanner](https://github.com/XTLS/RealiTLScanner)...

## 2023.4.20

After years of development, accumulating countless lines of code... The [Code Slimming Plan](https://github.com/XTLS/Xray-core/discussions/1967) has been proposed!

## 2023.4.19

`xtls-0rtt-vision(-udp443)` 🍪

## 2023.4.18 <Badge>[v1.8.1](https://github.com/XTLS/Xray-core/releases/tag/v1.8.1)</Badge>

The upgraded XUDP is here too!

- Now XUDP also comes with connection migration and port reuse features, and has a global Session ID ~~, so mom doesn't have to worry about accidental disconnections anymore~~.
- We also added XUDP control configurations, allowing you to master it better~
- The new XUDP tastes better when paired with XTLS Vision~
- As customary, there are little desserts. Welcome to taste~

## 2023.4.6

XUDP is also quietly upgrading...

## 2023.3.29

`PLUX protocol` 🍪

## 2023.3.19

The share link standard for REALITY has also emerged.

## 2023.3.9 <Badge>[v1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0)</Badge>

> THE NEXT FUTURE, REALITY is NOW release on Xray-core

REALITY has been implemented and released! Welcome to experience it!
XTLS Vision has also been perfected. Please upgrade both ends to the latest version to enjoy.

- Due to changes in the Vision padding algorithm this time, there will be compatibility issues between the old and new versions of XTLS Vision.
- HTTP/2 transport has also been improved. Use the new version now for silky smoothness~
- There are also a large number of small improvements welcome for you to experience~

## 2023.3.4

> Legends never die, they become a part of ~~you~~ VLESS.
>
> They simply fade away.

## 2023.3.2

Some legacy issues with HTTP/2 transport have been improved. Welcome to test it with REALITY for silky smoothness~

## 2023.2.16

THE NEXT FUTURE becomes THE REALITY NOW!

## 2023.2.9

REALITY is reality now!

## 2023.2.8 <Badge>[v1.7.5](https://github.com/XTLS/Xray-core/releases/tag/v1.7.5)</Badge>

Keep riding and never look back.

- Congratulations to [@yuhan6665](https://github.com/yuhan6665) for contributing the 500th commit to Xray-core!
- XTLS Vision flow control is nearing perfection and will be practical soon.
- Added more options for uTLS fingerprint simulation. Which one suits you?
- Share links now also support sharing uTLS fingerprint configurations simultaneously.
- Even more feature enhancements and fixes.
- This version is also the last one where you can see XTLS Origin, Direct, and Splice flow controls. ~~A bit sad, isn't it?~~

## 2023.1.29

Winter cannot cover the NEXT FUTURE...

## 2022.12.26 <Badge>[v1.7.0](https://github.com/XTLS/Xray-core/releases/tag/v1.7.0)</Badge>

Due to a slip of the hand, the version number jumped significantly this time. Thanks for everyone's support!

- Semantic Versioning will be strictly followed from now on.

## 2022.11.28 <Badge>[v1.6.5](https://github.com/XTLS/Xray-core/releases/tag/v1.6.5)</Badge>

This time we have WireGuard outbound.

- Using WireGuard with CF WARP can unlock interesting new ways to play.
- As always, security updates and fixes are included.

## 2022.11.7 <Badge>[v1.6.3](https://github.com/XTLS/Xray-core/releases/tag/v1.6.3)</Badge>

Now Vision flow control can also use uTLS fingerprint simulation. Is this the benefit of using `tlsSettings`!

## 2022.10.29 <Badge>[v1.6.2](https://github.com/XTLS/Xray-core/releases/tag/v1.6.2)</Badge>

The first release containing Vision flow control is out! Welcome to try it out and submit feedback!

## 2022.10.22 <Badge>[v1.6.1](https://github.com/XTLS/Xray-core/releases/tag/v1.6.1)</Badge>

- Brought uTLS fingerprint support to WebSocket, HTTP/2, and gRPC transports!
  - Options that were previously only available for TCP transport under standard TLS are now even easier to use.
- TCP congestion control can now be set separately for inbound and outbound on Linux.

## 2022.10.3

The weather is getting cooler, but the pace of development has not cooled down. The blockade descends, but it cannot stop the progress...

- A new XTLS flow control is brewing...
  - Solves existing issues with previous flow controls;
  - Enables `splice` directly for TLS 1.3;
  - Adds TLS handshake length obfuscation;
  - Simplifies code, using `tlsSettings` instead of `xtlsSettings`...

## 2022.8.28 <Badge>[v1.5.10](https://github.com/XTLS/Xray-core/releases/tag/v1.5.10)</Badge>

The underlying transport now supports more reasonable TCP Keepalive configurations.

## 2022.6.20 <Badge>[v1.5.8](https://github.com/XTLS/Xray-core/releases/tag/v1.5.8)</Badge>

Shadowsocks-2022 relay is now supported.

## 2022.5.29 <Badge>[v1.5.6](https://github.com/XTLS/Xray-core/releases/tag/v1.5.6)</Badge>

The Shadowsocks-2022 protocol comes to Xray-core!

- Thanks to [@nekohasekai](https://github.com/nekohasekai) for developing the brand new Go implementation <https://github.com/SagerNet/sing-shadowsocks> and introducing it to Xray.
- Thanks to [@database64128](https://github.com/database64128) for promoting the Shadowsocks community to propose a complete design scheme.
- Thanks to [@RPRX](https://github.com/RPRX) for submitting the original vulnerability.

Shadowsocks-2022 is a redesigned, brand-new protocol:

- Based on retaining Shadowsocks native UDP, it solves security issues like replay attacks (using timestamps like VMess, so clients and servers need consistent time).
- Supports single-port multi-user, and references the design and implementation of QUIC, WireGuard, etc., using a session mechanism to reduce encryption burden and ensure seamless migration during network changes.

## 2022.4.24 <Badge>[v1.5.5](https://github.com/XTLS/Xray-core/releases/tag/v1.5.5)</Badge>

This time brings a detection data interface convenient for visualization! Come and experience it!

- Also fixed some issues affecting user experience.

## 2022.3.13 <Badge>[v1.5.4](https://github.com/XTLS/Xray-core/releases/tag/v1.5.4)</Badge>

Added a `wxray.exe` file for the Windows platform that doesn't pop up a black window, and brought enhancements to UDS listening.

## 2022.1.29 <Badge>[v1.5.3](https://github.com/XTLS/Xray-core/releases/tag/v1.5.3)</Badge>

Farewell to the Ox, Leaping into the Year of the Tiger. 🧨

- This time brings stream allocation improvements for QUIC transport. Using QUIC transport is now smoother.

## 2021.12.24 <Badge>[v1.5.2](https://github.com/XTLS/Xray-core/releases/tag/v1.5.2)</Badge>

Added a new option for gRPC, making it easier to use when passing through CDNs.

## 2021.12.15 <Badge>[v1.5.1](https://github.com/XTLS/Xray-core/releases/tag/v1.5.1)</Badge>

> "Transitional phase maintenance release"

- New features, enhancements, and a large number of fixes are coming one after another.
- Remember to remove `alterID` from VMess configuration!

## 2021.10.20 <Badge>[v1.5.0](https://github.com/XTLS/Xray-core/releases/tag/v1.5.0)</Badge>

Truly massive changes!

- Refactored DNS components; more protocols and detailed configurations are supported.
- Enhanced gRPC transport and FakeDNS.
- Finally supports Windows ARM64.
- More new features and improvements await your experience.

## 2021.9.23 <Badge>[v1.4.5](https://github.com/XTLS/Xray-core/releases/tag/v1.4.5)</Badge>

Happy Mid-Autumn Festival, wishing you a happy family reunion.

- ~~Fixed the bug where the version number was too low and unlucky.~~
- This time removed insecure encryption methods in Shadowsocks. Migrate to AEAD encryption as soon as possible.
- Fixed a historical issue existing since ancient times: enabling traffic statistics might degrade performance. Simply put, turning on statistics now regardless of configuration will not have any impact on performance.
- Also includes security updates for XTLS and numerous fixes.
- By the way, due to the update of the TLS library, `cipherSuites` can no longer specify the order of cipher suites, and `preferServerCipherSuites` has been completely deprecated. In fact, these changes already occurred in Xray-core v1.4.3.

## 2021.9.16

- The documentation site has fully switched to docs-next, silky smooth, better experience! The address remains [https://xtls.github.io/](https://xtls.github.io/)

## 2021.9.8 <Badge>[v1.4.3](https://github.com/XTLS/Xray-core/releases/tag/v1.4.3)</Badge>

This is a periodic maintenance release. Development continues...

- Accumulated a large number of improvements and new features during this period.
- Added new DomainMatcher; domain rule matching performance is now better.
- Added health checks for HTTP/2 and gRPC transport, improved handling of unknown SNI, and fixed a bunch of bugs.

> ~~Helden sterben nicht!~~

## 2021.7.14

- AnXray's new icon, ~~designed at heavy cost~~, is now online!
  - The icon is now more recognizable.
- In the past three weeks, AnXray has accumulated 600 stars, 2K+ channel subscribers, and 11K+ GitHub downloads. Thanks for everyone's support.
- AX is the abbreviation for AnXray. It is recommended to use AX to refer to AnXray for brevity.

## 2021.6.21

Now an open-source, free Android client with Xray-core at its core has appeared—[AnXray](https://github.com/XTLS/AnXray)! Maintained by [@nekohasekai](https://github.com/nekohasekai).

- Supports numerous protocols and plugins.
- Chief Visual Designer [@RPRX](https://github.com/RPRX) designed the X-style logo, slogan, and a unique material black and white theme.
- There is also a little easter egg inside the APP waiting for you to discover.

Polished details repeatedly from morning till night over the last two days. Hope everyone gives it a Star and follows.

## 2021.5.1

Improvements to tun2socks have appeared on v2rayNG.

## 2021.4.26

Brought an improvement to tun2socks. Might be able to taste it later~

## 2021.4.12

Now bringing a sneak peek of X-flutter, look forward to what it will look like~ ~~🍪~~

## 2021.4.6

- VuePress Next.
- With Dark Mode.

## 2021.4.4

- This documentation welcomes a new homepage.
- This documentation welcomes Dark Mode.
- ~~Of course, Dark Mode still has various issues. Specific content needs to be adjusted slowly.~~
- Also: Telegram group chat exceeded 5000 people! Also added Anti-Spam bot!
- 🎉🎉🎉

## 2021.4.1 <Badge>[v1.4.2](https://github.com/XTLS/Xray-core/releases/tag/v1.4.2)</Badge>

- Not an April Fool's joke, updated today.
- Added Browser Dialer, used to change TLS fingerprints and behavior.
- Added uTLS, used to change TLS Client Hello fingerprints.
- By the way, fixed a bunch of wondrous issues. See the changelog for details.

## 2021.3.25

Yes, still changing. -\_-

## 2021.3.15

The documentation site is quietly undergoing some mysterious changes... 🙊🙊🙊

## 2021.3.14 <Badge>[v1.4.0](https://github.com/XTLS/Xray-core/releases/tag/v1.4.0)</Badge>

- Happy Pi-Day!
- This is a major update:
  - Introduced transport layer support for proxy chaining.
  - Introduced Domain Strategy for Dialer, solving wondrous DNS issues.
  - Added gRPC transport mode, and a slightly faster Multi Mode.
  - Added WebSocket Early-Data feature, reducing WebSocket latency.
  - Added FakeDNS.
  - Also fixed a series of issues and added various features. See changelog for details.
- VuePress is still nicer (

## 2021.3.3 <Badge>[1.3.1](https://github.com/XTLS/Xray-core/releases/tag/v1.3.1)</Badge>

- This version uses Golang 1.16, officially supporting Apple Silicon natively.
- At the same time fixed a bug that would cause Panic. ~~Holmium\_ thinks this is deception, a sneak attack.~~
- Fixed several legacy issues.

## 2021.2.14 <Badge>[1.3.0](https://github.com/XTLS/Xray-core/releases/tag/v1.3.0)</Badge>

- Happy 🐮 Year 🎉!
- v1.3.0 implemented FullCone for all V-series protocols through a very ingenious mechanism, while ensuring certain compatibility.
- OHHHHHHHHHHHH!

## 2021.01.31 <Badge>[1.2.4](https://github.com/XTLS/Xray-core/releases/tag/v1.2.4)</Badge>

- Solved two legacy issues where "errors might occur when connecting to standard Socks servers".
- It seems there are no changes in this version, but this is just the calm before the storm.
- (Yes, I am a prophet)
  > You fool, you are holding a UNO card.

## 2021.01.25

- Have students mastered the best and most detailed beginner's guide on the whole internet? Teacher 🍉 starts serializing the [First Level of the Guide](../document/level-1/)...
- The [English version documentation site](/en/) is gradually adding content. Thanks to all the big shots for their hard work~!

## 2021.01.22 <Badge>[1.2.3](https://github.com/XTLS/Xray-core/releases/tag/v1.2.3)</Badge>

- Support for SS protocol has become stronger **again**, supporting single-port multi-user!
- Support for Trojan protocol has also become stronger **again**; Trojan fallback also unlocked a new posture for SNI routing~!
- _(VLESS: \_cries_)\_
- Weird UDP BUGs have been eliminated. One word: "Stable".
- Sniffing can exclude domains you don't want to sniff, enabling some new ways to play.
- Salute to [@Bohan Yang](https://github.com/bohanyang) who discovers issues -> opens issues -> self-tests -> self-analyzes -> finds the problem -> solves it -> and then submits PRs to upstream and downstream!
- Other delicious little cherries, strictly update and taste as usual.

## 2021.01.19

- Some numbers
  - Version released 10 tags
  - Resolved 100 issues
  - Forked 300 times
  - Starred 2000 times
  - Group has 3000 people

## 2021.01.17

- Hard translation work has begun. Thanks to [@玖柒 Max](https://github.com/jiuqi9997) and all other translation gurus.
- [English version](/en/)

## 2021.01.15 <Badge>[1.2.2](https://github.com/XTLS/Xray-core/releases/tag/v1.2.2)</Badge>

- Fallback routing unlocked a strange new posture! Fallback can now route based on SNI~!
- The previously announced UUID modification is officially online. ([Look down, look down](#_2021-01-12))
- Logs now look a bit more pleasing to the eye than last time.
- Remote DOH has learned to use routing just like other DNS modes.
- Of course, there are other various small candies. (Update and taste is the way)
- Ah, also, the first man in the world to run Xray on M1 is Anthony TSE.

## 2021.01.12

- The upcoming UUID modification supports mapping between custom strings and UUIDs. This means you can write an ID in the configuration file to correspond to a user like this:
  - Client writes "id": "I love Teacher 🍉 1314",
  - Server writes "id": "5783a3e7-e373-51cd-8642-c83782b807c5" (This UUID is the UUID mapping for `I love Teacher 🍉 1314`)
- Teacher 🍉's [Absolute Beginner's Guide](../document/level-0/) finale. Confetti.

## 2021.01.10 <Badge>[1.2.1](https://github.com/XTLS/Xray-core/releases/tag/v1.2.1)</Badge>

- [Absolute Beginner's Guide](../document/level-0/) serialization is online! Teacher 🍉's painstaking work teaches you how to configure Xray proficiently from scratch!
- (Possibly the most detailed and patient tutorial on the whole internet teaching you to configure from 0)
- [Transparent Proxy](../document/level-2/) has also added more articles.
- There are many detail modifications, and the documentation will become more and more standardized!
- Thanks to [@ricuhkaen](https://github.com/ricuhkaen) , [@BioniCosmos](https://github.com/BioniCosmos), [@kirin](https://github.com/kirin10000)

- Extensive UDP-related fixes, you can even play Rainbow Six on Ubisoft's potato servers!
- Google Voice should also be able to make calls normally using v2rayNG.
- Logs now look more pleasing to the eye.

## 2021.01.07

- Politeness and respect should be one of the unspoken rules of the community.

## 2021.01.05

- The documentation site is quietly undergoing some mysterious changes... 🙊🙊🙊

## 2021.01.03

- First PR for the documentation repository. 🎉
  [Transparent Proxy (TProxy) Configuration Tutorial](../document/level-2/tproxy.md), thanks to [@BioniCosmos](https://github.com/BioniCosmos)
- TG group exceeded 2500 members.

## 2021.01.01

[Happy New Year everyone, Happy Niu (Ox) Year!] 🎆🎇🎆 <Badge>[1.2.0](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0)</Badge>

🎁 In the last few minutes of New Year's Day, v1.2.0 is here, carrying the custom of obligatory Friday updates, carrying the hard work of all contributing gurus and @rprxx's dark circles, living up to expectations!

- New Year's gift 🎁 following the Christmas gift [v1.1.5](#_2020-12-25-1-1-5), a big welfare for gamers, comprehensive FullCone.
- (UDP will continue to be enhanced!)
- If you have already unwrapped the Christmas gift, this time there are even more exquisite packaging and small candies than the Christmas gift. (Again, no need to ask, just update and taste)
- (No, the following is not an advertisement, it is a milestone.)
- Xray is the first unrestricted multi-protocol platform in history: Xray alone solves the problem without relying on other implementations.
  - Shouldering everything alone! Supports all major mainstream protocols!
  - Performance leaving others in the dust!
  - Increasingly perfect functions!
  - Terrifying vitality and community affinity!
- Xray will keep moving forward! Therefore [Xray needs more heroes!!](https://github.com/XTLS/Xray-core/discussions/56)!!
- PS: Please savor, carefully savor every sentence of the [release notes](https://github.com/XTLS/Xray-core/releases/tag/v1.2.0). There seems to be a little secret easter egg ~~ (Ah, someone is knocking... I'll tell you later)~~

## 2020.12.29

Good news for gamers using Transparent Proxy! Xray-core tproxy inbound, socks outbound UDP FullCone beta version, currently in hot testing in [TG Group](https://t.me/projectXray).

## 2020.12.25 <Badge>[1.1.5](https://github.com/XTLS/Xray-core/releases/tag/v1.1.5)</Badge>

Merry Christmas!

- Christmas gift for gamers! You can play games refreshingly with xray! Because of SS/trojan UDP fullcone.
- You can write configuration files in your favorite format, such as yaml, toml...
- (VLESS UDP fullcone and more enhancements are coming soon!)
- No need to worry about certificate verification being blocked anymore, OCSP stapling is online!
- kirin brought a big wave of script updates. [Script here](https://github.com/XTLS/Xray-install)
- And more delicious little cherries! (No need to ask, just update and taste)

## 2020.12.24

For some indescribable reasons, the Xray documentation site has sneakily gone online before the release date.
The URL is: [Yes, what you are looking at is](https://xtls.github.io)

Everyone is welcome to check various content and correct errors/make suggestions (can be sent to the issue area of the documentation github repository).

The documentation site needs continuous improvement and added content, as well as design refinement.
Therefore, everyone is welcome to contribute to the documentation construction.
[Documentation Repository](https://github.com/XTLS/XTLS.github.io)

There is a brief tutorial in the repository's readme explaining how to help xray improve the documentation site.
Welcome everyone to view, correct, modify, and add insights.

## 2020.12.23

Xray-core Shadowsocks UDP FullCone beta version, currently in hot testing in [TG Group](https://t.me/projectXray).

## 2020.12.21

- Project X group members 2000+
- Group messages (including game group) exceed 10,000 daily

## 2020.12.18 <Badge>[1.1.4](https://github.com/XTLS/Xray-core/releases/tag/v1.1.4)</Badge>

- Lower startup memory footprint and memory usage optimization.
- Custom TLS to improve your SSL rating.
- Support for Splice in XTLS inbound and XTLS support for Trojan.
- And suggestions for the best usage mode of Splice on your router.

## 2020.12.17

Given the growing number of group members and gaming needs, a [TG Game Group](https://t.me/joinchat/UO4NixbB_XDQJOUjS6mHEQ) has been opened.

## 2020.12.15

[Install script dev branch](https://github.com/XTLS/Xray-install/tree/dev) opened, features are being continuously updated.

## 2020.12.11 <Badge>[1.1.3](https://github.com/XTLS/Xray-core/releases/tag/v1.1.3)</Badge>

- Full version of REDIRECT transparent proxy mode.
- Optimization suggestions for splice flow control mode on soft routers.

## 2020.12.06 <Badge>[1.1.2](https://github.com/XTLS/Xray-core/releases/tag/v1.1.2)</Badge>

- Added splice mode to flow control, Linux exclusive, performance leaves others in the dust.
- Enhanced API compatibility.

## 2020.12.04

Added splice mode.

## 2020.11.27

- Project X's main GitHub repository Xray-core has gained 500+ stars.
- Made it to GitHub Trending.
- Project X group members exceeded 1000, channel subscribers 500+.

## 2020.11.25 <Badge>[1.0.0](https://github.com/XTLS/Xray-core/releases/tag/v1.0.0)</Badge>

The first version of Xray.

- Modified based on v2ray-core, with significant changes.
- Comprehensive enhancement, excellent performance, fully compatible.

## 2020.11.23

project X start

> ~~When the dream began~~
