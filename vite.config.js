import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/static': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      },
      '/generate': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      },
      '/styles': {  // Добавляем прокси для /styles
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
      }
  }
})
