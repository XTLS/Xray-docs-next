# 【Chapter 8】Xray Client Section

## 8.1 Brief Introduction to Xray's Working Principle

To properly configure and use `Xray`, you need to understand its working principle. For newcomers, you can first look at the simplified diagram below (many complex settings are omitted):

![Xray Data Flow](./ch08-img01-flow.png)

The key points are:

1. The APP must actively, or with the help of forwarding tools, send data `inbounds` to the `Xray` client.

2. After traffic enters the client, it will be processed by client routing (`routing`) according to rules and will flow `outbounds` in different directions through the `Xray` client. For example:
   1. Domestic traffic is directly connected (`direct`).
   2. Foreign traffic is forwarded to VPS (`proxy`).
   3. Ad traffic is blocked (`block`).

3. Foreign traffic forwarded to the VPS bypasses the firewall and `inbounds` into the `Xray` server.

4. Once traffic enters the server, just like the client, it will be processed by server routing (`routing`) according to rules and will flow `outbounds` in different directions:
   1. Since it is outside the firewall, traffic is directly connected by default, allowing access to previously inaccessible websites (`direct`).
   2. If chain forwarding is required between different VPS instances, you can configure forwarding rules (`proxy`).
   3. On the server, you can continue to block specific types of traffic, such as ads or BT downloads (`block`).


:::warning 注意

Please remember that `Xray` routing configuration is highly flexible. The explanation above is just one of infinite possibilities.

With the help of `geosite.dat` and `geoip.dat`, you can flexibly control the traffic flow direction from both **domain names** and **IP addresses** perspectives, leaving no blind spots. This is far more powerful than the once simplistic `GFWList`, allowing for precise fine-tuning. For example, you can specify Apple domains for direct connection or forwarding, Amazon domains for proxying or forwarding, Baidu domains for blocking, etc.

Now, [《Brief Analysis of Routing Functionality》](../level-1/routing-lv1-part1.md) is available. I recommend those interested in routing functionality to first complete the basic client configuration explained in this document and then study the detailed information there.

:::

## 8.2 Proper Connection Between Client and Server

Now that you understand the working principle of `Xray`, the next step is to **tell your client how to connect to the VPS server**. This is similar to what you might already be familiar with: telling `PuTTY` how to connect to a server remotely. However, with Xray, the connection involves more than just the four elements of **IP address**, **port**, **username**, and **password**.

In fact, the connection elements for `Xray` are determined by the chosen [protocol](../../config/inbounds/). In the configuration file `config.json` from Chapter 7, we used the unique and powerful `VLESS` protocol combined with `XTLS` flow control. By reviewing that configuration file, you can see the connection elements for this protocol combination are:

- Server **Address**: `a-name.yourdomain.com`
- Server **Port**: `443`
- Connection **Protocol**: `vless`
- Connection **Flow Control**: `xtls-rprx-vision` (the vision mode is suitable for all platforms)
- Connection **Authentication**: `uuiduuid-uuid-uuid-uuiduuiduuid`
- Connection **Security**: `"allowInsecure": false`

Since most beginners typically use mobile apps or desktop GUI clients, I have listed the common clients below. Each client has its own unique configuration interface. It is impractical to show screenshots of each one, so please carefully read the documentation for your chosen client and enter the above elements into the appropriate fields.

:::warning Notice
Many tools actually support both `xray-core` and `v2fly-core`, but the default built-in core may vary. So, don't forget to check which one is being used to ensure it is the desired one!
:::

- **v2rayN - Suitable for Windows Platform**
  - Download the latest version from its [GitHub repository Release page](https://github.com/2dust/v2rayN/releases).
  - Follow the instructions provided by the client to configure it.

- **v2rayNG - Suitable for Android Platform**
  - Download the latest version from its [GitHub repository Release page](https://github.com/2dust/v2rayNG/releases).
  - Follow the instructions provided by the client to configure it.

- **Shadowrocket - Suitable for iOS and macOS with Apple M chips**
  - You need to register a **non-China region** iCloud account.
  - Purchase the app from the App Store.
  - Follow the instructions provided by the client to configure it.

- **Qv2ray - Cross-Platform GUI for Linux, Windows, and macOS**
  - Download the latest version from its [GitHub repository Release page](https://github.com/Qv2ray/Qv2ray/releases) (or find newer versions in its [GitHub Actions builds](https://github.com/Qv2ray/Qv2ray/actions)).
  - Learn from its [official website](https://qv2ray.net/) documentation.
  - Follow the instructions provided by the client to configure it.

- **V2RayXS - A macOS Client Based on V2RayX Using xray-core**
  - Download the latest version from its [GitHub repository Release page](https://github.com/tzmax/v2rayXS/releases).
  - Supports one-click import of [VMessAEAD / VLESS share link standard proposal](https://github.com/XTLS/Xray-core/issues/91) compliant sharing links.
  - Follow the instructions provided by the client to configure it.

At this point, your full configuration should be working properly!

## 8.3 Bonus Question 1: Manually Configuring `xray-core` on PC

Although the previous step is sufficient to complete the setup, if you're a curious and attentive learner, you may recall that I mentioned in the last chapter: "If you place the `xray-core` binary on the server and run it, it becomes the server side; if you download it and run it on your local computer, it becomes the client side." So how exactly do you use `xray-core` as a client directly?

To answer this question, I’ve added a bonus section. It’s a bit beyond the scope and a little more troublesome, but I’m explaining it because this method has some advantages:

- Get the latest version immediately without waiting for the app to update.
- Flexible and free routing configuration capabilities (of course, the advanced routing editor in the GUI client Qv2ray is very powerful and can fully implement the routing configuration of xray-core).
- Save system resources (GUI interfaces always consume resources, and the amount of consumption depends on how the client is implemented).

Its disadvantage is that it requires **manually writing configuration files**, which can be a bit troublesome. But honestly, think about it: you’ve already successfully written the configuration on the server once. What’s the difference now? Let’s break down the steps as usual:

1. First, download the appropriate version for your platform from the official Xray [GitHub repository Release page](https://github.com/XTLS/Xray-core/releases) and extract it to a suitable folder.
2. In the chosen folder, create an empty configuration file: `config.json` (you surely know how to create a new file on your commonly used platform, so no need to elaborate here).
3. As for what is a “suitable folder”? It depends on the specific platform~
4. Fill in the client configuration:
   - I’ll write a configuration file based on the basic three types of traffic routing displayed in `8.1` (domestic traffic direct connection, international traffic forwarded to VPS, ad traffic blocking), combined with the connection elements from `8.2`.
   - Replace `uuid` with the same `uuid` as your server.
   - Replace `address` with your actual domain name.
   - Replace `serverName` with your actual domain name.
   - I’ve already (quite extensively) explained each configuration module at the corresponding configuration point.

   ```json
   // REFERENCE:
   // https://github.com/XTLS/Xray-examples
   // https://xtls.github.io/config/

   // Standard config file structure (server/client) with 5 core components:
   // ┌─ 1_log          Logging - What/Where to log (troubleshooting)
   // ├─ 2_dns          DNS - How to resolve domains (anti-pollution, privacy)
   // ├─ 3_routing      Traffic routing - How to classify traffic (ad-blocking, geo-routing)
   // ├─ 4_inbounds     Inbound rules - Acceptable incoming traffic
   // └─ 5_outbounds    Outbound rules - Where to forward traffic

   {
     // 1_Log Settings
     // Log paths commented for cross-platform compatibility (configure manually)
     "log": {
       // "access": "/home/local/xray_log/access.log",  // Access logs
       // "error": "/home/local/xray_log/error.log",    // Error logs  
       "loglevel": "warning" // Levels: "none", "error", "warning", "info", "debug"
     },

     // 2_DNS Settings
     "dns": {
       "servers": [
         // 2.1 Foreign domains → Foreign DNS
         {
           "address": "1.1.1.1",
           "domains": ["geosite:geolocation-!cn"]
         },
         // 2.2 Chinese domains → Chinese DNS (CN IPs only)
         {
           "address": "223.5.5.5",
           "domains": ["geosite:cn"],
           "expectIPs": ["geoip:cn"]
         },
         // 2.3 Fallback for Chinese domains
         {
           "address": "114.114.114.114",
           "domains": ["geosite:cn"]
         },
         // 2.4 Final fallback → Local DNS
         "localhost"
       ]
     },

     // 3_Routing Rules
     "routing": {
       "domainStrategy": "IPIfNonMatch",
       "rules": [
         // 3.1 Block ads
         {
           "type": "field",
           "domain": ["geosite:category-ads-all"],
           "outboundTag": "block"
         },
         // 3.2 Direct connect Chinese domains
         {
           "type": "field",
           "domain": ["geosite:cn"],
           "outboundTag": "direct"
         },
         // 3.3 Proxy foreign domains
         {
           "type": "field",
           "domain": ["geosite:geolocation-!cn"],
           "outboundTag": "proxy"
         },
         // 3.4 Direct route DNS queries to 223.5.5.5
         {
           "type": "field",
           "ip": ["223.5.5.5"],
           "outboundTag": "direct"
         },
         // 3.5 Direct connect Chinese IPs
         {
           "type": "field",
           "ip": ["geoip:cn", "geoip:private"],
           "outboundTag": "direct"
         }
         // 3.6 Default: First outbound (5.1)
       ]
     },

     // 4_Inbound Settings
     "inbounds": [
       // 4.1 Default SOCKS5 proxy
       {
         "tag": "socks-in",
         "protocol": "socks",
         "listen": "127.0.0.1", // SOCKS5 local address
         "port": 10800,         // SOCKS5 local port
         "settings": {
           "udp": true
         }
       },
       // 4.2 HTTP proxy (for SOCKS-incompatible apps)
       {
         "tag": "http-in",
         "protocol": "http",
         "listen": "127.0.0.1", // HTTP proxy address
         "port": 10801          // HTTP proxy port
       }
     ],

     // 5_Outbound Settings
     "outbounds": [
       // 5.1 Primary proxy (MUST be first)
       {
         "tag": "proxy",
         "protocol": "vless",
         "settings": {
           "vnext": [
             {
               "address": "a-name.yourdomain.com", // Your domain
               "port": 443,
               "users": [
                 {
                   "id": "uuiduuid-uuid-uuid-uuid-uuiduuiduuid", // Match server ID
                   "flow": "xtls-rprx-vision",
                   "encryption": "none",
                   "level": 0
                 }
               ]
             }
           ]
         },
         "streamSettings": {
           "network": "tcp",
           "security": "tls",
           "tlsSettings": {
             "serverName": "a-name.yourdomain.com", // Your domain
             "allowInsecure": false,                // Disallow insecure certs
             "fingerprint": "chrome"                // uTLS fingerprint spoofing
           }
         }
       },
       // 5.2 Direct connection
       {
         "tag": "direct",
         "protocol": "freedom"
       },
       // 5.3 Traffic blocking
       {
         "tag": "block",
         "protocol": "blackhole"
       }
     ]
   }
   ```

## 8.4 Additional Task 2: Manually Run `xray-core` on PC

After creating the config file, how do I make `xray-core` run? Double-clicking doesn't seem to work?

First, locate your computer's **Command Line Interface**.

1. **Linux Desktop/macOS** users: Search for `Console` or `Terminal`
2. **Windows** users: Use `Cmd` or `Powershell` (WSL users: Your `Console` works too)

Secondly, what we need to do is [let `xray` find and read the configuration file `config.json`, and then run], so:

1. Under Windows, assuming your `Xray` program location is `C:\Xray-windows-64\xray.exe` and the configuration file location is `C:\Xray-windows-64\config.json`, then the correct startup command is:

   ```shell
   C:\Xray-windows-64\xray.exe -c C:\Xray-windows-64\config.json
   ```

   :::tip
   Here, `-c` is a parameter that specifies the path of the configuration file, telling `xray` to look for the configuration file in the following location
   :::

2. Similarly, under Linux and macOS, assuming your `Xray` program location is `/usr/local/bin/xray` and the configuration file location is `/usr/local/etc/xray/config.json`, then the correct startup command is:

   ```shell
   /usr/local/bin/xray -c /usr/local/etc/xray/config.json
   ```

   :::tip
   Every system has a system path variable, so you don't have to write the absolute path when writing the `Xray` program. But it's definitely correct, so I demonstrated it this way.
   :::

## 8.5 Additional question 3: Automatically run `xray-core` on the PC

If you actually try to run `xray-core` manually, you will find that there are some minor issues with this approach:

1. Every time I run `Xray`, a black window appears, which is ugly
2. It cannot be started automatically, and I have to enter it manually every time, which is very inconvenient

I can tell you for sure: **It can be solved**. But the specific solution is left as an extracurricular homework! (Friendly reminder, there are clues in the Q&A area of ​​the document site)

## 8.6 Completed successfully!

I believe that the students who have the patience to see this are all curious and motivated learners! I would like to congratulate you now, because at this point, you have completed the VPS server deployment from the first command, and successfully configured and used Xray on the client**! This is undoubtedly a huge victory!

I believe that you must no longer be afraid of `Linux` and no longer unfamiliar with `Xray`!

**So far, the little white text has ended successfully! **

> ⬛⬛⬛⬛⬛⬛⬛⬛ 100%

## 8.7 TO INFINITY AND BEYOND!

**But what you see now is far from the full picture of Xray.**
`Xray` is a powerful and rich collection of network tools. It provides many modules on a platform. It can solve various problems through flexible configuration combinations like a Swiss Army Knife. In this article, I just used the **simplest** and **most intuitive** configuration to do **basic demonstration**.

If you think it is enough now, then enjoy the information freedom it brings you. But if your curiosity still can't stop, then continue to explore its infinite possibilities!

For more information, you can find it here:

1. [xtls.github.io](https://xtls.github.io/en/) - Official Documentation Site
2. [Official Telegram Group](https://t.me/projectXray) - friendly official discussion community

![TO INFINITY AND BEYOND!](./ch08-img02-buzz.png)

:::
tip (An afterword that is not really an afterword)

I hope that this little journey I have taken with you can be a small help in your online life.

The tools and information in this article will inevitably become outdated, but you will gradually grow into a big guy. Sometime in the future, if you can occasionally remember this tutorial and the original intention of writing this article, then I sincerely hope that you can pass on the torch and share the latest knowledge with the next generation, so that this little help can be firmly passed on in the community.

This is a world with heavy snow and dark clouds. People walk alone on their own roads trying to find sunshine. If everyone can't help and encourage each other when they occasionally meet, then in the end, I am afraid that only the desolation of [the birds have flown away from the thousands of mountains and the people have disappeared on the thousands of paths] will be left.
:::
