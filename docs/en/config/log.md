# Log Configuration

Log configuration controls how Xray outputs logs.

Xray has two types of logs: access logs and error logs. You can configure the output method for each type of log separately.

::: tip
The log configuration is not applied immediately. This means that you may see some log entries made by an unconfigured logger during startup. For example, you may see several `"info"` log entries while you have configured a `"warning"` log level.
:::

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

The log level for error logs, indicating the information that needs to be recorded. The default value is `"warning"`. Note that this setting applies to the error log only. It doesn't affect the access log (except for `"none"` value). The access log doesn't have log levels.

- `"debug"`: Output information used for debugging the program. Includes all `"info"` content.
- `"info"`: Runtime status information, etc., which does not affect normal use. Includes all `"warning"` content.
- `"warning"`: Information output when there are some problems that do not affect normal operation but may affect user experience. Includes all `"error"` content.
- `"error"`: Xray encountered a problem that cannot be run normally and needs to be resolved immediately.
- `"none"`: Disable all logs.

> `dnsLog`: bool

Log DNS queries made by built-in [DNS clients](./dns.md) to the access log. Example log record: `DOH//doh.server got answer: domain.com -> [ip1, ip2] 2.333ms`.

::: tip

1. Xray doesn't perform all DNS queries via its built-in clients. Therefore, enabling this option doesn't mean that all DNS queries performed by Xray will be logged.

2. DNS queries made by built-in [DNS clients](./dns.md) are also logged to the error log (with "Info" level) even if this option is disabled.
3.
4. FakeDNS client queries are never logged to the access log.
   :::

> `maskAddress`: "quarter" | "half" | "full"

IP address masking, when enabled, will automatically replace the IP address appearing in the log. It is used to protect privacy when sharing logs. The default is empty and is not enabled.

Currently available levels are `quarter`, `half`, `full`. The mask form corresponds to the following:

- ipv4 `1.2.*.*` `1.*.*.*` `[Masked IPv4]`
- ipv6 `1234:5678::/32` `1234::/16` `[Masked IPv6]`
