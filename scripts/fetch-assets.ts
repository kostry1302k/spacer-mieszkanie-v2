// Pobiera zasoby CC0 (tekstury PBR, HDRI) z Poly Haven i ambientCG do public/assets
// i zapisuje public/assets/CREDITS.md. Uruchamiane ręcznie: `npm run assets` (wynik jest w repozytorium).
// Tekstury są przeskalowywane i ponownie kompresowane narzędziem `sips` (macOS).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type Map = 'color' | 'normal' | 'roughness';
type Res = '1k' | '2k';

interface TextureAsset {
  kind: 'texture';
  source: 'polyhaven' | 'ambientcg';
  id: string;
  /** Do czego służy (wpis w CREDITS.md). */
  use: string;
  resolutions: Res[];
}

interface HdriAsset {
  kind: 'hdri';
  source: 'polyhaven';
  id: string;
  use: string;
  resolutions: Res[];
}

interface ModelAsset {
  kind: 'model';
  source: 'polyhaven';
  id: string;
  use: string;
}

type Asset = TextureAsset | HdriAsset | ModelAsset;

/** Lista zasobów. Dodając nowy, dopisz go tutaj i uruchom `npm run assets`. */
const ASSETS: Asset[] = [
  { kind: 'texture', source: 'polyhaven', id: 'concrete_floor_worn_001', use: 'wylewka cementowa (stan surowy)', resolutions: ['1k', '2k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Concrete024', use: 'szary tynk ścian (stan surowy)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Concrete034', use: 'sufit (stan surowy)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Concrete020', use: 'płyta balkonu, beton', resolutions: ['1k'] },
  { kind: 'texture', source: 'polyhaven', id: 'wood_floor', use: 'podłoga – dąb dymiony (styl 1)', resolutions: ['1k', '2k'] },
  { kind: 'texture', source: 'polyhaven', id: 'herringbone_parquet', use: 'podłoga – jasny dąb w jodełkę (styl 2)', resolutions: ['1k', '2k'] },
  { kind: 'texture', source: 'ambientcg', id: 'PaintedPlaster017', use: 'malowane ściany i sufity (wykończenia)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'PavingStones136', use: 'łazienka – duże płyty w stylu betonu (styl 1)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Tiles078', use: 'łazienka – płytki w stylu marmuru (styl 2)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Wood051', use: 'meble – fornir orzech (styl 1)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Wood049', use: 'meble – jasny dąb (styl 2)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Fabric030', use: 'tapicerka – tkanina (sofa, łóżko)', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Carpet016', use: 'dywany', resolutions: ['1k'] },
  { kind: 'texture', source: 'ambientcg', id: 'Wicker008A', use: 'rattan – lampa wisząca (styl 1)', resolutions: ['1k'] },
  { kind: 'model', source: 'polyhaven', id: 'potted_plant_04', use: 'mała roślina (łazienka, półki)' },
  { kind: 'hdri', source: 'polyhaven', id: 'noon_grass', use: 'niebo i otoczenie za oknami, światło otoczenia', resolutions: ['1k', '2k'] },
];

const OUT = join(import.meta.dirname, '..', 'public', 'assets');
const JPEG_QUALITY = '80';
const PIXELS: Record<Res, string> = { '1k': '1024', '2k': '2048' };

const POLYHAVEN_MAPS: Record<Map, string> = { color: 'Diffuse', normal: 'nor_gl', roughness: 'Rough' };
const AMBIENTCG_MAPS: Record<Map, string> = { color: 'Color', normal: 'NormalGL', roughness: 'Roughness' };

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': 'spacer-mieszkanie asset fetcher' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': 'spacer-mieszkanie asset fetcher' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

/** Przeskalowanie (najdłuższy bok) i kompresja JPEG przez `sips`. */
function recompress(file: string, res: Res): void {
  execFileSync('sips', ['-Z', PIXELS[res], '-s', 'format', 'jpeg', '-s', 'formatOptions', JPEG_QUALITY, file, '--out', file], { stdio: 'ignore' });
}

interface Credit {
  asset: Asset;
  url: string;
  authors: string;
}

async function fetchPolyHavenTexture(a: TextureAsset): Promise<Credit> {
  type Files = Record<string, Record<string, { jpg?: { url: string } }>>;
  const files = await json<Files>(`https://api.polyhaven.com/files/${a.id}`);
  for (const res of a.resolutions) {
    const dir = join(OUT, 'textures', a.id, res);
    mkdirSync(dir, { recursive: true });
    for (const [map, key] of Object.entries(POLYHAVEN_MAPS) as [Map, string][]) {
      const url = files[key]?.[res]?.jpg?.url;
      if (!url) throw new Error(`Poly Haven ${a.id}: brak mapy ${key} ${res}`);
      const dest = join(dir, `${map}.jpg`);
      await download(url, dest);
      recompress(dest, res);
    }
  }
  return { asset: a, url: `https://polyhaven.com/a/${a.id}`, authors: await polyHavenAuthors(a.id) };
}

async function fetchPolyHavenHdri(a: HdriAsset): Promise<Credit> {
  type Files = { hdri: Record<string, { hdr?: { url: string } }> };
  const files = await json<Files>(`https://api.polyhaven.com/files/${a.id}`);
  const dir = join(OUT, 'hdri');
  mkdirSync(dir, { recursive: true });
  for (const res of a.resolutions) {
    const url = files.hdri[res]?.hdr?.url;
    if (!url) throw new Error(`Poly Haven ${a.id}: brak HDRI ${res}`);
    await download(url, join(dir, `${a.id}_${res}.hdr`));
  }
  return { asset: a, url: `https://polyhaven.com/a/${a.id}`, authors: await polyHavenAuthors(a.id) };
}

/** Model glTF z Poly Haven (1k) → jeden plik GLB: tekstury 512 px WebP, geometria Meshopt. */
async function fetchPolyHavenModel(a: ModelAsset): Promise<Credit> {
  type File = { url: string; include?: Record<string, { url: string }> };
  const files = await json<{ gltf: Record<string, { gltf: File }> }>(`https://api.polyhaven.com/files/${a.id}`);
  const gltf = files.gltf['1k'].gltf;
  const tmp = mkdtempSync(join(tmpdir(), `ph-${a.id}-`));
  const main = join(tmp, `${a.id}.gltf`);
  await download(gltf.url, main);
  for (const [path, file] of Object.entries(gltf.include ?? {})) {
    if (path.includes('..')) throw new Error(`Poly Haven ${a.id}: podejrzana ścieżka ${path}`);
    mkdirSync(join(tmp, path, '..'), { recursive: true });
    await download(file.url, join(tmp, path));
  }
  const dir = join(OUT, 'models');
  mkdirSync(dir, { recursive: true });
  execFileSync(
    join(import.meta.dirname, '..', 'node_modules', '.bin', 'gltf-transform'),
    ['optimize', main, join(dir, `${a.id}.glb`), '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '512'],
    { stdio: 'ignore' },
  );
  rmSync(tmp, { recursive: true, force: true });
  return { asset: a, url: `https://polyhaven.com/a/${a.id}`, authors: await polyHavenAuthors(a.id) };
}

async function polyHavenAuthors(id: string): Promise<string> {
  const info = await json<{ authors: Record<string, string> }>(`https://api.polyhaven.com/info/${id}`);
  return Object.keys(info.authors).join(', ');
}

async function fetchAmbientCgTexture(a: TextureAsset): Promise<Credit> {
  for (const res of a.resolutions) {
    const label = res === '1k' ? '1K' : '2K';
    // Archiwum rozpakowujemy w osobnym, pustym katalogu tymczasowym i bierzemy z niego tylko potrzebne mapy.
    const tmp = mkdtempSync(join(tmpdir(), `acg-${a.id}-`));
    const zip = join(tmp, 'archive.zip');
    await download(`https://ambientcg.com/get?file=${a.id}_${label}-JPG.zip`, zip);
    const extracted = join(tmp, 'x');
    mkdirSync(extracted);
    execFileSync('unzip', ['-q', '-j', zip, '*.jpg', '-d', extracted]);
    const dir = join(OUT, 'textures', a.id, res);
    mkdirSync(dir, { recursive: true });
    const names = readdirSync(extracted);
    for (const [map, suffix] of Object.entries(AMBIENTCG_MAPS) as [Map, string][]) {
      const name = names.find((n) => n.endsWith(`_${suffix}.jpg`));
      if (!name) throw new Error(`ambientCG ${a.id}: brak mapy ${suffix}`);
      const dest = join(dir, `${map}.jpg`);
      renameSync(join(extracted, name), dest);
      recompress(dest, res);
    }
    rmSync(tmp, { recursive: true, force: true });
  }
  return { asset: a, url: `https://ambientcg.com/view?id=${a.id}`, authors: 'ambientCG (Lennart Demes)' };
}

function writeCredits(credits: Credit[]): void {
  const rows = credits.map(
    ({ asset, url, authors }) =>
      `| ${asset.kind === 'hdri' ? 'HDRI' : asset.kind === 'model' ? 'model 3D' : 'tekstura'} | [${asset.id}](${url}) | ${asset.source === 'polyhaven' ? 'Poly Haven' : 'ambientCG'} | ${authors} | CC0 1.0 | ${asset.use} |`,
  );
  writeFileSync(
    join(OUT, 'CREDITS.md'),
    `# Zasoby i licencje

Wszystkie zasoby są na licencji [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (domena publiczna).
Plik generuje \`npm run assets\` (scripts/fetch-assets.ts) – nie edytuj ręcznie.
Tekstury przeskalowane do 1k/2k i ponownie skompresowane (JPEG ${JPEG_QUALITY}%); modele 3D zapisane jako GLB (tekstury 512 px WebP, geometria Meshopt).

| Rodzaj | Zasób | Źródło | Autor | Licencja | Zastosowanie |
|---|---|---|---|---|---|
${rows.join('\n')}
`,
  );
}

function folderSize(path: string): number {
  if (!existsSync(path)) return 0;
  const s = statSync(path);
  if (!s.isDirectory()) return s.size;
  return readdirSync(path).reduce((sum, n) => sum + folderSize(join(path, n)), 0);
}

const credits: Credit[] = [];
for (const a of ASSETS) {
  process.stdout.write(`↓ ${a.source} ${a.id} … `);
  credits.push(
    a.kind === 'hdri'
      ? await fetchPolyHavenHdri(a)
      : a.kind === 'model'
        ? await fetchPolyHavenModel(a)
        : a.source === 'polyhaven'
          ? await fetchPolyHavenTexture(a)
          : await fetchAmbientCgTexture(a),
  );
  console.log('ok');
}
writeCredits(credits);
console.log(`\n✓ zasoby w public/assets: ${(folderSize(OUT) / 1024 / 1024).toFixed(1)} MB`);
