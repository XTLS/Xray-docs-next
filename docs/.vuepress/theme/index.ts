import { path } from "@vuepress/utils";
import { Theme } from "@vuepress/core";

export interface ThemeOptions {
  enableToggle?: boolean;
  ToggleText?: string;
}

export const docsPlugin: Theme<ThemeOptions> = (options, app) => {
  return {
    name: "xray-docs-theme",
    extends: "@vuepress/theme-default",
    layouts: {
      Layout: path.resolve(__dirname, "layouts/Layout.vue"),
    },
    define: {
      __LAYOUT__OPTIONS__: options,
    },
    clientAppEnhanceFiles: path.resolve(__dirname, "clientAppEnhance.ts"),
    plugins: [["@vuepress/plugin-palette", { preset: "sass" }]],
  };
};

export default docsPlugin;
