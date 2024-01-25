// import { Theme } from "@vuepress/core";
import { Theme } from "vuepress/core";
// import { path } from "@vuepress/utils";
import { path } from "vuepress/utils";
import { defaultTheme } from "vuepress";

export const docsPlugin: Theme = (options, app) => {
  return defaultTheme({
    name: "xray-docs-theme",
    extends: "@vuepress/theme-default",
    clientAppEnhanceFiles: path.resolve(__dirname, "clientAppEnhance.ts"),

  });
};

export default docsPlugin;
