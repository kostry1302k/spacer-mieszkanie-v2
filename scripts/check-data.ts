// Walidacja src/data/apartment.ts: uruchamiane przez `npm run check:data` i przed każdym buildem.
import { apartment as ap } from '../src/data/apartment.ts';
import { inVariant, polygonArea, wallAxis, wallsFor } from '../src/core/plan.ts';
import type { Variant, Wall } from '../src/data/types.ts';

const AREA_TOLERANCE = 0.05; // m²
const variants: Variant[] = ['developer', 'rebuild'];
const errors: string[] = [];
const fail = (msg: string) => errors.push(msg);

const unique = (label: string, ids: string[]) => {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) fail(`${label}: zdublowane id „${id}”`);
    seen.add(id);
  }
};
unique('ściany', ap.walls.map((w) => w.id));
unique('otwory', ap.openings.map((o) => o.id));
unique('drzwi', ap.doors.map((d) => d.id));
unique('pokoje', ap.rooms.map((r) => r.id));
unique('osprzęt', ap.fixtures.map((f) => f.id));

for (const w of ap.walls) {
  if (w.x1 <= w.x0 || w.y1 <= w.y0) fail(`ściana ${w.id}: zdegenerowany prostokąt`);
}

// Ściany nie mogą na siebie nachodzić (styk krawędzią jest dozwolony).
const overlapArea = (a: Wall, b: Wall) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
for (const variant of variants) {
  const walls = wallsFor(ap, variant);
  for (let i = 0; i < walls.length; i++) {
    for (let j = i + 1; j < walls.length; j++) {
      if (overlapArea(walls[i], walls[j]) > 0) fail(`${variant}: ściany ${walls[i].id} i ${walls[j].id} nachodzą na siebie`);
    }
  }
}

// Otwory muszą mieścić się w swojej ścianie i nie nachodzić na siebie.
for (const o of ap.openings) {
  const wall = ap.walls.find((w) => w.id === o.wallId);
  if (!wall) {
    fail(`otwór ${o.id}: brak ściany ${o.wallId}`);
    continue;
  }
  const [a0, a1] = wallAxis(wall) === 'x' ? [wall.x0, wall.x1] : [wall.y0, wall.y1];
  if (o.from < a0 || o.to > a1 || o.to <= o.from) fail(`otwór ${o.id}: zakres ${o.from}–${o.to} poza ścianą ${wall.id} (${a0}–${a1})`);
  if (o.sill < 0 || o.head > ap.height || o.head <= o.sill) fail(`otwór ${o.id}: zła wysokość ${o.sill}–${o.head}`);
  for (const other of ap.openings) {
    if (other !== o && other.wallId === o.wallId && other.from < o.to && o.from < other.to) {
      fail(`otwory ${o.id} i ${other.id} nachodzą na siebie`);
    }
  }
}

for (const d of ap.doors) {
  const o = ap.openings.find((op) => op.id === d.openingId);
  if (!o) {
    fail(`drzwi ${d.id}: brak otworu ${d.openingId}`);
    continue;
  }
  if (d.leafFrom < o.from || d.leafTo > o.to || d.leafTo <= d.leafFrom) fail(`drzwi ${d.id}: skrzydło poza otworem`);
}

// Metraże pokoi zgodne z wymiary.md.
for (const r of ap.rooms) {
  const area = polygonArea(r.polygon);
  const diff = area - r.expectedArea;
  const line = `${r.name.padEnd(26)} ${area.toFixed(3)} m² (wymiary.md: ${r.expectedArea.toFixed(2)}, różnica ${diff >= 0 ? '+' : ''}${diff.toFixed(3)})`;
  if (Math.abs(diff) > AREA_TOLERANCE) fail(`metraż: ${line}`);
  else console.log(`  ok  ${line}`);

  const { x, y } = r.spawn;
  const inside = r.polygon.some(([px]) => px <= x) && r.polygon.some(([px]) => px >= x) &&
    r.polygon.some(([, py]) => py <= y) && r.polygon.some(([, py]) => py >= y);
  if (!inside) fail(`pokój ${r.id}: punkt startowy poza obrysem`);
}

// Suma lokalu (bez balkonu) w wariancie deweloperskim: 30,12 m².
const total = ap.rooms.filter((r) => !r.outdoor && inVariant(r, 'developer')).reduce((s, r) => s + polygonArea(r.polygon), 0);
console.log(`  suma (stan deweloperski): ${total.toFixed(2)} m² (rzut: 30,12)`);
if (Math.abs(total - 30.12) > AREA_TOLERANCE * 2) fail(`suma powierzchni ${total.toFixed(2)} ≠ 30,12`);

const { x0, x1, y0, y1 } = ap.interior;
for (const f of ap.fixtures) {
  if (f.x < x0 || f.x > x1 || f.y < y0 || f.y > y1 || f.z < 0 || f.z > ap.height) fail(`osprzęt ${f.id}: poza mieszkaniem`);
}

if (errors.length) {
  console.error(`\n✗ check:data – ${errors.length} błędów:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✓ check:data – dane mieszkania poprawne');
