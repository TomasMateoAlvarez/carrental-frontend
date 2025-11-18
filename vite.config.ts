import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          icons: ['@ant-design/icons'],
          utils: ['axios', 'date-fns', 'dayjs']
        }
      }
    },
    // Enable source maps for debugging but smaller in production
    sourcemap: false,
    // Minimize the bundle
    minify: 'terser',
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096
  },
  // Optimize dev server
  server: {
    // Enable hot reload
    hmr: true,
    // Optimize pre-bundling
    force: false
  },
  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'antd',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'date-fns',
      'dayjs'
    ],
    exclude: ['@testing-library/react', '@testing-library/jest-dom']
  },
  // Enable esbuild optimization
  esbuild: {
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable minification
    minify: true
  }
})
