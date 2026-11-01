import { computed, onMounted, ref, watch } from "vue"
import { categoryLink, remoteCategoryLink } from "./links.mts"
import type { ViewerController } from "./useViewer.mts"

export function useViewerSharing(
  viewer: ViewerController,
  baseUrl: () => string
) {
  const mounted = ref(false)
  const copyStatus = ref<"" | "copied" | "copyFailed">("")
  onMounted(() => {
    mounted.value = true
  })
  const permalink = computed(() => {
    const source = viewer.session.loaded
    const category = viewer.results.value.selected
    if (!mounted.value || !source || !category) return ""
    if (source.preset)
      return categoryLink(baseUrl(), source.preset, category.code)
    return source.url
      ? remoteCategoryLink(
          baseUrl(),
          source.url,
          source.kind,
          category.code
        )
      : ""
  })
  watch(
    [
      () => viewer.session.loaded,
      () => viewer.results.value.selected,
      () => viewer.query.searching
    ],
    () => {
      copyStatus.value = ""
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
  return { permalink, copyStatus, copy }
}
