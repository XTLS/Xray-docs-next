import { test } from "node:test"
import assert from "node:assert/strict"
import protobuf from "protobufjs/minimal.js"
import {
  indexDataset,
  formatCIDR,
  pageBounds
} from "../../.vitepress/theme/components/geofileviewer/dataset.mts"
import { highlightParts } from "../../.vitepress/theme/components/geofileviewer/presentation.mts"

const W = protobuf.Writer
function site(
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
function ip(code = "private", bytes = [127, 0, 0, 0], prefix = 8) {
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
test("domain types and attributes retain false and int64 precision", async () => {
  const data = await indexDataset(
    site(
      "GOOGLE",
      [0, 1, 2, 3].map((type) => ({
        type,
        value: "google.com",
        attrs: true
      }))
    ),
    "geosite"
  )
  const result = (await data.search("google"))!
  assert.equal(data.entryCount, 4)
  const rows = data.entries(result, 0, 1).entries
  assert.deepEqual(
    rows.map((r) => r.type),
    ["keyword", "regexp", "domain", "full"]
  )
  assert.deepEqual(rows[0].attributes, [
    { key: "cn", value: "false" },
    { key: "weight", value: "9007199254740993" }
  ])
})
test("search matches category, literal content, attributes and zero results", async () => {
  const bytes = new Uint8Array([
    ...site("a", [
      { type: 2, value: "first[.com", attrs: true },
      { type: 3, value: "other.com" }
    ]),
    ...site("b", [{ type: 1, value: "second.com" }])
  ])
  const data = await indexDataset(bytes, "geosite")
  assert.equal((await data.search("A"))!.categories[0].matches, 2)
  const result = (await data.search("["))!
  assert.equal(result.categories.length, 1)
  assert.equal(data.entries(result, 0, 1).entries[0].value, "first[.com")
  assert.equal((await data.search("weight"))!.categories[0].matches, 1)
  assert.equal((await data.search("missing"))!.categories.length, 0)
  assert.equal(await data.search("", () => true), null)
})
test("entries are paged and category name matches include all entries", async () => {
  const data = await indexDataset(
    site(
      "large",
      Array.from({ length: 205 }, (_, i) => ({
        type: 2,
        value: `entry${i}.com`
      }))
    ),
    "geosite"
  )
  const result = (await data.search("large"))!
  assert.equal(data.entries(result, 0, 1).entries.length, 100)
  assert.equal(data.entries(result, 0, 3).entries.length, 5)
  assert.equal(data.entries(result, 0, 99).page, 3)
  assert.equal(data.entries(result, 99, 1).total, 0)
  assert.deepEqual(pageBounds(0, 99, 25), { page: 1, start: 0, end: 0 })
})
test("IPv4, compressed IPv6 and reverse match metadata", async () => {
  assert.equal(formatCIDR(new Uint8Array(16), 0), "::/0")
  assert.equal(
    formatCIDR(
      Uint8Array.from([32, 1, 13, 184, ...Array(12).fill(0)]),
      32
    ),
    "2001:db8::/32"
  )
  const data = await indexDataset(ip(), "geoip")
  const result = (await data.search("127.0"))!
  assert.equal(result.categories[0].reverseMatch, true)
  assert.equal(data.entries(result, 0, 1).entries[0].value, "127.0.0.0/8")
})
test("empty, truncated, wrong type and invalid CIDR files fail clearly", async () => {
  await assert.rejects(
    indexDataset(new Uint8Array(), "geoip"),
    /emptyFile/
  )
  for (const bytes of [
    Uint8Array.from([10, 255]),
    Uint8Array.from([0]),
    ip("bad", [1, 2, 3], 8),
    ip("bad", [1, 2, 3, 4], 33)
  ])
    await assert.rejects(indexDataset(bytes, "geoip"), /invalidFile/)
  await assert.rejects(indexDataset(ip(), "geosite"), /invalidFile/)
  await assert.rejects(
    indexDataset(site("a", [{ type: 2, value: "test.com" }]), "geoip"),
    /invalidFile/
  )
})
test("highlighting treats markup and regular expression characters as text", () => {
  assert.deepEqual(highlightParts("<script>[a]", "["), [
    { text: "<script>", match: false },
    { text: "[", match: true },
    { text: "a]", match: false }
  ])
  assert.deepEqual(highlightParts("TestTEST", "test"), [
    { text: "Test", match: true },
    { text: "TEST", match: true }
  ])
})
