import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 1. Plugins: Enables React support
  plugins: [react()],

  // 2. Server: Configuration for your local dev environment (port 5173)
  server: {
    port: 5173,
    host: true,
    strictPort: true
  },

  // 3. Build: Optimization settings for your S3 deployment
  build: {
    rollupOptions: {
      output: {
        // This splits your large node_modules into a separate 'vendor' file
        // to fix the "chunks larger than 500 kBs" warning.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increases warning threshold to 1MB to keep the build logs clean
    chunkSizeWarningLimit: 1000, 
  },
})