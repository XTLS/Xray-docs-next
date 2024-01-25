<template>
  <div v-html="payload.innerHtml"></div>
</template>

<script lang="ts">
import { useMutationObserver } from "@vueuse/core";
import {
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  shallowRef,
  watch,
  reactive,
  nextTick,
  toRef
} from "vue";

import { getDarkmodeStatus } from "../../plugins/mermaid/helpers/darkmode.js";

export default defineComponent({
  name: "Mermaid",

  props: {
    id: { type: String, required: true },
    code: { type: String, required: true },
  },

  setup(props) {
    const html = reactive({ innerHtml: "" });

    const chartID = toRef(props, "id");
    const rawGraph = toRef(props, "code");

    const isDarkmode = ref(false);

    const renderMermaid = async (): Promise<void> => {
      const mermaid = await import("mermaid");

      mermaid.default.initialize({
        theme: isDarkmode.value ? "dark" : "default",
        startOnLoad: false,
      });

      mermaid.default.render(chartID.value!, decodeURI(rawGraph.value!)).then(({ svg, bindFunctions }) => {
        html.innerHtml = svg;
      });
    };

    onMounted(() => {
      isDarkmode.value = getDarkmodeStatus()
      nextTick(renderMermaid)
    })

    // watch darkmode change
    if (typeof document !== 'undefined') {
      useMutationObserver(
        document.documentElement,
        () => {
          isDarkmode.value = getDarkmodeStatus();
        },
        {
          attributeFilter: ["class", "data-theme"],
          attributes: true,
        },
      );
    }


    watch(isDarkmode, () => renderMermaid());

    return {
      tag: chartID,
      payload: html
    }

  },
});
</script>

<style scoped></style>

