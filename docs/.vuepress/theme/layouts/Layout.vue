<template>
  <ParentLayout />
</template>

<script lang="ts">
import ParentLayout from "@parent-theme/layouts/Layout.vue";
import Vue from "vue";
export default Vue.extend({
  components: {
    ParentLayout
  }
});
</script>

<style lang="stylus">
@require '../styles/components.styl'
</style>
