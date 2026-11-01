<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch
} from "vue"

const props = defineProps<{ text: string }>()
const viewport = ref<HTMLElement>()
const content = ref<HTMLElement>()
const distance = ref(0)
const style = computed(() => ({
  "--geo-marquee-offset": `${-distance.value}px`,
  "--geo-marquee-duration": `${Math.max(8, distance.value / 24 + 4)}s`
}))
let observer: ResizeObserver | undefined

function measure() {
  distance.value = viewport.value?.clientWidth
    ? Math.max(
        0,
        (content.value?.scrollWidth ?? 0) - viewport.value.clientWidth
      )
    : 0
}
watch(
  () => props.text,
  async () => {
    distance.value = 0
    await nextTick()
    measure()
  }
)
onMounted(() => {
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(measure)
    observer.observe(viewport.value!)
    observer.observe(content.value!)
  } else window.addEventListener("resize", measure)
  measure()
})
onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener("resize", measure)
})
</script>

<template>
  <p
    ref="viewport"
    class="geo-summary geo-marquee"
    :class="{ 'is-overflowing': distance > 0 }"
    :style="style"
    :title="text"
  >
    <span ref="content">{{ text }}</span>
  </p>
</template>

<style scoped>
.geo-marquee {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
}
.geo-marquee > span {
  display: inline-block;
}
.geo-marquee.is-overflowing > span {
  animation: geo-marquee var(--geo-marquee-duration) linear infinite
    alternate;
}
.geo-marquee:hover > span {
  animation-play-state: paused;
}
@keyframes geo-marquee {
  0%,
  15% {
    transform: translateX(0);
  }
  85%,
  100% {
    transform: translateX(var(--geo-marquee-offset));
  }
}
@media (prefers-reduced-motion: reduce) {
  .geo-marquee.is-overflowing {
    overflow-x: auto;
    scrollbar-width: none;
  }
  .geo-marquee::-webkit-scrollbar {
    display: none;
  }
  .geo-marquee.is-overflowing > span {
    animation: none;
  }
}
</style>
