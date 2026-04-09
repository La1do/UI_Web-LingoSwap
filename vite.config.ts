import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vitejs.dev/config/
// https://vite.dev/config/
export default defineConfig({
  build: {
    cssMinify: 'esbuild',
  },

  plugins: [react(), tailwindcss()
  ],
})
