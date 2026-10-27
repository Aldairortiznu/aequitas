import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    open: true,
    port: 5173,
    host: true, // expone el juego en tu red local (para abrirlo también desde el celular)
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
