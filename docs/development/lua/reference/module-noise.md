# xray.finalmask.noise

生成噪声所需的随机数据。

```lua
local noise = require("xray.finalmask.noise")
```

## API 索引

| 分类 | 成员                                               | 说明               |
| ---- | -------------------------------------------------- | ------------------ |
| 函数 | [`noise.Random(...)`](#noise-random)               | 生成随机字节       |
| 函数 | [`noise.RandomBetween(...)`](#noise-randombetween) | 生成范围内的随机数 |

两个函数在所有脚本中都可用。噪声包由 [噪声 Hook](./hook-noise.md) 的 [`plan:Add`](./hook-noise.md#plan-add) 提交。

## 函数

### noise.Random

```lua
local bytes = noise.Random(size)
```

生成指定长度的随机字节，可直接作为噪声包的内容。

**参数**

| 参数   | 类型     | 说明 / 要求                                  |
| ------ | -------- | -------------------------------------------- |
| `size` | `number` | 必填，字节数，须为 `0 .. 65535` 范围内的整数 |

**返回值**

| 返回值  | 类型     | 说明                                          |
| ------- | -------- | --------------------------------------------- |
| `bytes` | `string` | 该长度的随机字节串，不为 `nil`；`0` 时为 `""` |

**行为约定**

使用密码学安全的随机源，每次调用结果不同。返回的是字节串而非文本，可包含任意字节。

参数超出范围或不是数字时抛出 Lua 异常，该实例会被销毁，本次不发送噪声。

### noise.RandomBetween

```lua
local value = noise.RandomBetween(from, to)
```

生成闭区间内的随机整数，可用于随机长度或随机延迟。

**参数**

| 参数   | 类型     | 说明 / 要求                              |
| ------ | -------- | ---------------------------------------- |
| `from` | `number` | 必填，下界，须满足 `0 <= from`           |
| `to`   | `number` | 必填，上界，须满足 `from <= to <= 65535` |

**返回值**

| 返回值  | 类型     | 说明                                        |
| ------- | -------- | ------------------------------------------- |
| `value` | `number` | `from .. to` 之间的整数，含两端，不为 `nil` |

**行为约定**

使用与 `noise.Random` 相同的随机源，两端取值都可能出现。`from` 与 `to` 相等时返回该值。

参数超出范围、顺序颠倒或不是数字时抛出 Lua 异常，该实例会被销毁，本次不发送噪声。

**示例**

```lua
local noise = require("xray.finalmask.noise")

function HandleNoise(plan, address)
    for i = 1, noise.RandomBetween(2, 5) do
        plan:Add(noise.Random(noise.RandomBetween(40, 90)), noise.RandomBetween(10, 20))
    end
end
```
