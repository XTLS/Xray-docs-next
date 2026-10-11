# Runtime Environment and Script Loading

## Lua Environment

Xray currently uses GopherLua, which supports Lua 5.1 syntax, Lua 5.2's `goto` statement, and its own [`channel`](https://github.com/yuin/gopher-lua#lua-api).

Xray loads Lua scripts according to the configuration file. The configuration location determines the script's purpose and the available Hooks. See the [Hook reference](./index.md#hook) for each entry point's Hooks and calling conventions.

## Module Loading

API modules are organized by functionality and loaded with `require`:

```lua
local geodata = require("xray.geodata")
local log = require("xray.log")
```

See [Module API](./index.md#module-api) for the module list, and each API reference for function usage.

See [Instances and Lifecycle](./guide/lifecycle.md) for when top-level initialization, such as loading Lua modules and creating objects, runs.

## Script File Paths

The `script` field in the configuration file specifies the path to a Lua script. An empty string or an omitted field disables the script; an absolute path locates the file directly.

Relative paths are searched in the following order. If a path does not exist, the search continues; if it exists but is not a regular file, an error is raised immediately:

1. The directory specified by the `XRAY_LOCATION_CONFDIR` environment variable;
2. The directory specified by the `XRAY_LOCATION_CONFIG` environment variable;
3. The Xray process's current working directory;
4. The directory containing the Xray executable.

See [Environment Variables](../../config/env.md) for these directory settings. Relative paths are not automatically resolved against the directory containing the configuration file.

For example, when the script path is `routing.lua`, Xray searches for the file in the order above. A Windows absolute path can be written as `C:/Xray/routing.lua`; if you use backslashes, escape them as required by your configuration format.
