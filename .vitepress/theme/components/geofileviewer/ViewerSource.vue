<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import type { Messages } from "./messages.mts"
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
    <p v-if="session.loaded" class="geo-summary">
      {{ session.loaded.name }} ·
      {{ session.loaded.kind === "geoip" ? "GeoIP" : "GeoSite" }} ·
      {{ number(session.categoryCount) }} {{ t.categories }} ·
      {{ number(session.entryCount) }} {{ t.entries }}
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
          class="geo-button primary"
          :disabled="!canLoad || loading"
          @click="load()"
        >
          {{ t.load }}
        </button>
      </div>
    </template>
    <div v-if="session.error" class="geo-notice error" role="alert">
      {{ t.errors[session.error] }}
      <button class="geo-button" :disabled="!canLoad" @click="load()">
        {{ t.retry }}
      </button>
    </div>
    <div v-if="loading" class="geo-notice geo-progress" role="status">
      <span
        >{{ progressLabel
        }}<template v-if="session.progress !== undefined">
          · {{ Math.round(session.progress * 100) }}%</template
        ><template v-if="session.downloadedBytes">
          ·
          {{
            (session.downloadedBytes / 1048576).toLocaleString(locale, {
              maximumFractionDigits: 1
            })
          }}
          MiB</template
        ></span
      >
      <progress
        :value="session.progress"
        max="1"
        :aria-label="progressLabel"
      />
      <button class="geo-button" @click="stop">{{ t.cancel }}</button>
    </div>
  </component>
</template>
<style scoped src="./source.css"></style>
