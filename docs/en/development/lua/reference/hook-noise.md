# Noise Hook

The core calls the global `HandleNoise` function in the `script` field of a [noise camouflage layer](../../../config/transports/finalmask.md#noise) when it needs to send noise to an address. See the [Noise Scripts guide](../guide/noise.md) for configuration and complete examples.

## API Index

| Category | Member                                   | Description                       |
| -------- | ---------------------------------------- | --------------------------------- |
| Hook     | [`HandleNoise(...)`](#handlenoise)       | Generate noise packets            |
| Method   | [`plan:Add(...)`](#plan-add)             | Submit one noise packet           |
| Method   | [`plan:AddRandom(...)`](#plan-addrandom) | Submit one packet of random bytes |

## Hook Interface

### HandleNoise(...)

```lua
function HandleNoise(plan, address)
    return err
end
```

Generates the noise packets to send this time. Packets are submitted one at a time through [`plan:Add`](#plan-add), and the return value is used only to report errors.

#### Parameters

The core always passes these parameters, and they are not `nil`.

| Parameter | Type       | Description                                                         |
| --------- | ---------- | ------------------------------------------------------------------- |
| `plan`    | `userdata` | The send plan for this call; submit packets with `plan:Add`         |
| `address` | `string`   | Target address of this send, in the form `192.0.2.1:443`; non-empty |

For the same address it is called only once, when data is first sent. When `reset` is configured, it is called again after that duration.

#### Return Values

| Return value | Type                                                 | Description               |
| ------------ | ---------------------------------------------------- | ------------------------- |
| `err`        | [`error`](./data-types.md#error), `string`, or `nil` | Only `nil` means no error |

No return value is needed when there is no error to report. The core reads only the first return value, and the rest are ignored.

#### Behavior

Noise is best-effort camouflage, and a failure does not affect normal communication: when the script reports an error or raises an execution exception, the core writes one `warning` log, sends no noise this time, and then sends the real data packets as usual. This matches the behavior when static noise fails to be sent.

| Script result                                       | Core behavior                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| `plan:Add` was called and no error was reported     | Sends these packets in submission order, then the real data               |
| `plan:Add` was not called and no error was reported | Sends no noise and sends the real data directly                           |
| Returned error or execution exception               | Discards the packets submitted this time and sends the real data directly |

The Hook runs synchronously before the real data packets are sent, so it should be as lightweight as possible; place time-consuming initialization at the script's top level. The execution timeout for each call is **1 second**, and the instance initialization timeout is **120 seconds**. See [Pooled Lifecycle](../guide/lifecycle.md#pooled-lifecycle) for details.

#### Example

```lua
local noise = require("xray.finalmask.noise")

function HandleNoise(plan, address)
    plan:Add("\22\3\1")
    plan:Add(noise.Random(64), noise.RandomBetween(10, 20))
end
```

## Methods

### plan:Add

```lua
plan:Add(packet)
plan:Add(packet, delay)
```

Submits one noise packet to this call's plan. It can be called several times; the core sends the packets in call order and only then sends the real data packets.

#### Parameters

| Parameter | Type              | Description / Requirement                                                                 |
| --------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `packet`  | `string`          | Required, the packet content; an empty string is allowed                                  |
| `delay`   | `number` or `nil` | Optional, the delay after sending this packet in milliseconds; an integer in `0 .. 65535` |

The packet content is a byte string that may contain any bytes, such as `\0`, and its length must fit in one datagram.

#### Return Values

None.

#### Behavior

The plan only takes packets while this Hook call runs. Keeping `plan` in a global and using it outside the Hook raises a Lua exception.

One call submits at most **64** packets, and all of them together at most **65535** bytes. These two limits keep a script shared along with a configuration from filling memory; going over either raises a Lua exception.

An argument of an invalid type or out of range also raises a Lua exception; that instance is destroyed, the packets submitted this time are discarded, and no noise is sent.

### plan:AddRandom

```lua
plan:AddRandom(size)
plan:AddRandom(size, delay)
```

Submits one noise packet of random bytes. It is the same as `plan:Add(noise.Random(size))`, except that the random data never goes through Lua, saving one string round trip.

#### Parameters

| Parameter | Type              | Description / Requirement                                 |
| --------- | ----------------- | --------------------------------------------------------- |
| `size`    | `number`          | Required, the number of bytes; an integer in `0 .. 65535` |
| `delay`   | `number` or `nil` | Optional, the same as the `delay` of `plan:Add`           |

#### Return Values

None.

#### Behavior

The limits and the exceptions are the same as for `plan:Add`, and the random source is the same as [`noise.Random`](./module-noise.md#noise-random).
