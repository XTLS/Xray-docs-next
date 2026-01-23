# Design Goals

- The Xray core provides a platform that supports necessary network proxy functions, upon which secondary development can be conducted to provide a better user experience.
- Cross-platform support is the primary principle to reduce the cost of secondary development.

## Architecture

![Architecture](./framework.png)

The core is divided into three layers: Application Layer, Proxy Layer, and Transport Layer.

Each layer contains several modules. Modules are independent of each other, and modules of the same type can be seamlessly replaced.

### Application Layer

The Application Layer contains common functions used in the Proxy Layer. These functions are abstracted to be reused across different proxy modules.

Modules in the Application Layer should be pure software implementations, independent of hardware or platform-specific technologies.

Important module list:

- **Dispatcher**: Used to transmit data received by the inbound proxy to the outbound proxy.
- **Router**: Routing module, see [Routing Configuration](../../config/routing.md) for details.
- **DNS**: Built-in DNS server module.
- **Proxy Manager**: Manages proxies.

### Proxy Layer

The Proxy Layer is divided into two parts: Inbound Proxy and Outbound Proxy.

The two parts are independent of each other. An inbound proxy does not depend on a specific outbound proxy, and vice versa.

#### Inbound Proxy

- Implements the [proxy.Inbound](https://github.com/xtls/Xray-core/blob/main/proxy/proxy.go) interface.

#### Outbound Proxy

- Implements the [proxy.Outbound](https://github.com/xtls/Xray-core/blob/main/proxy/proxy.go) interface.

### Transport Layer

The Transport Layer provides tool modules related to network data transmission.
