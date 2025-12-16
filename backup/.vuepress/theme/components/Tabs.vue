<template>
  <div class="container">
    <nav>
      <div :id="tag" class="nav nav-pills" role="tablist">
        <button
          v-for="tab of children"
          :id="tab.id + '-label'"
          :aria-controls="tab.id"
          :data-bs-target="'#' + tab.id"
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
    this.$nextTick(async function () {
      const bootstrap = await import("bootstrap");
      let triggerEl = document.getElementById(this.children["0"].id + "-label");
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
@import "node_modules/bootstrap/scss/bootstrap";

button.nav-link {
  color: var(--c-text-accent);
  &:hover,
  &:focus {
    color: var(--x-nav-text-hover);
  }
}

nav {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--c-border);
}
div.tab-content {
  border-bottom: 1px solid var(--c-border);
}
</style>
