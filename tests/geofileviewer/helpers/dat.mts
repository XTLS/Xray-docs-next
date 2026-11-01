import protobuf from "protobufjs/minimal.js"

const W = protobuf.Writer
export function site(
  code: string,
  rows: { type: number; value: string; attrs?: boolean }[]
) {
  const w = W.create().uint32(10).fork().uint32(10).string(code)
  for (const row of rows) {
    w.uint32(18)
      .fork()
      .uint32(8)
      .uint32(row.type)
      .uint32(18)
      .string(row.value)
    if (row.attrs) {
      w.uint32(26)
        .fork()
        .uint32(10)
        .string("cn")
        .uint32(16)
        .bool(false)
        .ldelim()
      w.uint32(26)
        .fork()
        .uint32(10)
        .string("weight")
        .uint32(24)
        .int64("9007199254740993")
        .ldelim()
    }
    w.ldelim()
  }
  return w.ldelim().finish()
}

export function ip(code = "private", bytes = [127, 0, 0, 0], prefix = 8) {
  return W.create()
    .uint32(10)
    .fork()
    .uint32(10)
    .string(code)
    .uint32(18)
    .fork()
    .uint32(10)
    .bytes(bytes)
    .uint32(16)
    .uint32(prefix)
    .ldelim()
    .uint32(24)
    .bool(true)
    .ldelim()
    .finish()
}
