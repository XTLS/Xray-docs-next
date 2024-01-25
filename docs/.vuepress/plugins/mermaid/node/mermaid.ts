import type { PluginSimple } from "markdown-it";
import type Renderer from "markdown-it/lib/renderer.js";

const mermaidRenderer: Renderer.RenderRule = (tokens: any, index: any) =>
  `<Mermaid id="mermaid-${index}" code="${encodeURI(
    tokens[index].content,
  )}"></Mermaid>`;

interface MermaidOptions {
  content: string;
  diagram?: string;
  title?: string;
}

export const getMermaidContent = ({
  diagram = "mermaid",
  content,
  title = "",
}: MermaidOptions): string => `\
${title
    ? `\
---
title: ${title}
---

`
    : ""
  }\
${diagram === "mermaid"
    ? ""
    : `\
${diagram}
`
  }\
${diagram === "mermaid" || diagram === "sankey-beta"
    ? content
    : content
      .split("\n")
      .map((line) => (line ? `  ${line}` : ""))
      .join("\n")
  }\
`;

const getMermaid = (options: MermaidOptions, index: number): string =>
  `<Mermaid id="mermaid-${index}" code="${encodeURI(getMermaidContent(options))}"${options.title ? ` title="${encodeURI(options.title)}"` : ""}></Mermaid>`;

export const MermaidPlugin: PluginSimple = (md) => {
  // Handle ```mermaid blocks
  const fence = md.renderer.rules.fence;

  md.renderer.rules.fence = (...args): string => {
    const [tokens, index] = args;
    const { content, info } = tokens[index];

    const fenceInfo = info.trim();

    if (fenceInfo === "mermaid") return getMermaid({ content }, index);

    const [name, ...rest] = fenceInfo.split(" ");

    return fence!(...args);
  };

  md.renderer.rules["mermaid"] = mermaidRenderer;
};
