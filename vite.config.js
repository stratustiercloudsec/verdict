import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Sets the port to 80
    host: true,    // Exposes the server to the network (same as --host)
    strictPort: true // Prevents Vite from switching to another port if 80 is busy
  }
})
