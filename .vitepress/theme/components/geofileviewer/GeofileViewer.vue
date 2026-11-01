<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useData, withBase } from "vitepress"
import { useViewer } from "./useViewer.mts"
import { getMessages } from "./messages.mts"
import { highlightParts } from "./presentation.mts"
import { usePermalink } from "./usePermalink.mts"
import { useInfiniteScroll } from "./useInfiniteScroll.mts"
import SearchInput from "./SearchInput.vue"

const props = defineProps<{ popupUrl?: string }>()
const embedded = computed(() => props.popupUrl !== undefined)
const viewer = useViewer()
const { actions, canLoad } = viewer
const source = computed({
  get: () => viewer.draft.mode,
  set: (value) => actions.updateSource({ mode: value })
})
const kind = computed({
  get: () => viewer.draft.kind,
  set: (value) => actions.updateSource({ kind: value })
})
const file = computed({
  get: () => viewer.draft.file,
  set: (value) => actions.updateSource({ file: value })
})
const presetIndex = computed({
  get: () => viewer.draft.presetIndex,
  set: (value) => actions.updateSource({ presetIndex: value })
})
const url = computed({
  get: () => viewer.draft.url,
  set: (value) => actions.updateSource({ url: value })
})
const loaded = computed(() => viewer.session.loaded)
const phase = computed(() => viewer.session.phase)
const progress = computed(() => viewer.session.progress)
const downloadedBytes = computed(() => viewer.session.downloadedBytes)
const error = computed(() => viewer.session.error)
const categoryCount = computed(() => viewer.session.categoryCount)
const entryCount = computed(() => viewer.session.entryCount)
const workspace = computed(() => viewer.view.workspace)
const sourceOpen = computed({
  get: () => viewer.view.sourceOpen,
  set: (value) => (value ? actions.openSource() : actions.closeSource())
})
const mobileDetail = computed(() => viewer.view.mobileDetail)
const contentQuery = computed({
  get: () => viewer.query.content,
  set: actions.setContentQuery
})
const activeContentQuery = computed(() => viewer.query.activeContent)
const categoryQuery = computed({
  get: () => viewer.query.category,
  set: actions.setCategoryFilter
})
const attributeKey = computed(() => viewer.query.attribute)
const searching = computed(() => viewer.query.searching)
const loading = computed(() => viewer.session.status === "loading")
const categories = computed(() => viewer.results.value.categories)
const visibleCategories = computed(
  () => viewer.results.value.visibleCategories
)
const selected = computed(() => viewer.results.value.selected)
const entries = computed(() => viewer.results.value.entries)
const entryTotal = computed(() => viewer.results.value.entryTotal)
const entriesLoading = computed(() => viewer.results.value.entriesLoading)
const hasMoreCategories = computed(
  () => viewer.results.value.hasMoreCategories
)
const hasMoreEntries = computed(() => viewer.results.value.hasMoreEntries)
const categoryMissing = computed(
  () => viewer.results.value.categoryMissing
)
const load = actions.loadSource
const stop = actions.dispose
const select = actions.selectCategory
const setAttribute = actions.setAttribute
const loadMoreCategories = actions.loadMoreCategories
const loadMoreEntries = actions.loadMoreEntries
const { permalink, invalidLink, copyStatus, copy } = usePermalink(
  viewer,
  props.popupUrl
)
const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)
const categoryList = ref<HTMLElement>()
const entryList = ref<HTMLElement>()
const checkCategories = useInfiniteScroll(
  categoryList,
  loadMoreCategories,
  [() => visibleCategories.value.length, searching, mobileDetail]
)
const checkEntries = useInfiniteScroll(entryList, loadMoreEntries, [
  () => entries.value.length,
  entriesLoading,
  searching,
  mobileDetail
])

function revealCategory() {
  const list = categoryList.value
  const active = list?.querySelector<HTMLElement>('[aria-current="true"]')
  if (!list?.clientHeight || !active) return
  const listRect = list.getBoundingClientRect()
  const itemRect = active.getBoundingClientRect()
  if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom)
    list.scrollTop +=
      itemRect.top -
      listRect.top -
      (list.clientHeight - itemRect.height) / 2
}
watch(
  categories,
  async () => {
    await nextTick()
    if (categoryList.value) categoryList.value.scrollTop = 0
    revealCategory()
  },
  { flush: "post" }
)
watch(
  [selected, activeContentQuery, attributeKey],
  () => {
    if (entryList.value) entryList.value.scrollTop = 0
  },
  { flush: "post" }
)
watch(mobileDetail, async (detail) => {
  if (!detail) {
    await nextTick()
    revealCategory()
  }
})
const { lang } = useData()
const t = computed(() => getMessages(lang.value))
const localePrefix = computed(() =>
  /^(en|ru)(-|$)/i.test(lang.value)
    ? `/${lang.value.split("-")[0].toLowerCase()}`
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
    })[phase.value]
)
const number = (value: number) => value.toLocaleString(lang.value)
const sourcePanel = ref<HTMLElement>()
const sourceSummary = computed(() =>
  loaded.value
    ? `${loaded.value.name} · ${loaded.value.kind === "geoip" ? "GeoIP" : "GeoSite"} · ${number(categoryCount.value)} ${t.value.categories} · ${number(entryCount.value)} ${t.value.entries}`
    : loading.value
      ? progressLabel.value
      : t.value.emptyTitle
)

watch(
  [workspace, sourceOpen],
  async () => {
    await nextTick()
    const panel = sourcePanel.value
    if (!(panel instanceof HTMLDialogElement)) return
    if (sourceOpen.value && !panel.open) panel.showModal()
    else if (!sourceOpen.value && panel.open) panel.close()
  },
  { flush: "post" }
)

function closeSource() {
  if (loading.value) stop()
  sourceOpen.value = false
}
function closeDocsOnBlur(event: FocusEvent) {
  const details = event.currentTarget as HTMLDetailsElement
  if (!details.contains(event.relatedTarget as Node | null))
    details.open = false
}

function pick(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0]
}
function drop(event: DragEvent) {
  dragging.value = false
  file.value = event.dataTransfer?.files[0]
}
</script>

<template>
  <component
    :is="embedded ? 'section' : 'main'"
    class="geo-viewer"
    :class="{ 'is-workspace': workspace, 'is-embedded': embedded }"
  >
    <header v-if="!workspace && !embedded" class="geo-heading">
      <p class="geo-eyebrow">PROJECT X / TOOLS</p>
      <h1>{{ t.title }}</h1>
      <p>{{ t.description }}</p>
    </header>
    <header
      v-else-if="workspace"
      class="geo-workspace-bar geo-source geo-panel"
    >
      <div class="geo-workspace-title">
        <h1 v-if="!embedded">{{ t.title }}</h1>
        <p class="geo-summary" :title="sourceSummary">
          {{ sourceSummary
          }}<template v-if="loading && progress !== undefined">
            · {{ Math.round(progress * 100) }}%</template
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
          v-if="loading && !sourceOpen"
          class="geo-button"
          @click="stop"
        >
          {{ t.cancel }}
        </button>
        <button
          class="geo-button"
          aria-haspopup="dialog"
          @click="sourceOpen = true"
        >
          {{ t.changeSource }}
        </button>
      </div>
    </header>
    <component
      :is="workspace ? 'dialog' : 'section'"
      ref="sourcePanel"
      class="geo-source geo-panel"
      :class="{ 'geo-source-dialog': workspace }"
      aria-labelledby="geo-source-title"
      @cancel="closeSource"
      @close="sourceOpen = false"
    >
      <div class="geo-panel-heading">
        <h2 id="geo-source-title">{{ t.source }}</h2>
        <button
          v-if="workspace"
          class="geo-text-button"
          @click="closeSource"
        >
          {{ t.cancel }}
        </button>
      </div>
      <p v-if="loaded" class="geo-summary">
        {{ loaded.name }} ·
        {{ loaded.kind === "geoip" ? "GeoIP" : "GeoSite" }} ·
        {{ number(categoryCount) }} {{ t.categories }} ·
        {{ number(entryCount) }} {{ t.entries }}
      </p>
      <template v-if="sourceOpen">
        <div class="geo-tabs" :aria-label="t.source">
          <button
            v-for="tab in [
              { id: 'preset', label: t.preset },
              { id: 'url', label: t.url },
              { id: 'local', label: t.local }
            ]"
            :key="tab.id"
            :aria-pressed="source === tab.id"
            @click="source = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
        <div v-if="source === 'preset'" class="geo-presets">
          <label
            v-for="(name, index) in t.presetNames"
            :key="index"
            class="geo-preset"
          >
            <input
              v-model="presetIndex"
              type="radio"
              name="geo-preset"
              :value="index"
            />
            <span
              ><strong>{{ name }}</strong
              ><small>{{ t.presetDescriptions[index] }}</small></span
            >
          </label>
        </div>
        <div v-else-if="source === 'url'" class="geo-field">
          <label for="geo-url">{{ t.fileUrl }}</label>
          <input
            id="geo-url"
            v-model="url"
            type="url"
            placeholder="https://example.com/geosite.dat"
          />
        </div>
        <div
          v-if="source !== 'preset'"
          class="geo-type"
          role="group"
          :aria-label="t.fileType"
        >
          <label
            ><input
              v-model="kind"
              type="radio"
              value="geosite"
              name="geo-kind"
            />GeoSite</label
          >
          <label
            ><input
              v-model="kind"
              type="radio"
              value="geoip"
              name="geo-kind"
            />GeoIP</label
          >
        </div>
        <div
          v-if="source === 'local'"
          class="geo-dropzone"
          :class="{ dragging }"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="drop"
        >
          <strong>{{ t.drop }}</strong>
          <p>{{ t.privacy }}</p>
          <input
            ref="fileInput"
            class="geo-sr-only"
            type="file"
            accept=".dat,.gz"
            :aria-label="t.browse"
            @change="pick"
          />
          <button class="geo-button" @click="fileInput?.click()">
            {{ t.browse }}
          </button>
          <span v-if="file" class="geo-file-name"
            >{{ file.name }} · {{ number(file.size) }} B</span
          >
        </div>
        <div class="geo-source-actions">
          <button
            class="geo-button primary"
            :disabled="!canLoad || loading"
            @click="load()"
          >
            {{ t.load }}
          </button>
        </div>
      </template>
      <div v-if="error" class="geo-notice error" role="alert">
        {{ t.errors[error] }}
        <button class="geo-button" :disabled="!canLoad" @click="load()">
          {{ t.retry }}
        </button>
      </div>
      <div v-if="loading" class="geo-notice geo-progress" role="status">
        <span
          >{{ progressLabel
          }}<template v-if="progress !== undefined">
            · {{ Math.round(progress * 100) }}%</template
          ><template v-if="downloadedBytes">
            ·
            {{
              (downloadedBytes / 1048576).toLocaleString(lang, {
                maximumFractionDigits: 1
              })
            }}
            MiB</template
          ></span
        >
        <progress :value="progress" max="1" :aria-label="progressLabel" />
        <button class="geo-button" @click="stop">{{ t.cancel }}</button>
      </div>
    </component>
    <div v-if="invalidLink" class="geo-notice error" role="alert">
      {{ t.invalidLink }}
    </div>
    <div v-if="categoryMissing" class="geo-notice" role="status">
      {{ t.missingCategory }}: {{ categoryMissing }}
    </div>
    <template v-if="loaded">
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
          searching
            ? t.searching
            : `${number(categories.length)} ${t.categories}`
        }}</span>
      </div>
      <section
        class="geo-browser geo-panel"
        :class="{ 'show-detail': mobileDetail }"
        :aria-busy="searching"
      >
        <aside class="geo-categories" :aria-label="t.categories">
          <div class="geo-category-header">
            <h2 class="geo-list-title">{{ t.categories }}</h2>
            <label class="geo-sr-only" for="geo-category-search">{{
              t.categorySearch
            }}</label>
            <SearchInput
              id="geo-category-search"
              v-model="categoryQuery"
              :placeholder="t.categorySearch"
              :clear-label="t.clearCategorySearch"
            />
          </div>
          <ul
            ref="categoryList"
            class="geo-category-list"
            tabindex="0"
            :aria-label="t.categories"
            @scroll.passive="checkCategories"
          >
            <li v-for="category in visibleCategories" :key="category.id">
              <button
                class="geo-category"
                :disabled="searching"
                :aria-current="
                  selected?.id === category.id ? 'true' : undefined
                "
                @click="select(category.id)"
              >
                <span
                  ><template
                    v-for="(part, partIndex) in highlightParts(
                      category.code,
                      categoryQuery
                    )"
                    :key="partIndex"
                    ><mark v-if="part.match">{{ part.text }}</mark
                    ><span v-else>{{ part.text }}</span></template
                  ></span
                ><small>{{ number(category.matches) }}</small>
              </button>
            </li>
            <li class="geo-list-status" role="status">
              <template v-if="searching">{{ t.searching }}</template>
              <template v-else-if="!categories.length">{{
                t.noResults
              }}</template>
              <template v-else
                >{{ hasMoreCategories ? t.scrollForMore : t.allLoaded }} ·
                {{ number(visibleCategories.length) }} /
                {{ number(categories.length) }}</template
              >
            </li>
          </ul>
        </aside>
        <section
          class="geo-content"
          :aria-label="t.entries"
          :aria-busy="entriesLoading"
        >
          <header class="geo-content-header">
            <button class="geo-back" @click="actions.showCategories()">
              {{ t.back }}
            </button>
            <div>
              <h2>{{ selected?.code ?? t.chooseCategory }}</h2>
              <p v-if="selected">
                {{ number(entryTotal) }} {{ t.matches }} /
                {{ number(selected.count) }} {{ t.entries
                }}<span v-if="selected.reverseMatch">
                  · {{ t.reverseMatch }}</span
                >
              </p>
            </div>
            <button v-if="permalink" class="geo-text-button" @click="copy">
              {{ copyStatus === "copied" ? t.copied : t.copyLink }}
            </button>
          </header>
          <div
            v-if="
              loaded.kind === 'geosite' &&
              selected?.attributes.length &&
              !searching
            "
            class="geo-attribute-filter"
          >
            <label for="geo-attribute">{{ t.attributeFilter }}</label>
            <select
              id="geo-attribute"
              :value="attributeKey"
              @change="
                setAttribute(($event.target as HTMLSelectElement).value)
              "
            >
              <option value="">{{ t.allAttributes }}</option>
              <option
                v-for="attribute in selected.attributes"
                :key="attribute.key"
                :value="attribute.key"
              >
                @{{ attribute.key }} ({{ number(attribute.count) }})
              </option>
            </select>
          </div>
          <div
            v-if="copyStatus === 'copyFailed'"
            class="geo-field geo-copy-fallback"
            role="status"
          >
            <label for="geo-copy">{{ t.copyFailed }}</label
            ><input
              id="geo-copy"
              readonly
              :value="permalink"
              @focus="($event.target as HTMLInputElement).select()"
            />
          </div>
          <ul
            ref="entryList"
            class="geo-entries"
            tabindex="0"
            :aria-label="t.entries"
            @scroll.passive="checkEntries"
          >
            <li
              v-for="(entry, index) in entries"
              :key="index"
              class="geo-entry"
            >
              <span class="geo-badge">{{ entry.type }}</span>
              <div class="geo-entry-data">
                <code
                  ><template
                    v-for="(part, partIndex) in highlightParts(
                      entry.value,
                      activeContentQuery
                    )"
                    :key="partIndex"
                    ><mark v-if="part.match">{{ part.text }}</mark
                    ><span v-else>{{ part.text }}</span></template
                  ></code
                >
                <div v-if="entry.attributes.length" class="geo-attributes">
                  <span
                    v-for="(attribute, attrIndex) in entry.attributes"
                    :key="attrIndex"
                    >@{{ attribute.key
                    }}<template v-if="attribute.value !== undefined"
                      >={{ attribute.value }}</template
                    ></span
                  >
                </div>
              </div>
            </li>
            <li class="geo-list-status" role="status">
              <template v-if="searching">{{ t.searching }}</template>
              <template v-else-if="entriesLoading">{{
                t.reading
              }}</template>
              <template v-else-if="!entries.length">{{
                t.noResults
              }}</template>
              <template v-else
                >{{ hasMoreEntries ? t.scrollForMore : t.allLoaded }} ·
                {{ number(entries.length) }} /
                {{ number(entryTotal) }}</template
              >
            </li>
          </ul>
        </section>
      </section>
    </template>
    <section v-else-if="!loading" class="geo-empty geo-panel">
      <span class="geo-empty-icon" aria-hidden="true">{ }</span>
      <h2>{{ t.emptyTitle }}</h2>
      <p>{{ t.emptyBody }}</p>
    </section>
    <nav v-if="!workspace" class="geo-links" :aria-label="t.relatedDocs">
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

<style scoped src="./viewer.css"></style>
