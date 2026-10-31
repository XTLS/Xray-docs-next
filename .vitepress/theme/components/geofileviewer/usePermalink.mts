import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vitepress"
import {
  categoryLink,
  remoteCategoryLink,
  parsePermalink
} from "./links.mts"
import type { useViewer } from "./useViewer.mts"

export function usePermalink(viewer: ReturnType<typeof useViewer>) {
  const router = useRouter()
  const mounted = ref(false)
  const invalidLink = ref(false)
  const copyStatus = ref<"" | "copied" | "copyFailed">("")
  const ownQueries = new Set<string>()
  let applying = false
  const permalink = computed(() => {
    const source = viewer.loaded.value
    const category = viewer.selected.value
    if (!mounted.value || !source || !category) return ""
    if (source.preset)
      return categoryLink(location.href, source.preset, category.code)
    if (source.url)
      return remoteCategoryLink(
        location.href,
        source.url,
        source.kind,
        category.code
      )
    return ""
  })

  function replace(url: URL) {
    if (url.search === router.route.query) return
    ownQueries.add(url.search)
    void router.go(url.href, { replace: true })
  }

  function clearSourceQuery() {
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
    if (parsed.invalid || (!parsed.file && !parsed.url)) {
      viewer.stop()
      viewer.loaded.value = undefined
      viewer.sourceOpen.value = true
    } else if (parsed.url) {
      const current = viewer.loaded.value
      if (
        current?.url === parsed.url &&
        current.kind === parsed.kind &&
        !current.preset
      )
        viewer.focusTag(parsed.tag)
      else {
        viewer.source.value = "url"
        viewer.url.value = parsed.url
        viewer.kind.value = parsed.kind
        void viewer.load(parsed.tag)
      }
    } else if (viewer.loaded.value?.preset === parsed.file)
      viewer.focusTag(parsed.tag)
    else {
      viewer.source.value = "preset"
      viewer.presetIndex.value = parsed.index
      void viewer.load(parsed.tag)
    }
    applying = false
  }

  onMounted(() => {
    mounted.value = true
    apply(router.route.query)
  })
  watch(
    () => router.route.query,
    (search) => {
      if (!mounted.value || ownQueries.delete(search)) return
      apply(search)
    },
    { flush: "sync" }
  )

  watch(
    [
      viewer.source,
      viewer.kind,
      viewer.file,
      viewer.url,
      viewer.presetIndex
    ],
    () => {
      if (!mounted.value || applying) return
      invalidLink.value = false
      if (!viewer.loaded.value) clearSourceQuery()
    },
    { flush: "sync" }
  )

  watch(
    viewer.loaded,
    (value) => {
      if (value) invalidLink.value = false
      if (mounted.value && !applying && !value?.preset && !value?.url)
        clearSourceQuery()
    },
    { flush: "sync" }
  )

  watch([viewer.loaded, viewer.selected, viewer.searching], () => {
    copyStatus.value = ""
    if (
      permalink.value &&
      !applying &&
      !viewer.searching.value &&
      !viewer.categoryMissing.value
    )
      replace(new URL(permalink.value))
  })

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
