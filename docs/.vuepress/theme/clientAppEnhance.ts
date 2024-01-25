// import { defineClientAppEnhance } from "@vuepress/client";
import { defineClientAppEnhance } from "vuepress/client";
import Tab from "./components/Tab.vue";
import Tabs from "./components/Tabs.vue";
import Mermaid from "./components/Mermaid.vue";

export default defineClientAppEnhance(({ app, router, siteData }) => {
  app.component("Tab", Tab);
  app.component("Tabs", Tabs);
  app.component("Mermaid", Mermaid);
});
