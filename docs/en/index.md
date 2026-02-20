---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: Project X
  text: Xray-core
  tagline: Fear not the clouds that obscure the view, golden eyes like a torch brighten the sky
  image:
    src: /LogoX2.png
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
  - title: Pierce Whitelists (uTLS & REALITY)
    icon: 🎭
    details: uTLS perfectly simulates client TLS fingerprints; REALITY takes over server certificate fingerprints without a domain name, striking directly at SNI blocking and whitelists.
  - title: Anti-Censorship Transport (XHTTP & xDrive)
    icon: 🚀
    details: Transport layer innovations. XHTTP cleverly leverages CDNs, while xDrive utilizes public cloud drives, hiding real traffic within massive whitelisted services.
  - title: Extreme Camouflage (xDNS & xICMP)
    icon: 👻
    details: Makes traffic invisible by perfectly encapsulating data into basic DNS queries or ICMP packets, establishing communication even in extreme blocking environments.
  - title: Performance & Stealth (VLESS & Vision)
    icon: ⚡
    details: VLESS avoids meaningless double encryption of inner traffic; combined with XTLS Vision, it completely eliminates TLS-in-TLS characteristics and achieves 0-RTT handshakes.
  - title: Ultra-Low Latency & Fullcone
    icon: 🎮
    details: Deeply optimizes DNS performance and fully supports UDP Fullcone NAT traversal, providing a native-like smooth experience for gaming and instant messaging.
  - title: Intranet Penetration (Reverse Proxy)
    icon: 🔗
    details: Built-in powerful reverse proxy and routing distribution, capable of reverse-forwarding server traffic to the client for secure cross-network interconnection.
---

## What is Xray?

**Xray-core is the next-generation network proxy tool that penetrates everything.**

As network blocking technologies continuously upgrade, traditional proxy protocols have gradually fallen behind. Xray-core has completely discarded historical baggage, providing the most powerful solutions for the harshest network environments and most complex routing needs through underlying architecture reconstruction and protocol innovation:

- **Direct Strike on Censorship (uTLS & REALITY)**: **uTLS** perfectly disguises client TLS handshake fingerprints; **REALITY** abandons the traditional website-building model, taking over server certificate fingerprints without needing a domain name. Its core power lies in ignoring SNI blocking and whitelist restrictions by directly "borrowing" certificates and SNIs of major target websites, fundamentally changing the dimension of the confrontation.
- **Core Power & Stealth (VLESS & XTLS Vision)**: A powerful alliance with distinct roles. **VLESS** protocol cleverly avoids meaningless double encryption of already encrypted inner traffic (like TLS 1.3), maximizing CPU power release (its variant **VLESS enc** is a perfect replacement for SS in relay scenarios, safe even if keys are leaked). **XTLS Vision** focuses on completely eliminating TLS-in-TLS traffic characteristics and natively supports true 0-RTT handshakes.
- **Anti-Censorship Transport (XHTTP & xDrive)**: Facing modern complex Deep Packet Inspection (DPI), new transport layers emerged. **XHTTP** leverages CDN infrastructure for efficient traffic forwarding with native 0-RTT support; **xDrive** takes a different approach, using public cloud drive APIs for data transmission, making censorship systems hesitate to block them.
- **Exotic Camouflage Tunnels (xDNS & xICMP)**: Underlying camouflage layers prepared for extremely high-pressure environments. They encapsulate proxy data in standard DNS queries or ICMP (Ping) packets, capable of not only penetrating strict firewall rules but also serving as the ultimate tool to bypass Captive Portals.
- **Ultimate Experience (UDP Fullcone & Reverse Proxy)**: The application side deeply optimizes DNS performance, while the protocol side fully supports UDP Fullcone NAT traversal. The built-in powerful reverse proxy can forward server traffic backward to the client, easily achieving intranet penetration and service exposure.
- **Fearless in Real-World Tests**: During previous strict network blockades (including high-pressure censorship in Iran, Russia, and Quanzhou, China), Xray-core demonstrated unmatched stability and connectivity. **When others fail, Xray prevails.**

> "Simpler configuration, stronger performance, penetrates everything."

### Who are we?

> **It doesn't matter who we are. What matters is that we will keep riding and never look back.**

### Help Xray become stronger

Welcome to help Xray become stronger!

- 🖥️ Help develop and test Xray, submit high-quality Pull requests.
- 📩 Initiate constructive or meaningful issues and discussions in [GitHub Issues](https://github.com/XTLS/Xray-core/issues) or the [Discussion area](https://github.com/XTLS/Xray-core/discussions).
- 📝 Write down your usage experience and submit it to Xray's [documentation website](https://github.com/XTLS/Xray-docs-next).
- 💬 Help group members/chat in our Telegram group.
- **...In fact, every support for Xray will make Xray stronger.**

### Telegram

- [Project X Discussion Group](https://t.me/projectXray)
  - You can chat freely above the bottom line in the discussion group, don't fight, no abuse of power.
  - Feel free to ask questions, and try to answer those you know.
  - No politics, No NSFW.
  - [Persian](https://t.me/projectXHTTP)

- [Project X Channel](https://t.me/projectXtls)
  - Publish the latest news of Project X.

### Thanks

- Thanks to everyone for their support!
- Thanks to all kinds of scripts, Docker images, multi-platform clients... Thanks to all the big guys who helped improve the ecosystem!
- Thanks to friends who have contributed to the Xray website and documentation.
- Thanks to friends who have made meaningful suggestions and comments.
- Thanks to every friend in the Telegram group who helps others.

### More about project X

- If you would like to learn more about project X's history and growth, please click [here](./about/news.md)

### License

[Mozilla Public License Version 2.0](https://github.com/XTLS/Xray-core/blob/main/LICENSE)

### Stargazers over time

[![Stargazers over time](https://starchart.cc/XTLS/Xray-core.svg?variant=adaptive)](https://starchart.cc/XTLS/Xray-core)
