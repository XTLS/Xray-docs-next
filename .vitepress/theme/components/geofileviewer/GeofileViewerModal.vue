<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue"
import { useData, useRouter, withBase } from "vitepress"
import { getMessages } from "./messages.mts"
import { viewerPopupTarget } from "./links.mts"

const Viewer = defineAsyncComponent(() => import("./GeofileViewer.vue"))
const router = useRouter()
const { lang } = useData()
const t = computed(() => getMessages(lang.value))
const target = ref<string>()
const dialog = ref<HTMLDialogElement>()
let opener: HTMLElement | undefined
let backdropPointer: number | undefined
let previous: typeof router.onBeforeRouteChange
let rootPadding: string | undefined

async function beforeRouteChange(href: string) {
  if ((await previous?.(href)) === false) return false
  const url = viewerPopupTarget(href, location.href, withBase("/"))
  if (!url) return
  opener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : undefined
  target.value = url.href
  await nextTick()
  if (dialog.value && !dialog.value.open) {
    const root = document.documentElement
    const scrollbar = window.innerWidth - root.clientWidth
    rootPadding = root.style.paddingRight
    root.style.paddingRight = `${parseFloat(getComputedStyle(root).paddingRight) + scrollbar}px`
    dialog.value.showModal()
  }
  return false
}

function close() {
  if (!target.value) return
  dialog.value?.close()
  if (rootPadding !== undefined)
    document.documentElement.style.paddingRight = rootPadding
  rootPadding = undefined
  target.value = undefined
  backdropPointer = undefined
  const focus = opener
  opener = undefined
  void nextTick(() => {
    if (focus?.isConnected) focus.focus({ preventScroll: true })
  })
}

function onPointerDown(event: PointerEvent) {
  backdropPointer =
    event.target === event.currentTarget ? event.pointerId : undefined
}
function onPointerUp(event: PointerEvent) {
  if (
    backdropPointer === event.pointerId &&
    event.target === event.currentTarget
  )
    close()
  backdropPointer = undefined
}

onMounted(() => {
  previous = router.onBeforeRouteChange
  router.onBeforeRouteChange = beforeRouteChange
})
onBeforeUnmount(() => {
  if (router.onBeforeRouteChange === beforeRouteChange)
    router.onBeforeRouteChange = previous
  close()
})
watch(
  () => [router.route.path, router.route.query, router.route.hash],
  close
)
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="target"
      ref="dialog"
      class="geo-modal"
      :aria-label="t.title"
      @cancel.prevent="close"
      @close="close"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="backdropPointer = undefined"
    >
      <div class="geo-modal-shell">
        <header class="geo-modal-header">
          <h2>{{ t.title }}</h2>
          <button
            type="button"
            class="geo-modal-close"
            :aria-label="t.close"
            :title="t.close"
            autofocus
            @click="close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div class="geo-modal-body">
          <Suspense>
            <Viewer :key="target" :popup-url="target" />
            <template #fallback
              ><p class="geo-modal-loading" role="status">
                {{ t.reading }}
              </p></template
            >
          </Suspense>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<style scoped>
:global(html:has(.geo-modal[open])) {
  overflow: hidden;
}
.geo-modal {
  position: fixed;
  inset: auto;
  top: 50dvh;
  left: 50vw;
  width: min(1248px, calc(100vw - 40px));
  height: min(900px, calc(100dvh - 40px));
  max-width: none;
  max-height: none;
  margin: 0;
  transform: translate(-50%, -50%);
  padding: 0;
  overflow: hidden;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 35%);
}
.geo-modal::backdrop {
  background: rgb(0 0 0 / 60%);
  backdrop-filter: blur(2px);
}
.geo-modal-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.geo-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.geo-modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
}
.geo-modal-close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.geo-modal-close:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.geo-modal-close:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.geo-modal-body {
  flex: 1;
  min-height: 0;
}
.geo-modal-loading {
  padding: 24px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
@media (max-width: 767px) {
  .geo-modal {
    width: calc(100vw - 16px);
    height: calc(100dvh - 16px);
  }
  .geo-modal-header {
    padding: 8px 12px;
  }
}
</style>
