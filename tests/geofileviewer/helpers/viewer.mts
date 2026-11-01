import { createRenderer } from "vue"
import { useViewer } from "../../../.vitepress/theme/components/geofileviewer/useViewer.mts"
import type {
  CategorySummary,
  WorkerRequest,
  WorkerResponse
} from "../../../.vitepress/theme/components/geofileviewer/types.mts"

export class TestWorker {
  static instances: TestWorker[] = []
  onmessage?: (event: { data: WorkerResponse }) => void
  requests: WorkerRequest[] = []
  terminated = false
  constructor() {
    TestWorker.instances.push(this)
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
  last<T extends WorkerRequest["type"]>(type: T) {
    return this.requests.findLast(
      (request) => request.type === type
    ) as Extract<WorkerRequest, { type: T }>
  }
}

export async function withViewer(
  run: (
    viewer: ReturnType<typeof useViewer>,
    worker: TestWorker
  ) => Promise<void>,
  autoLoad = true
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
    if (autoLoad) await viewer.load()
    await run(viewer, TestWorker.instances[0])
  } finally {
    app.unmount()
    globalThis.Worker = original
  }
}

export function finishSearch(
  worker: TestWorker,
  categories: CategorySummary[]
) {
  worker.reply({
    type: "search",
    id: worker.last("search").id,
    categories
  })
}
export function batch(
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
