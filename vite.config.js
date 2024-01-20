import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from '@vuepress/cli'

export default defineUserConfig({
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {
      template: {
        compilerOptions: {
          // isCustomElement: (tag) => tag === 'Mermaid'
          isCustomElement: (tag) => ['Mermaid'].includes(tag),
        },
      },
    },
  }),
})
// import vue from '@vitejs/plugin-vue'
// import { defineConfig } from 'vite'

// export default defineConfig({
//     plugins: [
//         vue({
//             template: {
//                 compilerOptions: {
//                     isCustomElement: (tag) => ['Mermaid'].includes(tag),
//                 }
//             }
//         })
//     ]
// })
