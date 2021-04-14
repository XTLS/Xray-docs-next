<template>
  <ParentLayout>
    <template v-slot:navbar-after>
      <ThemeToggle />
    </template>
  </ParentLayout>
</template>

<script lang="ts">
import ParentLayout from "@vuepress/theme-default/lib/client/layouts/Layout.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import { defineComponent } from "vue";

export default defineComponent({
  components: {
    ParentLayout,
    ThemeToggle,
  },
  beforeMount() {
    function setTheme(newTheme) {
      const html = document.getElementsByTagName("html")[0];
      html.setAttribute("theme", newTheme);
    }
    var dark = window.matchMedia("(prefers-color-scheme: dark)");
    dark.addEventListener("change", (e) => {
      setTheme(e.matches ? "dark" : "light");
    });
    setTheme(dark.matches ? "dark" : "light");
  },
});
</script>
