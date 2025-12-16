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
    };
  },
  mounted() {
    this.tabID = "tab-" + Math.random().toString(36).substring(2);
    this.$parent.$data.children.push({ id: this.tabID, title: this.title });
  },
  computed: {
    labelID(): String {
      return this.tabID + "-label";
    },
  },
});
</script>

<style lang="scss" scoped>
@import "node_modules/bootstrap/scss/bootstrap";
</style>
