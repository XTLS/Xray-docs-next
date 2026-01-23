# Statistics

Used to configure Xray traffic data statistics.

## StatsObject

`StatsObject` corresponds to the `stats` item in the configuration file.

```json
{
  "stats": {}
}
```

Currently, statistics do not require any parameters. As long as the `StatsObject` item exists, internal statistics are enabled.

After enabling statistics, you only need to enable the corresponding items in [Policy](./policy.md) to collect the corresponding data.

## Retrieving Statistics

You can use relevant `xray api` commands to retrieve statistics.

The currently available statistics are as follows:

- User Data
  - `user>>>[email]>>>traffic>>>uplink`

    Uplink traffic for a specific user, in bytes.

  - `user>>>[email]>>>traffic>>>downlink`

    Downlink traffic for a specific user, in bytes.

::: tip
If the corresponding user does not specify an Email, statistics will not be enabled.
:::

- Global Data
  - `inbound>>>[tag]>>>traffic>>>uplink`

    Uplink traffic for a specific inbound, in bytes.

  - `inbound>>>[tag]>>>traffic>>>downlink`

    Downlink traffic for a specific inbound, in bytes.

  - `outbound>>>[tag]>>>traffic>>>uplink`

    Uplink traffic for a specific outbound, in bytes.

  - `outbound>>>[tag]>>>traffic>>>downlink`

    Downlink traffic for a specific outbound, in bytes.
