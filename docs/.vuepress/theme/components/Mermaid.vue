<template>
  <div v-html="payload.innerHtml"></div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  nextTick,
  toRef,
  watch,
  reactive,
} from "vue";
import { useDarkMode } from "@vuepress/theme-default/lib/client";
export default defineComponent({
  name: "Mermaid",
  props: {
    identifier: String,
    graph: String,
  },
  setup(props) {
    const dark = useDarkMode();
    const chartID = toRef(props, "identifier");
    const rawGraph = toRef(props, "graph");
    const html = reactive({ innerHtml: "" });
    onMounted(() => {
      nextTick(async function () {
        const mermaid = await import("mermaid");
        mermaid.default.initialize({
          startOnLoad: false,
          theme: dark.value ? "dark" : "default",
        });
        mermaid.default.render(
          chartID.value!,
          decodeURI(rawGraph.value!)
        ).then(
          ({svg, bindFunctions}) => {
            html.innerHtml = svg;
          }
        );
      });
    });

    watch(dark, async () => {
      const mermaid = await import("mermaid");
      mermaid.default.initialize({
        startOnLoad: false,
        theme: dark.value ? "dark" : "default",
      });
      mermaid.default.render(
        chartID.value!,
        decodeURI(rawGraph.value!)
      ).then(
        ({svg, bindFunctions}) => {
          html.innerHtml = svg;
        }
      );
    });

    return {
      tag: chartID,
      payload: html,
    };
  },
});
</script>

<style scoped></style>
