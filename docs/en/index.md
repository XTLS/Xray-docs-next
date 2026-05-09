---
layout: home

hero:
  name: Project X
  text: Xray-core
  tagline: Fear not the clouds that obscure the view, golden eyes like a torch brighten the sky
  image:
    src: /img-project-x.png
    alt: Xray, Penetrates Everything
  actions:
    - theme: brand
      text: Quickstart
      link: /en/document/
    - theme: alt
      text: Configuration guide
      link: /en/config/
    - theme: alt
      text: Sponsor & Donation & NFTs
      link: /en/about/sponsor.md

features:
  - title: Original protocols
    icon: 🧬
    details: Original protocols such as VLESS, XTLS, Mux.Cool, XUDP, XHTTP, and REALITY cover proxying, flow control, multiplexing, transport, and security.
  - title: Powerful routing
    icon: 🔀
    details: A flexible routing and DNS system supports fine-grained traffic scheduling by domain, IP, port, protocol, process, user, and more for both forward-proxy splitting and reverse-proxy networking.
  - title: Traffic camouflage
    icon: 🎭
    details: VLESS fallback, REALITY, XTLS flow control, FinalMask, and related approaches reduce traffic fingerprints and improve resistance to detection at multiple layers.
  - title: Free combination
    icon: 🧩
    details: Proxy protocols, flow-control modes, transport layers, and the routing system can be freely combined to fit different scenarios.
  - title: Ultra-low overhead
    icon: 🌱
    details: VLESS removes redundant encryption, and Splice cuts forwarding overhead, making OpenWRT, Raspberry Pi, and other lightweight devices practical targets.
  - title: Community-driven
    icon: 💖
    details: Active community discussion and contributions under the MPL 2.0 open-source license.
---

## XTLS? Xray? V2Ray?

> **XTLS are brilliant ideas for TLS we study, while Xray is the best practice we maintain.**

- Xray-core originally branched from v2ray-core, but it has evolved independently for a long time and should no longer be treated as a fully compatible drop-in replacement.
  - Only one executable file, including ctl functionality, run is the default command
  - Some configuration structures and usage patterns still resemble v2ray-core, but environment variables, API prefixes, and many features are already different
  - Exposed raw protocol's ReadV on all platforms
  - Provides complete support for VLESS, XTLS Vision, and REALITY
  - Provides multiple XTLS flow-control modes and can deliver extremely high performance with Splice in suitable scenarios

### Who are we?

> **It doesn't matter who we are. What matters is that we will keep riding and never look back.**

### Help Xray become stronger

Welcome to help Xray become stronger!

- 🖥️ Help develop and test Xray, submit high-quality Pull requests.
- 📩 Initiate constructive or meaningful issues and discussions in [GitHub Issues](https://github.com/XTLS/Xray-core/issues) or [Discussion area](https://github.com/XTLS/Xray-core/discussions).
- 📝 Write down your usage experience and submit it to Xray's [documentation website](https://github.com/XTLS/Xray-docs-next).
- 💬 Help group members/chat in Telegram group.
- **...In fact, every support for Xray will make Xray stronger.**

### Telegram

- [Project X Discussion Group](https://t.me/projectXray)
  - Chinese / English user group. Chat freely within the rules, no fighting, no abuse of power.
  - Feel free to ask questions, and try to answer those you know.
  - No advertising, no politics, no NSFW.

- [Project VLESS Group](https://t.me/projectVless)
  - Russian user group. Sister group of [Project X](https://t.me/projectXray).
  - No advertising, no insults, no politics.

- [Project XHTTP Group](https://t.me/projectXHTTP)
  - Persian user group. Sister group of [Project X](https://t.me/projectXray).
  - No advertising, No insults, No politics.

- [Project X Channel](https://t.me/projectXtls)
  - Publish the latest news of Project X.

### Thanks

- Thanks to everyone for their support!
- Thanks to all kinds of scripts, Docker images, client support... Thanks to all the big guys who helped improve the ecosystem!
- Thanks to friends who have contributed to the Xray website and documentation.
- Thanks to friends who have made meaningful suggestions and comments.
- Thanks to every friend in the Telegram group who helps others.

### More about project X

- If you would like to learn more about project X's history and growth, please click [here](./about/news.md)
- Now Project X releases NFTs! If you would like to have one Project X NFT, or want to donate to or sponsoring Project X, please click [here](https://github.com/XTLS/Xray-core/discussions/3633#discussioncomment-10240940)

### License

[Mozilla Public License Version 2.0](https://github.com/XTLS/Xray-core/blob/main/LICENSE)

### Stargazers over time

[![Stargazers over time](https://starchart.cc/XTLS/Xray-core.svg?variant=adaptive)](https://starchart.cc/XTLS/Xray-core)
