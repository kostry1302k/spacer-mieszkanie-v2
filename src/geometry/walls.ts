import * as THREE from 'three';
import type { Apartment, Variant, Wall } from '../data/types';
import { inVariant, pointInPolygon, wallAxis, wallsFor } from '../core/plan';
import { m } from '../core/units';
import type { PlanBox } from './box';

/** Prostopadłościan zadany w osiach ściany: wzdłuż (a), w poprzek (n) i w pionie (z). */
export function alongWall(wall: Wall, a0: number, a1: number, n0: number, n1: number, z0: number, z1: number): PlanBox {
  const [lo, hi] = [Math.min(n0, n1), Math.max(n0, n1)];
  return wallAxis(wall) === 'x'
    ? { x0: a0, x1: a1, y0: lo, y1: hi, z0, z1 }
    : { x0: lo, x1: hi, y0: a0, y1: a1, z0, z1 };
}

/** Grubość ściany w osi poprzecznej. */
export function wallSpan(wall: Wall): [n0: number, n1: number] {
  return wallAxis(wall) === 'x' ? [wall.y0, wall.y1] : [wall.x0, wall.x1];
}

/**
 * Dzieli ściany na pełne bryły: odcinki między otworami oraz nadproża i parapety nad/pod otworami.
 * Lica otworów tworzą się same jako boki sąsiednich brył (ościeża).
 */
export function wallBoxes(ap: Apartment, variant: Variant): PlanBox[] {
  const boxes: PlanBox[] = [];
  for (const wall of wallsFor(ap, variant)) {
    const [a0, a1] = wallAxis(wall) === 'x' ? [wall.x0, wall.x1] : [wall.y0, wall.y1];
    const [n0, n1] = wallSpan(wall);
    const openings = ap.openings.filter((o) => o.wallId === wall.id).sort((p, q) => p.from - q.from);
    let cursor = a0;
    for (const o of openings) {
      if (o.from > cursor) boxes.push(alongWall(wall, cursor, o.from, n0, n1, 0, ap.height));
      if (o.sill > 0) boxes.push(alongWall(wall, o.from, o.to, n0, n1, 0, o.sill));
      if (o.head < ap.height) boxes.push(alongWall(wall, o.from, o.to, n0, n1, o.head, ap.height));
      cursor = o.to;
    }
    if (cursor < a1) boxes.push(alongWall(wall, cursor, a1, n0, n1, 0, ap.height));
  }
  return boxes;
}

export type WallSurface = 'wall' | 'wallBathroom' | 'facade';

const SAMPLE_OFFSET = 3; // cm przed licem ściany – tam sprawdzamy, do którego pomieszczenia należy lico

/**
 * Lica ścian jako osobne prostokąty z przypisaną powierzchnią: od strony łazienki płytki,
 * od strony zewnętrznej elewacja, reszta – ściana pokoju. Długie lica (np. ściana wejściowa
 * wzdłuż łazienki i holu) są cięte na granicach pomieszczeń. Spody brył na podłodze są pomijane.
 */
export function wallFaces(ap: Apartment, variant: Variant): { surface: WallSurface; geometry: THREE.BufferGeometry }[] {
  const rooms = ap.rooms.filter((r) => inVariant(r, variant));
  const boxes = wallBoxes(ap, variant);
  const outsideFrom = Math.max(...ap.walls.filter((w) => w.kind === 'exterior').map((w) => w.y1));
  const cutsX = [...new Set([...boxes.flatMap((b) => [b.x0, b.x1]), ...rooms.flatMap((r) => r.polygon.map((p) => p[0]))])].sort((a, b) => a - b);
  const cutsY = [...new Set([...boxes.flatMap((b) => [b.y0, b.y1]), ...rooms.flatMap((r) => r.polygon.map((p) => p[1]))])].sort((a, b) => a - b);
  const segments = (from: number, to: number, cuts: number[]) => {
    const points = [from, ...cuts.filter((c) => c > from && c < to), to];
    return points.slice(1).map((p, i) => [points[i], p] as const);
  };
  const surfaceAt = (cx: number, cy: number, ny: number): WallSurface => {
    const room = rooms.find((r) => pointInPolygon(cx, cy, r.polygon));
    if (room?.kind === 'bathroom') return 'wallBathroom';
    return !room && ny === 1 && cy > outsideFrom ? 'facade' : 'wall';
  };
  const faces: { surface: WallSurface; geometry: THREE.BufferGeometry }[] = [];
  const S = SAMPLE_OFFSET;

  for (const b of boxes) {
    const { z0, z1 } = b;
    // Lica pionowe: narożniki w kolejności przeciwnej do ruchu wskazówek zegara patrząc od strony normalnej.
    for (const [a0, a1] of segments(b.y0, b.y1, cutsY)) {
      const cy = (a0 + a1) / 2;
      faces.push({ surface: surfaceAt(b.x1 + S, cy, 0), geometry: quadGeometry([[b.x1, a1, z0], [b.x1, a0, z0], [b.x1, a0, z1], [b.x1, a1, z1]], [1, 0, 0]) });
      faces.push({ surface: surfaceAt(b.x0 - S, cy, 0), geometry: quadGeometry([[b.x0, a0, z0], [b.x0, a1, z0], [b.x0, a1, z1], [b.x0, a0, z1]], [-1, 0, 0]) });
    }
    for (const [a0, a1] of segments(b.x0, b.x1, cutsX)) {
      const cx = (a0 + a1) / 2;
      faces.push({ surface: surfaceAt(cx, b.y1 + S, 1), geometry: quadGeometry([[a0, b.y1, z0], [a1, b.y1, z0], [a1, b.y1, z1], [a0, b.y1, z1]], [0, 1, 0]) });
      faces.push({ surface: surfaceAt(cx, b.y0 - S, -1), geometry: quadGeometry([[a1, b.y0, z0], [a0, b.y0, z0], [a0, b.y0, z1], [a1, b.y0, z1]], [0, -1, 0]) });
    }
    faces.push({ surface: 'wall', geometry: quadGeometry([[b.x0, b.y1, z1], [b.x1, b.y1, z1], [b.x1, b.y0, z1], [b.x0, b.y0, z1]], [0, 0, 1]) });
    if (z0 > 0) faces.push({ surface: 'wall', geometry: quadGeometry([[b.x0, b.y0, z0], [b.x1, b.y0, z0], [b.x1, b.y1, z0], [b.x0, b.y1, z0]], [0, 0, -1]) });
  }
  return faces;
}

/** Prostokąt z czterech narożników (cm rzutu) jako dwa trójkąty w metrach sceny. */
function quadGeometry(corners: [number, number, number][], n: [number, number, number]): THREE.BufferGeometry {
  const toScene = ([x, y, z]: [number, number, number]) => [m(x), m(z), m(y)];
  const [a, b, c, d] = corners.map(toScene);
  const positions = new Float32Array([...a, ...b, ...c, ...a, ...c, ...d]);
  const normal = [n[0], n[2], n[1]];
  const normals = new Float32Array([...normal, ...normal, ...normal, ...normal, ...normal, ...normal]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(12), 2));
  return g;
}
