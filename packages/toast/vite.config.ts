import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// The JS bundle carries the CSS once (injected by the plugin); this emits the
// same stylesheet as a standalone file for `injectStyles: false` users.
const emitStylesheet = (): Plugin => ({
  name: 'emit-feather-toast-css',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'feather-toast-vue.css',
      source: readFileSync(resolve(__dirname, 'src/assets/toast.css'), 'utf8'),
    })
  },
})

// Library build — does NOT include the demo app or DevTools
export default defineConfig({
  plugins: [vue(), emitStylesheet()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FeatherToast',
      formats: ['es', 'umd'],
      fileName: (format) => `feather-toast.${format === 'es' ? 'es.js' : 'umd.cjs'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        exports: 'named',
        assetFileNames: (assetInfo) =>
          assetInfo.name === 'style.css' ? 'style.css' : (assetInfo.name ?? 'asset'),
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
