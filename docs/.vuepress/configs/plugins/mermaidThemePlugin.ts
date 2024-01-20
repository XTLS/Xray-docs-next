// Reference: https://github.com/mermaid-js/mermaid

// import { hash } from "@vuepress/utils";
// import type MarkdownIt from 'markdown-it';

// const MermaidPlugin = function (md: MarkdownIt) {
//     console.log(`>>> md -->`, md)
//     let fence = md.renderer.rules.fence?.bind(
//         md.renderer.rules
//     );
//     md.renderer.rules.fence = (...args) => {
//         const [tokens, idx] = args;
//         const { info } = tokens[idx];
//         if (info.trim() === "mermaid") {
//             const token = tokens[idx];
//             const key = `mermaid_${hash(idx)}`;
//             let { content } = token;
//             return `<Mermaid identifier="${key}" graph="${encodeURI(
//                 `${content.trim()}`,
//             )}"></Mermaid>`;
//         }
//         const rawCode = fence(...args);
//         return `${rawCode}`;
//     };
// let originFence = md.renderer.rules.fence?.bind(
//     md.renderer.rules,
// )

// md.renderer.rules.fence = (...args) => {
//     let [tokens, index] = args
//     let { info: languageType, content } = tokens[index]

//     if (content && languageType.trim() === 'mermaid') {
//         return `
//       <Mermaid
//         id="mermaid-${hash(index)}"
//         code="${content.trim()}"
//       ></Mermaid>
//     `
//     }

//     if (originFence) {
//         return `${originFence(...args)}`
//     }

//     return ''
// }
// };

// export { MermaidPlugin };
