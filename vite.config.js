import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  base: '/',
  build: {
    target: 'es2020', chunkSizeWarningLimit: 3000,
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), experience: resolve(import.meta.dirname, 'experience/index.html') } },
  },
  server: { port: 5174 },
});
