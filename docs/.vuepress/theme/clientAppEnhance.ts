import { defineClientAppEnhance } from "@vuepress/client";
import Tab from "./components/Tab.vue";
import Tabs from "./components/Tabs.vue";

export default defineClientAppEnhance(({ app, router, siteData }) => {
  app.component("Tab", Tab);
  app.component("Tabs", Tabs);
});
