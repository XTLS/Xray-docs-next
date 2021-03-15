# Inbounds 协议

> 这个章节包含了目前所有可用于 Inbounds 的协议及具体配置细节.

## 协议列表

>[Dokodemo-door](./dokodemo)
Dokodemo door（任意门）可以监听一个本地端口，并把所有进入此端口的数据发送至指定服务器的一个端口，从而达到端口映射的效果。
>[HTTP](./http)
HTTP 协议
>[Socks](./socks)
标准 Socks 协议实现，兼容 [Socks 4](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol)、Socks 4a 和 [Socks 5](http://ftp.icm.edu.pl/packages/socks/socks4/SOCKS4.protocol)。
>[VLESS](./vless)
VLESS 是一个无状态的轻量传输协议，可以作为 Xray 客户端和服务器之间的桥梁。
>[VMess](./vmess)
[VMess](../../develop/protocols/vmess) 是一个加密传输协议，，可以作为 Xray 客户端和服务器之间的桥梁。
>[Trojan](./trojan)
[Trojan](https://trojan-gfw.github.io/trojan/protocol) 协议
>[Shadowsocks](./shadowsocks)
[Shadowsocks](https://zh.wikipedia.org/wiki/Shadowsocks) 协议。

