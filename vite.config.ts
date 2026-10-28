import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/** Które mieszkanie budujemy: folder mieszkania/<id> (np. MIESZKANIE=m21 npm run dev). */
const mieszkanie = process.env.MIESZKANIE ?? 'm21';

export default defineConfig({
  // Ścieżki względne: build działa na GitHub Pages (podkatalog repo) i na każdym innym hostingu.
  base: './',
  resolve: {
    alias: { '@mieszkanie': fileURLToPath(new URL(`./mieszkania/${mieszkanie}/index.ts`, import.meta.url)) },
  },
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
