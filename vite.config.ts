import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

/** Które mieszkanie budujemy: folder mieszkania/<id> (np. MIESZKANIE=m21 npm run dev). */
const mieszkanie = process.env.MIESZKANIE ?? 'm21';

/** Tylko serwer deweloperski: przyjmuje pliki z app.exportBake() i zapisuje je w bake-work/ (wejście dla scripts/bake.py). */
const bakeUpload = (): Plugin => ({
  name: 'bake-upload',
  configureServer(server) {
    server.middlewares.use('/__bake/upload', (req, res) => {
      const name = new URL(req.url ?? '', 'http://x').searchParams.get('name') ?? '';
      if (req.method !== 'POST' || !/^[\w.-]+$/.test(name)) {
        res.statusCode = 400;
        res.end();
        return;
      }
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => chunks.push(c));
      req.on('end', () => {
        mkdirSync('bake-work', { recursive: true });
        writeFileSync(`bake-work/${name}`, Buffer.concat(chunks));
        res.end('ok');
      });
    });
  },
});

export default defineConfig({
  plugins: [bakeUpload()],
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
