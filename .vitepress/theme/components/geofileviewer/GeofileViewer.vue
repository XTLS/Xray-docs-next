<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useData, withBase } from "vitepress"
import { useViewer } from "./useViewer.mts"
import { getMessages } from "./messages.mts"
import { useViewerSharing } from "./useViewerSharing.mts"
import { useViewerPageRoute } from "./useViewerPageRoute.mts"
import { useViewerTarget } from "./useViewerTarget.mts"
import type { ViewerHost } from "./viewerState.mts"
import ViewerSource from "./ViewerSource.vue"
import ViewerCategoryList from "./ViewerCategoryList.vue"
import ViewerEntryList from "./ViewerEntryList.vue"
import SearchInput from "./SearchInput.vue"
const props = defineProps<{ host?: ViewerHost }>()
const host: ViewerHost = props.host ?? { mode: "page" }
const embedded = host.mode === "embedded"
const viewer = useViewer()
const { draft, session, query, view, results, canLoad, actions } = viewer
const { lang } = useData()
const t = computed(() => getMessages(lang.value))
const contentQuery = computed({
  get: () => query.content,
  set: actions.setContentQuery
})
const loading = computed(() => session.status === "loading")
const number = (value: number) => value.toLocaleString(lang.value)
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
const progressLabel = computed(
  () =>
    ({
      read: t.value.readingFile,
      download: t.value.downloading,
      decompress: t.value.decompressing,
      index: t.value.processing
    })[session.phase]
)
const sourceSummary = computed(() =>
  session.loaded
    ? [
        session.loaded.name,
        session.loaded.kind === "geoip" ? "GeoIP" : "GeoSite",
        number(session.categoryCount) + " " + t.value.categories,
        number(session.entryCount) + " " + t.value.entries
      ].join(" · ")
    : loading.value
      ? progressLabel.value
      : t.value.emptyTitle
)
const { permalink, copyStatus, copy } = useViewerSharing(viewer, () =>
  host.mode === "page" ? location.href : host.url
)
function setupLocation() {
  if (host.mode === "page")
    return useViewerPageRoute(viewer, permalink).invalidLink
  const target = useViewerTarget(viewer)
  onMounted(() => target.apply(new URL(host.url).search))
  return target.invalidLink
}
const invalidLink = setupLocation()
function closeDocsOnBlur(event: FocusEvent) {
  const details = event.currentTarget as HTMLDetailsElement
  if (!details.contains(event.relatedTarget as Node | null))
    details.open = false
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
        <p class="geo-summary" :title="sourceSummary">
          {{ sourceSummary
          }}<template v-if="loading && session.progress !== undefined">
            · {{ Math.round(session.progress * 100) }}%</template
          >
        </p>
      </div>
      <div class="geo-workspace-actions">
        <details
          class="geo-docs"
          @focusout="closeDocsOnBlur"
          @keydown.esc.stop.prevent="
            ($event.currentTarget as HTMLDetailsElement).open = false
          "
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
            <a
              :href="withBase(`${localePrefix}/config/routing.html`)"
              target="_blank"
              rel="noreferrer noopener"
              >{{ t.routingDocs }}</a
            >
            <a
              :href="withBase(`${localePrefix}/config/geodata.html`)"
              target="_blank"
              rel="noreferrer noopener"
              >{{ t.geodataDocs }}</a
            >
            <a
              :href="sourceDocs"
              target="_blank"
              rel="noreferrer noopener"
              >{{ t.dataSourceDocs }}</a
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
      :can-load="canLoad"
      :t="t"
      :locale="lang"
      :progress-label="progressLabel"
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
          t.contentSearch
        }}</label>
        <SearchInput
          id="geo-search"
          v-model="contentQuery"
          :placeholder="t.contentSearch"
          :clear-label="t.clearContentSearch"
        />
        <span class="geo-stats" role="status">{{
          query.searching
            ? t.searching
            : `${number(results.categories.length)} ${t.categories}`
        }}</span>
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
    <section v-else class="geo-empty geo-panel" :aria-busy="loading">
      <span class="geo-empty-icon" aria-hidden="true">{ }</span>
      <h2>{{ loading ? progressLabel : t.emptyTitle }}</h2>
      <p v-if="!loading">{{ t.emptyBody }}</p>
    </section>
    <nav
      v-if="!view.workspace"
      class="geo-links"
      :aria-label="t.relatedDocs"
    >
      <a :href="withBase(`${localePrefix}/config/routing.html`)">{{
        t.routingDocs
      }}</a>
      <a :href="withBase(`${localePrefix}/config/geodata.html`)">{{
        t.geodataDocs
      }}</a>
      <a :href="sourceDocs" target="_blank" rel="noreferrer noopener">{{
        t.dataSourceDocs
      }}</a>
    </nav>
  </component>
</template>
<style src="./viewer-shared.css"></style>
<style scoped src="./viewer.css"></style>
