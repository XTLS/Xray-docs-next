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
import Vue from "vue";

export default Vue.extend({
  props: {
    title: {
      type: String
    }
  },
  data() {
    return {
      tabID: "",
      labelID: ""
    };
  },
  created() {
    let tag =
      "tab-" +
      Math.random()
        .toString(36)
        .substring(2);
    this.tabID = tag;
    this.labelID = tag + "-" + "label";
  }
});
</script>
