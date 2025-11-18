import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Configuración para Vercel
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Deshabilitar para reducir tamaño
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          icons: ['@ant-design/icons']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    host: true
  },

  // Preview para testing local
  preview: {
    port: 4173,
    host: true
  },

  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})
