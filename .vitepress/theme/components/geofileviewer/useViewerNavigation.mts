import { onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter, withBase } from "vitepress"
import { viewerPopupTarget } from "./links.mts"

export function useViewerNavigation(
  open: (url: URL) => Promise<void>,
  close: () => void
) {
  const router = useRouter()
  let previous: typeof router.onBeforeRouteChange
  async function beforeRouteChange(href: string) {
    if ((await previous?.(href)) === false) return false
    const url = viewerPopupTarget(href, location.href, withBase("/"))
    if (!url) return
    await open(url)
    return false
  }
  onMounted(() => {
    previous = router.onBeforeRouteChange
    router.onBeforeRouteChange = beforeRouteChange
  })
  onBeforeUnmount(() => {
    if (router.onBeforeRouteChange === beforeRouteChange)
      router.onBeforeRouteChange = previous
  })
  watch(
    () => [router.route.path, router.route.query, router.route.hash],
    close
  )
}
