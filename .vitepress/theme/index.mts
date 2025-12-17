// Given from https://vitepress.dev/guide/extending-default-theme

import DefaultTheme from "vitepress/theme";

import "./style/index.css";

import mediumZoom from "medium-zoom";
import { onMounted, watch, nextTick } from "vue";
import { useRoute } from "vitepress";

import { h } from "vue";
import PageContributors from "./components/PageContributors.vue";

export default {
  extends: DefaultTheme,

  setup() {
    const route = useRoute();
    const initZoom = () => {
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' }); // default
      mediumZoom(".main img", { background: "var(--vp-c-bg)" }); // Enable this feature for all images unless {data-zoomable} is explicitly added.
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },

  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-after": () => h(PageContributors),
    });
  },
};
