# 开发指南

## 编译文档

Xray 支持各种平台, 您可以在多种平台上自行进行交叉编译。

请点击[编译文档](./intro/compile.md)以查看具体编译相关内容。

## 设计思路

Xray 内核提供了一个平台，在其之上可以进二次开发。

这个章节阐述了 Xray 的设计目标和架构。

请点击[设计思路](./intro/design.md)以了解 Xray 的设计目标和架构。

## 开发规范

这个章节阐述了获取代码,进行开发,提交 PR 的流程中需要遵循的准则, 以及相关的编码规范。

请点击[开发规范](./intro/guide.md)查看 Xray 开发中应遵循的准则。

## 协议详解

Xray 用到了很多种协议, 您可以通过各种途径获得协议的详细描述。

### [VLESS 协议](./protocols/vless.md)

VLESS 是一个无状态的轻量传输协议，可以作为 Xray 客户端和服务器之间的桥梁。

### [VMess 协议](./protocols/vmess.md)

VMess 是一个加密传输协议，可以作为 Xray 客户端和服务器之间的桥梁。

### [Mux.Cool 协议](./protocols/muxcool.md)

Mux.Cool 协议是一个多路复用传输协议，用于在一条已建立的数据流中传输多个各自独立的数据流。

### [mKCP 协议](./protocols/mkcp.md)

mKCP 是流式传输协议，由 [KCP 协议](https://github.com/skywind3000/kcp)修改而来，可以按顺序传输任意的数据流。
