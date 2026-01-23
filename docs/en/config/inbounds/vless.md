# VLESS (XTLS Vision Seed)

VLESS is a stateless, lightweight transport protocol. It is divided into inbound and outbound parts and can serve as a bridge between Xray clients and servers.

Unlike [VMess](./vmess.md), VLESS does not depend on system time. The authentication method is also UUID.

## InboundConfigurationObject

```json
{
  "clients": [
    {
      "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
      "level": 0,
      "email": "love@xray.com",
      "flow": "xtls-rprx-vision",
      "reverse": {}
    }
  ],
  "decryption": "none",
  "fallbacks": [
    {
      "dest": 80
    }
  ]
}
```

> `clients`: \[ [ClientObject](#clientobject) \]

An array representing a group of users approved by the server.

Each item is a user [ClientObject](#clientobject).

> `decryption`: "none"

[VLESS Encryption](https://github.com/XTLS/Xray-core/pull/5067) settings. Cannot be left empty; to disable, explicitly set it to `"none"`.

It is recommended for most users to use `./xray vlessenc` to automatically generate this field to ensure no errors in writing. The detailed configuration below is recommended for advanced users only.

Its format is a string of detailed configuration fields connected by `.`. For example: `mlkem768x25519plus.native.0rtt.100-111-1111.75-0-111.50-0-3333.ptjHQxBQxTJ9MWr2cd5qWIflBSACHOevTauCQwa_71U`. This document refers to the individual parts separated by dots as blocks.

- The 1st block is the handshake method. Currently, there is only `mlkem768x25519plus`. Requires the server and client to match.
- The 2nd block is the encryption method. Options are `native`/`xorpub`/`random`, corresponding to: raw format packets / raw format + obfuscated public key part / full random numbers (similar to VMess/Shadowsocks). Requires the server and client to match.
- The 3rd block is the session resumption ticket validity time. Format is `600s` or `100-500s`. The former will pick a random time between that duration and half of that duration (e.g., `600s` = `300-600s`); the latter manually specifies a random range.

Following this is padding. After the connection is established, the server sends some garbage data to obfuscate length characteristics. This does not need to be the same as the client (the same part in the outbound is the padding sent from the client to the server). It is a variable-length part, formatted as `padding.delay.padding`+`(.delay.padding)`\*n (multiple paddings can be inserted, requiring a delay block between two padding blocks). For example, you can write an ultra-long `padding.delay.padding.delay.padding.delay.padding.delay.padding.delay.padding`.

- The `padding` format is `probability-min-max`, e.g., `100-111-1111` means 100% probability of sending a padding with a length of 111~1111.
- The `delay` format is also `probability-min-max`, e.g., `75-0-111` means 75% probability of waiting for 0~111 milliseconds.

The first padding block has special requirements: it requires 100% probability and a minimum length greater than 0. If no padding exists, the core automatically uses `100-111-1111.75-0-111.50-0-3333` as the padding setting.

The last block is identified by the core as the parameter used to authenticate the client. It can be generated using `./xray x25519` (using the PrivateKey part) or `./xray mlkem768` (using the Seed part). It must correspond to the client. `mlkem768` is a post-quantum algorithm that prevents the private key from being cracked by quantum computers (in the future) to impersonate the server if client parameters are leaked. This parameter is only used for verification; the handshake process is post-quantum secure regardless, and existing encrypted data cannot be cracked by future quantum computers.

> `fallbacks`: \[ [FallbackObject](../features/fallback.md) \]

An array containing a series of powerful fallback distribution configurations (optional).
For specific fallback configurations, please click [FallbackObject](../features/fallback.md#fallbacks-configuration).

### ClientObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "level": 0,
  "email": "love@xray.com",
  "flow": "xtls-rprx-vision",
  "reverse" {}
}
```

> `id`: string

The user ID for VLESS. It can be any string less than 30 bytes or a valid UUID.
A custom string and its mapped UUID are equivalent, which means you can write the id in the configuration file to identify the same user like this:

- Write `"id": "我爱🍉老师1314"`,
- Or write `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the UUID mapping of `我爱🍉老师1314`).

The mapping standard is described in [VLESS UUID Mapping Standard: Mapping Custom Strings to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID mapped from the custom string.

> You can also use the command `xray uuid` to generate a random UUID.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the `level` value in [policy](../policy.md#policyobject). If not specified, the default is 0.

> `email`: string

User email, used to distinguish traffic from different users (reflected in logs and statistics).

> `flow`: string

Flow control mode, used to select the XTLS algorithm.

Currently, the following flow control modes are available in the inbound protocol:

- No `flow` or empty string: Use standard TLS proxy.
- `xtls-rprx-vision`: Use the new XTLS mode, including inner handshake random padding.

XTLS is only available under the following combinations:

- TCP+TLS/Reality: In this case, encrypted data is directly copied at the underlying layer (if transmitting TLS 1.3).
- VLESS Encryption: No underlying transport restrictions. If the underlying layer does not support direct copying (see above), it only penetrates Encryption.

> `reverse`: struct

VLESS simplified reverse proxy configuration. It functions the same as the core's internal general reverse proxy but with simpler configuration.

The presence of this item indicates that connections from this user can be used to establish a reverse proxy tunnel.

Current syntax:

```json
"reverse": {
  "tag": "r-outbound"
}
```

`tag` is the outbound proxy tag for this reverse proxy. Routing traffic to this outbound using routing rules will forward it through the reverse proxy to the connected client's routing system (see VLESS Outbound for client configuration details).

When multiple different connections (potentially from different devices) are connected, the core will randomly select one to dispatch reverse proxy data for each request.
