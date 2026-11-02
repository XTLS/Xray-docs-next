import { nextTick, onBeforeUnmount, type Ref } from "vue"

export function useViewerDialog(
  dialog: Ref<HTMLDialogElement | undefined>,
  onClose: () => void
) {
  let active = false
  let opener: HTMLElement | undefined
  let rootGutter: string | undefined
  let pointer: number | undefined
  function captureFocus() {
    active = true
    opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : undefined
  }
  function show() {
    if (!active || !dialog.value || dialog.value.open) return
    const root = document.documentElement
    rootGutter = root.style.scrollbarGutter
    // Keep the viewport width of fixed headers and sidebars as well as the
    // document flow. Padding only compensates for the latter.
    if (window.innerWidth > root.clientWidth)
      root.style.scrollbarGutter = "stable"
    dialog.value.showModal()
    dialog.value.focus({ preventScroll: true })
  }
  function close() {
    if (!active) return
    active = false
    dialog.value?.close()
    if (rootGutter !== undefined)
      document.documentElement.style.scrollbarGutter = rootGutter
    rootGutter = undefined
    pointer = undefined
    const focus = opener
    opener = undefined
    onClose()
    void nextTick(() => {
      if (focus?.isConnected) focus.focus({ preventScroll: true })
    })
  }
  onBeforeUnmount(close)
  return {
    captureFocus,
    show,
    close,
    pointerDown(event: PointerEvent) {
      pointer =
        event.target === event.currentTarget ? event.pointerId : undefined
    },
    pointerUp(event: PointerEvent) {
      if (
        pointer === event.pointerId &&
        event.target === event.currentTarget
      )
        close()
      pointer = undefined
    },
    cancelPointer() {
      pointer = undefined
    }
  }
}
