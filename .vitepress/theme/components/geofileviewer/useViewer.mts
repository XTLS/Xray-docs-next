import { computed, onUnmounted, ref, shallowRef, watch } from "vue"
import {
  CATEGORY_PAGE_SIZE,
  type CategorySummary,
  type ErrorCode,
  type GeoEntry,
  type GeoKind
} from "./types.mts"
import { ViewerError } from "./types.mts"
import {
  presetSource,
  validateUrl,
  type InputSource,
  type PresetFile,
  type LoadProgress
} from "./sources.mts"
import { createWorkerClient, type WorkerFactory } from "./workerClient.mts"

export function useViewer(options: { createWorker?: WorkerFactory } = {}) {
  const client = createWorkerClient(options.createWorker)
  const source = ref("preset")
  const sourceOpen = ref(true)
  const workspace = ref(false)
  const kind = ref<GeoKind>("geosite")
  const file = shallowRef<File>()
  const presetIndex = ref(0)
  const url = ref("")
  const loaded = shallowRef<{
    name: string
    kind: GeoKind
    preset?: PresetFile
    url?: string
  }>()
  const loading = ref(false)
  const progress = ref<number>()
  const phase = ref<LoadProgress["phase"]>("read")
  const downloadedBytes = ref(0)
  const error = ref<ErrorCode>()
  const contentQuery = ref("")
  const activeContentQuery = ref("")
  const categoryQuery = ref("")
  const attributeKey = ref("")
  const searching = ref(false)
  const entriesLoading = ref(false)
  const allCategories = shallowRef<CategorySummary[]>([])
  const categories = computed(() => {
    const needle = categoryQuery.value.trim().toLowerCase()
    return needle
      ? allCategories.value.filter((category) =>
          category.code.toLowerCase().includes(needle)
        )
      : allCategories.value
  })
  const categoryCount = ref(0)
  const entryCount = ref(0)
  const categoryLimit = ref(CATEGORY_PAGE_SIZE)
  const selectedId = ref<number>()
  const entries = shallowRef<GeoEntry[]>([])
  const entryTotal = ref(0)
  const mobileDetail = ref(false)
  const categoryMissing = ref("")
  let pendingTag: string | undefined
  let entryPage = 0
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
  const canLoad = computed(
    () =>
      source.value === "preset" ||
      (source.value === "url" ? !!url.value.trim() : !!file.value)
  )

  watch(
    loaded,
    (value) => {
      if (value) workspace.value = true
    },
    { flush: "sync" }
  )

  function stop() {
    clearTimeout(searchTimer)
    client.dispose()
    loading.value = false
    searching.value = false
    entriesLoading.value = false
  }

  function resetEntries() {
    client.cancelEntries()
    entryPage = 0
    entriesLoading.value = false
    entries.value = []
    entryTotal.value = 0
  }

  function reset() {
    stop()
    loaded.value = undefined
    workspace.value = false
    allCategories.value = []
    categoryLimit.value = CATEGORY_PAGE_SIZE
    resetEntries()
    selectedId.value = undefined
    categoryCount.value = 0
    entryCount.value = 0
    contentQuery.value = ""
    activeContentQuery.value = ""
    categoryQuery.value = ""
    attributeKey.value = ""
    mobileDetail.value = false
    categoryMissing.value = ""
    pendingTag = undefined
    progress.value = undefined
    phase.value = "read"
    downloadedBytes.value = 0
    error.value = undefined
    source.value = "preset"
    kind.value = "geosite"
    file.value = undefined
    presetIndex.value = 0
    url.value = ""
    sourceOpen.value = true
  }

  function loadMoreCategories() {
    if (!loaded.value || searching.value || !hasMoreCategories.value)
      return
    categoryLimit.value += CATEGORY_PAGE_SIZE
  }

  function loadMoreEntries() {
    if (
      !client.active ||
      !loaded.value ||
      searching.value ||
      entriesLoading.value ||
      !hasMoreEntries.value ||
      selectedId.value === undefined
    )
      return
    entriesLoading.value = true
    client.entries(
      selectedId.value,
      entryPage + 1,
      attributeKey.value || undefined
    )
  }

  function search() {
    if (!loaded.value || !client.active) return
    activeContentQuery.value = contentQuery.value
    searching.value = true
    resetEntries()
    client.search(contentQuery.value)
  }

  function refreshEntries() {
    resetEntries()
    entryTotal.value = attributeKey.value
      ? (selected.value?.attributes.find(
          (a) => a.key === attributeKey.value
        )?.count ?? 0)
      : (selected.value?.matches ?? 0)
    loadMoreEntries()
  }

  function setAttribute(key: string) {
    if (searching.value || attributeKey.value === key) return
    attributeKey.value = key
    refreshEntries()
  }

  function revealSelection() {
    const index = Math.max(
      0,
      categories.value.findIndex((c) => c.id === selectedId.value)
    )
    categoryLimit.value =
      (Math.floor(index / CATEGORY_PAGE_SIZE) + 1) * CATEGORY_PAGE_SIZE
  }

  function select(id: number) {
    if (searching.value) return
    categoryMissing.value = ""
    mobileDetail.value = true
    if (selectedId.value === id) return
    selectedId.value = id
    attributeKey.value = ""
    refreshEntries()
  }

  async function load(tag?: string) {
    if (!canLoad.value) return
    stop()
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
    allCategories.value = []
    categoryLimit.value = CATEGORY_PAGE_SIZE
    resetEntries()
    selectedId.value = undefined
    contentQuery.value = ""
    activeContentQuery.value = ""
    categoryQuery.value = ""
    attributeKey.value = ""
    error.value = undefined
    loading.value = true
    progress.value = undefined
    phase.value = input.mode === "remote" ? "download" : "read"
    downloadedBytes.value = 0
    mobileDetail.value = false
    categoryMissing.value = ""
    pendingTag = tag
    try {
      client.load(input, (message) => {
        if (message.type === "progress") {
          progress.value = message.progress
          phase.value = message.phase
          downloadedBytes.value = message.bytes ?? 0
        } else if (message.type === "ready") {
          loading.value = false
          loaded.value = {
            name: input.name,
            kind: input.kind,
            preset: input.mode === "remote" ? input.preset : undefined,
            url: input.mode === "remote" ? input.url : undefined
          }
          categoryCount.value = message.categoryCount
          entryCount.value = message.entryCount
          sourceOpen.value = false
          search()
        } else if (message.type === "search") {
          allCategories.value = message.categories
          searching.value = false
          categoryLimit.value = CATEGORY_PAGE_SIZE
          if (pendingTag !== undefined) {
            const index = categories.value.findIndex(
              (c) => c.code.toLowerCase() === pendingTag!.toLowerCase()
            )
            if (pendingTag && index < 0) categoryMissing.value = pendingTag
            selectedId.value = categories.value[Math.max(0, index)]?.id
            mobileDetail.value = !!pendingTag && index >= 0
            pendingTag = undefined
          } else {
            const index = Math.max(
              0,
              categories.value.findIndex((c) => c.id === selectedId.value)
            )
            selectedId.value = categories.value[index]?.id
          }
          attributeKey.value = ""
          revealSelection()
          refreshEntries()
        } else if (message.type === "entries" && !searching.value) {
          entries.value = [...entries.value, ...message.entries]
          entryTotal.value = message.total
          entryPage = message.page
          entriesLoading.value = false
        } else if (message.type === "error") fail(message.code)
      })
    } catch {
      fail("readFailed")
    }
  }

  function fail(code: ErrorCode) {
    stop()
    error.value = code
    sourceOpen.value = true
    loaded.value = undefined
  }

  function focusTag(tag: string) {
    clearTimeout(searchTimer)
    searching.value = true
    pendingTag = tag
    categoryMissing.value = ""
    contentQuery.value = ""
    categoryQuery.value = ""
    attributeKey.value = ""
    clearTimeout(searchTimer)
    search()
  }

  watch(
    contentQuery,
    () => {
      clearTimeout(searchTimer)
      if (!loaded.value) return
      // Invalidate in-flight results as soon as input changes, before debouncing.
      client.invalidateSearch()
      attributeKey.value = ""
      resetEntries()
      searching.value = true
      categoryQuery.value = ""
      searchTimer = setTimeout(search, 250)
    },
    { flush: "sync" }
  )
  watch(
    categoryQuery,
    () => {
      if (!loaded.value || searching.value) return
      categoryMissing.value = ""
      const next =
        categories.value.find((c) => c.id === selectedId.value) ??
        categories.value[0]
      if (selectedId.value !== next?.id) {
        selectedId.value = next?.id
        attributeKey.value = ""
        refreshEntries()
      }
      revealSelection()
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
    workspace,
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
    contentQuery,
    activeContentQuery,
    categoryQuery,
    attributeKey,
    setAttribute,
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
    reset,
    select
  }
}
