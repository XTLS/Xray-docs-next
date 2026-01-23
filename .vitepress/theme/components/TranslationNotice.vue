<script setup lang="ts">
import statusMap from "../../.generated/i18n-status.json"
import { useRoute, useData } from "vitepress"
import { computed } from "vue"

const route = useRoute()
const { lang } = useData()

const info = computed(() => {
  const map = statusMap as Record<string, any>
  const raw = route.path
  const keys = [
    raw,
    raw.replace(/\.html$/, ""),
    raw.endsWith("/") ? raw.slice(0, -1) : raw + "/",
    raw.replace(/\.html$/, "").endsWith("/")
      ? raw.replace(/\.html$/, "").slice(0, -1)
      : raw.replace(/\.html$/, "") + "/"
  ]
  for (const k of keys) if (map[k]) return map[k]
  return null
})

const isZh = computed(() =>
  (lang.value || "").toLowerCase().startsWith("zh")
)

const text = computed(() => {
  const l = (lang.value || "en").toLowerCase()
  const dict: any = {
    en: {
      title: "Translation notice",
      body: "This translation may be outdated. Please refer to the Chinese original.",
      missing:
        "This page is not translated yet. Please refer to the Chinese original.",
      go: "View Chinese original"
    },
    ru: {
      title: "Уведомление о переводе",
      body: "Этот перевод может быть устаревшим. Пожалуйста, обратитесь к оригинальной китайской версии.",
      missing:
        "Эта страница ещё не переведена. Пожалуйста, обратитесь к оригинальной версии на китайском языке.",
      go: "Посмотреть оригинальную китайскую версию"
    }
  }
  return dict[l] || dict[l.split("-")[0]] || dict.en
})
</script>

<template>
  <div
    v-if="!isZh && info && info.stale"
    class="custom-block warning vp-translation-warning"
  >
    <p class="custom-block-title">
      {{ text.title }}
    </p>

    <p>
      <span v-if="info.translated">
        {{ text.body }}
      </span>
      <span v-else>
        {{ text.missing }}
      </span>
      <br />
      <a
        :href="info.zhRoute"
        class="link"
        target="_blank"
        rel="noreferrer noopener"
      >
        {{ text.go }}
      </a>
    </p>
  </div>
</template>

<style scoped>
.vp-translation-warning {
  margin: 16px 0;
}
</style>
