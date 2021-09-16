# VLESS 协议详解

> **VLESS 是原创的无状态的轻量传输协议, 也是 Xray 一切的开始**

## 协议详解 <Badge text="WIP" type="warning"/>

## 配置模板

[Xray-examples](https://github.com/xtls/Xray-examples) 有完整的 VLESS 配置示例供参考。（但目前不能保证其它协议的配置示例质量）

## 客户端开发指引

1. VLESS 协议本身还会有不兼容升级，但客户端配置文件参数基本上是只增不减的。**所以如果你开发了用 core 的客户端，现在就可以适配。** iOS 客户端的协议实现则需紧跟升级。
2. **视觉标准：UI 标识请统一用 VLESS**，而不是 VLess / Vless / vless，配置文件不受影响，代码内则顺其自然。
3. `encryption` 应做成输入框而不是选择框，新配置的默认值应为 `none`，若用户置空则应代填 `none`。

**以下为已支持图形化配置 VLESS 的部分客户端列表，推荐使用：**（排名不分先后顺序）

- OpenWrt
  - [PassWall](https://github.com/xiaorouji/openwrt-passwall)
  - [Hello World](https://github.com/jerrykuku/luci-app-vssr)
  - [ShadowSocksR Plus+](https://github.com/fw876/helloworld)
- Windows
  - [v2rayN](https://github.com/2dust/v2rayN)
  - [Qv2ray](https://github.com/Qv2ray/Qv2ray)
- Android
  - [v2rayNG](https://github.com/2dust/v2rayNG)
  - [Kitsunebi](https://github.com/rurirei/Kitsunebi/tree/release_xtls)
- iOS / Mac
  - [Shadowrocket](https://apps.apple.com/app/shadowrocket/id932747118)

## Fallbacks

Fallbacks 是 Xray 独创的新型协议回落模式解析, 可有效防止主动探测, 自由配置常用端口多服务共享.

目前 Xray 中的 VLESS 和 trojan 协议支持 Fallbacks.

- [Fallbacks 配置说明](../fallback/#fallbacks-配置)
- [Fallbacks 功能简析]()
- [Fallbacks 设计理论](../fallback/#fallbacks-设计理论)

## VLESS 分享链接标准

感谢 <img src="https://avatars2.githubusercontent.com/u/7822648?s=32" width="32px" height="32px" alt="a"/> [@DuckSoft](https://github.com/DuckSoft) 的提案!

目前为初步提案, 详情请见 [VMessAEAD / VLESS 分享链接标准提案](https://github.com/XTLS/Xray-core/issues/91)
