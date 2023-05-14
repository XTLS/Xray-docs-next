# Development Guide

## Compile Documentation

Xray supports multiple platforms, and you can perform cross-compilation on various platforms by yourself.

Please click [Compile Documentation](./intro/compile.md) to view specific compile-related content.

## Design Concept

Xray kernel provides a platform for secondary development.

This section explains the design goals and architecture of Xray.

Please click [Design Principles](./intro/design.md) to learn about the design goals and architecture of Xray.

## Development Standards

This section outlines the guidelines to follow when obtaining code, developing, submitting PRs, as well as the relevant coding standards.

Please click [Development Specification](./intro/guide.md) to view the guidelines that should be followed during Xray development.

## Protocol Details

Xray uses many protocols, and you can obtain a detailed description of each protocol through various means.

### [VLESS Protocol](./protocols/vless.md)

VLESS is a stateless lightweight transport protocol that can serve as a bridge between Xray clients and servers.

### [VMess Protocol](./protocols/vmess.md)

VMess is an encrypted transport protocol that can act as a bridge between Xray clients and servers.

### [Mux.Cool Protocol](./protocols/muxcool.md)

Mux.Cool protocol is a multiplexing transport protocol used to transmit multiple independent data streams within an established data stream.

### [mKCP Protocol](./protocols/mkcp.md)

mKCP is a stream transmission protocol modified from the [KCP protocol](https://github.com/skywind3000/kcp) that can transmit arbitrary data streams in order.
