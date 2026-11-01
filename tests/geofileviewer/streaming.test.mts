import { test } from "node:test"
import assert from "node:assert/strict"
import {
  withViewer,
  TestWorker,
  finishSearch,
  batch
} from "./helpers/viewer.mts"
import type { CategorySummary } from "../../.vitepress/theme/components/geofileviewer/types.mts"

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
    viewer.loadMoreEntries()
    const stale = worker.last("entries")
    assert.equal(stale.page, 2)
    assert.equal(viewer.entries.value.length, 100)
    viewer.select(1)
    const other = worker.last("entries")
    assert.equal(other.page, 1)
    assert.equal(viewer.entries.value.length, 0)
    batch(worker, stale, 100, 100, 205)
    assert.equal(viewer.entries.value.length, 0)
    batch(worker, other, 0, 2, 2, "b")
    assert.deepEqual(
      viewer.entries.value.map((row) => row.value),
      ["b0.example", "b1.example"]
    )
    viewer.select(0)
    batch(worker, worker.last("entries"), 0, 100, 205)
    const before = worker.requests.length
    viewer.loadMoreEntries()
    viewer.loadMoreEntries()
    assert.equal(worker.requests.length, before + 1)
    assert.equal(viewer.entries.value.length, 100)
    batch(worker, worker.last("entries"), 100, 100, 205)
    viewer.loadMoreEntries()
    batch(worker, worker.last("entries"), 200, 5, 205)
    assert.equal(viewer.entries.value.length, 205)
    assert.equal(
      new Set(viewer.entries.value.map((row) => row.value)).size,
      205
    )
    assert.equal(viewer.entries.value[0].value, "a0.example")
    assert.equal(viewer.entries.value.at(-1)?.value, "a204.example")
    assert.equal(viewer.hasMoreEntries.value, false)
    const ended = worker.requests.length
    viewer.loadMoreEntries()
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
    assert.equal(viewer.visibleCategories.value.length, 25)
    viewer.loadMoreCategories()
    assert.equal(viewer.visibleCategories.value.length, 50)
    assert.equal(viewer.visibleCategories.value[0].id, 0)
    viewer.loadMoreCategories()
    assert.equal(viewer.visibleCategories.value.length, 60)
    assert.equal(viewer.hasMoreCategories.value, false)
    batch(worker, worker.last("entries"), 0, 100, 150)
    viewer.loadMoreEntries()
    const stale = worker.last("entries")
    viewer.contentQuery.value = "fresh"
    assert.equal(viewer.entries.value.length, 0)
    batch(worker, stale, 100, 50, 150)
    assert.equal(viewer.entries.value.length, 0)
    const pending = worker.requests.length
    viewer.loadMoreEntries()
    viewer.loadMoreCategories()
    assert.equal(worker.requests.length, pending)
    await new Promise((resolve) => setTimeout(resolve, 270))
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
    assert.equal(viewer.visibleCategories.value.length, 1)
    assert.equal(viewer.selected.value?.code, "FRESH")
    assert.equal(viewer.entries.value.length, 3)
    assert.equal(viewer.entries.value[0].value, "fresh0.example")
    assert.equal(viewer.hasMoreEntries.value, false)
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
    viewer.setAttribute("cn")
    const filtered = worker.last("entries")
    assert.equal(filtered.attributeKey, "cn")
    assert.equal(filtered.page, 1)
    assert.equal(viewer.entryTotal.value, 2)
    batch(worker, initial, 0, 100, 205)
    assert.equal(viewer.entries.value.length, 0)
    batch(worker, filtered, 110, 2, 2)
    assert.deepEqual(viewer.categories.value, summaries)
    const requests = worker.requests.length
    viewer.categoryQuery.value = "["
    assert.deepEqual(
      viewer.categories.value.map((c) => c.code),
      ["A["]
    )
    assert.equal(viewer.attributeKey.value, "cn")
    assert.equal(viewer.entries.value.length, 2)
    assert.equal(worker.requests.length, requests)

    viewer.categoryQuery.value = "b"
    assert.deepEqual(
      viewer.categories.value.map((c) => c.code),
      ["B", "ABC"]
    )
    assert.equal(viewer.selected.value?.code, "B")
    assert.equal(viewer.attributeKey.value, "")
    assert.equal(worker.last("entries").attributeKey, undefined)
    assert.equal(
      worker.requests.filter((r) => r.type === "search").length,
      1
    )
    viewer.setAttribute("weight")
    const stale = worker.last("entries")
    viewer.categoryQuery.value = "no-category"
    assert.equal(worker.requests.at(-1)?.type, "cancelEntries")
    batch(worker, stale, 0, 1, 1)
    assert.equal(viewer.selected.value, undefined)
    assert.equal(viewer.attributeKey.value, "")
    assert.equal(viewer.entries.value.length, 0)
    assert.equal(viewer.entryTotal.value, 0)
    viewer.categoryQuery.value = ""
    assert.equal(viewer.categories.value.length, 3)
    assert.equal(viewer.selected.value?.code, "A[")
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
    viewer.categoryQuery.value = "b"
    viewer.setAttribute("cn")
    const stale = worker.last("entries")
    const entriesBeforeSearch = worker.requests.filter(
      (r) => r.type === "entries"
    ).length
    viewer.contentQuery.value = "fresh"
    assert.equal(viewer.categoryQuery.value, "")
    assert.equal(viewer.attributeKey.value, "")
    assert.equal(viewer.searching.value, true)
    assert.equal(
      worker.requests.filter((r) => r.type === "entries").length,
      entriesBeforeSearch
    )
    batch(worker, stale, 0, 1, 1)
    assert.equal(viewer.entries.value.length, 0)
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.last("search").contentQuery, "fresh")
    finishSearch(
      worker,
      summaries.map((c) => ({ ...c, matches: 2 }))
    )
    assert.deepEqual(
      viewer.categories.value.map((c) => c.code),
      ["A", "B"]
    )
    assert.equal(viewer.entryTotal.value, 2)
    assert.equal(viewer.selected.value?.code, "B")
    viewer.categoryQuery.value = "a"
    assert.equal(viewer.contentQuery.value, "fresh")
    assert.equal(viewer.selected.value?.code, "A")
    viewer.categoryQuery.value = ""
    assert.equal(viewer.contentQuery.value, "fresh")
    assert.equal(viewer.selected.value?.code, "A")
    viewer.setAttribute("cn")
    viewer.select(1)
    assert.equal(viewer.attributeKey.value, "")
    viewer.setAttribute("cn")
    viewer.categoryQuery.value = "b"
    viewer.contentQuery.value = ""
    assert.equal(viewer.categoryQuery.value, "")
    assert.equal(viewer.attributeKey.value, "")
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.last("search").contentQuery, "")
    finishSearch(worker, summaries)
    assert.equal(viewer.categories.value.length, 2)
    assert.equal(viewer.entryTotal.value, 5)
    viewer.setAttribute("cn")
    viewer.categoryQuery.value = "a"
    viewer.focusTag("b")
    assert.equal(viewer.contentQuery.value, "")
    assert.equal(viewer.categoryQuery.value, "")
    assert.equal(viewer.attributeKey.value, "")
    finishSearch(worker, summaries)
    assert.equal(viewer.selected.value?.code, "B")
    assert.equal(viewer.mobileDetail.value, true)
    viewer.categoryQuery.value = "b"
    viewer.contentQuery.value = "other"
    await viewer.load()
    assert.equal(viewer.contentQuery.value, "")
    assert.equal(viewer.categoryQuery.value, "")
    assert.equal(viewer.attributeKey.value, "")
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
    assert.equal(viewer.workspace.value, true)
    viewer.select(0)
    viewer.setAttribute("cn")
    const stale = worker.last("entries")
    viewer.categoryQuery.value = "a"
    viewer.contentQuery.value = "pending"
    viewer.source.value = "url"
    viewer.url.value = "https://example.com/geosite.dat"
    viewer.presetIndex.value = 3
    viewer.kind.value = "geoip"
    viewer.reset()
    const requests = worker.requests.length
    assert.equal(worker.terminated, true)
    assert.equal(viewer.workspace.value, false)
    assert.equal(viewer.sourceOpen.value, true)
    assert.equal(viewer.source.value, "preset")
    assert.equal(viewer.presetIndex.value, 0)
    assert.equal(viewer.kind.value, "geosite")
    assert.equal(viewer.url.value, "")
    assert.equal(viewer.file.value, undefined)
    assert.equal(viewer.loaded.value, undefined)
    assert.equal(viewer.loading.value, false)
    assert.equal(viewer.searching.value, false)
    assert.equal(viewer.entriesLoading.value, false)
    assert.equal(viewer.contentQuery.value, "")
    assert.equal(viewer.activeContentQuery.value, "")
    assert.equal(viewer.categoryQuery.value, "")
    assert.equal(viewer.attributeKey.value, "")
    assert.equal(viewer.categoryCount.value, 0)
    assert.equal(viewer.entryCount.value, 0)
    assert.equal(viewer.entryTotal.value, 0)
    assert.equal(viewer.mobileDetail.value, false)
    assert.equal(viewer.selected.value, undefined)
    assert.deepEqual(viewer.categories.value, [])
    assert.deepEqual(viewer.entries.value, [])
    worker.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    batch(worker, stale, 0, 1, 1)
    worker.reply({ type: "error", code: "invalidFile" })
    await new Promise((resolve) => setTimeout(resolve, 270))
    assert.equal(worker.requests.length, requests)
    assert.equal(viewer.workspace.value, false)
    assert.equal(viewer.error.value, undefined)
    assert.equal(viewer.loaded.value, undefined)
    assert.equal(viewer.entries.value.length, 0)
    await viewer.load()
    const next = TestWorker.instances[1]
    next.reply({ type: "ready", categoryCount: 1, entryCount: 2 })
    finishSearch(next, summaries)
    batch(next, next.last("entries"), 0, 2, 2)
    assert.equal(viewer.workspace.value, true)
    assert.equal(viewer.entries.value.length, 2)
  }))
