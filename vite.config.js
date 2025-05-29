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
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.serveo.net',  // Allow all serveo.net subdomains
      'blackjack.serveo.net'  // Specific subdomain if needed
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
})
