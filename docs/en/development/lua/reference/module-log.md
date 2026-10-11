# xray.log

Writes logs to Xray's logging system.

```lua
local log = require("xray.log")
```

## API Index

| Category | Member                             | Description         |
| -------- | ---------------------------------- | ------------------- |
| Function | [`log.Debug(...)`](#log-debug)     | Write a debug log   |
| Function | [`log.Info(...)`](#log-info)       | Write an info log   |
| Function | [`log.Warning(...)`](#log-warning) | Write a warning log |
| Function | [`log.Error(...)`](#log-error)     | Write an error log  |

## Functions

### log.Debug

```lua
log.Debug(...)
```

Writes a log at the `debug` level.

**Parameters**

| Parameter | Type          | Description / Requirements                                |
| --------- | ------------- | --------------------------------------------------------- |
| `...`     | Any Lua value | Optional; any number of log values, concatenated in order |

**Return Values**

No return values.

**Argument Conversion**

Accepts no arguments, `nil`, `""`, `{}`, and empty slices. Arguments are converted to text and concatenated in order, without automatically inserting spaces or separators.

- [`error`](./data-types.md#error) values are converted to their error messages first.
- Other values with a function-valued `__tostring` use that conversion; exceptions it raises propagate to the caller.
- Remaining values use their default string representation. `nil` becomes `"nil"`, and empty strings add no text. Tables and slices are not expanded into element lists.

**Output Conditions**

Logs are prefixed with the calling script's filename. Whether they are written depends on [`log.loglevel`](../../../config/log.md#logobject). For example, at `warning`, `Debug` and `Info` produce no output and do not invoke their arguments' `__tostring` conversions.

None of the four functions returns `err`. Assigning a call to a variable gives `nil`, which cannot be used to determine whether a log was successfully written.

**Example**

```lua
log.Info("Query domain: ", domain)
log.Warning("Upstream query failed: ", err)
```

### log.Info

Same as above.

### log.Warning

Same as above.

### log.Error

Same as above.
