<template>
  <div
    class="tab-pane fade"
    :id="tabID"
    role="tabpanel"
    :aria-labelledby="labelID"
  >
    <slot />
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
      tabID: "",
      labelID: "",
    };
  },
  beforeMount() {
    let tag = "tab-" + Math.random().toString(36).substring(2);
    this.tabID = tag;
    this.labelID = tag + "-" + "label";

    // Since Vue 3.0, we have no access to $children.
    // So we need another approach to register our child components.
    this.$parent.$data.children.push(this);
  },
});
</script>

<style lang="scss" scoped>
@import "~bootstrap/scss/bootstrap";
</style>
