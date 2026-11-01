import { ref, watch } from "vue"
import { parsePermalink } from "./links.mts"
import type { ViewerController } from "./useViewer.mts"

export function useViewerTarget(viewer: ViewerController) {
  const invalidLink = ref(false)
  let applying = false
  function apply(search: string) {
    const parsed = parsePermalink(search)
    applying = true
    invalidLink.value = parsed.invalid
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
  watch(
    () => [
      viewer.draft.mode,
      viewer.draft.kind,
      viewer.draft.file,
      viewer.draft.url,
      viewer.draft.presetIndex
    ],
    () => {
      if (!applying) invalidLink.value = false
    },
    { flush: "sync" }
  )
  watch(
    () => viewer.session.loaded,
    (value) => {
      if (value) invalidLink.value = false
    },
    { flush: "sync" }
  )
  return {
    invalidLink,
    apply,
    get applying() {
      return applying
    }
  }
}
