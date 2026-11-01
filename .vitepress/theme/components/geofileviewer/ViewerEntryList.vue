<script setup lang="ts">
import { ref, watch } from "vue"
import type { Messages } from "./messages.mts"
import type {
  ViewerResults,
  ViewerQuery,
  ViewerView
} from "./viewerState.mts"
import { highlightParts } from "./presentation.mts"
import { useInfiniteScroll } from "./useInfiniteScroll.mts"
const props = defineProps<{
  results: ViewerResults
  query: ViewerQuery
  view: ViewerView
  t: Messages
  locale: string
  sharing: { permalink: string; copyStatus: "" | "copied" | "copyFailed" }
}>()
const emit = defineEmits<{
  attribute: [value: string]
  categories: []
  copy: []
  loadMore: []
}>()
const entryList = ref<HTMLElement>()
const number = (value: number) => value.toLocaleString(props.locale)
const setAttribute = (key: string) => emit("attribute", key)
const copy = () => emit("copy")
const checkEntries = useInfiniteScroll(entryList, () => emit("loadMore"), [
  () => props.results.entries.length,
  () => props.results.entriesLoading,
  () => props.query.searching,
  () => props.view.mobileDetail
])
watch(
  [
    () => props.results.selected,
    () => props.query.activeContent,
    () => props.query.attribute
  ],
  () => {
    if (entryList.value) entryList.value.scrollTop = 0
  },
  { flush: "post" }
)
</script>
<template>
  <section
    class="geo-content"
    :aria-label="t.entries"
    :aria-busy="query.searching || results.entriesLoading"
  >
    <header class="geo-content-header">
      <button class="geo-back" @click="emit('categories')">
        {{ t.back }}
      </button>
      <div v-if="results.selected">
        <h2>{{ results.selected.code }}</h2>
        <p>
          {{ number(results.entryTotal) }} {{ t.matches }} /
          {{ number(results.selected.count) }} {{ t.entries
          }}<span v-if="results.selected.reverseMatch">
            · {{ t.reverseMatch }}</span
          >
        </p>
      </div>
      <button
        v-if="sharing.permalink"
        class="geo-text-button"
        @click="copy"
      >
        {{ sharing.copyStatus === "copied" ? t.copied : t.copyLink }}
      </button>
    </header>
    <div
      v-if="results.selected?.attributes.length && !query.searching"
      class="geo-attribute-filter"
    >
      <label for="geo-attribute">{{ t.attributeFilter }}</label>
      <select
        id="geo-attribute"
        :value="query.attribute"
        @change="setAttribute(($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t.allAttributes }}</option>
        <option
          v-for="attribute in results.selected.attributes"
          :key="attribute.key"
          :value="attribute.key"
        >
          @{{ attribute.key }} ({{ number(attribute.count) }})
        </option>
      </select>
    </div>
    <div
      v-if="sharing.permalink && sharing.copyStatus === 'copyFailed'"
      class="geo-field geo-copy-fallback"
      role="status"
    >
      <label for="geo-copy">{{ t.copyFailed }}</label
      ><input
        id="geo-copy"
        readonly
        :value="sharing.permalink"
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
        v-for="(entry, index) in results.entries"
        :key="index"
        class="geo-entry"
      >
        <span class="geo-badge">{{ entry.type }}</span>
        <div class="geo-entry-data">
          <code
            ><template
              v-for="(part, partIndex) in highlightParts(
                entry.value,
                query.activeContent,
                entry.type === 'IPv4' || entry.type === 'IPv6'
                  ? query.ipMode === 'ip'
                    ? 'whole'
                    : 'prefix'
                  : 'contains'
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
      <li v-if="!query.error" class="geo-list-status" role="status">
        <template v-if="query.searching">{{ t.searching }}</template>
        <template v-else-if="results.entriesLoading">{{
          t.reading
        }}</template>
        <template v-else-if="!results.entries.length">{{
          t.noResults
        }}</template>
        <template v-else
          >{{ results.hasMoreEntries ? t.scrollForMore : t.allLoaded }} ·
          {{ number(results.entries.length) }} /
          {{ number(results.entryTotal) }}</template
        >
      </li>
    </ul>
  </section>
</template>
<style scoped src="./entries.css"></style>
