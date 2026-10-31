<script setup lang="ts">
import { computed, ref } from "vue"
import { useData, withBase } from "vitepress"
import { useViewer } from "./useViewer.mts"
import { getMessages } from "./messages.mts"
import { highlightParts } from "./presentation.mts"
import { usePermalink } from "./usePermalink.mts"

const viewer = useViewer()
const {
  source,
  sourceOpen,
  kind,
  file,
  presetIndex,
  url,
  canLoad,
  loaded,
  loading,
  progress,
  phase,
  downloadedBytes,
  error,
  query,
  activeQuery,
  searching,
  entriesLoading,
  categories,
  categoryCount,
  entryCount,
  categoryPage,
  entryPage,
  selected,
  entries,
  entryTotal,
  mobileDetail,
  categoryMissing,
  categoryPages,
  entryPages,
  visibleCategories,
  load,
  stop,
  select
} = viewer
const { permalink, invalidLink, copyStatus, copy } = usePermalink(viewer)
const fileInput = ref<HTMLInputElement>()
const dragging = ref(false)
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

function pick(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0]
}
function drop(event: DragEvent) {
  dragging.value = false
  file.value = event.dataTransfer?.files[0]
}
</script>

<template>
  <main class="geo-viewer">
    <header class="geo-heading">
      <p class="geo-eyebrow">PROJECT X / TOOLS</p>
      <h1>{{ t.title }}</h1>
      <p>{{ t.description }}</p>
    </header>
    <section class="geo-source geo-panel" :aria-label="t.source">
      <div class="geo-panel-heading">
        <h2>{{ t.source }}</h2>
        <button
          v-if="loaded"
          class="geo-text-button"
          :aria-expanded="sourceOpen"
          @click="sourceOpen = !sourceOpen"
        >
          {{ sourceOpen ? t.collapse : t.changeSource }}
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
    </section>
    <div v-if="invalidLink" class="geo-notice error" role="alert">
      {{ t.invalidPreset }}
    </div>
    <div v-if="categoryMissing" class="geo-notice" role="status">
      {{ t.missingCategory }}: {{ categoryMissing }}
    </div>
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
    <template v-if="loaded">
      <div class="geo-toolbar">
        <label class="geo-sr-only" for="geo-search">{{ t.search }}</label>
        <input
          id="geo-search"
          v-model="query"
          type="search"
          class="geo-search"
          :placeholder="t.search"
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
          <h2 class="geo-list-title">{{ t.categories }}</h2>
          <ul class="geo-category-list">
            <li v-for="category in visibleCategories" :key="category.id">
              <button
                class="geo-category"
                :aria-current="
                  selected?.id === category.id ? 'true' : undefined
                "
                @click="select(category.id)"
              >
                <span>{{ category.code }}</span
                ><small>{{ number(category.matches) }}</small>
              </button>
            </li>
          </ul>
          <p
            v-if="!categories.length && !searching"
            class="geo-no-results"
          >
            {{ t.noResults }}
          </p>
          <nav class="geo-pagination" :aria-label="t.categories">
            <button
              :disabled="categoryPage <= 1 || searching"
              @click="categoryPage--"
            >
              {{ t.previous }}</button
            ><span>{{ categoryPage }} / {{ categoryPages }}</span
            ><button
              :disabled="categoryPage >= categoryPages || searching"
              @click="categoryPage++"
            >
              {{ t.next }}
            </button>
          </nav>
        </aside>
        <section
          class="geo-content"
          :aria-label="t.entries"
          :aria-busy="entriesLoading"
        >
          <header class="geo-content-header">
            <button class="geo-back" @click="mobileDetail = false">
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
          <p
            v-if="searching || entriesLoading"
            class="geo-no-results"
            role="status"
          >
            {{ searching ? t.searching : t.reading }}
          </p>
          <ul v-else class="geo-entries">
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
                      activeQuery
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
          </ul>
          <p
            v-if="!entries.length && !entriesLoading && !searching"
            class="geo-no-results"
          >
            {{ t.noResults }}
          </p>
          <nav class="geo-pagination" :aria-label="t.entries">
            <button
              :disabled="entryPage <= 1 || searching || entriesLoading"
              @click="entryPage--"
            >
              {{ t.previous }}</button
            ><span>{{ entryPage }} / {{ entryPages }}</span
            ><button
              :disabled="
                entryPage >= entryPages || searching || entriesLoading
              "
              @click="entryPage++"
            >
              {{ t.next }}
            </button>
          </nav>
        </section>
      </section>
    </template>
    <section v-else-if="!loading" class="geo-empty geo-panel">
      <span class="geo-empty-icon" aria-hidden="true">{ }</span>
      <h2>{{ t.emptyTitle }}</h2>
      <p>{{ t.emptyBody }}</p>
    </section>
    <p class="geo-help">{{ t.help }}</p>
    <nav class="geo-links" :aria-label="t.relatedDocs">
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
  </main>
</template>

<style scoped src="./viewer.css"></style>
