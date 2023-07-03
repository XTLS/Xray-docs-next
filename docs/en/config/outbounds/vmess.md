# VMess

[VMess](../../development/protocols/vmess.md) is an encrypted transport protocol commonly used as a bridge between Xray clients and servers.

::: danger
VMess relies on system time. Please ensure that the UTC time of your system, when using Xray, has an error within 120 seconds, regardless of the time zone. On Linux systems, you can install the `ntp` service to automatically synchronize the system time.
:::

## OutboundConfigurationObject

```json
{
  "vnext": [
    {
      "address": "127.0.0.1",
      "port": 37192,
      "users": [
        {
          "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
          "security": "auto",
          "level": 0
        }
      ]
    }
  ]
}
```

> `vnext`：\[ [ServerObject](#serverobject) \]

An array containing a set of server configurations.

Each item in the array is a server configuration [ServerObject](#serverobject).

### ServerObject

```json
{
  "address": "127.0.0.1",
  "port": 37192,
  "users": []
}
```

> `address`: address

The server address, which can be an IP address or domain name.

> `port`: number

The port number that the server is listening on. Required.

> `users`: \[ [UserObject](#userobject) \]

An array representing a group of users authorized by the server.

Each item is a user configuration [UserObject](#userobject).

#### UserObject

```json
{
  "id": "5783a3e7-e373-51cd-8642-c83782b807c5",
  "security": "auto",
  "level": 0
}
```

> `id`: string

The user ID for VMess, which can be any string less than 30 bytes or a valid UUID.

Custom strings and their corresponding UUIDs are equivalent. This means that you can use either a custom string or its corresponding UUID to identify the same user in the configuration file. For example:

- Write `"id": "我爱🍉老师1314"`,
- Or write `"id": "5783a3e7-e373-51cd-8642-c83782b807c5"` (this UUID is the mapping of the custom string "我爱 🍉 老师 1314")

The mapping standard is described in the [VLESS UUID Mapping Standard: Mapping a Custom String to a UUIDv5](https://github.com/XTLS/Xray-core/issues/158).

You can use the command `xray uuid -i "custom string"` to generate the UUID corresponding to a custom string, or use the command `xray uuid` to generate a random UUID.

> `level`: number

The user level. Connections will use the corresponding [local policy](../policy.md#levelpolicyobject) associated with this user level.

The `level` value corresponds to the `level` value in the [policy](../policy.md#policyobject). If not specified, the default value is 0.

> `security`: "aes-128-gcm" | "chacha20-poly1305" | "auto" | "none" | "zero"

The encryption method. The client will use the configured encryption method to send data, and the server will automatically recognize it without the need for configuration.

- `"aes-128-gcm"`: Recommended for use on PCs.
- `"chacha20-poly1305"`: Recommended for use on mobile devices.
- `"auto"`: Default value. Automatically selects the encryption method (uses aes-128-gcm when running on AMD64, ARM64, or s390x architecture, and Chacha20-Poly1305 in other cases).
- `"none"`: No encryption.
- `"zero"`: No encryption and no message authentication (v1.4.0+).

::: tip
It is recommended to use the `"auto"` encryption method as it ensures long-term security and compatibility.

The `"none"` pseudo-encryption method calculates and verifies the packet's checksum. However, due to the lack of hardware support for the authentication algorithm, it may be slower than the hardware-accelerated `"aes-128-gcm"` on some platforms.

The `"zero"` pseudo-encryption method neither encrypts the message nor calculates the checksum, theoretically providing higher speed than any other encryption method. The actual speed may be influenced by other factors.

It is not recommended to use the `"none"` or `"zero"` pseudo-encryption methods without enabling TLS encryption and forcibly verifying certificates. If you use a CDN or other intermediate platforms or network environments that decrypt TLS connections, it is not recommended to use the `"none"` or `"zero"` pseudo-encryption methods.

Regardless of the encryption method used, the VMess packet header is protected by encryption and authentication.
:::
