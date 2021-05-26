<template>
  <nav v-if="enable" class="navbar-links toggle-bar">
    <div class="navbar-links-item">
      <a class="nav-link" @click.prevent="toggleTheme">{{ text }}</a>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useThemeLocaleData } from "@vuepress/plugin-theme-data/lib/client";
import { ToggleOptions } from "../types";

export default defineComponent({
  computed: {
    enable: function (): Boolean {
      const option = useThemeLocaleData<ToggleOptions>();
      return option.value.enableToggle;
    },
    text: function (): String {
      const option = useThemeLocaleData<ToggleOptions>();
      return option.value.ToggleText;
    },
  },
  methods: {
    toggleTheme() {
      const html = document.getElementsByTagName("html")[0];

      let theme = html.getAttribute("theme");
      if (theme == "light") {
        html.setAttribute("theme", "dark");
      } else if (theme == "dark") {
        html.setAttribute("theme", "light");
      } else {
        html.setAttribute("theme", "light");
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.toggle-bar {
  margin-left: 1.5rem;
}
</style>
