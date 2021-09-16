// Reference: https://github.com/mermaid-js/mermaid

import { PluginSimple } from "markdown-it/lib";
import { hash } from "@vuepress/utils";

const MermaidPlugin: PluginSimple = function (md) {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const { info } = tokens[idx];
    if (info.trim() === "mermaid") {
      const token = tokens[idx];
      const key = `mermaid_${hash(idx)}`;
      let { content } = token;
      return `<Mermaid identifier="${key}" graph="${encodeURI(
        content
      )}"></Mermaid>`;
    }
    const rawCode = fence(...args);
    return `${rawCode}`;
  };
};

export { MermaidPlugin };
