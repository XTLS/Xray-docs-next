# xray.finalmask.noise

Provides the random data needed to generate noise.

```lua
local noise = require("xray.finalmask.noise")
```

## API Index

| Category | Member                                             | Description                         |
| -------- | -------------------------------------------------- | ----------------------------------- |
| Function | [`noise.Random(...)`](#noise-random)               | Generate random bytes               |
| Function | [`noise.RandomBetween(...)`](#noise-randombetween) | Generate a random number in a range |

Both functions are available in all scripts. Noise packets are submitted through [`plan:Add`](./hook-noise.md#plan-add) in the [Noise Hook](./hook-noise.md).

## Functions

### noise.Random

```lua
local bytes = noise.Random(size)
```

Generates random bytes of the specified length, which can be used directly as the content of a noise packet.

**Parameters**

| Parameter | Type     | Description / Requirements                                    |
| --------- | -------- | ------------------------------------------------------------- |
| `size`    | `number` | Required; number of bytes, must be an integer in `0 .. 65535` |

**Return Values**

| Return value | Type     | Description                                                     |
| ------------ | -------- | --------------------------------------------------------------- |
| `bytes`      | `string` | A random byte string of that length; never `nil`. `""` when `0` |

**Behavior**

Uses a cryptographically secure random source, so each call produces a different result. The return value is a byte string rather than text and can contain arbitrary bytes.

Raises a Lua exception if the argument is out of range or not a number; the instance is destroyed and no noise is sent this time.

### noise.RandomBetween

```lua
local value = noise.RandomBetween(from, to)
```

Generates a random integer in a closed interval, which can be used for random lengths or random delays.

**Parameters**

| Parameter | Type     | Description / Requirements                                |
| --------- | -------- | --------------------------------------------------------- |
| `from`    | `number` | Required; lower bound, must satisfy `0 <= from`           |
| `to`      | `number` | Required; upper bound, must satisfy `from <= to <= 65535` |

**Return Values**

| Return value | Type     | Description                                                  |
| ------------ | -------- | ------------------------------------------------------------ |
| `value`      | `number` | An integer in `from .. to`, including both ends; never `nil` |

**Behavior**

Uses the same random source as `noise.Random`, and both ends can occur. When `from` and `to` are equal, that value is returned.

Raises a Lua exception if an argument is out of range, the bounds are reversed, or an argument is not a number; the instance is destroyed and no noise is sent this time.

**Example**

```lua
local noise = require("xray.finalmask.noise")

function HandleNoise(plan, address)
    for i = 1, noise.RandomBetween(2, 5) do
        plan:Add(noise.Random(noise.RandomBetween(40, 90)), noise.RandomBetween(10, 20))
    end
end
```
