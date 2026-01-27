<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue"

// --- Types ---
interface PanZoomInstance {
  destroy: () => void
  resize?: () => void
  fit?: () => void
  center?: () => void
  resetZoom?: () => void
  zoomIn?: () => void
  zoomOut?: () => void
  zoomBy?: (scale: number) => void
  panBy?: (p: { x: number; y: number }) => void
  getPan?: () => { x: number; y: number }
  pan?: (p: { x: number; y: number }) => void
}

// --- State ---
const open = ref(false)
const svgHtml = ref("")
const contentRef = ref<HTMLElement | null>(null)
let panZoom: PanZoomInstance | null = null

// Factory cache (Singleton pattern)
type SvgPanZoomFactory = (
  svg: SVGSVGElement,
  opts: Record<string, any>
) => PanZoomInstance
let svgPanZoomFactory: SvgPanZoomFactory | null = null

const PAN_STEP_PX = 60

// --- Backdrop Logic ---
let backdropPress = false
let backdropPointerId: number | null = null

// --- Actions ---
const destroyPanzoom = () => {
  if (!panZoom) return
  try {
    panZoom.destroy()
  } catch {}
  panZoom = null
}

const initPanzoom = async () => {
  await nextTick()
  destroyPanzoom()

  const svg = contentRef.value?.querySelector(
    "svg"
  ) as SVGSVGElement | null
  if (!svg) return

  // Cache the factory to avoid repeated dynamic imports
  if (!svgPanZoomFactory) {
    const mod: any = await import("svg-pan-zoom")
    svgPanZoomFactory = (mod.default ?? mod) as SvgPanZoomFactory
  }

  panZoom = svgPanZoomFactory(svg, {
    zoomEnabled: true,
    panEnabled: true,
    mouseWheelZoomEnabled: true,
    dblClickZoomEnabled: true,
    fit: true,
    center: true,
    minZoom: 0.1,
    maxZoom: 20,
    controlIconsEnabled: false,
    preventMouseEventsDefault: true
  })

  // Initial alignment:
  // 1. Sync call ensures correct position on first paint (no flash).
  // 2. RAF handles any layout shifts or font loading settlements.
  const align = () => {
    try {
      panZoom?.resize?.()
      panZoom?.fit?.()
      panZoom?.center?.()
    } catch {}
  }

  align()
  requestAnimationFrame(align)
}

const close = () => {
  open.value = false
  svgHtml.value = ""
  destroyPanzoom()
  backdropPress = false
  backdropPointerId = null
}

// --- Pan/Zoom Helpers ---
// Helper to safely execute PanZoom methods if the instance exists
const withPanZoom = (fn: (pz: PanZoomInstance) => void) => {
  const pz = panZoom
  if (!pz) return
  try {
    fn(pz)
  } catch {}
}

const zoomIn = () => withPanZoom((pz) => pz.zoomIn?.())
const zoomOut = () => withPanZoom((pz) => pz.zoomOut?.())
const resetView = () =>
  withPanZoom((pz) => {
    pz.resetZoom?.()
    pz.fit?.()
    pz.center?.()
  })

const panBy = (dx: number, dy: number) =>
  withPanZoom((pz) => {
    // Prefer native panBy if available (better stability with transforms)
    if (pz.panBy) {
      pz.panBy({ x: dx, y: dy })
    } else if (pz.getPan && pz.pan) {
      const { x, y } = pz.getPan()
      pz.pan({ x: x + dx, y: y + dy })
    }
  })

const panUp = () => panBy(0, PAN_STEP_PX)
const panDown = () => panBy(0, -PAN_STEP_PX)
const panLeft = () => panBy(PAN_STEP_PX, 0)
const panRight = () => panBy(-PAN_STEP_PX, 0)

// --- Event Handlers ---
function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") close()
}

async function onDocClick(e: MouseEvent) {
  if (open.value) return

  const target = e.target as HTMLElement | null
  const svg = target?.closest?.("svg") as SVGElement | null
  // Strict check: only Mermaid diagrams
  if (!svg || !svg.closest(".mermaid")) return

  e.preventDefault()
  svgHtml.value = svg.outerHTML
  open.value = true
  await initPanzoom()
}

// Backdrop specific: only close if user starts AND ends click on backdrop
function onBackdropPointerDown(e: PointerEvent) {
  if (e.target === e.currentTarget) {
    backdropPress = true
    backdropPointerId = e.pointerId
  } else {
    backdropPress = false
    backdropPointerId = null
  }
}

function onBackdropPointerUp(e: PointerEvent) {
  const isSamePointer = backdropPointerId === e.pointerId
  const releasedOnBackdrop = e.target === e.currentTarget

  if (backdropPress && isSamePointer && releasedOnBackdrop) {
    close()
  }
  backdropPress = false
  backdropPointerId = null
}

function onBackdropPointerCancel() {
  backdropPress = false
  backdropPointerId = null
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown)
  document.addEventListener("click", onDocClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown)
  document.removeEventListener("click", onDocClick, true)
  destroyPanzoom()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="mz-overlay"
      aria-modal="true"
      role="dialog"
      @pointerdown="onBackdropPointerDown"
      @pointerup="onBackdropPointerUp"
      @pointercancel="onBackdropPointerCancel"
    >
      <div class="mz-box" @click.stop @pointerdown.stop @pointerup.stop>
        <div class="mz-toolbar" @click.stop>
          <button
            class="mz-btn"
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            @click="zoomOut"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19.96 11.48C19.96 13.8 19.02 15.9 17.5 17.45C16.93 18.02 16.28 18.5 15.57 18.9C14.36 19.58 12.96 19.96 11.48 19.96C6.8 19.96 3 16.16 3 11.48C3 6.8 6.8 3 11.48 3C16.16 3 19.96 6.8 19.96 11.48Z"
              />
              <path d="M18.15 18.15L21.88 21.88" />
              <path d="M8 11.55H15.1" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            @click="zoomIn"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M19.96 11.48C19.96 13.8 19.02 15.9 17.5 17.45C16.93 18.02 16.28 18.5 15.57 18.9C14.36 19.58 12.96 19.96 11.48 19.96C6.8 19.96 3 16.16 3 11.48C3 6.8 6.8 3 11.48 3C16.16 3 19.96 6.8 19.96 11.48Z"
              />
              <path d="M18.15 18.15L21.88 21.88" />
              <path d="M8 11.55H15.1" />
              <path d="M11.55 15.1L11.55 8" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Reset view"
            aria-label="Reset view"
            @click="resetView"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20.95 9.75L22.25 6.13" />
              <path d="M20.95 9.75L17.16 9.12" />
              <path
                d="M20.16 8.28C19.4 6.57 18.09 5.1 16.32 4.14C12.06 1.85 6.75 3.45 4.46 7.7C3.92 8.7 3.6 9.78 3.48 10.85"
              />
              <path d="M3.54 14.25L2.24 17.87" />
              <path d="M3.54 14.25L7.33 14.87" />
              <path
                d="M4.33 15.71C5.1 17.42 6.4 18.9 8.18 19.85C12.44 22.14 17.74 20.55 20.03 16.3C20.57 15.28 20.9 14.22 21.02 13.15"
              />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Pan up"
            aria-label="Pan up"
            @click="panUp"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12.4 7L17.8 11.5" />
              <path d="M12.4 7L7 11.5" />
              <path d="M12.4 12L17.8 16.5" />
              <path d="M12.4 12L7 16.5" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Pan down"
            aria-label="Pan down"
            @click="panDown"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17.65 12L12.25 16.5L6.85 12" />
              <path d="M17.65 7L12.25 11.5L6.85 7" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Pan left"
            aria-label="Pan left"
            @click="panLeft"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M7 11.75L11.5 17.15" />
              <path d="M7 11.75L11.5 6.35" />
              <path d="M12 11.75L16.5 17.15" />
              <path d="M12 11.75L16.5 6.35" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Pan right"
            aria-label="Pan right"
            @click="panRight"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 11.75L11.5 17.15" />
              <path d="M16 11.75L11.5 6.35" />
              <path d="M11 11.75L6.5 17.15" />
              <path d="M11 11.75L6.5 6.35" />
            </svg>
          </button>

          <button
            class="mz-btn"
            type="button"
            title="Close"
            aria-label="Close"
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
              stroke-linejoin="round"
            >
              <path d="M19 5L5 19" />
              <path d="M5 5L19 19" />
            </svg>
          </button>
        </div>

        <div ref="contentRef" class="mz-canvas" v-html="svgHtml" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mz-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.mz-box {
  position: relative;
  width: min(1200px, 96vw);
  height: min(900px, 92vh);
  background: var(--vp-c-bg, #fff);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, #eee);
}

.mz-toolbar {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-bg, #fff) 85%, transparent);
  backdrop-filter: blur(8px);
}

.mz-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-1, #333);
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.mz-btn:hover {
  background-color: var(--vp-c-bg-soft, #f4f4f4);
  color: var(--vp-c-brand, #3451b2);
}

.mz-btn:active {
  background-color: var(--vp-c-bg-mute, #e2e2e2);
}

.mz-canvas {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background-image: radial-gradient(
    var(--vp-c-divider, #e5e5e5) 1px,
    transparent 1px
  );
  background-size: 20px 20px;
}

.mz-canvas :deep(svg) {
  position: absolute;
  inset: 0;
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  cursor: grab;
}

.mz-canvas :deep(svg:active) {
  cursor: grabbing;
}
</style>
