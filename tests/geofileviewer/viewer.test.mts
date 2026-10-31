import { test } from "node:test"
import assert from "node:assert/strict"
import { createRenderer, nextTick } from "vue"
import { useViewer } from "../../.vitepress/theme/components/geofileviewer/useViewer.mts"
import type {
  WorkerRequest,
  WorkerResponse
} from "../../.vitepress/theme/components/geofileviewer/types.mts"

test("cancelled or replaced workers cannot update the current dataset", async () => {
  const original = globalThis.Worker
  const instances: FakeWorker[] = []
  class FakeWorker {
    onmessage?: (event: { data: WorkerResponse }) => void
    onerror?: () => void
    terminated = false
    requests: WorkerRequest[] = []
    constructor() {
      instances.push(this)
    }
    postMessage(message: WorkerRequest) {
      this.requests.push(message)
    }
    terminate() {
      this.terminated = true
    }
    reply(data: WorkerResponse) {
      this.onmessage?.({ data })
    }
  }
  globalThis.Worker = FakeWorker as unknown as typeof Worker
  let viewer!: ReturnType<typeof useViewer>
  const renderer = createRenderer({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert: () => {},
    remove: () => {},
    setText: () => {},
    setElementText: () => {},
    parentNode: () => null,
    nextSibling: () => null,
    patchProp: () => {}
  })
  const app = renderer.createApp({
    setup() {
      viewer = useViewer()
      return () => null
    }
  })
  try {
    app.mount({})
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
        reverseMatch: false
      }))
    })
    assert.equal(viewer.selected.value?.code, "US")
    assert.equal(viewer.categoryPage.value, 2)
    assert.equal(viewer.mobileDetail.value, true)
    viewer.focusTag("missing")
    const missingSearch = current.requests.findLast(
      (request) => request.type === "search"
    )!
    if (missingSearch.type !== "search") throw Error()
    current.reply({ type: "search", id: missingSearch.id, categories: [] })
    assert.equal(viewer.categoryMissing.value, "missing")
    viewer.query.value = "new query"
    const staleSearch = current.requests.find(
      (request) => request.type === "search"
    )!
    if (staleSearch.type !== "search") throw Error()
    current.reply({
      type: "search",
      id: staleSearch.id,
      categories: [
        { id: 0, code: "STALE", count: 1, matches: 1, reverseMatch: false }
      ]
    })
    assert.equal(viewer.categories.value.length, 0)
    viewer.stop()
    current.reply({ type: "ready", categoryCount: 999, entryCount: 999 })
    assert.equal(viewer.categoryCount.value, 19)
    assert.equal(viewer.loading.value, false)
    await nextTick()
  } finally {
    app.unmount()
    globalThis.Worker = original
  }
})
