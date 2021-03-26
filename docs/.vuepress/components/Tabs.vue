<template>
  <div class="container">
    <nav>
      <div class="nav nav-tabs" :id="tag" role="tablist">
        <button
          v-for="tab of children"
          class="nav-link"
          :id="tab.labelID"
          data-bs-toggle="tab"
          :data-bs-target="'#' + tab.tabID"
          type="button"
          role="tab"
          :aria-controls="tab.tabID"
          aria-selected="false"
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
      type: String
    }
  },
  data() {
    return {
      children: []
    };
  },
  created() {
    this.children = this.$children;
  },
  mounted() {
    this.$nextTick(function() {
      const bootstrap = require("bootstrap");
      let triggerEl = document.getElementById(this.children["0"].$data.labelID);
      new bootstrap.Tab(triggerEl).show();
    });
  },
  computed: {
    tag: function() {
      return "tabs-" + this.title;
    },
    contentTag: function() {
      return "tabs-" + this.title + "-content";
    }
  }
});
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/bootstrap";
</style>
