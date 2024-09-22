# Log Configuration

Log configuration controls how Xray outputs logs.

Xray has two types of logs: access logs and error logs. You can configure the output method for each type of log separately.

## LogObject

LogObject corresponds to the `log` item in the configuration file.

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

The file path for the access log. The value is a valid file path, such as `"/var/log/Xray/access.log"` (Linux) or `"C:\\Temp\\Xray\\_access.log"` (Windows). When this item is not specified or is an empty value, the log is output to stdout.

- The special value `none` disables access logs.

> `error`: string

The file path for the error log. The value is a valid file path, such as `"/var/log/Xray/error.log"` (Linux) or `"C:\\Temp\\Xray\\_error.log"` (Windows). When this item is not specified or is an empty value, the log is output to stdout.

- The special value `none` disables error logs.

> `loglevel`: "debug" | "info" | "warning" | "error" | "none"

The log level for error logs, indicating the information that needs to be recorded. The default value is `"warning"`.

- `"debug"`: Output information used for debugging the program. Includes all `"info"` content.
- `"info"`: Runtime status information, etc., which does not affect normal use. Includes all `"warning"` content.
- `"warning"`: Information output when there are some problems that do not affect normal operation but may affect user experience. Includes all `"error"` content.
- `"error"`: Xray encountered a problem that cannot be run normally and needs to be resolved immediately.
- `"none"`: Do not record any content.

> `dnsLog`: bool

Whether to enable DNS query logs, for example: `DOH//doh.server got answer: domain.com -> [ip1, ip2] 2.333ms`.

> `maskAddress`: "quarter" | "half" | "full"

IP address masking, when enabled, will automatically replace the IP address appearing in the log. It is used to protect privacy when sharing logs. The default is empty and is not enabled.

Currently available levels are `quarter`, `half`, `full`. The mask form corresponds to the following:

- ipv4 `1.2.*.*` `1.*.*.*` `[Masked IPv4]`
- ipv6 `1234:5678::/32` `1234::/16` `[Masked IPv6]`
