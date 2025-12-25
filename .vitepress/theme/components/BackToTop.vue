<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const visible = ref(false);
const THRESHOLD = 300;

function onScroll() {
  visible.value = window.scrollY > THRESHOLD;
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <button
    v-show="visible"
    class="vp-back-to-top"
    aria-label="Back to top"
    @click="backToTop"
  >
    ↑
  </button>
</template>

<style scoped>
.vp-back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  width: 36px;
  height: 36px;
  border-radius: 999px;

  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);

  cursor: pointer;
  font-size: 16px;
  line-height: 1;

  opacity: 0.8;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.vp-back-to-top:hover {
  opacity: 1;
  transform: translateY(-2px);
}
</style>
