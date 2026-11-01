import { nextTick, onBeforeUnmount, type Ref } from "vue"

export function useViewerDialog(
  dialog: Ref<HTMLDialogElement | undefined>,
  onClose: () => void
) {
  let active = false
  let opener: HTMLElement | undefined
  let rootPadding: string | undefined
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
    const scrollbar = window.innerWidth - root.clientWidth
    rootPadding = root.style.paddingRight
    root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`
    dialog.value.showModal()
  }
  function close() {
    if (!active) return
    active = false
    dialog.value?.close()
    if (rootPadding !== undefined)
      document.documentElement.style.paddingRight = rootPadding
    rootPadding = undefined
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
