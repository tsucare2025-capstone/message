import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    target: 'es2020',
    minify: 'esbuild'
  },
  optimizeDeps: {
    exclude: ['@vitejs/plugin-react']
  }
})
