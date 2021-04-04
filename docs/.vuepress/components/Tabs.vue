<template>
  <div class="container">
    <nav>
      <div :id="tag" class="nav nav-pills" role="tablist">
        <button
          v-for="tab of children"
          :id="tab.labelID"
          :aria-controls="tab.tabID"
          :data-bs-target="'#' + tab.tabID"
          aria-selected="false"
          class="nav-link"
          data-bs-toggle="tab"
          role="tab"
          type="button"
        >
          {{ tab.title }}
        </button>
      </div>
    </nav>
    <div :id="contentTag" class="tab-content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    title: {
      type: String,
    },
  },
  data() {
    return {
      children: [],
    };
  },
  created() {
    this.children = [];
  },
  mounted() {
    this.$nextTick(function () {
      const bootstrap = require("bootstrap");
      let triggerEl = document.getElementById(this.children["0"].$data.labelID);
      new bootstrap.Tab(triggerEl).show();
    });
  },
  computed: {
    tag: function () {
      return "tabs-" + this.title;
    },
    contentTag: function () {
      return "tabs-" + this.title + "-content";
    },
  },
});
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/bootstrap";

button.nav-link {
  @media (prefers-color-scheme: light) {
    color: #2c3e50;
  }
  @media (prefers-color-scheme: dark) {
    color: #e2e2e2;
  }
}
html[theme="light"] button.nav-link {
  color: #2c3e50;
}
html[theme="dark"] button.nav-link {
  color: #e2e2e2;
}
</style>
