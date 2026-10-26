// Kolizje 2D w rzucie (cm): gracz to okrąg, przeszkody to prostokąty wyliczone z danych mieszkania.
import type { Apartment, Variant } from '../data/types';
import { wallAxis, wallsFor } from '../core/plan';
import { wallBoxes, wallSpan } from '../geometry/walls';

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Bryła, która sięga poniżej tej wysokości, blokuje przejście (nadproża nie). */
const BLOCKS_BELOW = 100;
const RAIL = 4;

/** Przeszkody stałe: ściany (bez otworów), grzejniki, balustrada, stałe przeszklenia, wyjście na korytarz. */
export function staticColliders(ap: Apartment, variant: Variant): Rect[] {
  const rects: Rect[] = wallBoxes(ap, variant)
    .filter((b) => b.z0 < BLOCKS_BELOW)
    .map(({ x0, y0, x1, y1 }) => ({ x0, y0, x1, y1 }));

  for (const r of ap.radiators) rects.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 });

  const { slab, railing } = ap.balcony;
  const left = slab.x0 + railing.inset;
  const right = slab.x1 - railing.inset;
  const front = slab.y1 - railing.inset;
  rects.push(
    { x0: left - RAIL, y0: front - RAIL / 2, x1: right + RAIL, y1: front + RAIL / 2 },
    { x0: left - RAIL / 2, y0: slab.y0, x1: left + RAIL / 2, y1: front },
    { x0: right - RAIL / 2, y0: slab.y0, x1: right + RAIL / 2, y1: front },
  );

  const walls = wallsFor(ap, variant);
  for (const door of ap.doors) {
    const opening = ap.openings.find((o) => o.id === door.openingId)!;
    const wall = walls.find((w) => w.id === opening.wallId);
    if (!wall) continue;
    const [n0, n1] = wallSpan(wall);
    const span = (a0: number, a1: number, b0: number, b1: number): Rect =>
      wallAxis(wall) === 'x' ? { x0: a0, x1: a1, y0: b0, y1: b1 } : { x0: b0, x1: b1, y0: a0, y1: a1 };

    // Stała część drzwi balkonowych.
    if (door.leafFrom > opening.from) rects.push(span(opening.from, door.leafFrom, n0, n1));
    if (door.leafTo < opening.to) rects.push(span(door.leafTo, opening.to, n0, n1));

    // Korytarz klatki nie jest modelowany: za drzwiami wejściowymi stoi niewidoczna bariera.
    if (door.kind === 'entrance') {
      const outside = door.swing > 0 ? n0 : n1;
      rects.push(span(opening.from, opening.to, outside - 10, outside));
    }
  }
  return rects;
}

/** Wypycha okrąg (x, y, r) z prostokątów; kilka iteracji rozwiązuje narożniki. */
export function resolveCircle(x: number, y: number, r: number, rects: readonly Rect[]): [number, number] {
  for (let iter = 0; iter < 4; iter++) {
    let moved = false;
    for (const b of rects) {
      if (x < b.x0 - r || x > b.x1 + r || y < b.y0 - r || y > b.y1 + r) continue;
      const nx = Math.min(Math.max(x, b.x0), b.x1);
      const ny = Math.min(Math.max(y, b.y0), b.y1);
      const dx = x - nx;
      const dy = y - ny;
      const d2 = dx * dx + dy * dy;
      if (d2 >= r * r) continue;
      if (d2 > 1e-6) {
        const d = Math.sqrt(d2);
        x = nx + (dx / d) * r;
        y = ny + (dy / d) * r;
      } else {
        // Środek w prostokącie: wypchnij najkrótszą drogą.
        const pushes: [number, number, number][] = [
          [x - b.x0 + r, -1, 0],
          [b.x1 - x + r, 1, 0],
          [y - b.y0 + r, 0, -1],
          [b.y1 - y + r, 0, 1],
        ];
        const [dist, sx, sy] = pushes.reduce((best, p) => (p[0] < best[0] ? p : best));
        x += sx * dist;
        y += sy * dist;
      }
      moved = true;
    }
    if (!moved) break;
  }
  return [x, y];
}

export function rectFromPoints(points: readonly [number, number][]): Rect {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
