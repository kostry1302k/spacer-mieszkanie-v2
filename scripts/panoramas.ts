// Panoramy 360° w Blenderze dla wszystkich punktów mieszkania (mieszkania/<MIESZKANIE>/panoramy.ts).
// Najpierw w spacerze z ?debug, dla każdego stylu: await app.exportBake('evening', true); await app.exportBake('day', true)
// Potem: npm run panoramas [-- --styles styl1,styl2 --time day --only salon,hol --test]
//   --test: szybki podgląd 1024 px do bake-work/pano-test (kadry i jasność), bez tego: 4096 px do public/pano/<mieszkanie>.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import type { Panorama } from '../src/site.ts';

const BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender';
const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const mieszkanie = process.env.MIESZKANIE ?? 'm21';
const panoramy: Panorama[] = (await import(`../mieszkania/${mieszkanie}/panoramy.ts`)).panoramy;
const test = process.argv.includes('--test');
const styles = arg('styles', 'styl1,styl2').split(',');
const time = arg('time', 'day');
const only = arg('only', '').split(',').filter(Boolean);
const size = arg('size', test ? '1024' : '4096');
const samples = arg('samples', test ? '32' : '192');
const out = test ? 'bake-work/pano-test' : `public/pano/${mieszkanie}`;
mkdirSync(out, { recursive: true });

const t0 = Date.now();
for (const style of styles) {
  const scene = `bake-work/${style}-full.glb`;
  const lights = `bake-work/${style}-${time}.json`;
  if (!existsSync(scene) || !existsSync(lights)) throw new Error(`Brak ${scene} albo ${lights} – najpierw app.exportBake('${time}', true) w stylu ${style}.`);
  for (const p of panoramy.filter((q) => !only.length || only.includes(q.id))) {
    const name = `${style}-${p.id}-${time}`;
    const args = ['-b', '--factory-startup', '-P', 'scripts/bake.py', '--', '--scene', scene, '--lights', lights, '--out', `${out}/${name}`, '--panorama'];
    args.push('--size', size, '--samples', samples, '--camera', `${p.x / 100},${p.z / 100},${p.y / 100},${p.yaw}`, '--exposure', String(p.exposure));
    if (p.lamps === 'all') args.push('--lamps-from', `bake-work/${style}-evening.json`);
    if (p.lampGain) args.push('--lamp-gain', String(p.lampGain));
    // Wnętrze równo doświetlone i łagodna krzywa kontrastu – klient ma zobaczyć pokój, nie głębokie cienie.
    args.push('--look', 'AgX - Low Contrast', '--fill', String(p.fill ?? 45));
    const started = Date.now();
    const run = spawnSync(BLENDER, args, { encoding: 'utf8' });
    if (run.status !== 0) throw new Error(`${name}: Blender zakończył się błędem\n${run.stderr.slice(-2000)}`);
    console.log(`${name}: ${Math.round((Date.now() - started) / 1000)} s`);
  }
}

// Spis gotowych panoram – spacer pokazuje przycisk i znacznik tylko dla nich.
const ready = readdirSync(out).filter((f) => f.endsWith('.jpg')).map((f) => f.slice(0, -4)).sort();
writeFileSync(`${out}/index.json`, JSON.stringify(ready));
console.log(`gotowe: ${ready.length} panoram w ${out}, ${Math.round((Date.now() - t0) / 60000)} min`);
