# Configure and Run

After [downloading and installing Xray](./install/), you need to configure it.

For demonstration purposes, only a simple configuration method is introduced here. For more templates, please refer to [Xray-examples](https://github.com/XTLS/Xray-examples).

If you need to set up more advanced features, please refer to the relevant instructions in the more detailed [configuration file](../config/).

## Server Configuration

You need a server outside the firewall to run server-side Xray. The configuration is as follows:

```json
{
  "inbounds": [
    {
      "port": 10086, // The port on which the server is listening
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

In server configuration, it is necessary to ensure that the `id` and port are consistent with the client in order to establish a normal connection.

## Client Configuration

On your PC (or phone), you need to run Xray with the following configuration:

```json
{
  "inbounds": [
    {
      "port": 1080, // SOCKS代理端口，需要在浏览器中配置代理并指向该端口
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
            "address": "server", // 服务器地址，请将其更改为您自己的服务器IP或域名
            "port": 10086, // 服务器端口
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

The only thing you need to modify in the above configuration is your server's IP address, which is indicated in the configuration. This configuration will redirect all traffic to your server, except for traffic on the local area network (such as the access router).

## Run

- On Windows and macOS, the configuration files are usually named `config.json`.
  - To start Xray, simply run `Xray` or `Xray.exe`.
- On Linux, the configuration files are usually located in `/etc/xray/` or `/usr/local/etc/xray/`.
  - To start Xray, run the command `xray run -c /etc/xray/config.json`.
  - Alternatively, you can use a tool like systemd to run Xray as a background service.

For more detailed instructions, please refer to the [Configuration](../config/) Document and [Layman's Terms](./level-0/).
