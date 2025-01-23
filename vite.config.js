import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gifWorker: ['gif.js.optimized'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['gif.js.optimized'],
  },
  worker: {
    format: 'es',
  },
});
