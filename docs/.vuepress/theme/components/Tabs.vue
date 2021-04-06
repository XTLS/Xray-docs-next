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
import { defineComponent } from "vue";

export default defineComponent({
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
  beforeMount() {
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
  color: var(--textColor);
}
</style>
