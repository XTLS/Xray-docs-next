import { test } from "node:test"
import assert from "node:assert/strict"
import {
  withViewer,
  TestWorker,
  finishSearch,
  batch
} from "./helpers/viewer.mts"
import type { CategorySummary } from "../../.vitepress/theme/components/geofileviewer/types.mts"

test("IP validation waits for the debounce and invalid input never starts a search or restores stale results", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  return withViewer(
    async (viewer, worker) => {
      worker.reply({ type: "ready", categoryCount: 1, entryCount: 2 })
      const categories: CategorySummary[] = [
        {
          id: 0,
          code: "A",
          count: 2,
          matches: 2,
          reverseMatch: false,
          attributes: []
        }
      ]
      finishSearch(worker, categories)
      batch(worker, worker.last("entries"), 0, 2, 2)
      const loaded = viewer.session.loaded
      viewer.actions.setContentQuery("192.0.2.1")
      context.mock.timers.tick(250)
      const pending = worker.last("search")
      const requests = worker.requests.filter(
        (r) => r.type === "search"
      ).length
      for (const input of [
        "192.0.",
        "256.1.2.3",
        "1.2.3.4/24",
        "2001:db8:",
        "fe80::1%eth0"
      ]) {
        viewer.actions.setContentQuery(input)
        assert.equal(viewer.query.invalidIp, false, input)
        assert.equal(viewer.query.searching, true)
        context.mock.timers.tick(249)
        assert.equal(viewer.query.invalidIp, false, input)
        assert.equal(
          worker.requests.filter((r) => r.type === "search").length,
          requests
        )
        context.mock.timers.tick(1)
        assert.equal(viewer.query.invalidIp, true, input)
        assert.equal(viewer.query.searching, false)
        assert.equal(viewer.results.value.selected, undefined)
        assert.deepEqual(viewer.results.value.categories, [])
        assert.deepEqual(viewer.results.value.entries, [])
      }
      worker.reply({ type: "search", id: pending.id, categories })
      context.mock.timers.tick(1000)
      assert.equal(
        worker.requests.filter((r) => r.type === "search").length,
        requests
      )
      assert.deepEqual(viewer.results.value.categories, [])
      assert.equal(viewer.session.loaded, loaded)
      assert.equal(viewer.session.error, undefined)
      viewer.actions.setContentQuery("10.")
      viewer.actions.setIpSearchMode("cidr")
      assert.equal(viewer.query.invalidIp, false)
      context.mock.timers.tick(250)
      assert.equal(worker.last("search").contentQuery, "10.")
      assert.equal(worker.last("search").ipMode, "cidr")
      finishSearch(worker, categories)
      viewer.actions.setIpSearchMode("ip")
      assert.equal(viewer.query.invalidIp, false)
      context.mock.timers.tick(250)
      assert.equal(viewer.query.invalidIp, true)
      viewer.actions.setContentQuery("2001:db8::1")
      assert.equal(viewer.query.invalidIp, false)
      context.mock.timers.tick(250)
      assert.equal(worker.last("search").contentQuery, "2001:db8::1")
      assert.equal(worker.last("search").ipMode, "ip")
      finishSearch(worker, categories)
      viewer.actions.setContentQuery("192.0.2.1")
      viewer.actions.setContentQuery("192.0.")
      const before = worker.requests.filter(
        (r) => r.type === "search"
      ).length
      context.mock.timers.tick(250)
      assert.equal(
        worker.requests.filter((r) => r.type === "search").length,
        before
      )
      viewer.actions.setContentQuery("")
      assert.equal(viewer.query.invalidIp, false)
      context.mock.timers.tick(250)
      assert.equal(worker.last("search").contentQuery, "")
      finishSearch(worker, categories)
      assert.equal(viewer.results.value.selected?.code, "A")
      viewer.actions.setContentQuery("bad")
      viewer.actions.focusCategory("A")
      assert.equal(viewer.query.invalidIp, false)
      assert.equal(viewer.query.content, "")
      assert.equal(worker.last("search").contentQuery, "")
    },
    true,
    "geoip"
  )
})

test("GeoIP search mode is explicit, preserves input and invalidates pending work", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  return withViewer(
    async (viewer, worker) => {
      worker.reply({ type: "ready", categoryCount: 1, entryCount: 205 })
      const categories: CategorySummary[] = [
        {
          id: 0,
          code: "A",
          count: 205,
          matches: 205,
          reverseMatch: false,
          attributes: []
        }
      ]
      finishSearch(worker, categories)
      batch(worker, worker.last("entries"), 0, 100, 205)
      viewer.actions.loadMoreEntries()
      const oldEntries = worker.last("entries")
      const oldSearch = worker.last("search")
      assert.equal(viewer.query.ipMode, "ip")
      assert.equal(oldSearch.ipMode, "ip")
      viewer.actions.setCategoryFilter("a")
      viewer.actions.setContentQuery("10.")
      viewer.actions.setIpSearchMode("cidr")
      context.mock.timers.tick(250)
      const cidrSearch = worker.last("search")
      assert.equal(cidrSearch.contentQuery, "10.")
      assert.equal(cidrSearch.ipMode, "cidr")
      assert.equal(viewer.query.content, "10.")
      assert.equal(viewer.query.category, "")
      assert.equal(viewer.query.attribute, "")
      assert.equal(viewer.results.value.selected, undefined)
      batch(worker, oldEntries, 100, 100, 205)
      worker.reply({ type: "search", id: oldSearch.id, categories })
      assert.equal(viewer.results.value.entries.length, 0)
      assert.equal(viewer.query.searching, true)
      const searches = worker.requests.filter(
        (r) => r.type === "search"
      ).length
      context.mock.timers.tick(1000)
      assert.equal(
        worker.requests.filter((r) => r.type === "search").length,
        searches
      )
      viewer.actions.setIpSearchMode("ip")
      worker.reply({ type: "search", id: cidrSearch.id, categories })
      assert.equal(viewer.query.searching, true)
      assert.equal(viewer.query.invalidIp, false)
      context.mock.timers.tick(250)
      assert.equal(viewer.query.searching, false)
      assert.equal(viewer.query.invalidIp, true)
      assert.equal(worker.last("search"), cidrSearch)
      viewer.actions.setContentQuery("10.0.0.7")
      context.mock.timers.tick(250)
      finishSearch(worker, categories)
      assert.equal(viewer.results.value.selected?.code, "A")
      assert.equal(worker.last("search").ipMode, "ip")
      viewer.actions.setIpSearchMode("cidr")
      viewer.actions.focusCategory("A")
      assert.equal(viewer.query.ipMode, "ip")
      assert.equal(viewer.query.content, "")
      assert.equal(worker.last("search").ipMode, "ip")
      viewer.actions.setIpSearchMode("cidr")
      await viewer.actions.loadSource()
      assert.equal(viewer.query.ipMode, "ip")
      const next = TestWorker.instances[1]
      next.reply({ type: "ready", categoryCount: 1, entryCount: 205 })
      assert.equal(next.last("search").ipMode, "ip")
      viewer.actions.updateSource({ presetIndex: 2 })
      await viewer.actions.loadSource()
      const geosite = TestWorker.instances[2]
      geosite.reply({ type: "ready", categoryCount: 1, entryCount: 1 })
      const requests = geosite.requests.length
      viewer.actions.setIpSearchMode("cidr")
      assert.equal(viewer.query.ipMode, "ip")
      assert.equal(geosite.requests.length, requests)
    },
    true,
    "geoip"
  )
})

test("entry streaming appends once, stops at the end and discards a previous category's pending batch", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 2, entryCount: 207 })
    finishSearch(worker, [
      {
        id: 0,
        code: "A",
        count: 205,
        matches: 205,
        reverseMatch: false,
        attributes: []
      },
      {
        id: 1,
        code: "B",
        count: 2,
        matches: 2,
        reverseMatch: false,
        attributes: []
      }
    ])
    batch(worker, worker.last("entries"), 0, 100, 205)
    viewer.actions.loadMoreEntries()
    const stale = worker.last("entries")
    assert.equal(stale.page, 2)
    assert.equal(viewer.results.value.entries.length, 100)
    viewer.actions.selectCategory(1)
    const other = worker.last("entries")
    assert.equal(other.page, 1)
    assert.equal(viewer.results.value.entries.length, 0)
    batch(worker, stale, 100, 100, 205)
    assert.equal(viewer.results.value.entries.length, 0)
    batch(worker, other, 0, 2, 2, "b")
    assert.deepEqual(
      viewer.results.value.entries.map((row) => row.value),
      ["b0.example", "b1.example"]
    )
    viewer.actions.selectCategory(0)
    batch(worker, worker.last("entries"), 0, 100, 205)
    const before = worker.requests.length
    viewer.actions.loadMoreEntries()
    viewer.actions.loadMoreEntries()
    assert.equal(worker.requests.length, before + 1)
    assert.equal(viewer.results.value.entries.length, 100)
    batch(worker, worker.last("entries"), 100, 100, 205)
    viewer.actions.loadMoreEntries()
    batch(worker, worker.last("entries"), 200, 5, 205)
    assert.equal(viewer.results.value.entries.length, 205)
    assert.equal(
      new Set(viewer.results.value.entries.map((row) => row.value)).size,
      205
    )
    assert.equal(viewer.results.value.entries[0].value, "a0.example")
    assert.equal(
      viewer.results.value.entries.at(-1)?.value,
      "a204.example"
    )
    assert.equal(viewer.results.value.hasMoreEntries, false)
    const ended = worker.requests.length
    viewer.actions.loadMoreEntries()
    assert.equal(worker.requests.length, ended)
  }))

test("category streaming grows a prefix and a new search resets entries without accepting stale batches", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 60, entryCount: 9000 })
    finishSearch(
      worker,
      Array.from({ length: 60 }, (_, id) => ({
        id,
        code: `category-${id}`,
        count: 150,
        matches: 150,
        reverseMatch: false,
        attributes: []
      }))
    )
    assert.equal(viewer.results.value.visibleCategories.length, 25)
    viewer.actions.loadMoreCategories()
    assert.equal(viewer.results.value.visibleCategories.length, 50)
    assert.equal(viewer.results.value.visibleCategories[0].id, 0)
    viewer.actions.loadMoreCategories()
    assert.equal(viewer.results.value.visibleCategories.length, 60)
    assert.equal(viewer.results.value.hasMoreCategories, false)
    batch(worker, worker.last("entries"), 0, 100, 150)
    viewer.actions.loadMoreEntries()
    const stale = worker.last("entries")
    viewer.actions.setContentQuery("fresh")
    assert.equal(viewer.results.value.selected, undefined)
    assert.equal(viewer.results.value.entries.length, 0)
    batch(worker, stale, 100, 50, 150)
    assert.equal(viewer.results.value.selected, undefined)
    assert.equal(viewer.results.value.entries.length, 0)
    const pending = worker.requests.length
    viewer.actions.loadMoreEntries()
    viewer.actions.loadMoreCategories()
    assert.equal(worker.requests.length, pending)
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(viewer.results.value.selected, undefined)
    finishSearch(worker, [
      {
        id: 900,
        code: "FRESH",
        count: 3,
        matches: 3,
        reverseMatch: false,
        attributes: []
      }
    ])
    batch(worker, worker.last("entries"), 0, 3, 3, "fresh")
    assert.equal(viewer.results.value.visibleCategories.length, 1)
    assert.equal(viewer.results.value.selected?.code, "FRESH")
    assert.equal(viewer.results.value.entries.length, 3)
    assert.equal(viewer.results.value.entries[0].value, "fresh0.example")
    assert.equal(viewer.results.value.hasMoreEntries, false)
  }))

test("category names filter locally while attributes only filter the selected category's entries", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 3, entryCount: 215 })
    const summaries: CategorySummary[] = [
      {
        id: 0,
        code: "A[",
        count: 205,
        matches: 205,
        reverseMatch: false,
        attributes: [{ key: "cn", count: 2 }]
      },
      {
        id: 1,
        code: "B",
        count: 5,
        matches: 5,
        reverseMatch: false,
        attributes: [{ key: "weight", count: 1 }]
      },
      {
        id: 2,
        code: "ABC",
        count: 5,
        matches: 5,
        reverseMatch: false,
        attributes: []
      }
    ]
    finishSearch(worker, summaries)
    const initial = worker.last("entries")
    viewer.actions.setAttribute("cn")
    const filtered = worker.last("entries")
    assert.equal(filtered.attributeKey, "cn")
    assert.equal(filtered.page, 1)
    assert.equal(viewer.results.value.entryTotal, 2)
    batch(worker, initial, 0, 100, 205)
    assert.equal(viewer.results.value.entries.length, 0)
    batch(worker, filtered, 110, 2, 2)
    assert.deepEqual(viewer.results.value.categories, summaries)
    const requests = worker.requests.length
    viewer.actions.setCategoryFilter("[")
    assert.deepEqual(
      viewer.results.value.categories.map((c) => c.code),
      ["A["]
    )
    assert.equal(viewer.query.attribute, "cn")
    assert.equal(viewer.results.value.entries.length, 2)
    assert.equal(worker.requests.length, requests)

    viewer.actions.setCategoryFilter("b")
    assert.deepEqual(
      viewer.results.value.categories.map((c) => c.code),
      ["B", "ABC"]
    )
    assert.equal(viewer.results.value.selected?.code, "B")
    assert.equal(viewer.query.attribute, "")
    assert.equal(worker.last("entries").attributeKey, undefined)
    assert.equal(
      worker.requests.filter((r) => r.type === "search").length,
      1
    )
    viewer.actions.setAttribute("weight")
    const stale = worker.last("entries")
    viewer.actions.setCategoryFilter("no-category")
    assert.equal(worker.requests.at(-1)?.type, "cancelEntries")
    batch(worker, stale, 0, 1, 1)
    assert.equal(viewer.results.value.selected, undefined)
    assert.equal(viewer.query.attribute, "")
    assert.equal(viewer.results.value.entries.length, 0)
    assert.equal(viewer.results.value.entryTotal, 0)
    viewer.actions.setCategoryFilter("")
    assert.equal(viewer.results.value.categories.length, 3)
    assert.equal(viewer.results.value.selected?.code, "A[")
    assert.equal(
      worker.requests.filter((r) => r.type === "search").length,
      1
    )
  }))

test("content changes clear category and attribute filters while category changes preserve content search", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 2, entryCount: 10 })
    const summaries: CategorySummary[] = ["A", "B"].map((code, id) => ({
      id,
      code,
      count: 5,
      matches: 5,
      reverseMatch: false,
      attributes: [{ key: "cn", count: 1 }]
    }))
    finishSearch(worker, summaries)
    viewer.actions.setCategoryFilter("b")
    viewer.actions.setAttribute("cn")
    const stale = worker.last("entries")
    const entriesBeforeSearch = worker.requests.filter(
      (r) => r.type === "entries"
    ).length
    viewer.actions.setContentQuery("fresh")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
    assert.equal(viewer.query.searching, true)
    assert.equal(viewer.results.value.selected, undefined)
    assert.equal(
      worker.requests.filter((r) => r.type === "entries").length,
      entriesBeforeSearch
    )
    batch(worker, stale, 0, 1, 1)
    assert.equal(viewer.results.value.entries.length, 0)
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.last("search").contentQuery, "fresh")
    finishSearch(
      worker,
      summaries.map((c) => ({ ...c, matches: 2 }))
    )
    assert.deepEqual(
      viewer.results.value.categories.map((c) => c.code),
      ["A", "B"]
    )
    assert.equal(viewer.results.value.entryTotal, 2)
    assert.equal(viewer.results.value.selected?.code, "B")
    viewer.actions.setCategoryFilter("a")
    assert.equal(viewer.query.content, "fresh")
    assert.equal(viewer.results.value.selected?.code, "A")
    viewer.actions.setCategoryFilter("")
    assert.equal(viewer.query.content, "fresh")
    assert.equal(viewer.results.value.selected?.code, "A")
    viewer.actions.setAttribute("cn")
    viewer.actions.selectCategory(1)
    assert.equal(viewer.query.attribute, "")
    viewer.actions.setAttribute("cn")
    viewer.actions.setCategoryFilter("b")
    viewer.actions.setContentQuery("")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
    assert.equal(viewer.results.value.selected, undefined)
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.last("search").contentQuery, "")
    finishSearch(worker, summaries)
    assert.equal(viewer.results.value.categories.length, 2)
    assert.equal(viewer.results.value.entryTotal, 5)
    viewer.actions.setAttribute("cn")
    viewer.actions.setCategoryFilter("a")
    viewer.actions.focusCategory("b")
    assert.equal(viewer.query.content, "")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
    finishSearch(worker, summaries)
    assert.equal(viewer.results.value.selected?.code, "B")
    assert.equal(viewer.view.mobileDetail, true)
    viewer.actions.setCategoryFilter("b")
    viewer.actions.setContentQuery("other")
    await viewer.actions.loadSource()
    assert.equal(viewer.query.content, "")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
  }))

test("returning to the tool home resets the workspace, cancels pending work and allows loading again", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 1, entryCount: 2 })
    const summaries: CategorySummary[] = [
      {
        id: 0,
        code: "A",
        count: 2,
        matches: 2,
        reverseMatch: false,
        attributes: [{ key: "cn", count: 1 }]
      }
    ]
    finishSearch(worker, summaries)
    assert.equal(viewer.view.workspace, true)
    viewer.actions.selectCategory(0)
    viewer.actions.setAttribute("cn")
    const stale = worker.last("entries")
    viewer.actions.setCategoryFilter("a")
    viewer.actions.setContentQuery("pending")
    viewer.actions.updateSource({ mode: "url" })
    viewer.actions.updateSource({ url: "https://example.com/geosite.dat" })
    viewer.actions.updateSource({ presetIndex: 3 })
    viewer.actions.updateSource({ kind: "geoip" })
    viewer.actions.resetToHome()
    const requests = worker.requests.length
    assert.equal(worker.terminated, true)
    assert.equal(viewer.view.workspace, false)
    assert.equal(viewer.view.sourceOpen, true)
    assert.equal(viewer.draft.mode, "preset")
    assert.equal(viewer.draft.presetIndex, 0)
    assert.equal(viewer.draft.kind, "geosite")
    assert.equal(viewer.draft.url, "")
    assert.equal(viewer.draft.file, undefined)
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.status === "loading", false)
    assert.equal(viewer.query.searching, false)
    assert.equal(viewer.results.value.entriesLoading, false)
    assert.equal(viewer.query.content, "")
    assert.equal(viewer.query.activeContent, "")
    assert.equal(viewer.query.category, "")
    assert.equal(viewer.query.attribute, "")
    assert.equal(viewer.session.categoryCount, 0)
    assert.equal(viewer.session.entryCount, 0)
    assert.equal(viewer.results.value.entryTotal, 0)
    assert.equal(viewer.view.mobileDetail, false)
    assert.equal(viewer.results.value.selected, undefined)
    assert.deepEqual(viewer.results.value.categories, [])
    assert.deepEqual(viewer.results.value.entries, [])
    worker.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    batch(worker, stale, 0, 1, 1)
    worker.reply({ type: "error", code: "invalidFile" })
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.requests.length, requests)
    assert.equal(viewer.view.workspace, false)
    assert.equal(viewer.session.error, undefined)
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.results.value.entries.length, 0)
    await viewer.actions.loadSource()
    const next = TestWorker.instances[1]
    next.reply({ type: "ready", categoryCount: 1, entryCount: 2 })
    finishSearch(next, summaries)
    batch(next, next.last("entries"), 0, 2, 2)
    assert.equal(viewer.view.workspace, true)
    assert.equal(viewer.results.value.entries.length, 2)
  }))

test("source drafts preserve loaded data and cancelled replacement keeps workspace presentation", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 1, entryCount: 2 })
    finishSearch(worker, [
      {
        id: 0,
        code: "CN",
        count: 2,
        matches: 2,
        reverseMatch: false,
        attributes: []
      }
    ])
    const loaded = viewer.session.loaded
    viewer.actions.openSource()
    viewer.actions.updateSource({
      mode: "url",
      url: "https://example.com/new.dat",
      kind: "geosite"
    })
    assert.equal(viewer.session.loaded, loaded)
    assert.equal(worker.terminated, false)
    await viewer.actions.loadSource()
    const replacement = TestWorker.instances[1]
    assert.equal(viewer.view.workspace, true)
    assert.equal(viewer.session.status, "loading")
    viewer.actions.updateSource({ url: "https://example.com/other.dat" })
    assert.equal(replacement.terminated, true)
    assert.equal(viewer.view.workspace, true)
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.status, "idle")
    replacement.reply({ type: "ready", categoryCount: 99, entryCount: 99 })
    assert.equal(viewer.session.loaded, undefined)
    viewer.actions.closeSource()
    assert.equal(viewer.view.sourceOpen, false)
    assert.equal(viewer.view.workspace, true)
    viewer.actions.openTarget({ type: "home" })
    assert.equal(viewer.view.workspace, false)
    assert.equal(viewer.draft.presetIndex, 0)
  }))
