import {
  nextTick,
  onMounted,
  onUnmounted,
  watch,
  type Ref,
  type WatchSource
} from "vue"

export function useInfiniteScroll(
  root: Ref<HTMLElement | undefined>,
  loadMore: () => void,
  changes: WatchSource[]
) {
  let observer: ResizeObserver | undefined
  let scheduled = false
  let disposed = false

  function schedule() {
    if (scheduled || disposed) return
    scheduled = true
    void nextTick(() => {
      scheduled = false
      const element = root.value
      if (
        !disposed &&
        element &&
        element.clientHeight > 0 &&
        element.scrollHeight - element.scrollTop - element.clientHeight <=
          160
      )
        loadMore()
    })
  }

  watch(
    root,
    (element, previous) => {
      if (previous) observer?.unobserve(previous)
      if (element) observer?.observe(element)
      schedule()
    },
    { flush: "post" }
  )
  watch(changes, schedule, { flush: "post" })
  onMounted(() => {
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(schedule)
      if (root.value) observer.observe(root.value)
    } else window.addEventListener("resize", schedule)
    schedule()
  })
  onUnmounted(() => {
    disposed = true
    observer?.disconnect()
    window.removeEventListener("resize", schedule)
  })
  return schedule
}
