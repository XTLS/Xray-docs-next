import { onMounted, ref, watch, type ComputedRef } from "vue"
import { useRouter } from "vitepress"
import { useViewerTarget } from "./useViewerTarget.mts"
import type { ViewerController } from "./useViewer.mts"

export function useViewerPageRoute(
  viewer: ViewerController,
  permalink: ComputedRef<string>
) {
  const router = useRouter()
  const target = useViewerTarget(viewer)
  const mounted = ref(false)
  const ownQueries = new Set<string>()
  function replace(url: URL) {
    if (url.search === router.route.query) return
    ownQueries.add(url.search)
    void router.go(url.href, { replace: true })
  }
  function clearSourceQuery() {
    const url = new URL(location.href)
    for (const key of ["file", "tag", "url", "type"])
      url.searchParams.delete(key)
    replace(url)
  }
  onMounted(() => {
    mounted.value = true
    target.apply(router.route.query)
  })
  watch(
    () => router.route.query,
    (search) => {
      if (mounted.value && !ownQueries.delete(search)) target.apply(search)
    },
    { flush: "sync" }
  )
  watch(
    () => [
      viewer.draft.mode,
      viewer.draft.kind,
      viewer.draft.file,
      viewer.draft.url,
      viewer.draft.presetIndex
    ],
    () => {
      if (mounted.value && !target.applying && !viewer.session.loaded)
        clearSourceQuery()
    },
    { flush: "sync" }
  )
  watch(
    () => viewer.session.loaded,
    (value) => {
      if (
        mounted.value &&
        !target.applying &&
        !value?.preset &&
        !value?.url
      )
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
      if (
        permalink.value &&
        !target.applying &&
        !viewer.query.searching &&
        !viewer.results.value.categoryMissing
      )
        replace(new URL(permalink.value))
    }
  )
  return { invalidLink: target.invalidLink }
}
