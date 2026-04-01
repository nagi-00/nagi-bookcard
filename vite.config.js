// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/nagi-bookcard/',
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
})
