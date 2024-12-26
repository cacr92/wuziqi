import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.vue']
  },
  
  server: {
    port: 5173,
    host: true,
    hmr: {
      overlay: true,  // 显示错误提示
      timeout: 5000,  // 增加超时时间
    },
    watch: {
      usePolling: true,  // 使用轮询监听文件变化
      interval: 100,     // 轮询间隔
    },
    headers: {
      'Content-Type': 'application/javascript'
    }
  },
  
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // 开发时的一些优化配置
  optimizeDeps: {
    force: true  // 强制预构建依赖
  },

  // 构建配置
  build: {
    sourcemap: true,  // 生成 sourcemap
    chunkSizeWarningLimit: 1000,  // 提高代码分块大小警告限制
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})