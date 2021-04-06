import { defineClientAppEnhance } from "@vuepress/client";
import Tab from "./components/Tab.vue";
import Tabs from "./components/Tabs.vue";

import "./styles/default/index.scss";

export default defineClientAppEnhance(({ app, router, siteData }) => {
  app.component("Tab", Tab);
  app.component("Tabs", Tabs);
});
