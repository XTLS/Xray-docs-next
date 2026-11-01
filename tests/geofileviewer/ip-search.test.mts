import { test } from "node:test"
import assert from "node:assert/strict"
import { parseIpQuery } from "../../.vitepress/theme/components/geofileviewer/ipSearch.mts"
import {
  formatCIDR,
  indexDataset
} from "../../.vitepress/theme/components/geofileviewer/dataset.mts"
import { ipRanges } from "./helpers/dat.mts"

const v6 = (words: number[]) =>
  words.flatMap((word) => [word >> 8, word & 255])
const text = (bytes: number[]) =>
  bytes.length === 4
    ? bytes.join(".")
    : Array.from({ length: 8 }, (_, i) =>
        ((bytes[i * 2] << 8) | bytes[i * 2 + 1]).toString(16)
      ).join(":")

test("IP queries parse complete IPv4, compressed IPv6 and embedded IPv4 without losing precision", () => {
  assert.deepEqual(
    [...parseIpQuery(" 255.0.128.1 ")!.address],
    [255, 0, 128, 1]
  )
  assert.deepEqual([...parseIpQuery("0.0.0.0")!.address], [0, 0, 0, 0])
  assert.deepEqual(
    [...parseIpQuery("255.255.255.255")!.address],
    [255, 255, 255, 255]
  )
  const bytes = v6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 1])
  for (const value of ["2001:DB8::1", "2001:0db8:0:0:0:0:0:0001"])
    assert.deepEqual([...parseIpQuery(value)!.address], bytes)
  assert.deepEqual([...parseIpQuery("::")!.address], Array(16).fill(0))
  assert.deepEqual(
    [...parseIpQuery("::ffff:192.0.2.128")!.address],
    v6([0, 0, 0, 0, 0, 0xffff, 0xc000, 0x280])
  )
  assert.deepEqual(
    [...parseIpQuery("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff")!.address],
    Array(16).fill(255)
  )
})

test("IP mode accepts only complete IP addresses and never switches to CIDR matching automatically", async () => {
  const data = await indexDataset(
    ipRanges("TEST", [{ bytes: [127, 0, 0, 0], prefix: 8 }]),
    "geoip"
  )
  for (const value of [
    "",
    "127.0",
    "127.0.0",
    "127.0.0.256",
    "127.0.0.-1",
    "127.0.0.01",
    "0x7f.0.0.1",
    "127.0.0.1/",
    "127.0.0.0/8",
    "0.0.0.0/0",
    "::/0",
    "127.0.0.1/33",
    "127.0.0.1/-1",
    "127.0.0.1/1.5",
    "127.0.0.1/8/8",
    "127.0.0.1 /8",
    "127.0.0.1:80",
    "localhost",
    "TEST",
    ":::",
    "1::2::3",
    "2001:db8",
    "1:2:3:4:5:6:7:8:9",
    "1:2:3:4:5:6:7:8::",
    "12345::",
    "::ffff:256.0.0.1",
    "::/129",
    "::%eth0",
    "[::1]"
  ]) {
    assert.equal(parseIpQuery(value), undefined, value)
    if (value)
      assert.equal((await data.search(value))!.categories.length, 0, value)
  }
})

test("IPv4 point lookups include all containing ranges across categories in original file order", async () => {
  const data = await indexDataset(
    new Uint8Array([
      ...ipRanges("A", [
        { bytes: [10, 0, 0, 0], prefix: 24 },
        { bytes: [128, 0, 0, 0], prefix: 1 },
        { bytes: [10, 0, 0, 0], prefix: 8 },
        { bytes: [10, 0, 0, 7], prefix: 32 },
        { bytes: [10, 0, 0, 0], prefix: 24 },
        { bytes: [0, 0, 0, 0], prefix: 1 }
      ]),
      ...ipRanges(
        "B",
        [
          { bytes: [10, 0, 0, 0], prefix: 25 },
          { bytes: [0, 0, 0, 0], prefix: 0 }
        ],
        false
      )
    ]),
    "geoip"
  )
  const result = (await data.search("10.0.0.7"))!
  assert.deepEqual(
    result.categories.map((c) => [c.code, c.matches, c.reverseMatch]),
    [
      ["A", 5, true],
      ["B", 2, false]
    ]
  )
  assert.deepEqual(
    (await data.entries(result, 0, 1))!.entries.map((e) => e.value),
    [
      "10.0.0.0/24",
      "10.0.0.0/8",
      "10.0.0.7/32",
      "10.0.0.0/24",
      "0.0.0.0/1"
    ]
  )
  for (const [query, match] of [
    ["127.255.255.255", "0.0.0.0/1"],
    ["128.0.0.0", "128.0.0.0/1"],
    ["255.255.255.255", "128.0.0.0/1"]
  ]) {
    const found = (await data.search(query))!
    assert.equal(
      (await data.entries(found, 0, 1))!.entries[0].value,
      match
    )
  }
})

test("CIDR mode matches only the literal start of the displayed range, including partial addresses and prefixes", async () => {
  const data = await indexDataset(
    ipRanges("A", [
      { bytes: [10, 0, 0, 0], prefix: 8 },
      { bytes: [10, 0, 0, 0], prefix: 24 },
      { bytes: [10, 0, 0, 7], prefix: 24 },
      { bytes: [10, 0, 0, 0], prefix: 25 },
      { bytes: [10, 0, 0, 0], prefix: 24 },
      { bytes: [0, 0, 0, 0], prefix: 0 }
    ]),
    "geoip"
  )
  const result = (await data.search("10.0.0.0/24", { mode: "rules" }))!
  assert.equal(result.categories[0].matches, 2)
  assert.deepEqual(
    (await data.entries(result, 0, 1))!.entries.map((e) => e.value),
    ["10.0.0.0/24", "10.0.0.0/24"]
  )
  const partial = (await data.search("10.0.0.0/2", { mode: "rules" }))!
  assert.equal(partial.categories[0].matches, 3)
  assert.equal(
    (await data.search(" 10. ", { mode: "rules" }))!.categories[0].matches,
    5
  )
  assert.equal(
    (await data.search("0.0.0", { mode: "rules" }))!.categories[0].matches,
    1
  )
  assert.equal(
    (await data.search(".0.0", { mode: "rules" }))!.categories.length,
    0
  )
  assert.equal(
    (await data.search("A", { mode: "rules" }))!.categories.length,
    0
  )
  assert.equal(
    (await data.search("10.0.0.7", { mode: "rules" }))!.categories[0]
      .matches,
    1
  )
  assert.equal((await data.search("10.0.0.7"))!.categories[0].matches, 6)
  assert.equal(
    (await data.search("", { mode: "rules" }))!.categories[0].matches,
    6
  )
  assert.equal(
    await data.search("10.", { mode: "rules", cancelled: () => true }),
    null
  )
})

test("IPv6 lookup handles partial-byte prefixes, equivalent spellings, endpoints and separate address families", async () => {
  const data = await indexDataset(
    ipRanges("MIXED", [
      { bytes: [192, 0, 2, 0], prefix: 24 },
      {
        bytes: v6([0x2001, 0xdb8, 0xabcd, 0x8000, 0, 0, 0, 0]),
        prefix: 49
      },
      { bytes: v6([0, 0, 0, 0, 0, 0xffff, 0, 0]), prefix: 96 },
      { bytes: Array(16).fill(0), prefix: 0 },
      { bytes: Array(16).fill(255), prefix: 128 },
      { bytes: Array(16).fill(0), prefix: 128 }
    ]),
    "geoip"
  )
  assert.equal(
    (await data.search("2001:db8:abcd:ffff::1"))!.categories[0].matches,
    2
  )
  assert.equal(
    (await data.search("2001:db8:abcd:7fff::1"))!.categories[0].matches,
    1
  )
  assert.equal(
    (await data.search("2001:DB8:ABCD:8", { mode: "rules" }))!
      .categories[0].matches,
    1
  )
  assert.equal(
    (await data.search("2001:db8:abcd:8000::/48"))!.categories.length,
    0
  )
  assert.equal(
    (await data.search("::ffff:192.0.2.1"))!.categories[0].matches,
    2
  )
  assert.equal((await data.search("192.0.2.1"))!.categories[0].matches, 1)
  assert.equal(
    (await data.search("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"))!
      .categories[0].matches,
    2
  )
  assert.equal((await data.search("::"))!.categories[0].matches, 2)
  assert.equal(
    (await data.search("::/0", { mode: "rules" }))!.categories[0].matches,
    1
  )
  assert.equal(await data.search("::1", { cancelled: () => true }), null)
})

test("CIDR prefix lookup follows the displayed IPv6 compression and literal prefix length", async () => {
  const rows = [
    {
      bytes: v6([0, 1, 0, 0, 2, 3, 4, 5]),
      prefix: 64,
      value: "0:1::2:3:4:5/64"
    },
    {
      bytes: v6([0, 0, 1, 0, 0, 2, 3, 4]),
      prefix: 64,
      value: "::1:0:0:2:3:4/64"
    },
    {
      bytes: v6([0x2001, 0xdb8, 0, 0, 0, 0, 0, 0]),
      prefix: 32,
      value: "2001:db8::/32"
    },
    {
      bytes: v6([1, 2, 3, 4, 5, 6, 7, 8]),
      prefix: 128,
      value: "1:2:3:4:5:6:7:8/128"
    },
    { bytes: Array(16).fill(0), prefix: 0, value: "::/0" },
    {
      bytes: v6([0, 1, 2, 3, 4, 5, 6, 7]),
      prefix: 128,
      value: "0:1:2:3:4:5:6:7/128"
    },
    { bytes: [0, 1, 2, 3], prefix: 24, value: "0.1.2.3/24" }
  ]
  const data = await indexDataset(ipRanges("DISPLAY", rows), "geoip")
  for (const row of rows) {
    assert.equal(
      formatCIDR(Uint8Array.from(row.bytes), row.prefix),
      row.value
    )
    for (let size = 1; size <= row.value.length; size++) {
      const prefix = row.value.slice(0, size).toUpperCase()
      const result = (await data.search(prefix, { mode: "rules" }))!
      const expected = rows
        .filter((r) => r.value.toUpperCase().startsWith(prefix))
        .map((r) => r.value)
      assert.deepEqual(
        (await data.entries(result, 0, 1))!.entries.map((e) => e.value),
        expected,
        prefix
      )
    }
  }
})

test("numeric matches stream beyond the first page and clearing the query restores every entry", async () => {
  const ranges = Array.from({ length: 205 }, () => ({
    bytes: [10, 0, 0, 0],
    prefix: 8
  }))
  ranges.splice(100, 0, { bytes: [192, 0, 2, 0], prefix: 24 })
  const data = await indexDataset(ipRanges("MANY", ranges), "geoip")
  for (const mode of ["match", "rules"] as const) {
    const result = (await data.search(
      mode === "match" ? "10.2.3.4" : "10.0.0.0/",
      { mode }
    ))!
    assert.equal(result.categories[0].matches, 205)
    assert.equal((await data.entries(result, 0, 1))!.entries.length, 100)
    assert.equal((await data.entries(result, 0, 3))!.entries.length, 5)
    assert.equal((await data.entries(result, 0, 99))!.page, 3)
  }
  const all = (await data.search(""))!
  assert.equal(all.categories[0].matches, 206)
  assert.equal(
    (await data.entries(all, 0, 2))!.entries[0].value,
    "192.0.2.0/24"
  )
})

test("binary lookup agrees with an independent numeric scan of unsorted mixed and overlapping networks", async () => {
  let state = 12345
  const random = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0)
  const numeric = (bytes: number[]) =>
    bytes.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n)
  const ranges = Array.from({ length: 1200 }, (_, i) => {
    const length = i % 2 ? 4 : 16
    return {
      bytes: Array.from({ length }, () => random() >>> 24),
      prefix: random() % (length * 8 + 1)
    }
  })
  const encoded = ipRanges("RANDOM", ranges)
  const padded = new Uint8Array(encoded.length + 13)
  padded.set(encoded, 7)
  const data = await indexDataset(
    padded.subarray(7, 7 + encoded.length),
    "geoip"
  )
  for (let i = 0; i < 80; i++) {
    const range = ranges[random() % ranges.length]
    const query = text(range.bytes)
    const address = numeric(range.bytes)
    const expected = ranges.flatMap((entry, index) => {
      if (entry.bytes.length !== range.bytes.length) return []
      const shift = BigInt(entry.bytes.length * 8 - entry.prefix)
      const match = numeric(entry.bytes) >> shift === address >> shift
      return match ? [index] : []
    })
    const result = (await data.search(query))!
    assert.equal(
      result.categories[0]?.matches ?? 0,
      expected.length,
      query
    )
    assert.deepEqual(
      Array.from(result.indexes.get(0) ?? ranges.map((_, index) => index)),
      expected,
      query
    )
  }
})
