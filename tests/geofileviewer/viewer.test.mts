import { test } from "node:test"
import assert from "node:assert/strict"
import { nextTick } from "vue"
import { withViewer, TestWorker } from "./helpers/viewer.mts"

test("cancelled or replaced workers cannot update the current dataset", () =>
  withViewer(async (viewer) => {
    const instances = TestWorker.instances
    viewer.actions.updateSource({ presetIndex: 1 })
    await viewer.actions.loadSource()
    const old = instances[0]
    viewer.actions.updateSource({ presetIndex: 0 })
    await viewer.actions.loadSource("uS")
    const current = instances[1]
    assert.equal(old.terminated, true)
    old.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    old.onerror?.()
    assert.equal(viewer.session.loaded, undefined)
    assert.equal(viewer.session.error, undefined)
    current.reply({ type: "ready", categoryCount: 19, entryCount: 1000 })
    assert.equal(viewer.session.loaded?.name, "geoip-lite.dat")
    assert.equal(viewer.session.categoryCount, 19)
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
    assert.equal(viewer.results.value.selected?.code, "US")
    assert.equal(
      viewer.results.value.visibleCategories.some((c) => c.code === "US"),
      true
    )
    assert.equal(viewer.results.value.visibleCategories[0].id, 0)
    assert.equal(viewer.view.mobileDetail, true)
    viewer.actions.updateSource({ presetIndex: 2 })
    assert.equal(viewer.session.loaded?.name, "geoip-lite.dat")
    assert.equal(current.terminated, false)
    viewer.actions.focusCategory("missing")
    const missingSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (missingSearch.type !== "search") throw Error()
    current.reply({ type: "search", id: missingSearch.id, categories: [] })
    assert.equal(viewer.results.value.categoryMissing, "missing")
    viewer.actions.setContentQuery("new query")
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
    assert.equal(viewer.results.value.categories.length, 0)
    viewer.actions.dispose()
    current.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.session.categoryCount, 19)
    assert.equal(viewer.session.status === "loading", false)
    await nextTick()
  }, false))
