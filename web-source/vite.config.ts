import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: {
    outDir: '../client',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/server': {
        target: 'https://wordchain-60047186223.development.catalystserverless.in',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
