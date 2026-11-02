<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useData, withBase } from "vitepress"
import { VPLink } from "vitepress/theme"
import { useViewer } from "./useViewer.mts"
import { getMessages } from "./messages.mts"
import { presets } from "./sources.mts"
import { useViewerSharing } from "./useViewerSharing.mts"
import { useViewerPageRoute } from "./useViewerPageRoute.mts"
import { useViewerTarget } from "./useViewerTarget.mts"
import type { ViewerHost } from "./viewerState.mts"
import ViewerSource from "./ViewerSource.vue"
import ViewerCategoryList from "./ViewerCategoryList.vue"
import ViewerEntryList from "./ViewerEntryList.vue"
import SearchInput from "./SearchInput.vue"
import MarqueeText from "./MarqueeText.vue"
const props = defineProps<{ host?: ViewerHost; active?: boolean }>()
const emit = defineEmits<{ ready: [] }>()
const embedded = props.host?.mode === "embedded"
const viewer = useViewer()
const {
  draft,
  session,
  query,
  view,
  results,
  canLoad,
  remoteAllowed,
  actions
} = viewer
const { lang } = useData()
const t = computed(() => getMessages(lang.value))
const contentQuery = computed({
  get: () => query.content,
  set: actions.setContentQuery
})
const searchLabel = computed(() =>
  session.loaded?.kind === "geoip"
    ? query.mode === "match"
      ? t.value.ipSearch
      : t.value.cidrSearch
    : query.mode === "match"
      ? t.value.domainSearch
      : t.value.contentSearch
)
const loading = computed(() => session.status === "loading")
const number = (value: number) => value.toLocaleString(lang.value)
const searchStatus = computed(() =>
  query.error
    ? t.value[query.error]
    : query.searching
      ? t.value.searching
      : `${number(results.value.categories.length)} ${t.value.categories}`
)
const localePrefix = computed(() =>
  /^(en|ru)(-|$)/i.test(lang.value)
    ? "/" + lang.value.split("-")[0].toLowerCase()
    : ""
)
const sourceDocs = computed(() =>
  lang.value.startsWith("zh")
    ? "https://github.com/XTLS/Xray-rules-dat/blob/main/README_zh-Hans.md"
    : lang.value.startsWith("ru")
      ? "https://github.com/XTLS/Xray-rules-dat/blob/main/README_ru-RU.md"
      : "https://github.com/XTLS/Xray-rules-dat"
)
const relatedDocs = computed(() => [
  {
    href: withBase(
      `${localePrefix.value}/document/level-1/routing-lv1-part1.html#${t.value.domainRoutingAnchor}`
    ),
    label: t.value.domainRoutingDocs,
    newTab: !embedded
  },
  {
    href: withBase(
      `${localePrefix.value}/document/level-1/routing-with-dns.html`
    ),
    label: t.value.dnsRoutingDocs,
    newTab: !embedded
  },
  {
    href: withBase(`${localePrefix.value}/config/geodata.html`),
    label: t.value.geodataDocs,
    newTab: !embedded
  },
  {
    href: sourceDocs.value,
    label: t.value.dataSourceDocs,
    newTab: true
  }
])
const docsMenu = ref<HTMLDetailsElement>()
const progressLabel = computed(
  () =>
    ({
      read: t.value.readingFile,
      download: t.value.downloading,
      decompress: t.value.decompressing,
      index: t.value.processing
    })[session.phase]
)
const loadedSourceName = computed(() => {
  const loaded = session.loaded
  if (!loaded) return ""
  const index = presets.findIndex(
    (preset) => preset.file === loaded.preset
  )
  return index < 0
    ? loaded.name
    : `${t.value.preset} · ${t.value.presetNames[index]}`
})
const sourceSummary = computed(() => {
  const summary = session.loaded
    ? [
        loadedSourceName.value,
        ...(session.loaded.preset
          ? []
          : [session.loaded.kind === "geoip" ? "GeoIP" : "GeoSite"]),
        number(session.categoryCount) + " " + t.value.categories,
        number(session.entryCount) + " " + t.value.entries
      ].join(" · ")
    : loading.value
      ? progressLabel.value
      : t.value.emptyTitle
  return loading.value && session.progress !== undefined
    ? `${summary} · ${Math.round(session.progress * 100)}%`
    : summary
})
const { permalink, pageUrl, copyStatus, copy } = useViewerSharing(
  viewer,
  () => (props.host?.mode === "embedded" ? props.host.url : location.href)
)
const linkTarget = embedded ? useViewerTarget(viewer) : undefined
const invalidLink = linkTarget
  ? linkTarget.invalidLink
  : useViewerPageRoute(viewer, permalink).invalidLink
defineExpose({
  openLink: (search: string) => linkTarget?.apply(search),
  pageUrl
})
onMounted(() => {
  emit("ready")
  document.addEventListener("pointerdown", closeDocsOutside)
})
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", closeDocsOutside)
)
function closeDocs() {
  if (docsMenu.value) docsMenu.value.open = false
}
function closeDocsOutside(event: PointerEvent) {
  if (!docsMenu.value?.contains(event.target as Node)) closeDocs()
}
</script>
<template>
  <component
    :is="embedded ? 'section' : 'main'"
    class="geo-viewer"
    :class="{
      'is-workspace': view.workspace,
      'geo-viewer--embedded': embedded,
      'geo-viewer--page': !embedded
    }"
  >
    <header v-if="!view.workspace && !embedded" class="geo-heading">
      <p class="geo-eyebrow">PROJECT X / TOOLS</p>
      <h1>{{ t.title }}</h1>
      <p>{{ t.description }}</p>
    </header>
    <header
      v-else-if="view.workspace"
      class="geo-workspace-bar geo-source geo-panel"
    >
      <div class="geo-workspace-title">
        <h1 v-if="!embedded">{{ t.title }}</h1>
        <MarqueeText :text="sourceSummary" />
      </div>
      <div class="geo-workspace-actions">
        <details
          ref="docsMenu"
          class="geo-docs"
          @keydown.esc.stop.prevent="closeDocs"
        >
          <summary :aria-label="t.relatedDocs" :title="t.relatedDocs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              aria-hidden="true"
            >
              <path
                d="M12 5v15M3 4h4a5 5 0 0 1 5 2 5 5 0 0 1 5-2h4v15h-4a5 5 0 0 0-5 2 5 5 0 0 0-5-2H3Z"
              /></svg
            ><span class="geo-docs-label">{{ t.relatedDocs }}</span>
          </summary>
          <nav class="geo-links" :aria-label="t.relatedDocs">
            <VPLink
              v-for="link in relatedDocs"
              :key="link.href"
              :href="link.href"
              :target="link.newTab ? '_blank' : undefined"
              :rel="link.newTab ? 'noreferrer noopener' : undefined"
              >{{ link.label }}</VPLink
            >
          </nav>
        </details>
        <button
          v-if="loading && !view.sourceOpen"
          class="geo-button"
          @click="actions.cancelLoad"
        >
          {{ t.cancel }}
        </button>
        <button
          class="geo-button"
          aria-haspopup="dialog"
          @click="actions.openSource()"
        >
          {{ t.changeSource }}
        </button>
      </div>
    </header>
    <ViewerSource
      :draft="draft"
      :session="session"
      :view="view"
      :embedded="embedded"
      :active="!embedded || props.active !== false"
      :can-load="canLoad"
      :remote-allowed="remoteAllowed"
      :t="t"
      :locale="lang"
      :progress-label="progressLabel"
      :loaded-source-name="loadedSourceName"
      @source-change="actions.updateSource"
      @load="actions.loadSource()"
      @cancel="actions.cancelLoad"
      @close="actions.closeSource"
    />
    <div v-if="invalidLink" class="geo-notice error" role="alert">
      {{ t.invalidLink }}
    </div>
    <div v-if="results.categoryMissing" class="geo-notice" role="status">
      {{ t.missingCategory }}: {{ results.categoryMissing }}
    </div>
    <template v-if="session.loaded">
      <div class="geo-toolbar">
        <label class="geo-sr-only" for="geo-search">{{
          searchLabel
        }}</label>
        <SearchInput
          id="geo-search"
          v-model="contentQuery"
          :placeholder="searchLabel"
          :clear-label="t.clearContentSearch"
          :invalid="!!query.error"
          :described-by="query.error ? 'geo-search-status' : undefined"
        >
          <template #prefix>
            <div
              class="geo-search-modes"
              role="group"
              :aria-label="t.searchMode"
            >
              <button
                type="button"
                :aria-pressed="query.mode === 'match'"
                @click="actions.setSearchMode('match')"
              >
                {{ t.matchMode }}
              </button>
              <button
                type="button"
                :aria-pressed="query.mode === 'rules'"
                @click="actions.setSearchMode('rules')"
              >
                {{ t.rulesMode }}
              </button>
            </div>
          </template>
        </SearchInput>
        <span
          id="geo-search-status"
          class="geo-stats"
          :class="{ 'is-error': query.error }"
          role="status"
          >{{ searchStatus }}</span
        >
      </div>
      <section
        class="geo-browser geo-panel"
        :class="{ 'show-detail': view.mobileDetail }"
        :aria-busy="query.searching"
      >
        <ViewerCategoryList
          :results="results"
          :query="query"
          :view="view"
          :t="t"
          :locale="lang"
          @filter="actions.setCategoryFilter"
          @select="actions.selectCategory"
          @load-more="actions.loadMoreCategories"
        />
        <ViewerEntryList
          :results="results"
          :query="query"
          :view="view"
          :t="t"
          :locale="lang"
          :sharing="{ permalink, copyStatus }"
          @attribute="actions.setAttribute"
          @categories="actions.showCategories"
          @copy="copy"
          @load-more="actions.loadMoreEntries"
        />
      </section>
    </template>
    <p
      v-else-if="view.workspace && !view.sourceOpen"
      class="geo-workspace-status"
      role="status"
    >
      {{ loading ? progressLabel : t.emptyBody }}
    </p>
    <nav
      v-if="!view.workspace"
      class="geo-links"
      :aria-label="t.relatedDocs"
    >
      <VPLink
        v-for="link in relatedDocs"
        :key="link.href"
        :href="link.href"
        :target="link.newTab ? '_blank' : undefined"
        :rel="link.newTab ? 'noreferrer noopener' : undefined"
        >{{ link.label }}</VPLink
      >
    </nav>
  </component>
</template>
<style src="./viewer-shared.css"></style>
<style scoped src="./viewer.css"></style>
