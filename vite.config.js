// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Solo aplica en desarrollo local (npm run dev).
    // En Azure SWA, el enrutamiento /api → Function lo maneja Azure directamente.
    proxy: {
      '/api': {
        target: 'https://bookloop-api.azure-api.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1'),
      }
    }
  }
})
