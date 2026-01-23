# Configure and Run

After you have [downloaded and installed](./install) Xray, you need to configure it.

For demonstration purposes, only simple configuration methods are introduced here. For more templates: [Xray-examples](https://github.com/XTLS/Xray-examples)

To configure more complex features, please refer to the detailed instructions in [Configuration](../config/).

::: danger
To avoid your traffic being decrypted,<br>
You should use `xray uuid` or `uuidgen` to generate a unique UUID.<br>
On the server side, put it in `inbounds[0].settings.clients[0].id`.<br>
On the client side, put it in `outbounds[0].settings.vnext[0].users[0].id`.<br>
:::

## Server Configuration

You need a server outside the firewall to run the server-side Xray. The configuration is as follows:

```json
{
  "inbounds": [
    {
      "port": 10086, // Server listening port
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811" // Remember to replace this field, generate using `xray uuid` or `uuidgen`
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom"
    }
  ]
}
```

Ensure that the `id` and port in the server configuration match the client's, and you will be able to connect normally.

## Client Configuration

On your PC (or mobile phone), you need to run Xray with the following configuration:

```json
{
  "inbounds": [
    {
      "port": 1080, // SOCKS proxy port. You need to configure the proxy in the browser to point to this port.
      "listen": "127.0.0.1",
      "protocol": "socks",
      "settings": {
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "server", // Server address. Please change to your own server IP or domain name.
            "port": 10086, // Server port
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811" // Remember to replace this field, generate using `xray uuid` or `uuidgen`
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "ip": ["geoip:private", "geoip:cn"], // Bypass LAN and mainland China IPs
        "outboundTag": "direct"
      }
    ]
  }
}
```

The only places you need to change in the above configuration are your server IP and user UUID, as noted in the configuration. The above configuration will forward all traffic to your server except for LAN (e.g., accessing the router) and mainland China IP ranges (e.g., accessing Bilibili, AcFun).

## Run

- In Windows and macOS, the configuration file is usually the `config.json` file in the same directory as Xray.
  - Simply run `Xray` or `Xray.exe`.
- In Linux, the configuration file is usually located in the `/etc/xray/` or `/usr/local/etc/xray/` directory.
  - Run `xray run -c /etc/xray/config.json`.
  - Or use tools like systemd to run Xray as a service in the background.

For more detailed instructions, please refer to [Configuration Documentation](../config/) and [Project X for Dummies](./level-0/).
