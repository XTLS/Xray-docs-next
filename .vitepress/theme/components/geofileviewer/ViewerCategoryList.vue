<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import type { Messages } from "./messages.mts"
import type {
  ViewerResults,
  ViewerQuery,
  ViewerView
} from "./viewerState.mts"
import { highlightParts } from "./presentation.mts"
import { useInfiniteScroll } from "./useInfiniteScroll.mts"
import SearchInput from "./SearchInput.vue"
const props = defineProps<{
  results: ViewerResults
  query: ViewerQuery
  view: ViewerView
  t: Messages
  locale: string
}>()
const emit = defineEmits<{
  filter: [value: string]
  select: [id: number]
  loadMore: []
}>()
const filter = computed({
  get: () => props.query.category,
  set: (value) => emit("filter", value)
})
const categoryList = ref<HTMLElement>()
const number = (value: number) => value.toLocaleString(props.locale)
const select = (id: number) => emit("select", id)
const checkCategories = useInfiniteScroll(
  categoryList,
  () => emit("loadMore"),
  [
    () => props.results.visibleCategories.length,
    () => props.query.searching,
    () => props.view.mobileDetail
  ]
)
function revealCategory() {
  const list = categoryList.value
  const active = list?.querySelector<HTMLElement>('[aria-current="true"]')
  if (!list?.clientHeight || !active) return
  const listRect = list.getBoundingClientRect(),
    itemRect = active.getBoundingClientRect()
  if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom)
    list.scrollTop +=
      itemRect.top -
      listRect.top -
      (list.clientHeight - itemRect.height) / 2
}
watch(
  () => props.results.categories,
  async () => {
    await nextTick()
    if (categoryList.value) categoryList.value.scrollTop = 0
    revealCategory()
  },
  { flush: "post" }
)
watch(
  () => props.view.mobileDetail,
  async (detail) => {
    if (!detail) {
      await nextTick()
      revealCategory()
    }
  }
)
</script>
<template>
  <aside class="geo-categories" :aria-label="t.categories">
    <div class="geo-category-header">
      <h2 class="geo-list-title">{{ t.categories }}</h2>
      <label class="geo-sr-only" for="geo-category-search">{{
        t.categorySearch
      }}</label>
      <SearchInput
        id="geo-category-search"
        v-model="filter"
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
      <li v-for="category in results.visibleCategories" :key="category.id">
        <button
          class="geo-category"
          :disabled="query.searching"
          :aria-current="
            results.selected?.id === category.id ? 'true' : undefined
          "
          @click="select(category.id)"
        >
          <span
            ><template
              v-for="(part, partIndex) in highlightParts(
                category.code,
                filter
              )"
              :key="partIndex"
              ><mark v-if="part.match">{{ part.text }}</mark
              ><span v-else>{{ part.text }}</span></template
            ></span
          ><small>{{ number(category.matches) }}</small>
        </button>
      </li>
      <li class="geo-list-status" role="status">
        <template v-if="query.searching">{{ t.searching }}</template>
        <template v-else-if="!results.categories.length">{{
          t.noResults
        }}</template>
        <template v-else
          >{{
            results.hasMoreCategories ? t.scrollForMore : t.allLoaded
          }}
          · {{ number(results.visibleCategories.length) }} /
          {{ number(results.categories.length) }}</template
        >
      </li>
    </ul>
  </aside>
</template>
<style scoped src="./categories.css"></style>
