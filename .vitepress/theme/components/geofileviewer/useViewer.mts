import {
  computed,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  shallowReactive,
  shallowReadonly
} from "vue"
import {
  CATEGORY_PAGE_SIZE,
  ViewerError,
  type CategorySummary,
  type ErrorCode,
  type SearchMode
} from "./types.mts"
import {
  canAutoLoadUrl,
  presetSource,
  presets,
  validateUrl,
  type InputSource
} from "./sources.mts"
import { parseIpQuery } from "./ipSearch.mts"
import { parseDomainQuery } from "./domainQuery.mts"
import {
  createWorkerClient,
  type ViewerEvent,
  type WorkerFactory
} from "./workerClient.mts"
import {
  initialDraft,
  initialSession,
  initialQuery,
  initialResults,
  initialView,
  type SourceDraft,
  type ViewerTarget,
  type ViewerResults
} from "./viewerState.mts"

export function useViewer(
  options: {
    createWorker?: WorkerFactory
    protocol?: string
  } = {}
) {
  const client = createWorkerClient(options.createWorker)
  const remoteAllowed = ref(false)
  const draft = shallowReactive(initialDraft(false))
  const session = shallowReactive(initialSession())
  const query = reactive(initialQuery())
  const view = reactive(initialView())
  const rows = shallowReactive(initialResults())
  let pendingTag: string | undefined
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    remoteAllowed.value =
      (options.protocol ?? location.protocol) === "https:"
    Object.assign(draft, initialDraft(remoteAllowed.value))
  })

  const categories = computed(() => {
    const needle = query.category.trim().toLowerCase()
    return needle
      ? rows.categories.filter((c) =>
          c.code.toLowerCase().includes(needle)
        )
      : rows.categories
  })
  const selected = computed(() =>
    categories.value.find((c) => c.id === rows.selectedId)
  )
  const canLoad = computed(() =>
    draft.mode === "local"
      ? !!draft.file
      : remoteAllowed.value &&
        (draft.mode === "preset" || !!draft.url.trim())
  )
  const results = computed<ViewerResults>(
    () =>
      ({
        categories: categories.value as readonly CategorySummary[],
        visibleCategories: categories.value.slice(0, rows.limit),
        selected: query.searching ? undefined : selected.value,
        entries: rows.entries,
        entryTotal: rows.total,
        entriesLoading: rows.loading,
        hasMoreCategories: rows.limit < categories.value.length,
        hasMoreEntries: rows.entries.length < rows.total,
        categoryMissing: rows.missingTag
      }) as const
  )

  function dispose() {
    clearTimeout(searchTimer)
    client.dispose()
    session.status = session.loaded ? "ready" : "idle"
    query.searching = false
    rows.loading = false
  }

  function resetEntries() {
    client.cancelEntries()
    rows.entries = []
    rows.total = 0
    rows.page = 0
    rows.loading = false
  }

  function clearData() {
    session.loaded = undefined
    Object.assign(query, initialQuery())
    Object.assign(rows, initialResults())
    pendingTag = undefined
  }

  function resetToHome() {
    dispose()
    clearData()
    Object.assign(draft, initialDraft(remoteAllowed.value))
    Object.assign(session, initialSession())
    Object.assign(view, initialView())
  }

  function updateSource(patch: Partial<SourceDraft>) {
    if (
      !remoteAllowed.value &&
      ((patch.mode && patch.mode !== "local") || patch.url !== undefined)
    )
      return
    if (
      !Object.entries(patch).some(
        ([key, value]) => draft[key as keyof SourceDraft] !== value
      )
    )
      return
    if (session.status === "loading") {
      dispose()
      session.loaded = undefined
    }
    Object.assign(draft, patch)
    session.error = undefined
    if (session.status === "error") session.status = "idle"
    rows.missingTag = ""
    pendingTag = undefined
  }

  function loadMoreEntries() {
    if (
      !client.active ||
      !session.loaded ||
      query.searching ||
      rows.loading ||
      !results.value.hasMoreEntries ||
      rows.selectedId === undefined
    )
      return
    rows.loading = true
    client.entries(
      rows.selectedId,
      rows.page + 1,
      query.attribute || undefined
    )
  }

  function refreshEntries() {
    resetEntries()
    rows.total = query.attribute
      ? (selected.value?.attributes.find((a) => a.key === query.attribute)
          ?.count ?? 0)
      : (selected.value?.matches ?? 0)
    loadMoreEntries()
  }

  function revealSelection() {
    const index = Math.max(
      0,
      categories.value.findIndex((c) => c.id === rows.selectedId)
    )
    rows.limit =
      (Math.floor(index / CATEGORY_PAGE_SIZE) + 1) * CATEGORY_PAGE_SIZE
  }

  function validateSearch() {
    query.error = undefined
    if (query.mode === "match" && query.content.trim()) {
      const isIp = session.loaded?.kind === "geoip"
      const valid = isIp
        ? parseIpQuery(query.content)
        : parseDomainQuery(query.content)
      if (!valid) query.error = isIp ? "invalidIp" : "invalidDomain"
    }
    if (query.error) {
      query.searching = false
      rows.categories = []
      rows.missingTag = ""
    }
    return !query.error
  }

  function searchNow() {
    if (!session.loaded || !client.active) return
    resetEntries()
    if (!validateSearch()) return
    query.activeContent = query.content
    query.searching = true
    client.search(query.content, query.mode)
  }

  function restartSearch() {
    clearTimeout(searchTimer)
    if (!session.loaded) return
    client.invalidateSearch()
    query.attribute = ""
    query.category = ""
    query.error = undefined
    resetEntries()
    query.searching = true
    searchTimer = setTimeout(searchNow, 250)
  }

  function setContentQuery(value: string) {
    if (query.content === value) return
    query.content = value
    restartSearch()
  }

  function setSearchMode(mode: SearchMode) {
    if (!session.loaded || query.mode === mode) return
    query.mode = mode
    restartSearch()
  }

  function setCategoryFilter(value: string) {
    if (query.category === value) return
    query.category = value
    if (!session.loaded || query.searching) return
    rows.missingTag = ""
    const next = selected.value ?? categories.value[0]
    if (rows.selectedId !== next?.id) {
      rows.selectedId = next?.id
      query.attribute = ""
      refreshEntries()
    }
    revealSelection()
  }

  function setAttribute(key: string) {
    if (query.searching || query.attribute === key) return
    query.attribute = key
    refreshEntries()
  }

  function selectCategory(id: number) {
    if (query.searching) return
    rows.missingTag = ""
    view.mobileDetail = true
    if (rows.selectedId === id) return
    rows.selectedId = id
    query.attribute = ""
    refreshEntries()
  }

  function acceptSearch(found: CategorySummary[]) {
    rows.categories = found
    query.searching = false
    const index =
      pendingTag !== undefined
        ? categories.value.findIndex(
            (c) => c.code.toLowerCase() === pendingTag!.toLowerCase()
          )
        : categories.value.findIndex((c) => c.id === rows.selectedId)
    if (pendingTag !== undefined) {
      if (pendingTag && index < 0) rows.missingTag = pendingTag
      view.mobileDetail = !!pendingTag && index >= 0
    }
    pendingTag = undefined
    rows.selectedId = categories.value[Math.max(0, index)]?.id
    query.attribute = ""
    revealSelection()
    refreshEntries()
  }

  function fail(code: ErrorCode) {
    dispose()
    session.status = "error"
    session.error = code
    session.loaded = undefined
    view.sourceOpen = true
  }

  function receive(input: InputSource, event: ViewerEvent) {
    switch (event.type) {
      case "progress":
        session.progress = event.progress
        session.phase = event.phase
        session.downloadedBytes = event.bytes ?? 0
        break
      case "ready":
        session.status = "ready"
        session.loaded = {
          name: input.name,
          kind: input.kind,
          preset: input.mode === "remote" ? input.preset : undefined,
          url: input.mode === "remote" ? input.url : undefined
        }
        session.categoryCount = event.categoryCount
        session.entryCount = event.entryCount
        view.workspace = true
        view.sourceOpen = false
        searchNow()
        break
      case "search":
        acceptSearch(event.categories)
        break
      case "entries":
        if (query.searching) return
        rows.entries = [...rows.entries, ...event.entries]
        rows.total = event.total
        rows.page = event.page
        rows.loading = false
        break
      case "error":
        fail(event.code)
    }
  }

  async function loadSource(tag = pendingTag) {
    if (!canLoad.value) return
    dispose()
    let input: InputSource
    try {
      input =
        draft.mode === "preset"
          ? presetSource(draft.presetIndex)
          : draft.mode === "url"
            ? {
                mode: "remote",
                name: draft.url.trim(),
                url: validateUrl(draft.url),
                kind: draft.kind
              }
            : {
                mode: "local",
                name: draft.file!.name,
                file: draft.file!,
                kind: draft.kind
              }
    } catch (error) {
      fail(error instanceof ViewerError ? error.code : "invalidUrl")
      return
    }
    clearData()
    session.error = undefined
    session.status = "loading"
    session.progress = undefined
    session.phase = input.mode === "remote" ? "download" : "read"
    session.downloadedBytes = 0
    view.mobileDetail = false
    pendingTag = tag
    try {
      client.load(input, (event) => receive(input, event))
    } catch {
      fail("readFailed")
    }
  }

  function focusCategory(tag: string) {
    clearTimeout(searchTimer)
    Object.assign(query, initialQuery())
    pendingTag = tag
    rows.missingTag = ""
    searchNow()
  }

  function openTarget(target: ViewerTarget) {
    if (
      target.type !== "home" &&
      (!remoteAllowed.value ||
        (target.type === "url" && !canAutoLoadUrl(target.url)))
    ) {
      resetToHome()
      return
    }
    const current = session.loaded
    if (target.type === "home") resetToHome()
    else if (target.type === "preset") {
      if (current?.preset === presets[target.index]?.file)
        focusCategory(target.tag)
      else {
        updateSource({ mode: "preset", presetIndex: target.index })
        void loadSource(target.tag)
      }
    } else if (
      current?.url === target.url &&
      current.kind === target.kind &&
      !current.preset
    )
      focusCategory(target.tag)
    else {
      updateSource({ mode: "url", url: target.url, kind: target.kind })
      pendingTag = target.tag
      void loadSource()
    }
  }

  onUnmounted(dispose)
  return {
    draft: shallowReadonly(draft),
    session: shallowReadonly(session),
    query: shallowReadonly(query),
    view: shallowReadonly(view),
    results,
    canLoad,
    remoteAllowed: computed(() => remoteAllowed.value),
    actions: {
      updateSource,
      loadSource,
      cancelLoad: dispose,
      dispose,
      resetToHome,
      openTarget,
      setContentQuery,
      setSearchMode,
      setCategoryFilter,
      setAttribute,
      selectCategory,
      focusCategory,
      openSource() {
        view.sourceOpen = true
      },
      closeSource() {
        if (session.status === "loading") dispose()
        view.sourceOpen = false
      },
      showCategories() {
        view.mobileDetail = false
      },
      loadMoreEntries,
      loadMoreCategories() {
        if (
          session.loaded &&
          !query.searching &&
          results.value.hasMoreCategories
        )
          rows.limit += CATEGORY_PAGE_SIZE
      }
    }
  }
}

export type ViewerController = ReturnType<typeof useViewer>
