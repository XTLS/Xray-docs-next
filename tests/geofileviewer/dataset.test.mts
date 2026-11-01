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
  const rows = (await data.entries(result, 0, 1))!.entries
  assert.deepEqual(
    rows.map((r) => r.type),
    ["keyword", "regexp", "domain", "full"]
  )
  assert.deepEqual(rows[0].attributes, [
    { key: "cn", value: "false" },
    { key: "weight", value: "9007199254740993" }
  ])
})
test("content search is literal, case-insensitive and excludes category names and attributes", async () => {
  const bytes = new Uint8Array([
    ...site("a", [
      { type: 2, value: "first[.com", attrs: true },
      { type: 3, value: "other.com" }
    ]),
    ...site("b", [{ type: 1, value: "second.com" }])
  ])
  const data = await indexDataset(bytes, "geosite")
  assert.equal((await data.search("a"))!.categories.length, 0)
  assert.equal((await data.search("FIRST"))!.categories[0].matches, 1)
  const result = (await data.search("["))!
  assert.equal(result.categories.length, 1)
  assert.equal(
    (await data.entries(result, 0, 1))!.entries[0].value,
    "first[.com"
  )
  assert.equal((await data.search("weight"))!.categories.length, 0)
  assert.equal((await data.search("false"))!.categories.length, 0)
  assert.equal(
    (await data.search("9007199254740993"))!.categories.length,
    0
  )
  assert.equal((await data.search("missing"))!.categories.length, 0)
  assert.equal(await data.search("", () => true), null)
})
test("empty content search includes all entries and pages are bounded", async () => {
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
  const result = (await data.search(""))!
  assert.equal((await data.search("large"))!.categories.length, 0)
  assert.equal((await data.entries(result, 0, 1))!.entries.length, 100)
  assert.equal((await data.entries(result, 0, 3))!.entries.length, 5)
  assert.equal((await data.entries(result, 0, 99))!.page, 3)
  assert.equal((await data.entries(result, 99, 1))!.total, 0)
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
  assert.equal(
    (await data.entries(result, 0, 1))!.entries[0].value,
    "127.0.0.0/8"
  )
  assert.deepEqual(result.categories[0].attributes, [])
  assert.equal((await data.search("private"))!.categories.length, 0)
})
test("attribute options and filtering cover the complete content result, beyond the first batch", async () => {
  const data = await indexDataset(
    new Uint8Array([
      ...site(
        "A",
        Array.from({ length: 330 }, (_, i) => ({
          type: 2,
          value: `${i >= 200 ? "tail" : "entry"}${i}.com`,
          attrs: i >= 110 && i < 315
        }))
      ),
      ...site("B", [{ type: 2, value: "other.com", attrs: true }])
    ]),
    "geosite"
  )
  const result = (await data.search(""))!
  const summaries = structuredClone(result.categories)
  assert.deepEqual(result.categories[0].attributes, [
    { key: "cn", count: 205 },
    { key: "weight", count: 205 }
  ])
  assert.equal(
    (await data.entries(result, 0, 1))!.entries.some(
      (row) => row.attributes.length
    ),
    false
  )
  const first = (await data.entries(result, 0, 1, "cn"))!
  assert.equal(first.total, 205)
  assert.equal(first.entries[0].value, "entry110.com")
  assert.equal(first.entries[0].attributes[0].value, "false")
  const last = (await data.entries(result, 0, 3, "cn"))!
  assert.equal(last.entries.length, 5)
  assert.equal(last.entries.at(-1)?.value, "tail314.com")
  assert.equal(
    (await data.entries(result, 0, 1, "weight"))!.entries[0].attributes[1]
      .value,
    "9007199254740993"
  )
  assert.deepEqual(result.categories, summaries)
  assert.equal((await data.entries(result, 0, 1, "missing"))!.total, 0)
  assert.equal((await data.entries(result, 1, 1, "cn"))!.total, 1)
  assert.equal((await data.entries(result, 0, 1))!.total, 330)

  const tail = (await data.search("TAIL"))!
  assert.equal(tail.categories.length, 1)
  assert.equal(tail.categories[0].matches, 130)
  assert.deepEqual(tail.categories[0].attributes, [
    { key: "cn", count: 115 },
    { key: "weight", count: 115 }
  ])
  assert.equal((await data.entries(tail, 0, 2, "cn"))!.entries.length, 15)
  assert.equal(
    (await data.entries(tail, 0, 1, "cn"))!.entries[0].value,
    "tail200.com"
  )
})

test("cancelled attribute filtering produces no page or cached partial result", async () => {
  const data = await indexDataset(
    site(
      "A",
      Array.from({ length: 205 }, (_, i) => ({
        type: 2,
        value: `row${i}.example`,
        attrs: true
      }))
    ),
    "geosite"
  )
  const result = (await data.search(""))!
  let checks = 0
  assert.equal(
    await data.entries(result, 0, 1, "cn", () => ++checks > 1),
    null
  )
  assert.equal(result.attributeFilter, undefined)
  assert.equal((await data.entries(result, 0, 1, "cn"))!.total, 205)
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
