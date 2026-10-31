import {
  indexDataset,
  type Dataset,
  type SearchResult
} from "./dataset.mts"
import {
  ViewerError,
  type WorkerRequest,
  type WorkerResponse
} from "./types.mts"

const send = (message: WorkerResponse) => self.postMessage(message)
let dataset: Dataset | undefined
let result: SearchResult | undefined
let searchId = 0

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  try {
    if (request.type === "load") {
      dataset = await indexDataset(
        new Uint8Array(request.buffer),
        request.kind,
        (progress) => send({ type: "progress", progress })
      )
      send({
        type: "ready",
        categoryCount: dataset.categoryCount,
        entryCount: dataset.entryCount
      })
    } else if (request.type === "search" && dataset) {
      searchId = request.id
      result = undefined
      const found = await dataset.search(
        request.query,
        () => searchId !== request.id
      )
      if (!found) return
      result = found
      send({
        type: "search",
        id: request.id,
        categories: found.categories
      })
    } else if (
      request.type === "entries" &&
      dataset &&
      result &&
      searchId === request.searchId
    ) {
      send({
        type: "entries",
        id: request.id,
        ...dataset.entries(result, request.categoryId, request.page)
      })
    }
  } catch (error) {
    send({
      type: "error",
      code: error instanceof ViewerError ? error.code : "invalidFile"
    })
  }
}
