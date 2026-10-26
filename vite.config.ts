import { defineConfig } from 'vite';

export default defineConfig({
  // Ścieżki względne: build działa na GitHub Pages (podkatalog repo) i na każdym innym hostingu.
  base: './',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined),
      },
    },
  },
});
