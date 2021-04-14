import { path } from "@vuepress/utils";
import { Theme } from "@vuepress/core";

export const docsPlugin: Theme = (options, app) => {
  return {
    name: "xray-docs-theme",
    extends: "@vuepress/theme-default",
    layouts: {
      Layout: path.resolve(__dirname, "layouts/Layout.vue"),
    },
    clientAppEnhanceFiles: path.resolve(__dirname, "clientAppEnhance.ts"),
  };
};

export default docsPlugin;
