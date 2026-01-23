# VMess

[VMess](../../development/protocols/vmess.md) is an encrypted transport protocol, usually serving as a bridge between the Xray client and server.

::: danger
VMess depends on system time. Please ensure that the UTC time of the system running Xray is within 120 seconds of the actual time, independent of the time zone. On Linux systems, you can install the `ntp` service to automatically synchronize the system time.
:::

## OutboundConfigurationObject

```json
{
  "address": "127.0.0.1",
  "port": 37192,
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "security": "auto",
  "level": 0,
  "experiments": ""
}
```

> `address`: address

Server address, supports IP address or domain name.

> `port`: number

The port number the server is listening on. Required.

> `id`: string

VMess User ID. It can be any string less than 30 bytes or a valid UUID.

A custom string and its mapped UUID are equivalent. This means you can identify the same user in the configuration file like this:

- Write `"id": "我爱🍉老师1314"`,
- Or write `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (This UUID is the UUID mapping of `我爱🍉老师1314`)

The mapping standard is described in [VLESS UUID Mapping Standard: Mapping Custom Strings to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID mapped from the custom string. You can also use the command `xray uuid` to generate a random UUID.

> `level`: number

User level. The connection will use the [local policy](../policy.md#levelpolicyobject) corresponding to this user level.

The value of `level` corresponds to the value of `level` in [policy](../policy.md#policyobject). If not specified, the default is 0.

> `security`: "aes-128-gcm" | "chacha20-poly1305" | "auto" | "none" | "zero"

Encryption method. The client will use the configured encryption method to send data, and the server will automatically identify it without configuration.

- `"aes-128-gcm"`: Use AES-128-GCM algorithm.
- `"chacha20-poly1305"`: Use Chacha20-Poly1305 algorithm.
- `"auto"`: Default value. Automatically selected (uses aes-128-gcm encryption when the running framework is AMD64, ARM64, or s390x; uses Chacha20-Poly1305 encryption in other cases).
- `"none"`: No encryption, maintains the VMess message structure.
- `"zero"`: No encryption, direct stream copy (similar to VLESS).

It is not recommended to use `"none"` or `"zero"` pseudo-encryption methods without enabling TLS encryption and enforcing certificate verification. Regardless of the encryption method used, the VMess packet header is protected by encryption and authentication.

Note: `"auto"` only determines the AES hardware acceleration support status of the *client*. If the *server* does not support AES hardware acceleration, you still need to manually set it to `chacha20-poly1305`. This is very important because Chacha20-Poly1305 takes about 48% more time than AES-128-GCM on platforms supporting AES acceleration, but on platforms *without* AES acceleration, AES-128-GCM takes over 2000% more time than Chacha20-Poly1305.

> `experiments`: string

Enabled VMess protocol experimental features. (Features here are unstable and may be removed at any time). Multiple enabled experiments can be separated by the `|` character, such as `"AuthenticatedLength|NoTerminationSignal"`.

- `"AuthenticatedLength"`: Enable authenticated packet length experiment. This experiment requires both the client and server to enable it simultaneously and run the same version of the program.
- `"NoTerminationSignal"`: Enable not sending the disconnection signal. This feature is now enabled by default.
