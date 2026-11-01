import { createRenderer } from "vue"
import { useViewer } from "../../../.vitepress/theme/components/geofileviewer/useViewer.mts"
import type {
  CategorySummary,
  WorkerRequest,
  WorkerResponse
} from "../../../.vitepress/theme/components/geofileviewer/types.mts"

import { TestWorker } from "./worker.mts"
export { TestWorker } from "./worker.mts"

export async function withViewer(
  run: (
    viewer: ReturnType<typeof useViewer>,
    worker: TestWorker
  ) => Promise<void>,
  autoLoad = true
) {
  TestWorker.instances = []
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
      viewer = useViewer({
        createWorker: () => new TestWorker()
      })
      return () => null
    }
  })
  try {
    app.mount({})
    if (autoLoad) await viewer.actions.loadSource()
    await run(viewer, TestWorker.instances[0])
  } finally {
    app.unmount()
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
