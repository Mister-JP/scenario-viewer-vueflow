// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' // 1. Import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: { // 2. Add the resolve configuration
    alias: {
      '@': path.resolve(__dirname, './src'), // 3. Define the '@' alias
    },
  },
  optimizeDeps: {
    include: ['vue-router'],
  },
})