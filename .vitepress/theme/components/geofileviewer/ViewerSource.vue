<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import type { Messages } from "./messages.mts"
import { presets } from "./sources.mts"
import type {
  SourceDraft,
  ViewerSession,
  ViewerView
} from "./viewerState.mts"
const props = defineProps<{
  draft: Readonly<SourceDraft>
  session: ViewerSession
  view: ViewerView
  embedded: boolean
  canLoad: boolean
  remoteAllowed: boolean
  t: Messages
  locale: string
  progressLabel: string
  loadedSourceName: string
}>()
const emit = defineEmits<{
  sourceChange: [patch: Partial<SourceDraft>]
  load: []
  cancel: []
  close: []
}>()
const source = computed({
  get: () => props.draft.mode,
  set: (value) => emit("sourceChange", { mode: value })
})
const kind = computed({
  get: () => props.draft.kind,
  set: (value) => emit("sourceChange", { kind: value })
})
const presetIndex = computed({
  get: () => props.draft.presetIndex,
  set: (value) => emit("sourceChange", { presetIndex: value })
})
const url = computed({
  get: () => props.draft.url,
  set: (value) => emit("sourceChange", { url: value })
})
const file = computed(() => props.draft.file)
const currentName = computed(() =>
  props.session.loaded
    ? props.t.loadedSource + props.loadedSourceName
    : loading.value
      ? props.progressLabel
      : props.t.noLoadedSource
)
const tabs = computed(() => [
  ...(props.remoteAllowed
    ? [
        { id: "preset" as const, label: props.t.preset },
        { id: "url" as const, label: props.t.url }
      ]
    : []),
  { id: "local" as const, label: props.t.local }
])
const loading = computed(() => props.session.status === "loading")
const fileInput = ref<HTMLInputElement>()
const sourcePanel = ref<HTMLElement>()
const dragging = ref(false)
const number = (value: number) => value.toLocaleString(props.locale)
const load = () => emit("load")
const stop = () => emit("cancel")
const closeSource = () => emit("close")
function pick(event: Event) {
  const selected = (event.target as HTMLInputElement).files?.[0]
  if (selected) emit("sourceChange", { file: selected })
}
function drop(event: DragEvent) {
  dragging.value = false
  emit("sourceChange", { file: event.dataTransfer?.files[0] })
}
watch(
  () => [props.view.workspace, props.view.sourceOpen],
  async () => {
    await nextTick()
    const panel = sourcePanel.value
    if (!(panel instanceof HTMLDialogElement)) return
    if (props.view.sourceOpen && !panel.open) panel.showModal()
    else if (!props.view.sourceOpen && panel.open) panel.close()
  },
  { flush: "post" }
)
</script>
<template>
  <component
    :is="view.workspace ? 'dialog' : 'section'"
    ref="sourcePanel"
    class="geo-source geo-panel"
    :class="{
      'geo-source-dialog': view.workspace,
      'is-embedded-source': embedded
    }"
    aria-labelledby="geo-source-title"
    @cancel.stop.prevent="closeSource"
    @close="emit('close')"
  >
    <div class="geo-panel-heading">
      <h2 id="geo-source-title">{{ t.source }}</h2>
      <button
        v-if="view.workspace"
        class="geo-text-button"
        @click="closeSource"
      >
        {{ t.cancel }}
      </button>
    </div>
    <p
      v-if="view.workspace"
      class="geo-summary geo-source-current"
      :title="currentName"
    >
      {{ currentName }}
    </p>
    <template v-if="view.sourceOpen">
      <div class="geo-tabs" :aria-label="t.source">
        <button
          v-for="tab in tabs"
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
          <span class="geo-preset-content"
            ><strong>{{ name }}</strong
            ><small
              class="geo-preset-description"
              :title="t.presetDescriptions[index]"
              >{{ t.presetDescriptions[index] }}</small
            ><small
              class="geo-preset-source"
              :title="`${t.presetDelivery} ${presets[index].file}`"
              ><span
                class="vpi-simple-icons-github"
                role="img"
                aria-label="GitHub"
              />
              <span class="geo-preset-source-text">{{
                `${t.presetDelivery} ${presets[index].file}`
              }}</span></small
            ></span
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
          @cancel.stop
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
          class="geo-button primary geo-load-button"
          :disabled="!loading && !canLoad"
          @click="loading ? stop() : load()"
        >
          <span>{{
            loading ? t.cancelLoad : session.error ? t.retry : t.load
          }}</span>
          <span class="geo-load-measure" aria-hidden="true">{{
            t.cancelLoad
          }}</span>
        </button>
        <div
          class="geo-source-status"
          :class="{ 'is-error': session.error }"
          :role="session.error ? 'alert' : 'status'"
          aria-atomic="true"
        >
          <span v-if="loading">
            {{ progressLabel }}
            <template v-if="session.progress !== undefined">
              · {{ Math.round(session.progress * 100) }}%</template
            >
            <template v-if="session.downloadedBytes">
              ·
              {{
                (session.downloadedBytes / 1048576).toLocaleString(
                  locale,
                  { maximumFractionDigits: 1 }
                )
              }}
              MiB</template
            >
          </span>
          <span v-else-if="session.error">{{
            t.errors[session.error]
          }}</span>
        </div>
        <progress
          v-if="loading"
          class="geo-source-progress"
          :value="session.progress"
          max="1"
          :aria-label="progressLabel"
        />
      </div>
    </template>
  </component>
</template>
<style scoped src="./source.css"></style>
