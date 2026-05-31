import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://resumatchai-three.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
