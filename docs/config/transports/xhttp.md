# XHTTP: Beyond REALITY

See [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113)

## Multiplex

VLESS Multiplex 聚合应用层数据流，XHTTP 通过 XMUX 重用 HTTP 连接。同时使用时，两组参数分别影响不同层级的连接分配。

VLESS 在 XHTTP 上启用公共连接池时，客户端会在加载时输出警告并继续启动。配置字段、警告文本和独立 UDP 连接池模式参见 [Multiplex 文档](../multiplex.md#xhttp)。
