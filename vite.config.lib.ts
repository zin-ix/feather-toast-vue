import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Library build — does NOT include the demo app or DevTools
export default defineConfig({
  plugins: [vue()],
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
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
