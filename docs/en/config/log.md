# Log Configuration

Log configuration controls how Xray outputs logs.

Xray has two types of logs: access logs and error logs. You can configure the output method for each type independently.

## LogObject

`LogObject` corresponds to the `log` entry in the configuration file.

```json
{
  "log": {
    "access": "file_path",
    "error": "file_path",
    "loglevel": "warning",
    "dnsLog": false,
    "maskAddress": ""
  }
}
```

> `access`: string

The file path for the access log. Its value must be a valid file path, such as `"/var/log/Xray/access.log"` (Linux) or `"C:\\Temp\\Xray\\_access.log"` (Windows). When this item is unspecified or empty, logs are output to stdout.

- Special value `none`: disables the access log.

> `error`: string

The file path for the error log. Its value must be a valid file path, such as `"/var/log/Xray/error.log"` (Linux) or `"C:\\Temp\\Xray\\_error.log"` (Windows). When this item is unspecified or empty, logs are output to stdout.

- Special value `none`: disables the error log.

> `loglevel`: "debug" | "info" | "warning" | "error" | "none"

The level of the error log, indicating the information that needs to be recorded.
The default value is `"warning"`.

- `"debug"`: Output information used for debugging. Includes all `"info"` content.
- `"info"`: Runtime status information, etc., which does not affect normal usage. Includes all `"warning"` content.
- `"warning"`: Information output when issues occur that do not affect normal operation but may impact user experience. Includes all `"error"` content.
- `"error"`: Xray encountered a problem where it cannot operate normally and requires immediate resolution.
- `"none"`: Do not record any content.

> `dnsLog`: bool

Whether to enable DNS query logs, for example: `DOH//doh.server got answer: domain.com -> [ip1, ip2] 2.333ms`

> `maskAddress`: "quarter" | "half" | "full"

IP address mask. When enabled, it automatically replaces IP addresses appearing in the log to protect privacy when sharing logs. The default is empty (disabled).

Currently, the available levels are `quarter`, `half`, and `full`. The masking formats correspond as follows:

- ipv4 `1.2.*.*` `1.*.*.*` `[Masked IPv4]`
- ipv6 `1234:5678::/32` `1234::/16` `[Masked IPv6]`

For more specific requirements, you can use a custom format such as `/16+/32`. The format defines the number of bits to keep unmasked; the first number is for IPv4 and the second for IPv6. Note that the IPv4 value must be divisible by 8. Using /32 (IPv4) or /128 (IPv6) means no masking, while /0 will display as `[Masked IPv4/IPv6]`.
