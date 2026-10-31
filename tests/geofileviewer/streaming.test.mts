import { test } from "node:test"
import assert from "node:assert/strict"
import { createRenderer } from "vue"
import { useViewer } from "../../.vitepress/theme/components/geofileviewer/useViewer.mts"
import type {
  CategorySummary,
  WorkerRequest,
  WorkerResponse
} from "../../.vitepress/theme/components/geofileviewer/types.mts"

class TestWorker {
  static instances: TestWorker[] = []
  onmessage?: (event: { data: WorkerResponse }) => void
  requests: WorkerRequest[] = []
  constructor() {
    TestWorker.instances.push(this)
  }
  postMessage(message: WorkerRequest) {
    this.requests.push(message)
  }
  terminate() {}
  reply(data: WorkerResponse) {
    this.onmessage?.({ data })
  }
  last<T extends WorkerRequest["type"]>(type: T) {
    return this.requests.findLast(
      (request) => request.type === type
    ) as Extract<WorkerRequest, { type: T }>
  }
}

async function withViewer(
  run: (
    viewer: ReturnType<typeof useViewer>,
    worker: TestWorker
  ) => Promise<void>
) {
  const original = globalThis.Worker
  TestWorker.instances = []
  globalThis.Worker = TestWorker as unknown as typeof Worker
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
    await viewer.load()
    await run(viewer, TestWorker.instances[0])
  } finally {
    app.unmount()
    globalThis.Worker = original
  }
}

function finishSearch(worker: TestWorker, categories: CategorySummary[]) {
  worker.reply({
    type: "search",
    id: worker.last("search").id,
    categories
  })
}
function batch(
  worker: TestWorker,
  request: Extract<WorkerRequest, { type: "entries" }>,
  start: number,
  count: number,
  total: number,
  prefix = "a"
) {
  worker.reply({
    type: "entries",
    id: request.id,
    page: request.page,
    total,
    entries: Array.from({ length: count }, (_, index) => ({
      type: "domain",
      value: `${prefix}${start + index}.example`,
      attributes: []
    }))
  })
}

test("entry streaming appends once, stops at the end and discards a previous category's pending batch", () =>
  withViewer(async (viewer, worker) => {
    worker.reply({ type: "ready", categoryCount: 2, entryCount: 207 })
    finishSearch(worker, [
      { id: 0, code: "A", count: 205, matches: 205, reverseMatch: false },
      { id: 1, code: "B", count: 2, matches: 2, reverseMatch: false }
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
        reverseMatch: false
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
    viewer.query.value = "fresh"
    assert.equal(viewer.entries.value.length, 0)
    batch(worker, stale, 100, 50, 150)
    assert.equal(viewer.entries.value.length, 0)
    const pending = worker.requests.length
    viewer.loadMoreEntries()
    viewer.loadMoreCategories()
    assert.equal(worker.requests.length, pending)
    await new Promise((resolve) => setTimeout(resolve, 270))
    finishSearch(worker, [
      { id: 900, code: "FRESH", count: 3, matches: 3, reverseMatch: false }
    ])
    batch(worker, worker.last("entries"), 0, 3, 3, "fresh")
    assert.equal(viewer.visibleCategories.value.length, 1)
    assert.equal(viewer.selected.value?.code, "FRESH")
    assert.equal(viewer.entries.value.length, 3)
    assert.equal(viewer.entries.value[0].value, "fresh0.example")
    assert.equal(viewer.hasMoreEntries.value, false)
  }))
