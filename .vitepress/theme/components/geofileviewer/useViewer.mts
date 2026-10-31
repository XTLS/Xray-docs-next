import { computed, onUnmounted, ref, shallowRef, watch } from "vue"
import {
  CATEGORY_PAGE_SIZE,
  ENTRY_PAGE_SIZE,
  type CategorySummary,
  type ErrorCode,
  type GeoEntry,
  type GeoKind,
  type WorkerRequest,
  type WorkerResponse
} from "./types.mts"

export function useViewer() {
  const source = ref("preset")
  const sourceOpen = ref(true)
  const kind = ref<GeoKind>("geosite")
  const file = shallowRef<File>()
  const loaded = shallowRef<{ name: string; kind: GeoKind }>()
  const loading = ref(false)
  const progress = ref(0)
  const error = ref<ErrorCode>()
  const query = ref("")
  const activeQuery = ref("")
  const searching = ref(false)
  const entriesLoading = ref(false)
  const categories = shallowRef<CategorySummary[]>([])
  const categoryCount = ref(0)
  const entryCount = ref(0)
  const categoryPage = ref(1)
  const entryPage = ref(1)
  const selectedId = ref<number>()
  const entries = shallowRef<GeoEntry[]>([])
  const entryTotal = ref(0)
  const mobileDetail = ref(false)
  let worker: Worker | undefined
  let generation = 0
  let searchId = 0
  let entriesId = 0
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  const selected = computed(() =>
    categories.value.find((c) => c.id === selectedId.value)
  )
  const categoryPages = computed(() =>
    Math.max(1, Math.ceil(categories.value.length / CATEGORY_PAGE_SIZE))
  )
  const entryPages = computed(() =>
    Math.max(1, Math.ceil(entryTotal.value / ENTRY_PAGE_SIZE))
  )
  const visibleCategories = computed(() =>
    categories.value.slice(
      (categoryPage.value - 1) * CATEGORY_PAGE_SIZE,
      categoryPage.value * CATEGORY_PAGE_SIZE
    )
  )
  const send = (message: WorkerRequest) => worker?.postMessage(message)

  function stop() {
    generation++
    clearTimeout(searchTimer)
    worker?.terminate()
    worker = undefined
    loading.value = false
    searching.value = false
    entriesLoading.value = false
  }

  function requestEntries() {
    entries.value = []
    entryTotal.value = selected.value?.matches ?? 0
    if (selectedId.value === undefined) return
    entriesLoading.value = true
    send({
      type: "entries",
      id: ++entriesId,
      searchId,
      categoryId: selectedId.value,
      page: entryPage.value
    })
  }

  function search() {
    if (!loaded.value || !worker) return
    activeQuery.value = query.value
    searching.value = true
    entriesLoading.value = false
    entries.value = []
    send({ type: "search", id: ++searchId, query: query.value })
  }

  function select(id: number) {
    selectedId.value = id
    entryPage.value = 1
    mobileDetail.value = true
    requestEntries()
  }

  async function load() {
    if (!file.value) return
    stop()
    const currentGeneration = generation
    const input = file.value
    const inputKind = kind.value
    loaded.value = undefined
    categories.value = []
    entries.value = []
    selectedId.value = undefined
    query.value = ""
    activeQuery.value = ""
    error.value = undefined
    loading.value = true
    progress.value = 0
    mobileDetail.value = false
    try {
      const buffer = await input.arrayBuffer()
      if (currentGeneration !== generation) return
      worker = new Worker(
        new URL("./viewer.worker.mts", import.meta.url),
        { type: "module" }
      )
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (currentGeneration !== generation) return
        const message = event.data
        if (message.type === "progress") progress.value = message.progress
        else if (message.type === "ready") {
          loading.value = false
          loaded.value = { name: input.name, kind: inputKind }
          categoryCount.value = message.categoryCount
          entryCount.value = message.entryCount
          sourceOpen.value = false
          search()
        } else if (message.type === "search" && message.id === searchId) {
          categories.value = message.categories
          searching.value = false
          categoryPage.value = 1
          if (!message.categories.some((c) => c.id === selectedId.value))
            selectedId.value = message.categories[0]?.id
          entryPage.value = 1
          requestEntries()
        } else if (
          message.type === "entries" &&
          message.id === entriesId &&
          !searching.value
        ) {
          entries.value = message.entries
          entryTotal.value = message.total
          entryPage.value = message.page
          entriesLoading.value = false
        } else if (message.type === "error") fail(message.code)
      }
      worker.onerror = () => fail("workerFailed")
      worker.postMessage(
        { type: "load", buffer, kind: inputKind } satisfies WorkerRequest,
        [buffer]
      )
    } catch {
      if (currentGeneration === generation) fail("readFailed")
    }
  }

  function fail(code: ErrorCode) {
    stop()
    error.value = code
    sourceOpen.value = true
    loaded.value = undefined
  }

  watch(query, () => {
    clearTimeout(searchTimer)
    // Invalidate in-flight results as soon as input changes, before debouncing.
    searchId++
    entriesId++
    searching.value = true
    searchTimer = setTimeout(search, 250)
  })
  watch(entryPage, requestEntries)
  watch([source, kind, file], () => {
    stop()
    loaded.value = undefined
    error.value = undefined
  })
  onUnmounted(stop)

  return {
    source,
    sourceOpen,
    kind,
    file,
    loaded,
    loading,
    progress,
    error,
    query,
    activeQuery,
    searching,
    entriesLoading,
    categories,
    categoryCount,
    entryCount,
    categoryPage,
    entryPage,
    selected,
    entries,
    entryTotal,
    mobileDetail,
    categoryPages,
    entryPages,
    visibleCategories,
    load,
    stop,
    select
  }
}
