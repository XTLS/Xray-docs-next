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
import { readSource } from "./sources.mts"

const send = (message: WorkerResponse) => self.postMessage(message)
let dataset: Dataset | undefined
let result: SearchResult | undefined
let searchId = 0
let entriesId = 0

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  try {
    if (request.type === "load") {
      const bytes = await readSource(
        request.source,
        new AbortController().signal,
        (progress) => send({ type: "progress", ...progress })
      )
      dataset = await indexDataset(
        bytes,
        request.source.kind,
        (progress) => send({ type: "progress", phase: "index", progress })
      )
      send({
        type: "ready",
        categoryCount: dataset.categoryCount,
        entryCount: dataset.entryCount
      })
    } else if (request.type === "cancelEntries") {
      entriesId++
      if (result) result.attributeFilter = undefined
    } else if (request.type === "search" && dataset) {
      searchId = request.id
      entriesId++
      result = undefined
      const found = await dataset.search(request.contentQuery, {
        mode: request.mode,
        cancelled: () => searchId !== request.id
      })
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
      const currentEntriesId = ++entriesId
      const page = await dataset.entries(
        result,
        request.categoryId,
        request.page,
        request.attributeKey,
        () =>
          entriesId !== currentEntriesId || searchId !== request.searchId
      )
      if (!page) return
      send({
        type: "entries",
        id: request.id,
        ...page
      })
    }
  } catch (error) {
    send({
      type: "error",
      code: error instanceof ViewerError ? error.code : "invalidFile"
    })
  }
}
