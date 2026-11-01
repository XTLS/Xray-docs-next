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
const dialog = ref<HTMLDialogElement>()
const modal = useViewerDialog(dialog, () => {
  target.value = undefined
})
useViewerNavigation(async (url) => {
  modal.captureFocus()
  target.value = url.href
  await nextTick()
  modal.show()
}, modal.close)
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="target"
      ref="dialog"
      class="geo-modal"
      :aria-label="t.title"
      @cancel.self.prevent="modal.close"
      @close="modal.close"
      @pointerdown="modal.pointerDown"
      @pointerup="modal.pointerUp"
      @pointercancel="modal.cancelPointer"
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
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div class="geo-modal-body">
          <Suspense>
            <Viewer
              :key="target"
              :host="{ mode: 'embedded', url: target }"
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
