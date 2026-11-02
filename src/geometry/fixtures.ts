import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Apartment, Fixture, FixtureType, FurnitureItem, Variant } from '../data/types';
import { inVariant } from '../core/plan';
import { m } from '../core/units';
import type { MaterialSet } from '../scene/materials';
import type { Lamp } from '../furniture/place';
import { boxGeometry, mergeStatic, type PlanBox } from './box';

/** Wymiary lica osprzętu: szerokość × wysokość × grubość (cm). */
const PLATE: Record<Exclude<FixtureType, 'ceilingOutlet'>, [number, number, number]> = {
  socket: [8, 8, 1],
  socketDouble: [15, 8, 1],
  switch: [8, 8, 1],
  intercom: [10, 20, 2],
  panel: [30, 40, 0.6],
  wallOutlet: [6, 6, 1.5],
};

const CABLE = 25; // długość przewodu z wypustu sufitowego
const HOLDER = 6; // oprawka
const BULB_RADIUS = 3;
const BULB_CD = 20; // goła żarówka ok. 250 lm
const BULB_COLOR = 0xffc58a; // ok. 2700 K

/** Na wypuście: goła żarówka na kablu (stan surowy) albo nic – w wykończeniach lampy są meblami. */
export type CeilingFixture = 'bulb' | 'none';

/** Gołe żarówki na wypustach sufitowych jako źródła światła (cm). */
export function bulbLamps(ap: Apartment, variant: Variant): Lamp[] {
  return ap.fixtures
    .filter((f) => f.type === 'ceilingOutlet' && inVariant(f, variant))
    .map((f) => ({ x: f.x, y: f.y, z: f.z - CABLE - HOLDER - BULB_RADIUS, intensity: BULB_CD, color: BULB_COLOR }));
}

const FACING_ANGLE = { '+y': 0, '-y': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 } as const;

/**
 * Grubość okładziny stylu (panel, płytki, boazeria – `wallPanel` i `block` przylegające do ściany) w miejscu osprzętu.
 * Lico osprzętu montujemy na niej – inaczej ramka i okładzina leżą w jednej płaszczyźnie i migoczą (z-fighting).
 */
export function coveringDepth(f: Fixture, items: FurnitureItem[]): number {
  if (f.facing === 'down') return 0;
  const sign = f.facing[0] === '+' ? 1 : -1;
  const alongX = f.facing[1] === 'y';
  let depth = 0;
  for (const i of items) {
    if (i.type !== 'wallPanel' && i.type !== 'block') continue;
    const p = i.params ?? {};
    const t = Number(i.type === 'wallPanel' ? (p.t ?? 1) : (p.d ?? 50));
    const w = Number(p.w ?? (i.type === 'wallPanel' ? 100 : 50));
    const z0 = i.z ?? 0;
    if (f.z < z0 || f.z > z0 + Number(p.h ?? (i.type === 'wallPanel' ? 55 : 50))) continue;
    if ((i.facing[1] === 'y') !== alongX) continue; // okładzina równoległa do ściany z osprzętem
    const [center, normal, wall] = alongX ? [i.x, i.y, f.y] : [i.y, i.x, f.x];
    if (Math.abs((alongX ? f.x : f.y) - center) > w / 2) continue;
    const back = sign * (normal - wall) - t / 2; // tył okładziny względem lica ściany (cm, + w głąb pokoju)
    if (back < -1 || back > 1) continue; // przylega do ściany
    depth = Math.max(depth, back + t);
  }
  return depth;
}

/** Lico osprzętu (cm → m): zaokrąglona ramka; włącznik z klawiszem, gniazdko z kołnierzem i otworami (`dark`). */
function plateParts(f: Fixture, lift: number): { light: THREE.BufferGeometry[]; dark: THREE.BufferGeometry[] } {
  if (f.facing === 'down') throw new Error(`osprzęt ${f.id}: lico 'down' tylko dla wypustu sufitowego`);
  const [w, h, t] = PLATE[f.type as keyof typeof PLATE];
  const light: THREE.BufferGeometry[] = [new RoundedBoxGeometry(w, h, t, 3, Math.min(0.6, t / 2 - 0.01)).translate(0, 0, t / 2)];
  const dark: THREE.BufferGeometry[] = [];
  if (f.type === 'switch') light.push(new RoundedBoxGeometry(5, 5, 0.6, 2, 0.25).translate(0, 0, t + 0.1));
  if (f.type === 'socket' || f.type === 'socketDouble') {
    for (const cx of f.type === 'socket' ? [0] : [-3.6, 3.6]) {
      light.push(new THREE.CylinderGeometry(2.3, 2.3, 0.3, 32).rotateX(Math.PI / 2).translate(cx, 0, t + 0.1));
      for (const hx of [-0.95, 0.95]) dark.push(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12).rotateX(Math.PI / 2).translate(cx + hx, 0, t + 0.26));
    }
  }
  const place = new THREE.Matrix4()
    .makeTranslation(m(f.x), m(f.z), m(f.y))
    .multiply(new THREE.Matrix4().makeRotationY(FACING_ANGLE[f.facing]))
    .multiply(new THREE.Matrix4().makeScale(0.01, 0.01, 0.01))
    .multiply(new THREE.Matrix4().makeTranslation(0, 0, lift));
  for (const g of [...light, ...dark]) g.applyMatrix4(place);
  return { light, dark };
}

/** Grzejniki płytowe i osprzęt elektryczny (orientacyjny) stanu surowego. */
export function buildFixtures(ap: Apartment, variant: Variant, ceiling: CeilingFixture, mats: MaterialSet, depthOf: (f: Fixture) => number = () => 0): THREE.Group {
  const group = new THREE.Group();
  group.name = 'fixtures';
  const plates: PlanBox[] = [];
  const cables: PlanBox[] = [];
  const faces: THREE.BufferGeometry[] = [];
  const holes: THREE.BufferGeometry[] = [];

  for (const f of ap.fixtures.filter((fx) => inVariant(fx, variant))) {
    if (f.type === 'ceilingOutlet' && ceiling === 'none') continue;
    if (f.type === 'ceilingOutlet') {
      cables.push({ x0: f.x - 0.4, x1: f.x + 0.4, y0: f.y - 0.4, y1: f.y + 0.4, z0: f.z - CABLE, z1: f.z });
      plates.push({ x0: f.x - 2, x1: f.x + 2, y0: f.y - 2, y1: f.y + 2, z0: f.z - CABLE - HOLDER, z1: f.z - CABLE });
    } else {
      const { light, dark } = plateParts(f, depthOf(f));
      faces.push(...light);
      holes.push(...dark);
    }
  }

  const bulbs =
    ceiling === 'bulb'
      ? bulbLamps(ap, variant).map((b) => new THREE.SphereGeometry(m(BULB_RADIUS), 12, 8).translate(m(b.x), m(b.z), m(b.y)))
      : [];
  const radiators = ap.radiators.map((r) => boxGeometry({ x0: r.x0, x1: r.x1, y0: r.y0, y1: r.y1, z0: r.bottom, z1: r.top }));
  const parts: [keyof MaterialSet, THREE.BufferGeometry[]][] = [
    ['fixture', [...plates.map(boxGeometry), ...faces]],
    ['cable', [...cables.map(boxGeometry), ...holes]],
    ['radiator', radiators],
    ['bulb', bulbs],
  ];
  for (const [key, geos] of parts) {
    if (!geos.length) continue;
    const mesh = new THREE.Mesh(mergeStatic(geos), mats[key]);
    mesh.castShadow = key === 'radiator';
    mesh.receiveShadow = key !== 'bulb';
    group.add(mesh);
  }
  return group;
}
