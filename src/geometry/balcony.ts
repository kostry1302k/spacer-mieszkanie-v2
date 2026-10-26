import * as THREE from 'three';
import type { Apartment } from '../data/types';
import { m } from '../core/units';
import type { MaterialSet } from '../scene/materials';
import { boxGeometry, mergeStatic, type PlanBox } from './box';

const BAR = 1.6; // przekrój pręta balustrady
const BAR_SPACING = 11;
const RAIL = 4;

/** Płyta balkonu i balustrada B1 z pionowych prętów, cofnięta od krawędzi płyty. */
export function buildBalcony(ap: Apartment, mats: MaterialSet): THREE.Group {
  const group = new THREE.Group();
  group.name = 'balcony';
  const { slab, railing } = ap.balcony;

  const slabMesh = new THREE.Mesh(
    mergeStatic([boxGeometry({ x0: slab.x0, x1: slab.x1, y0: slab.y0, y1: slab.y1, z0: -slab.thickness, z1: 0 })]),
    mats.concrete,
  );
  slabMesh.receiveShadow = true;
  slabMesh.castShadow = true;
  group.add(slabMesh);

  const left = slab.x0 + railing.inset;
  const right = slab.x1 - railing.inset;
  const front = slab.y1 - railing.inset;
  const h = railing.height;

  const rails: PlanBox[] = [];
  for (const [z0, z1] of [[h - RAIL, h], [8, 8 + RAIL / 2]]) {
    rails.push({ x0: left - RAIL / 2, x1: right + RAIL / 2, y0: front - RAIL / 2, y1: front + RAIL / 2, z0, z1 });
    rails.push({ x0: left - RAIL / 2, x1: left + RAIL / 2, y0: slab.y0, y1: front, z0, z1 });
    rails.push({ x0: right - RAIL / 2, x1: right + RAIL / 2, y0: slab.y0, y1: front, z0, z1 });
  }
  const railMesh = new THREE.Mesh(mergeStatic(rails.map(boxGeometry)), mats.metal);
  railMesh.castShadow = true;
  group.add(railMesh);

  // Pręty jako jedna siatka instancjonowana (jeden draw call).
  const bars: [number, number][] = [];
  const along = (from: number, to: number, fixed: number, axis: 'x' | 'y') => {
    const count = Math.round((to - from) / BAR_SPACING);
    for (let i = 0; i <= count; i++) {
      const t = from + ((to - from) * i) / count;
      bars.push(axis === 'x' ? [t, fixed] : [fixed, t]);
    }
  };
  along(left, right, front, 'x');
  along(slab.y0 + BAR_SPACING, front - BAR_SPACING, left, 'y');
  along(slab.y0 + BAR_SPACING, front - BAR_SPACING, right, 'y');

  const barHeight = h - RAIL - 8;
  const barMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(m(BAR), m(barHeight), m(BAR)), mats.metal, bars.length);
  const matrix = new THREE.Matrix4();
  bars.forEach(([x, y], i) => barMesh.setMatrixAt(i, matrix.makeTranslation(m(x), m(8 + barHeight / 2), m(y))));
  barMesh.castShadow = true;
  group.add(barMesh);

  return group;
}
