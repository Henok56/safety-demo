import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', 
    port: 3000,
    strictPort: true,
    // Ensure all local access points are allowed
    allowedHosts: ['pchqflfe1', 'localhost', '127.0.0.1', '.local'],
   proxy: {
  '/api': {
    target: 'http://127.0.0.1:4000', // Use the IP, not 'localhost'
    changeOrigin: true,
    secure: false,
  },
}
  },
});