<template>
  <div>
    <ParentNavLinks />
    <nav class="nav-links">
      <a v-if="enable" class="nav-link" @click.prevent="toggleTheme">{{
        text
      }}</a>
    </nav>
  </div>
</template>

<script lang="ts">
import ParentNavLinks from "@parent-theme/components/NavLinks.vue";
import NavLink from "@theme/components/NavLink.vue";
import Vue from "vue";

export default Vue.extend({
  components: { ParentNavLinks, NavLink },
  data() {
    return {
      enable: false,
      text: ""
    };
  },
  mounted() {
    console.log("m");
    this.enable = this.$themeConfig.themeChange;
    this.text = this.$themeConfig.themeChangeText;
  },
  methods: {
    toggleTheme() {
      let html = document.getElementsByTagName("html")[0];

      let theme = html.getAttribute("theme");
      if (theme == "light") {
        html.setAttribute("theme", "dark");
      } else if (theme == "dark") {
        html.setAttribute("theme", "light");
      } else {
        html.setAttribute("theme", "light");
      }
    }
  }
});
</script>
