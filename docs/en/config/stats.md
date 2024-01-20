# Traffic Statistics

Used to configure traffic statistics for Xray.

## StatsObject

The `StatsObject` corresponds to the `stats` item in the configuration file.

```json
{
  "stats": {}
}
```

Currently, no parameters are required for traffic statistics, and internal statistics will be enabled as long as the `StatsObject` item exists.

After statistics are enabled, you only need to enable the corresponding items in the [Policy](./policy.md) to collect the corresponding data.

## Retrieving Traffic Statistics

You can use the `xray api` command to retrieve traffic statistics.

The current traffic statistics are as follows:

- User Data

  - `user>>>[email]>>>traffic>>>uplink`

    The uplink traffic of a specific user, in bytes.

  - `user>>>[email]>>>traffic>>>downlink`

    The downlink traffic of a specific user, in bytes.

::: tip
If the corresponding user does not have an email specified, statistics will not be enabled.
:::

- Global Data

  - `inbound>>>[tag]>>>traffic>>>uplink`

    The uplink traffic of a specific inbound, in bytes.

  - `inbound>>>[tag]>>>traffic>>>downlink`

    The downlink traffic of a specific inbound, in bytes.

  - `outbound>>>[tag]>>>traffic>>>uplink`

    The uplink traffic of a specific outbound, in bytes.

  - `outbound>>>[tag]>>>traffic>>>downlink`

    The downlink traffic of a specific outbound, in bytes.
