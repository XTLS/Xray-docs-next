# Configure and Run

After [downloading and installing Xray](./install/), you need to configure it,

For demonstration, only a simple configuration method is introduced here. More templates: [Xray-examples](https://github.com/XTLS/Xray-examples)

If you need to configure more complex functions, please refer to the relevant instructions in the more detailed [configuration file](../config/).

## Server Configuration

You need a server outside the firewall to run server-side Xray. The configuration is as follows:

```json
{
  "inbounds": [
    {
      "port": 10086, // server listening port
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
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

In the configuration of the server, you need to ensure `id` that the and port are consistent with the client, and then you can connect normally.

## Client Configuration

On your PC (or phone), you need to run Xray with the following configuration:

```json
{
  "inbounds": [
    {
      "port": 1080, // SOCKS proxy port, the proxy needs to be configured in the browser and point to this port
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
            "address": "server", // Server address, please change it to your own server IP or domain name
            "port": 10086, // server port
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
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
        "type": "field",
        "ip": ["geoip:private"],
        "outboundTag": "direct"
      }
    ]
  }
}
```

The only thing to change in the above configuration is your server IP, which is noted in the configuration. The above configuration will forward all traffic to your server except on the LAN (such as the access router).

## Run

- On Windows and macOS, configuration files are usually `config.json`
  - Just run `Xray` or `Xray.exe`
- On Linux, configuration files are usually located in `/etc/xray/` or `/usr/local/etc/xray/`.
  - Run `xray run -c /etc/xray/config.json`
  - Or use something like systemd to run Xray as a service in the background.

For more detailed instructions, please refer to [Configuration](../config/) Document and [小小白话文](../documents/level-0/).
