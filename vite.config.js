import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),    
    tailwindcss()
  ],
  server: {
    host: '0.0.0.0',  // Allow external connections
    port: 5173,
    strictPort: true,
    origin: 'http://0.0.0.0:5173'
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})
