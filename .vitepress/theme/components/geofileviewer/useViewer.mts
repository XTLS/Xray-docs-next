import {
  computed,
  onUnmounted,
  reactive,
  shallowReactive,
  shallowReadonly
} from "vue"
import {
  CATEGORY_PAGE_SIZE,
  ViewerError,
  type CategorySummary,
  type ErrorCode,
  type IpSearchMode
} from "./types.mts"
import {
  canAutoLoadUrl,
  presetSource,
  presets,
  validateUrl,
  type InputSource
} from "./sources.mts"
import { parseIpQuery } from "./ipSearch.mts"
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

export function useViewer(options: { createWorker?: WorkerFactory } = {}) {
  const client = createWorkerClient(options.createWorker)
  const draft = shallowReactive(initialDraft())
  const session = shallowReactive(initialSession())
  const query = reactive(initialQuery())
  const view = reactive(initialView())
  const rows = shallowReactive(initialResults())
  let pendingTag: string | undefined
  let searchTimer: ReturnType<typeof setTimeout> | undefined

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
  const canLoad = computed(
    () =>
      draft.mode === "preset" ||
      (draft.mode === "url" ? !!draft.url.trim() : !!draft.file)
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
    Object.assign(draft, initialDraft())
    Object.assign(session, initialSession())
    Object.assign(view, initialView())
  }

  function updateSource(patch: Partial<SourceDraft>) {
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
    query.invalidIp =
      session.loaded?.kind === "geoip" &&
      query.ipMode === "ip" &&
      !!query.content.trim() &&
      !parseIpQuery(query.content)
    if (query.invalidIp) {
      query.searching = false
      rows.categories = []
      rows.missingTag = ""
    }
    return !query.invalidIp
  }

  function searchNow() {
    if (!session.loaded || !client.active) return
    resetEntries()
    if (!validateSearch()) return
    query.activeContent = query.content
    query.searching = true
    client.search(query.content, query.ipMode)
  }

  function restartSearch() {
    clearTimeout(searchTimer)
    if (!session.loaded) return
    client.invalidateSearch()
    query.attribute = ""
    query.category = ""
    query.invalidIp = false
    resetEntries()
    query.searching = true
    searchTimer = setTimeout(searchNow, 250)
  }

  function setContentQuery(value: string) {
    if (query.content === value) return
    query.content = value
    restartSearch()
  }

  function setIpSearchMode(mode: IpSearchMode) {
    if (session.loaded?.kind !== "geoip" || query.ipMode === mode) return
    query.ipMode = mode
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
      const autoLoad = canAutoLoadUrl(target.url)
      if (!autoLoad) resetToHome()
      updateSource({ mode: "url", url: target.url, kind: target.kind })
      pendingTag = target.tag
      if (autoLoad) void loadSource()
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
    actions: {
      updateSource,
      loadSource,
      cancelLoad: dispose,
      dispose,
      resetToHome,
      openTarget,
      setContentQuery,
      setIpSearchMode,
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
