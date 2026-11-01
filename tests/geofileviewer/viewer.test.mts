import { test } from "node:test"
import assert from "node:assert/strict"
import { nextTick } from "vue"
import { withViewer, TestWorker } from "./helpers/viewer.mts"

test("cancelled or replaced workers cannot update the current dataset", () =>
  withViewer(async (viewer) => {
    const instances = TestWorker.instances
    viewer.presetIndex.value = 1
    await viewer.load()
    const old = instances[0]
    viewer.presetIndex.value = 0
    await viewer.load("uS")
    const current = instances[1]
    assert.equal(old.terminated, true)
    old.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    old.onerror?.()
    assert.equal(viewer.loaded.value, undefined)
    assert.equal(viewer.error.value, undefined)
    current.reply({ type: "ready", categoryCount: 19, entryCount: 1000 })
    assert.equal(viewer.loaded.value?.name, "geoip-lite.dat")
    assert.equal(viewer.categoryCount.value, 19)
    const initialSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (initialSearch.type !== "search") throw Error()
    current.reply({
      type: "search",
      id: initialSearch.id,
      categories: Array.from({ length: 50 }, (_, id) => ({
        id,
        code: id === 40 ? "US" : `category-${id}`,
        count: 1,
        matches: 1,
        reverseMatch: false,
        attributes: []
      }))
    })
    assert.equal(viewer.selected.value?.code, "US")
    assert.equal(
      viewer.visibleCategories.value.some((c) => c.code === "US"),
      true
    )
    assert.equal(viewer.visibleCategories.value[0].id, 0)
    assert.equal(viewer.mobileDetail.value, true)
    viewer.presetIndex.value = 2
    assert.equal(viewer.loaded.value?.name, "geoip-lite.dat")
    assert.equal(current.terminated, false)
    viewer.focusTag("missing")
    const missingSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (missingSearch.type !== "search") throw Error()
    current.reply({ type: "search", id: missingSearch.id, categories: [] })
    assert.equal(viewer.categoryMissing.value, "missing")
    viewer.contentQuery.value = "new query"
    const staleSearch = current.requests.find(
      (request) => request.type === "search"
    )!
    if (staleSearch.type !== "search") throw Error()
    current.reply({
      type: "search",
      id: staleSearch.id,
      categories: [
        {
          id: 0,
          code: "STALE",
          count: 1,
          matches: 1,
          reverseMatch: false,
          attributes: []
        }
      ]
    })
    assert.equal(viewer.categories.value.length, 0)
    viewer.stop()
    current.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.categoryCount.value, 19)
    assert.equal(viewer.loading.value, false)
    await nextTick()
  }, false))
