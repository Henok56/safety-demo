import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  // Base path for GitHub Pages or custom domain
  base: '/',
  
  server: {
    host: '0.0.0.0', 
    port: 3000,
    strictPort: true,
    // Allow all hosts for public access
    allowedHosts: [
      'pchqflfe1', 
      'localhost', 
      '127.0.0.1', 
      '.local',
      '.vercel.app',
      '.onrender.com',
      '.netlify.app',
      'all'
    ],
    // Enable CORS for development
    cors: true,
    // Proxy only in development
    proxy: process.env.NODE_ENV !== 'production' ? {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    } : undefined
  },
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['react-icons', 'lucide-react'],
          charts: ['recharts']
        }
      }
    }
  },
  
  // Preview configuration
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: ['*']
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios']
  }
});