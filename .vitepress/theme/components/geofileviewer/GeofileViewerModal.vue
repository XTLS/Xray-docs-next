<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref } from "vue"
import { useData } from "vitepress"
import { getMessages } from "./messages.mts"
import { useViewerDialog } from "./useViewerDialog.mts"
import { useViewerNavigation } from "./useViewerNavigation.mts"
const Viewer = defineAsyncComponent(() => import("./GeofileViewer.vue"))
const { lang } = useData()
const t = computed(() => getMessages(lang.value))
const target = ref<string>()
const revision = ref(0)
const viewer = ref<{ openLink(search: string): void }>()
const visible = ref(false)
const dialog = ref<HTMLDialogElement>()
const modal = useViewerDialog(dialog, () => {
  visible.value = false
})
useViewerNavigation(async (url) => {
  modal.captureFocus()
  const retained = !!target.value
  const generation = revision.value
  target.value = url.href
  await nextTick()
  if (generation === revision.value && retained && viewer.value) {
    if (url.search) viewer.value.openLink(url.search)
    showViewer()
  }
}, modal.close)
function showViewer() {
  if (!viewer.value) return
  modal.show()
  visible.value = dialog.value?.open ?? false
}
function viewerReady() {
  const generation = revision.value
  void nextTick(() => {
    if (generation !== revision.value || !target.value || !viewer.value)
      return
    viewer.value.openLink(new URL(target.value).search)
    showViewer()
  })
}
function closeViewer() {
  modal.close()
  target.value = undefined
  revision.value++
}
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="target"
      ref="dialog"
      class="geo-modal"
      :aria-label="t.title"
      autofocus
      @cancel.self.prevent="modal.close"
      @pointerdown="modal.pointerDown"
      @pointerup="modal.pointerUp"
      @pointercancel="modal.cancelPointer"
    >
      <div class="geo-modal-shell">
        <header class="geo-modal-header">
          <h2>{{ t.title }}</h2>
          <div class="geo-modal-controls">
            <button
              type="button"
              class="geo-modal-control geo-modal-minimize"
              :aria-label="t.minimize"
              :title="t.minimize"
              @click="modal.close"
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
                <path d="M6 12h12" />
              </svg>
            </button>
            <button
              type="button"
              class="geo-modal-control geo-modal-close"
              :aria-label="t.close"
              :title="t.close"
              @click="closeViewer"
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
          </div>
        </header>
        <div class="geo-modal-body">
          <Suspense>
            <Viewer
              ref="viewer"
              :key="revision"
              :active="visible"
              :host="{ mode: 'embedded', url: target }"
              @ready="viewerReady"
            />
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
  width: min(960px, calc(100vw - 40px));
  height: auto;
  max-width: none;
  max-height: calc(100dvh - 40px);
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
.geo-modal:focus {
  outline: none;
}
.geo-modal-shell {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 42px);
}
.geo-modal:has(.geo-viewer.is-workspace) {
  width: min(1248px, calc(100vw - 40px));
  height: min(900px, calc(100dvh - 40px));
}
.geo-modal:has(.geo-viewer.is-workspace) .geo-modal-shell {
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
.geo-modal-controls {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
}
.geo-modal-control {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.geo-modal-control:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.geo-modal-control:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.geo-modal-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.geo-modal-loading {
  padding: 24px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
@media (max-width: 767px) {
  .geo-modal {
    width: calc(100vw - 16px);
    max-height: calc(100dvh - 16px);
  }
  .geo-modal:has(.geo-viewer.is-workspace) {
    width: calc(100vw - 16px);
    height: calc(100dvh - 16px);
  }
  .geo-modal-shell {
    max-height: calc(100dvh - 18px);
  }
  .geo-modal-header {
    padding: 8px 12px;
  }
}
</style>
