import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  build: {
    cssMinify: 'esbuild',
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // lắng nghe 0.0.0.0 — cho phép truy cập từ IP thật
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true,
    //   },
    // },
    allowedHosts: true,
  },
  base: '/',
})
