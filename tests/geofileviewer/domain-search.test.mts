import { test } from "node:test"
import assert from "node:assert/strict"
import { indexDataset } from "../../.vitepress/theme/components/geofileviewer/dataset.mts"
import { parseDomainQuery } from "../../.vitepress/theme/components/geofileviewer/domainQuery.mts"
import { DomainMatcher } from "../../.vitepress/theme/components/geofileviewer/domainSearch.mts"
import { site } from "./helpers/dat.mts"
import {
  withViewer,
  finishSearch,
  batch,
  TestWorker
} from "./helpers/viewer.mts"

test("domain input accepts hostnames and IDNs, normalizes case and the root dot, and rejects URLs and IPs", () => {
  for (const [input, expected] of [
    [" WWW.Example.COM. ", "www.example.com"],
    ["例子.中国。", "xn--fsqu00a.xn--fiqs8s"],
    ["localhost", "localhost"],
    ["_service.example", "_service.example"]
  ])
    assert.equal(parseDomainQuery(input), expected)
  for (const input of [
    "",
    "https://example.com",
    "example.com/path",
    "example.com:443",
    "user@example.com",
    "example.com?query",
    "example.com#fragment",
    "exam ple.com",
    "example..com",
    ".example",
    "-example.com",
    "example-.com",
    "example.com..",
    "*.example.com",
    "example%2ecom",
    "example\\com",
    "127.0.0.1",
    "::1",
    "[::1]",
    "0x7f000001",
    "a".repeat(64) + ".com",
    Array(5).fill("a".repeat(63)).join(".")
  ])
    assert.equal(parseDomainQuery(input), undefined, input)
})

test("GeoSite matches all four rule types across categories in file order without using category names or attributes", async () => {
  const data = await indexDataset(
    new Uint8Array([
      ...site("A", [
        { type: 0, value: "AMP", attrs: true },
        { type: 1, value: "^www[0-9]+\\.example\\.com$" },
        { type: 2, value: "EXAMPLE.COM" },
        { type: 3, value: "www7.example.com" },
        { type: 3, value: "example.com" },
        { type: 1, value: "^WWW" }
      ]),
      ...site("B", [{ type: 2, value: "com", attrs: true }]),
      ...site("www7.example.com", [{ type: 3, value: "other.test" }])
    ]),
    "geosite"
  )
  const result = (await data.search("WWW7.EXAMPLE.COM."))!
  assert.deepEqual(
    result.categories.map((c) => [c.code, c.matches]),
    [
      ["A", 4],
      ["B", 1]
    ]
  )
  const rows = (await data.entries(result, 0, 1))!.entries
  assert.deepEqual(
    rows.map((row) => row.type),
    ["keyword", "regexp", "domain", "full"]
  )
  assert.deepEqual(result.categories[0].attributes, [
    { key: "cn", count: 1 },
    { key: "weight", count: 1 }
  ])
  assert.equal((await data.entries(result, 0, 1, "cn"))!.total, 1)
  assert.equal(
    (await data.entries(result, 0, 1, "cn"))!.entries[0].attributes[0]
      .value,
    "false"
  )
  assert.equal((await data.search("weight"))!.categories.length, 0)
  assert.equal(
    (await data.search("https://example.com"))!.categories.length,
    0
  )
})

test("domain and full rules respect label boundaries; keyword and regex rules search the target", async () => {
  const data = await indexDataset(
    site("A", [
      { type: 2, value: "example.com" },
      { type: 3, value: "example.com" },
      { type: 0, value: "example" },
      { type: 1, value: "(?i)EXAMPLE\\.com" }
    ]),
    "geosite"
  )
  for (const [target, types] of [
    ["example.com", ["domain", "full", "keyword", "regexp"]],
    ["sub.example.com", ["domain", "keyword", "regexp"]],
    ["notexample.com", ["keyword", "regexp"]],
    ["example.com.other", ["keyword", "regexp"]],
    ["example.net", ["keyword"]]
  ] as const) {
    const result = (await data.search(target))!
    assert.deepEqual(
      (await data.entries(result, 0, 1))!.entries.map((e) => e.type),
      types,
      target
    )
  }
})

test("Go-style regexes are safe, invalid patterns are skipped in matches and remain searchable as text", async () => {
  const matcher = new DomainMatcher()
  for (const [pattern, domain, expected] of [
    ["\\Awww\\.[[:alpha:]]+\\.com\\z", "www.example.com", true],
    ["(?i:EXAMPLE)\\.com$", "example.com", true],
    ["([a-z]+)+$", "a".repeat(200) + "!", false],
    ["(?=example)", "example.com", false],
    ["(?<=www)example", "wwwexample.com", false],
    ["(.)\\1", "www.example.com", false],
    ["[", "example.com", false]
  ] as const)
    assert.equal(
      matcher.matches(
        { type: "regexp", value: pattern, attributes: [] },
        domain
      ),
      expected,
      pattern
    )
  const data = await indexDataset(
    site("A", [
      { type: 1, value: "[" },
      { type: 3, value: "example.com" },
      { type: 2, value: "xn--fsqu00a.xn--fiqs8s" }
    ]),
    "geosite"
  )
  assert.equal(
    (await data.search("example.com"))!.categories[0].matches,
    1
  )
  assert.equal((await data.search("例子.中国"))!.categories[0].matches, 1)
  const rules = (await data.search("[", { mode: "rules" }))!
  assert.equal((await data.entries(rules, 0, 1))!.entries[0].value, "[")
  assert.equal(
    (await data.search("AMPLE", { mode: "rules" }))!.categories[0].matches,
    1
  )
})

test("domain matches and attributes include all batches; clearing or switching modes rebuilds the result", async () => {
  const data = await indexDataset(
    site(
      "A",
      Array.from({ length: 240 }, (_, i) => ({
        type: i === 239 ? 3 : 2,
        value: i === 239 ? "other.com" : "example.com",
        attrs: i >= 110
      }))
    ),
    "geosite"
  )
  const result = (await data.search("sub.example.com"))!
  assert.equal(result.categories[0].matches, 239)
  assert.equal(result.categories[0].attributes[0].count, 129)
  assert.equal((await data.entries(result, 0, 1))!.entries.length, 100)
  assert.equal((await data.entries(result, 0, 3))!.entries.length, 39)
  assert.equal(
    (await data.entries(result, 0, 2, "weight"))!.entries.length,
    29
  )
  assert.equal(
    (await data.search("sub.example.com", { mode: "rules" }))!.categories
      .length,
    0
  )
  assert.equal((await data.search(""))!.categories[0].matches, 240)
  assert.equal(
    await data.search("sub.example.com", { cancelled: () => true }),
    null
  )
})

test("domain scanning yields, discards a cancelled partial result and allows the next search", async (context) => {
  const data = await indexDataset(
    site(
      "A",
      Array.from({ length: 1000 }, () => ({
        type: 2,
        value: "example.com"
      }))
    ),
    "geosite"
  )
  let clock = 0
  context.mock.method(Date, "now", () => (clock += 17))
  let cancelled = false
  setTimeout(() => {
    cancelled = true
  }, 0)
  assert.equal(
    await data.search("example.com", { cancelled: () => cancelled }),
    null
  )
  assert.equal(cancelled, true)
  assert.equal(
    (await data.search("sub.example.com"))!.categories[0].matches,
    1000
  )
})

test("GeoSite validation and mode changes share the debounce, discard stale work and reset on category links and new sources", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  return withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 1, entryCount: 205 })
    const categories = [
      {
        id: 0,
        code: "A",
        count: 205,
        matches: 205,
        reverseMatch: false,
        attributes: [{ key: "cn", count: 2 }]
      }
    ]
    finishSearch(worker, categories)
    assert.equal(viewer.query.mode, "match")
    viewer.actions.setContentQuery("example.com")
    context.mock.timers.tick(250)
    const stale = worker.last("search")
    for (const input of [
      "https://example.com",
      "example.com:80",
      "127.0.0.1",
      "example..com"
    ]) {
      const count = worker.requests.filter(
        (r) => r.type === "search"
      ).length
      viewer.actions.setContentQuery(input)
      context.mock.timers.tick(249)
      assert.equal(viewer.query.error, undefined)
      context.mock.timers.tick(1)
      assert.equal(viewer.query.error, "invalidDomain")
      assert.equal(
        worker.requests.filter((r) => r.type === "search").length,
        count
      )
      assert.equal(viewer.results.value.selected, undefined)
    }
    worker.reply({ type: "search", id: stale.id, categories })
    assert.deepEqual(viewer.results.value.categories, [])
    viewer.actions.setSearchMode("rules")
    context.mock.timers.tick(250)
    assert.equal(viewer.query.error, undefined)
    assert.equal(worker.last("search").mode, "rules")
    assert.equal(worker.last("search").contentQuery, "example..com")
    finishSearch(worker, categories)
    batch(worker, worker.last("entries"), 0, 100, 205)
    viewer.actions.loadMoreEntries()
    const oldEntries = worker.last("entries")
    viewer.actions.setCategoryFilter("a")
    viewer.actions.setAttribute("cn")
    viewer.actions.setContentQuery("例子.中国。")
    viewer.actions.setSearchMode("match")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
    context.mock.timers.tick(250)
    assert.equal(viewer.query.error, undefined)
    assert.equal(worker.last("search").mode, "match")
    batch(worker, oldEntries, 100, 100, 205)
    assert.deepEqual(viewer.results.value.entries, [])
    viewer.actions.setSearchMode("rules")
    viewer.actions.focusCategory("A")
    assert.equal(viewer.query.mode, "match")
    assert.equal(viewer.query.content, "")
    assert.equal(worker.last("search").contentQuery, "")
    viewer.actions.setSearchMode("rules")
    await viewer.actions.loadSource()
    const next = TestWorker.instances[1]
    next.reply({ type: "ready", categoryCount: 1, entryCount: 205 })
    assert.equal(viewer.query.mode, "match")
    assert.equal(next.last("search").mode, "match")
  })
})
