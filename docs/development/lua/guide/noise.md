# 噪声脚本

通过 [noise 伪装](../../../config/transports/finalmask.md#noise)的 `script` 指定脚本后，它发送的噪声包由 Lua 的 `HandleNoise` 函数生成，不再使用配置里的 `noise` 列表。

## 最小示例

在已有配置中加入：

```json
{
  "streamSettings": {
    "finalmask": {
      "udp": [
        {
          "type": "noise",
          "settings": {
            "script": "noise.lua",
            "reset": "30-60"
          }
        }
      ]
    }
  }
}
```

保存 `noise.lua`：

```lua
local noise = require("xray.finalmask.noise")

function HandleNoise(plan, address)
    plan:AddRandom(noise.RandomBetween(40, 90))
end
```

上面的配置片段需要合并到完整配置中。文件定位规则见[脚本文件路径](../environment.md#脚本文件路径)。

## 与 noise 配置的关系

`script` 与 `noise` 互斥，同时配置会导致启动失败。`reset` 对两者都有效：它决定同一地址多久之后再次发送噪声，也就是 `HandleNoise` 多久之后再被调用一次。

脚本用 [`plan:Add`](../reference/hook-noise.md#plan-add) 逐个提交要发送的包，核心按调用顺序发送，全部发完后才发送真实数据。`Send` 的第二个参数是该包之后的延迟，作用与配置中的 `delay` 相同。参数、返回值和失败行为见[噪声 Hook](../reference/hook-noise.md)。

与 `type` 为 `exp` 的表达式相比，脚本可以写条件分支和循环，也可以在实例中保留状态，适合按地址区分、按调用次数变化，或由多个片段拼成结构复杂的包。只需要固定结构时，`exp` 更简单也更省资源。

## 示例：首次多发、之后少发

噪声脚本使用池化实例，顶层的 `local` 只属于当前实例，详见[池化生命周期](./lifecycle.md#池化生命周期)。下面用它记录本实例处理过的地址：

```lua
local noise = require("xray.finalmask.noise")
local log = require("xray.log")
local seen = {}

local record = "\22\3\1"

function HandleNoise(plan, address)
    if seen[address] then
        log.Debug("再次为 ", address, " 发送噪声")
        plan:Add(noise.Random(noise.RandomBetween(20, 40)))
        return
    end

    seen[address] = true
    for i = 1, noise.RandomBetween(2, 4) do
        plan:Add(
            record .. noise.Random(noise.RandomBetween(40, 90)),
            noise.RandomBetween(10, 20)
        )
    end
end
```

请求不保证总是分配到同一个实例，因此 `seen` 只能用于这类无需精确的伪装决策，不能当作所有连接共享的状态。

## 示例：报告错误

噪声失败不影响正常通信。需要让核心记录原因时，返回一个错误：

```lua
local noise = require("xray.finalmask.noise")

function HandleNoise(plan, address)
    if address == "" then
        return "没有目标地址"
    end
    plan:Add("\0\0\0\0")
end
```

核心会记录一条 `warning` 日志，本次不发送噪声，随后照常发送真实数据包。
