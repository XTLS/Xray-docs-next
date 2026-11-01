import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vitepress"
import {
  categoryLink,
  remoteCategoryLink,
  parsePermalink
} from "./links.mts"
import type { useViewer } from "./useViewer.mts"

export function usePermalink(
  viewer: ReturnType<typeof useViewer>,
  popupUrl?: string
) {
  const router = useRouter()
  const mounted = ref(false)
  const invalidLink = ref(false)
  const copyStatus = ref<"" | "copied" | "copyFailed">("")
  const ownQueries = new Set<string>()
  let applying = false
  const permalink = computed(() => {
    const source = viewer.session.loaded
    const category = viewer.results.value.selected
    if (!mounted.value || !source || !category) return ""
    if (source.preset)
      return categoryLink(
        popupUrl ?? location.href,
        source.preset,
        category.code
      )
    if (source.url)
      return remoteCategoryLink(
        popupUrl ?? location.href,
        source.url,
        source.kind,
        category.code
      )
    return ""
  })

  function replace(url: URL) {
    if (popupUrl !== undefined) return
    if (url.search === router.route.query) return
    ownQueries.add(url.search)
    void router.go(url.href, { replace: true })
  }

  function clearSourceQuery() {
    if (popupUrl !== undefined) return
    const url = new URL(location.href)
    url.searchParams.delete("file")
    url.searchParams.delete("tag")
    url.searchParams.delete("url")
    url.searchParams.delete("type")
    replace(url)
  }

  function apply(search: string) {
    const parsed = parsePermalink(search)
    invalidLink.value = parsed.invalid
    applying = true
    viewer.actions.openTarget(
      parsed.invalid || (!parsed.file && !parsed.url)
        ? { type: "home" }
        : parsed.url
          ? {
              type: "url",
              url: parsed.url,
              kind: parsed.kind,
              tag: parsed.tag
            }
          : { type: "preset", index: parsed.index, tag: parsed.tag }
    )
    applying = false
  }

  onMounted(() => {
    mounted.value = true
    apply(
      popupUrl !== undefined
        ? new URL(popupUrl).search
        : router.route.query
    )
  })
  watch(
    () => router.route.query,
    (search) => {
      if (
        popupUrl !== undefined ||
        !mounted.value ||
        ownQueries.delete(search)
      )
        return
      apply(search)
    },
    { flush: "sync" }
  )

  watch(
    [
      () => viewer.draft.mode,
      () => viewer.draft.kind,
      () => viewer.draft.file,
      () => viewer.draft.url,
      () => viewer.draft.presetIndex
    ],
    () => {
      if (!mounted.value || applying) return
      invalidLink.value = false
      if (!viewer.session.loaded) clearSourceQuery()
    },
    { flush: "sync" }
  )

  watch(
    () => viewer.session.loaded,
    (value) => {
      if (value) invalidLink.value = false
      if (mounted.value && !applying && !value?.preset && !value?.url)
        clearSourceQuery()
    },
    { flush: "sync" }
  )

  watch(
    [
      () => viewer.session.loaded,
      () => viewer.results.value.selected,
      () => viewer.query.searching
    ],
    () => {
      copyStatus.value = ""
      if (
        permalink.value &&
        !applying &&
        !viewer.query.searching &&
        !viewer.results.value.categoryMissing
      )
        replace(new URL(permalink.value))
    }
  )

  async function copy() {
    if (!permalink.value) return
    try {
      await navigator.clipboard.writeText(permalink.value)
      copyStatus.value = "copied"
    } catch {
      copyStatus.value = "copyFailed"
    }
  }
  return { permalink, invalidLink, copyStatus, copy }
}
