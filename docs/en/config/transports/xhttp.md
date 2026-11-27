# XHTTP: Beyond REALITY

See the [XHTTP: Beyond REALITY discussion](https://github.com/XTLS/Xray-core/discussions/4113) for the transport description and configuration examples.

## Multiplex

VLESS Multiplex combines application streams. XHTTP separately manages reuse of HTTP connections through XMUX. When used together, these settings affect connection distribution at different layers.

When a VLESS shared pool runs over XHTTP, the client prints a warning during configuration loading and continues startup. The configuration fields, warning text and separate UDP pool mode are described in the [Multiplex reference](../multiplex.md#xhttp).
