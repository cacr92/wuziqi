import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 4173,
    host: true,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 