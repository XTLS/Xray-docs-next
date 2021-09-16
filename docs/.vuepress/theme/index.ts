import { path } from "@vuepress/utils";
import { Theme } from "@vuepress/core";
import { MermaidPlugin } from "./plugin/mermaidPlugin";

export const docsPlugin: Theme = (options, app) => {
  return {
    name: "xray-docs-theme",
    extends: "@vuepress/theme-default",
    clientAppEnhanceFiles: path.resolve(__dirname, "clientAppEnhance.ts"),
    extendsMarkdown: (md) => {
      md.use(MermaidPlugin);
    },
  };
};

export default docsPlugin;
