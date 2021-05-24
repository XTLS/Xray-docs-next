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
    let tag = this.title;
    return {
      tabID: tag,
      labelID: tag + "-" + "label",
    };
  },
  beforeMount() {
    this.$parent.$data.children.push(this);
  },
});
</script>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/bootstrap";
</style>
