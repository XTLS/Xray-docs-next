import { computed, onUnmounted, ref, shallowRef, watch } from "vue"
import {
  CATEGORY_PAGE_SIZE,
  type CategorySummary,
  type ErrorCode,
  type GeoEntry,
  type GeoKind,
  type WorkerRequest,
  type WorkerResponse
} from "./types.mts"
import { ViewerError } from "./types.mts"
import {
  presetSource,
  validateUrl,
  type InputSource,
  type PresetFile,
  type LoadProgress
} from "./sources.mts"

export function useViewer() {
  const source = ref("preset")
  const sourceOpen = ref(true)
  const kind = ref<GeoKind>("geosite")
  const file = shallowRef<File>()
  const presetIndex = ref(0)
  const url = ref("")
  const loaded = shallowRef<{
    name: string
    kind: GeoKind
    preset?: PresetFile
  }>()
  const loading = ref(false)
  const progress = ref<number>()
  const phase = ref<LoadProgress["phase"]>("read")
  const downloadedBytes = ref(0)
  const error = ref<ErrorCode>()
  const query = ref("")
  const activeQuery = ref("")
  const searching = ref(false)
  const entriesLoading = ref(false)
  const categories = shallowRef<CategorySummary[]>([])
  const categoryCount = ref(0)
  const entryCount = ref(0)
  const categoryLimit = ref(CATEGORY_PAGE_SIZE)
  const selectedId = ref<number>()
  const entries = shallowRef<GeoEntry[]>([])
  const entryTotal = ref(0)
  const mobileDetail = ref(false)
  const categoryMissing = ref("")
  let pendingTag: string | undefined
  let worker: Worker | undefined
  let generation = 0
  let searchId = 0
  let entriesId = 0
  let entryPage = 0
  let pendingEntries: { id: number; page: number } | undefined
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  const selected = computed(() =>
    categories.value.find((c) => c.id === selectedId.value)
  )
  const visibleCategories = computed(() =>
    categories.value.slice(0, categoryLimit.value)
  )
  const hasMoreCategories = computed(
    () => categoryLimit.value < categories.value.length
  )
  const hasMoreEntries = computed(
    () => entries.value.length < entryTotal.value
  )
  const send = (message: WorkerRequest) => worker?.postMessage(message)
  const canLoad = computed(
    () =>
      source.value === "preset" ||
      (source.value === "url" ? !!url.value.trim() : !!file.value)
  )

  function stop() {
    generation++
    clearTimeout(searchTimer)
    worker?.terminate()
    worker = undefined
    loading.value = false
    searching.value = false
    entriesLoading.value = false
    pendingEntries = undefined
  }

  function resetEntries() {
    entriesId++
    pendingEntries = undefined
    entryPage = 0
    entriesLoading.value = false
    entries.value = []
    entryTotal.value = 0
  }

  function loadMoreCategories() {
    if (!loaded.value || searching.value || !hasMoreCategories.value)
      return
    categoryLimit.value += CATEGORY_PAGE_SIZE
  }

  function loadMoreEntries() {
    if (
      !worker ||
      !loaded.value ||
      searching.value ||
      entriesLoading.value ||
      !hasMoreEntries.value ||
      selectedId.value === undefined
    )
      return
    entriesLoading.value = true
    pendingEntries = { id: ++entriesId, page: entryPage + 1 }
    send({
      type: "entries",
      id: pendingEntries.id,
      searchId,
      categoryId: selectedId.value,
      page: pendingEntries.page
    })
  }

  function search() {
    if (!loaded.value || !worker) return
    activeQuery.value = query.value
    searching.value = true
    resetEntries()
    send({ type: "search", id: ++searchId, query: query.value })
  }

  function select(id: number) {
    if (searching.value) return
    categoryMissing.value = ""
    mobileDetail.value = true
    if (selectedId.value === id) return
    selectedId.value = id
    resetEntries()
    entryTotal.value = selected.value?.matches ?? 0
    loadMoreEntries()
  }

  async function load(tag?: string) {
    if (!canLoad.value) return
    stop()
    const currentGeneration = generation
    let input: InputSource
    try {
      input =
        source.value === "preset"
          ? presetSource(presetIndex.value)
          : source.value === "url"
            ? {
                mode: "remote",
                name: url.value.trim(),
                url: validateUrl(url.value),
                kind: kind.value
              }
            : {
                mode: "local",
                name: file.value!.name,
                file: file.value!,
                kind: kind.value
              }
    } catch (error) {
      fail(error instanceof ViewerError ? error.code : "invalidUrl")
      return
    }
    loaded.value = undefined
    categories.value = []
    categoryLimit.value = CATEGORY_PAGE_SIZE
    resetEntries()
    selectedId.value = undefined
    query.value = ""
    activeQuery.value = ""
    error.value = undefined
    loading.value = true
    progress.value = undefined
    phase.value = input.mode === "remote" ? "download" : "read"
    downloadedBytes.value = 0
    mobileDetail.value = false
    categoryMissing.value = ""
    pendingTag = tag
    try {
      worker = new Worker(
        new URL("./viewer.worker.mts", import.meta.url),
        { type: "module" }
      )
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (currentGeneration !== generation) return
        const message = event.data
        if (message.type === "progress") {
          progress.value = message.progress
          phase.value = message.phase
          downloadedBytes.value = message.bytes ?? 0
        } else if (message.type === "ready") {
          loading.value = false
          loaded.value = {
            name: input.name,
            kind: input.kind,
            preset: input.mode === "remote" ? input.preset : undefined
          }
          categoryCount.value = message.categoryCount
          entryCount.value = message.entryCount
          sourceOpen.value = false
          search()
        } else if (message.type === "search" && message.id === searchId) {
          categories.value = message.categories
          searching.value = false
          categoryLimit.value = CATEGORY_PAGE_SIZE
          if (pendingTag !== undefined) {
            const index = message.categories.findIndex(
              (c) => c.code.toLowerCase() === pendingTag!.toLowerCase()
            )
            if (pendingTag && index < 0) categoryMissing.value = pendingTag
            selectedId.value = message.categories[Math.max(0, index)]?.id
            categoryLimit.value =
              (Math.floor(Math.max(0, index) / CATEGORY_PAGE_SIZE) + 1) *
              CATEGORY_PAGE_SIZE
            mobileDetail.value = !!pendingTag && index >= 0
            pendingTag = undefined
          } else {
            const index = Math.max(
              0,
              message.categories.findIndex(
                (c) => c.id === selectedId.value
              )
            )
            selectedId.value = message.categories[index]?.id
            categoryLimit.value =
              (Math.floor(index / CATEGORY_PAGE_SIZE) + 1) *
              CATEGORY_PAGE_SIZE
          }
          resetEntries()
          entryTotal.value = selected.value?.matches ?? 0
          loadMoreEntries()
        } else if (
          message.type === "entries" &&
          message.id === pendingEntries?.id &&
          message.page === pendingEntries.page &&
          !searching.value
        ) {
          entries.value = [...entries.value, ...message.entries]
          entryTotal.value = message.total
          entryPage = message.page
          pendingEntries = undefined
          entriesLoading.value = false
        } else if (message.type === "error") fail(message.code)
      }
      worker.onerror = () => {
        if (currentGeneration === generation) fail("workerFailed")
      }
      worker.postMessage({
        type: "load",
        source: input
      } satisfies WorkerRequest)
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

  function focusTag(tag: string) {
    pendingTag = tag
    categoryMissing.value = ""
    if (query.value) query.value = ""
    else search()
  }

  watch(
    query,
    () => {
      clearTimeout(searchTimer)
      if (!loaded.value) return
      // Invalidate in-flight results as soon as input changes, before debouncing.
      searchId++
      resetEntries()
      searching.value = true
      searchTimer = setTimeout(search, 250)
    },
    { flush: "sync" }
  )
  watch(
    [source, kind, file, presetIndex, url],
    () => {
      // Editing the source picker should not discard the current dataset.
      // An active load is cancelled immediately when its input changes.
      if (loading.value) {
        stop()
        loaded.value = undefined
      }
      error.value = undefined
      categoryMissing.value = ""
      pendingTag = undefined
    },
    { flush: "sync" }
  )
  onUnmounted(stop)

  return {
    source,
    sourceOpen,
    kind,
    file,
    presetIndex,
    url,
    canLoad,
    loaded,
    loading,
    progress,
    phase,
    downloadedBytes,
    error,
    query,
    activeQuery,
    searching,
    entriesLoading,
    categories,
    categoryCount,
    entryCount,
    selected,
    entries,
    entryTotal,
    mobileDetail,
    categoryMissing,
    focusTag,
    visibleCategories,
    hasMoreCategories,
    hasMoreEntries,
    loadMoreCategories,
    loadMoreEntries,
    load,
    stop,
    select
  }
}
