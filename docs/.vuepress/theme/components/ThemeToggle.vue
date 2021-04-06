<template>
  <nav class="navbar-links toggle-bar">
    <div class="navbar-links-item">
      <a v-if="enable" class="nav-link" @click.prevent="toggleTheme">{{
        text
      }}</a>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThemeOptions } from "../index";
declare const __LAYOUT__OPTIONS__: ThemeOptions;

export default defineComponent({
  data() {
    return {
      enable: false,
      text: "",
    };
  },
  mounted() {
    this.enable = __LAYOUT__OPTIONS__.enableToggle;
    this.text = __LAYOUT__OPTIONS__.ToggleText;
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
