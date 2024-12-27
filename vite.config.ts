import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router'],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://your-vercel-domain.vercel.app' 
          : 'http://localhost:3001',
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: ['vue'],
    exclude: []
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    commonjsOptions: {
      include: []
    }
  }
})