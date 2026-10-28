import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/feather-toast-vue/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      // Point at package sources so the demo hot-reloads without a library build
      'feather-toast-vue': fileURLToPath(new URL('../packages/toast/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
