# Development Guide

## Compilation Documentation

Xray supports a wide range of platforms, allowing you to perform cross-compilation on various systems yourself.

Please click [Compilation Documentation](./intro/compile.md) to view specific compilation-related content.

## Design Philosophy

The Xray kernel provides a platform upon which secondary development can be conducted.

This chapter expounds on Xray's design goals and architecture.

Please click [Design Philosophy](./intro/design.md) to understand Xray's design goals and architecture.

## Development Guidelines

This chapter explains the guidelines to follow during the process of obtaining code, conducting development, and submitting PRs, as well as relevant coding conventions.

Please click [Development Guidelines](./intro/guide.md) to view the criteria to be followed in Xray development.

## Protocol Details

Xray utilizes many types of protocols. You can obtain detailed descriptions of these protocols through various channels.

### [VLESS Protocol](./protocols/vless.md)

VLESS is a stateless lightweight transport protocol that can serve as a bridge between Xray clients and servers.

### [VMess Protocol](./protocols/vmess.md)

VMess is an encrypted transport protocol that can serve as a bridge between Xray clients and servers.

### [Mux.Cool Protocol](./protocols/muxcool.md)

The Mux.Cool protocol is a multiplexing transport protocol used to transmit multiple independent data streams within a single established data stream.

### [mKCP Protocol](./protocols/mkcp.md)

mKCP is a stream transport protocol, modified from the [KCP Protocol](https://github.com/skywind3000/kcp), capable of transmitting arbitrary data streams in order.
