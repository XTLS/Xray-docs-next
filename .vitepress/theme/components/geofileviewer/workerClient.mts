import type { InputSource } from "./sources.mts"
import type { WorkerRequest, WorkerResponse } from "./types.mts"

export interface ViewerWorker {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  postMessage(message: WorkerRequest): void
  terminate(): void
}
export type WorkerFactory = () => ViewerWorker
export type ViewerEvent =
  | Exclude<WorkerResponse, { type: "search" | "entries" }>
  | Omit<Extract<WorkerResponse, { type: "search" }>, "id">
  | Omit<Extract<WorkerResponse, { type: "entries" }>, "id">

const browserWorker: WorkerFactory = () =>
  new Worker(new URL("./viewer.worker.mts", import.meta.url), {
    type: "module"
  })

export function createWorkerClient(
  createWorker: WorkerFactory = browserWorker
) {
  let worker: ViewerWorker | undefined
  let generation = 0
  let searchId = 0
  let entriesId = 0
  let pendingEntries: { id: number; page: number } | undefined
  const send = (message: WorkerRequest) => worker?.postMessage(message)

  function dispose() {
    generation++
    worker?.terminate()
    worker = undefined
    pendingEntries = undefined
  }

  function load(
    source: InputSource,
    receive: (event: ViewerEvent) => void
  ) {
    dispose()
    const session = generation
    worker = createWorker()
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if (session !== generation) return
      if (data.type === "search") {
        if (data.id !== searchId) return
        receive({ type: "search", categories: data.categories })
      } else if (data.type === "entries") {
        if (
          data.id !== pendingEntries?.id ||
          data.page !== pendingEntries.page
        )
          return
        pendingEntries = undefined
        receive({
          type: "entries",
          entries: data.entries,
          total: data.total,
          page: data.page
        })
      } else receive(data)
    }
    worker.onerror = () => {
      if (session === generation)
        receive({ type: "error", code: "workerFailed" })
    }
    send({ type: "load", source })
  }

  function cancelEntries() {
    entriesId++
    pendingEntries = undefined
    send({ type: "cancelEntries" })
  }

  return {
    get active() {
      return !!worker
    },
    load,
    dispose,
    cancelEntries,
    invalidateSearch() {
      searchId++
    },
    search(contentQuery: string) {
      send({ type: "search", id: ++searchId, contentQuery })
    },
    entries(categoryId: number, page: number, attributeKey?: string) {
      if (!worker || pendingEntries) return
      pendingEntries = { id: ++entriesId, page }
      send({
        type: "entries",
        id: pendingEntries.id,
        searchId,
        categoryId,
        page,
        attributeKey
      })
    }
  }
}
