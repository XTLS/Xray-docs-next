<script setup lang="ts">
import { ref } from "vue"

defineProps<{ id: string; placeholder: string; clearLabel: string }>()
const model = defineModel<string>({ required: true })
const input = ref<HTMLInputElement>()

function clear() {
  model.value = ""
  input.value?.focus({ preventScroll: true })
}
</script>

<template>
  <div class="geo-search-field">
    <slot name="prefix" />
    <input
      :id="id"
      ref="input"
      v-model="model"
      type="search"
      class="geo-search"
      :placeholder="placeholder"
    />
    <button
      v-if="model"
      type="button"
      class="geo-search-clear"
      :aria-label="clearLabel"
      :title="clearLabel"
      @click="clear"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          fill-rule="evenodd"
          d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59Z"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.geo-search-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  width: 100%;
  min-width: 0;
  font-size: 14px;
  border: 1px solid var(--geo-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.geo-search {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 9px 40px 9px 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-text-1);
}
.geo-search::-webkit-search-cancel-button,
.geo-search::-webkit-search-decoration {
  display: none;
}
.geo-search-clear {
  position: absolute;
  top: 50%;
  right: 4px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  transform: translateY(-50%);
  border-radius: 50%;
  color: var(--vp-c-text-2);
  cursor: pointer;
}
.geo-search-clear:hover {
  color: var(--vp-c-text-1);
}
.geo-search:focus-visible {
  outline: none;
}
.geo-search-field:focus-within,
.geo-search-clear:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}
</style>
