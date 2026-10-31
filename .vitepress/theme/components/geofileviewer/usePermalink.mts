import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vitepress"
import { categoryLink, parsePermalink } from "./links.mts"
import type { useViewer } from "./useViewer.mts"

export function usePermalink(viewer: ReturnType<typeof useViewer>) {
  const router = useRouter()
  const mounted = ref(false)
  const invalidLink = ref(false)
  const copyStatus = ref<"" | "copied" | "copyFailed">("")
  const ownQueries = new Set<string>()
  let applying = false
  const permalink = computed(() =>
    mounted.value && viewer.loaded.value?.preset && viewer.selected.value
      ? categoryLink(
          location.href,
          viewer.loaded.value.preset,
          viewer.selected.value.code
        )
      : ""
  )

  function replace(url: URL) {
    if (url.search === router.route.query) return
    ownQueries.add(url.search)
    void router.go(url.href, { replace: true })
  }

  function clearPresetQuery() {
    const url = new URL(location.href)
    url.searchParams.delete("file")
    url.searchParams.delete("tag")
    replace(url)
  }

  function apply(search: string) {
    const parsed = parsePermalink(search)
    invalidLink.value = parsed.invalid
    applying = true
    if (parsed.invalid || !parsed.file) {
      viewer.stop()
      viewer.loaded.value = undefined
      viewer.sourceOpen.value = true
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
      if (!viewer.loaded.value) clearPresetQuery()
    },
    { flush: "sync" }
  )

  watch(
    viewer.loaded,
    (value) => {
      if (value) invalidLink.value = false
      if (mounted.value && !applying && !value?.preset) clearPresetQuery()
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
