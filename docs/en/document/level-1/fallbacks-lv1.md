# Brief Analysis of the "Fallback" Feature

While using Xray, you’ve probably heard about the "fallback" feature countless times. This article will briefly explain the logic and usage of this function.

## 1. Revisiting the Fallback in "Plain Language"

If you’ve used the [Xray configuration](../level-0/ch07-xray-server.md#_7-4-配置xray) from "Plain Language" and completed the [HTTP to HTTPS redirection optimization](../level-0/ch07-xray-server.md#_7-8-服务器优化之二-开启http自动跳转https), then you already have a simple fallback mechanism based on the `VLESS` protocol:

```json
{
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          // ... ...
        ],
        "decryption": "none",
        "fallbacks": [
          {
            "dest": 8080 // Default fallback to the anti-probing proxy
          }
        ]
      },
      "streamSettings": {
        // ... ...
      }
    }
  ]
}
```

How can we explain this configuration in simpler terms?

1. **`Xray` listens on port `443` for inbound traffic**
   Xray is responsible for handling the HTTPS traffic on port 443.

2. **The inbound protocol is `vless`**
   Only `vless` protocol traffic is processed by Xray.

   ::: warning
   **Note:** The `VLESS` protocol was originally developed for Xray and v2fly to introduce the fallback feature and reduce redundant checks/encryption. (Currently, the `trojan` protocol in Xray also fully supports fallback functionality.)
   :::

3. **Fallback destination is port `8080`**
   Xray processes `vless` traffic and forwards it accordingly. Non-`vless` traffic is forwarded to port 8080.

   ::: warning
   **Question: Why do we use plurals like `inbounds` and `fallbacks` in the config?**
   
   Answer: While the configuration file uses plurals to indicate support for multiple elements (like multiple inbound ports or fallbacks), the explanation here only covers one example, so I used the singular form.
   :::

4. **Traffic forwarded to port 8080 is handled by subsequent programs**
   In the "Plain Language" example, traffic forwarded to port 8080 is processed by Nginx to display a website.

5. **Summary of the simple fallback:**

   ```mermaid
   graph LR;
   W(External HTTP:80 request) --> N80(HTTP:80)
   subgraph Nginx External Listener
   N80 -.- N301(301 Redirect) -.- N443(HTTPS:443)
   end
   N443 --> X(Xray listens on 443) .- X1{Inbound Check}
   X1 --> |VLESS traffic| X2(Xray Internal Rules)
   X2 --> O(Xray Outbounds)
   X1 ==> |Non-VLESS traffic| N8080(Nginx:8080)
   N8080:::nginxclass ==> H(index.html)
   classDef nginxclass fill:#FFFFDE
   ```

## 2. Understanding Fallbacks (WHAT, HOW `v1`)

From the above example, you can understand what a fallback is (WHAT) and how it works (HOW). In simple terms:

1. The fallback happens after traffic reaches the `Xray listening port`.
2. It’s based on characteristics like the `protocol type`.
3. The traffic is forwarded to a specific `port`.
4. The traffic at the fallback port is handled by subsequent programs.

## 3. Why Use a Fallback (WHY `v1`)

Initially, fallbacks were implemented to defend against **active probing**.

**Active Probing:** In simple terms, this refers to external entities sending specific network requests to determine if a server is running proxy tools like `Xray`, `v2fly`, or `Shadowsocks`. If identified, the server may face interference or be blocked.

Fallbacks help prevent identification by forwarding probing traffic to programs like `Nginx`, masking the server's real functionality.

## 4. The Full Power of Fallbacks (WHAT, WHY, HOW `v2`)

As the `VLESS` protocol evolved, fallbacks became more flexible. By utilizing information in the initial data packet (like `path` or `alpn`), fallbacks can now be multi-layered and support various protocols and features.

Modern fallbacks in Xray are:
- **Secure**: Resistant to active probing.
- **Efficient**: Minimal performance loss.
- **Flexible**: Capable of multi-protocol and feature-based traffic routing.

## 5. Multi-layer Fallback Example and Analysis

Below is an example configuration of Xray’s fallback mechanism, listening on port 443:

```json
{
  "port": 443,
  "protocol": "vless",
  "settings": {
    "clients": [
      {
        "id": "", // Your UUID
        "flow": "xtls-rprx-vision",
        "level": 0,
        "email": "love@example.com"
      }
    ],
    "decryption": "none",
    "fallbacks": [
      {
        "dest": 1310, // Default fallback to Xray's Trojan protocol
        "xver": 1
      },
      {
        "path": "/websocket",
        "dest": 1234,
        "xver": 1
      },
      {
        "path": "/vmesstcp",
        "dest": 2345,
        "xver": 1
      },
      {
        "path": "/vmessws",
        "dest": 3456,
        "xver": 1
      }
    ]
  },
  "streamSettings": {
    "network": "tcp",
    "security": "tls",
    "tlsSettings": {
      "alpn": ["http/1.1"],
      "certificates": [
        {
          "certificateFile": "/path/to/fullchain.crt", // Your certificate path
          "keyFile": "/path/to/private.key" // Your private key path
        }
      ]
    }
  }
}
```

This configuration shows multi-layer fallbacks, each handling different traffic types based on the `path` provided.

## 6. Conclusion

This article has provided an overview of the powerful fallback feature in Xray. With its flexibility and security benefits, it’s an essential part of any secure proxy setup.

